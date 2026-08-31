# iHealth — Remote Patient Monitoring Backend

Spring Boot backend for a remote patient monitoring platform. The service ingests live sensor telemetry from IoT devices over MQTT, stores patient medical records, and exposes a secured REST API consumed by a React frontend.

**Stack:** Java 17 · Spring Boot 3.2.4 · Spring Security (JWT) · Spring Data JPA / Hibernate · Spring Integration MQTT · MySQL · Maven

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Domain model](#domain-model)
- [Security](#security)
- [Telemetry ingestion (MQTT)](#telemetry-ingestion-mqtt)
- [REST API reference](#rest-api-reference)
- [Business rules](#business-rules)
- [Configuration](#configuration)
- [Running the project](#running-the-project)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)

---

## Overview

iHealth connects three types of users around a patient's medical data:

| Role | Capabilities |
|---|---|
| `ADMIN` | Creates doctor accounts. Seeded automatically at startup. |
| `DOCTOR` | Reads patient demographics, adds medical events, writes and manages recommendations, updates a patient's medical summary. |
| `PATIENT` | Registers independently, creates and reads their own profile, reads their own medical events, recommendations and telemetry history. |

In parallel with the REST API, the backend subscribes to an MQTT topic where wearable/IoT devices publish sensor readings. Each incoming payload is decomposed into individual measurements (temperature, blood pressure, heart rate, SpO2, ECG) and persisted against the corresponding patient.

## Architecture

The codebase is split into three top-level packages, each with a distinct responsibility:

```
com.ex
├── core   → domain layer: JPA entities, enums, repositories
├── sv     → sensor/IoT layer: MQTT configuration, telemetry DTOs and ingestion service
└── web    → web layer: REST controllers, request/response DTOs, services, authentication module
```

Request flow for the REST API:

```
HTTP request
   → AuthFilterService (JWT validation, populates SecurityContext)
   → Controller (@PreAuthorize role check)
   → Service (business rules + ownership checks)
   → Repository (Spring Data JPA)
   → MySQL
```

Ingestion flow for telemetry:

```
IoT device
   → MQTT broker (topic: ihealth/v1/telemetrie, QoS 1)
   → MqttPahoMessageDrivenChannelAdapter
   → mqttInputChannel (DirectChannel)
   → @ServiceActivator handler (Jackson deserialization)
   → TelemetryService.processTelemetryData()
   → MySQL (telemetry_measurements)
```

## Domain model

All entities live in `com.ex.core.entities`. Identifiers are auto-generated (`GenerationType.IDENTITY`).

### `User` (`users`)
Implements Spring Security's `UserDetails`. `getUsername()` returns the **email**, which is therefore the login identifier. Authorities are derived from the `type` field, exposed as a single `SimpleGrantedAuthority`.

| Field | Notes |
|---|---|
| `id` | PK |
| `name`, `username` | `username` unique |
| `email` | unique, `@Email` validated |
| `password` | BCrypt hash |
| `type` | enum `TypeUser`: `ADMIN`, `DOCTOR`, `PATIENT` |
| `refreshToken` | `@OneToOne`, mapped by `RefreshToken.user` |
| `medic` | `@OneToOne`, present only for doctor accounts |

### `Patient` (`patient`)
Clinical and demographic profile, linked one-to-one to a `User`.

| Field | Notes |
|---|---|
| `name`, `bornDate`, `gender` | `Gender`: `MALE`, `FEMALE` |
| `cnp` | unique, validated (see [Business rules](#business-rules)) |
| `address` | `@Embedded` `Address` (country, county, city, street, zipCode, number) |
| `phone` | unique |
| `email`, `profesion`, `job` | |
| `generalMedicalHistory`, `knownAllergies` | medical summary, writable by doctors only |
| `user` | `@OneToOne`, cascade `ALL` |
| `medicalEvents`, `alertRules`, `alertHistories` | `@OneToMany`, lazy, cascade `ALL` |

### `Medic` (`medic`)
`id`, `nume`, `specializare`, plus a `@OneToOne` link to the backing `User`.

### `MedicalEvent` (`medical_event`)
A dated entry in the patient's record: `eventData`, `eventType` (`CONSULTATION`, `ANALYSIS_RESULT`, `TELEMETRY_DATA`), `details`, and a mandatory `@ManyToOne` patient.

### `Recommendation` (`recommendation`)
Lifestyle recommendation issued by a doctor: `recommendationType` (`bicicleta`, `inot`, `plimbare`, `fructe`, `legume`), `details` (not null), mandatory `@ManyToOne` patient.

### `TelemetryMeasurement` (`telemetry_measurements`)
One row per sensor reading: `sensorType` (not null), `value`, `ecgData` (`@Lob`, for raw ECG series), `timestamp` (not null), mandatory `@ManyToOne` patient.

### `AlertRule` (`alert_rule`)
Per-patient threshold definition: `sensorType`, `condition` (`GREATER_THAN`, `LESS_THAN`, `EQUALS`), `value`, patient. The column is mapped as `` `condition` `` because it is a reserved SQL word.

### `AlertHistory` (`alert_history`)
Record of a triggered alert: `details`, `triggeredAt`, patient.

### `RefreshToken`
`tokenId`, `refreshToken` (UUID string, up to 500 chars), `expirationTime` (`Instant`), `@OneToOne` user. Serialization of the user side is suppressed with `@JsonIgnore`.

### Repositories

All repositories extend `JpaRepository`. Derived queries in use:

| Repository | Custom methods |
|---|---|
| `UserRepository` | `findByEmail`, `findByType` |
| `PatientRepository` | `findByUser`, `findById`, `findByUserEmail`, `existsPatientByCnp` |
| `MedicRepository` | `findByUser` |
| `MedicalEventRepository` | `findByPatient` |
| `RecommendationRepository` | `findByPatient` |
| `TelemetryMeasurementRepository` | `findTop100ByPatient_User_IdOrderByTimestampDesc` |
| `AlertRuleRepository` | `findByPatientIdAndSensorType` |
| `RefreshTokenRepository` | `findByRefreshToken` |

## Security

Authentication is stateless and token-based.

**`SecurityConfiguration`**
- CSRF disabled, CORS enabled via `CorsConfig`.
- `SessionCreationPolicy.STATELESS`.
- `@EnableMethodSecurity(prePostEnabled = true)` — authorisation is expressed per endpoint with `@PreAuthorize`.
- Public endpoints: `POST /api/v1/auth/login` and `POST /api/v1/auth/register/patient`. Everything else requires authentication.
- `AuthFilterService` is registered before `UsernamePasswordAuthenticationFilter`.

**`AuthFilterService`** (extends `OncePerRequestFilter`)
Reads the `Authorization: Bearer <token>` header, extracts the subject (email), loads the `UserDetails`, validates the token and populates the `SecurityContext`. Requests without the header pass through unauthenticated.

**`JwtService`**
Signs tokens with HS256. Claims embedded in the access token: `sub` (email), `role` (granted authorities), `userId`, `user_role`, `iat`, `exp`.

**`RefreshTokenService`**
Issues one persistent refresh token per user (UUID). `verifyRefreshToken` deletes expired tokens and rejects the request; valid tokens are exchanged for a fresh access token at `POST /api/v1/auth/refresh`.

**`ApplicationConfig`**
Declares `UserDetailsService` (lookup by email), `BCryptPasswordEncoder`, `DaoAuthenticationProvider` and the `AuthenticationManager`.

**`CorsConfig`**
Allows origin pattern `http://localhost:*`, methods `GET, POST, PUT, PATCH, DELETE, OPTIONS`, all headers, with credentials.

**`DataLoader`** (`CommandLineRunner`)
On startup, creates a default `ADMIN` account if no user with type `ADMIN` exists. Change these credentials before any non-local use.

### Authorisation model

Endpoint-level checks use `@PreAuthorize`. On top of that, the service layer performs **ownership checks**: `MedicalEventService.getEventsForPatient` and `RecommendationService.getRecommendationsForPatient` resolve the authenticated user and throw `AccessDeniedException` unless the caller is a `DOCTOR` or is the patient whose data is being requested. Doctors are additionally required to have a `Medic` record before they can create recommendations.

## Telemetry ingestion (MQTT)

`MqttConfig` wires a `MqttPahoMessageDrivenChannelAdapter` (client id `iHealthClient`, QoS 1, completion timeout 5000 ms) to the topic `ihealth/v1/telemetrie`, feeding a `DirectChannel`. A `@ServiceActivator` on that channel deserializes the JSON payload into `TelemetryData` with Jackson and hands it to `TelemetryService`.

Expected payload shape:

```json
{
  "p_id": "PT_102",
  "data": {
    "temp": 36.7,
    "pres": 120.0,
    "bpm": 78.0,
    "spo2": 97.0,
    "ecg": 512
  }
}
```

`TelemetryService.processTelemetryData` is `@Transactional`. It parses the numeric patient id out of the `p_id` string (`PT_102` → `102`), resolves the `Patient`, and writes one `TelemetryMeasurement` row per sensor (`temp`, `pres`, `bpm`, `spo2`, `ecg`) with a shared timestamp.

## REST API reference

Base URL: `http://localhost:8080`. All protected endpoints require `Authorization: Bearer <accessToken>`.

### Authentication — `/api/v1/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/register/patient` | public | Self-registration for patients. Returns `201` with tokens. |
| `POST` | `/register/doctor` | `ADMIN` | Creates a `User` of type `DOCTOR` and its `Medic` record. Returns `201`. |
| `POST` | `/login` | authenticated credentials | Returns access + refresh token. |
| `POST` | `/refresh` | valid refresh token | Exchanges a refresh token for a new access token. |

`AuthResponse`: `accessToken`, `refreshToken`, `name`, `email`.

### Users — `/api/v1/users`

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/me` | authenticated | Returns `CurrentUserResponse`: `id`, `name`, `email`, `role`, `patientId`, `medicId`. |

### Patients — `/api/patients`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/profile` | `PATIENT` | Creates the demographic profile for the logged-in patient. Returns `201`. |
| `GET` | `/me` | `PATIENT` | Returns the caller's own profile. |
| `GET` | `/{id}/demographics` | `DOCTOR` | Returns a patient's demographics, `404` if not found. |
| `PATCH` | `/{id}/medical-summary` | `DOCTOR` | Updates `generalMedicalHistory` and `knownAllergies`. |
| `PATCH` | `/create/demographics` | `MEDIC` | Saves demographics for a given patient id. |
| `DELETE` | `/{id}/remove` | `MEDIC` | Deletes a patient's demographic record. |

### Medical events — `/api/patients/{patientId}/medical-events`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/` | `DOCTOR` | Adds an event (`eventDate`, `eventType`, `details`). Returns `201`. |
| `GET` | `/` | `DOCTOR`, `PATIENT` | Lists events. Patients receive only their own; enforced in the service layer. |

### Recommendations — `/api/patients/recommendations`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/for-patient/{patientId}/doctor` | `DOCTOR` | Creates a recommendation. Requires the caller to have a `Medic` record. Returns `201`. |
| `GET` | `/for-patient/{patientId}` | `PATIENT` | Lists recommendations, with an ownership check. |
| `PATCH` | `/{recommendationId}` | `DOCTOR` | Updates type and details. |
| `DELETE` | `/{recommendationId}` | `DOCTOR` | Deletes a recommendation. Returns `204`. |

### Telemetry — `/api/telemetry`

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/me` | `PATIENT` | Returns the caller's latest 100 measurements, newest first. |

### Interactive documentation

`springdoc-openapi` is on the classpath, so once the application is running the generated documentation is available at `/swagger-ui.html` and the raw spec at `/v3/api-docs`.

## Business rules

**Email domain enforcement.** Doctor accounts must use an address ending in `@medic.com`; patient self-registration requires `@patient.com`. Duplicate emails are rejected with `IllegalArgumentException`.

**CNP validation.** Before a patient profile is stored, the Romanian personal numeric code is validated in `PatientService.validateCnp` through a chain of predicates:

1. exactly 13 digits;
2. first digit in `1..8` (sex and century);
3. digits 4–5 form a month in `01..12`;
4. digits 6–7 form a day in `01..31`;
5. digits 8–9 form a county code in `01..52`;
6. digits 10–12 form an order number in `001..999`;
7. the 13th digit matches the checksum computed with the official weights `2 7 9 1 4 6 3 5 8 2 7 9` (`sum % 11`, with remainder `10` mapped to `1`).

Uniqueness is then checked separately against the database.

**Doctor identity.** Creating a recommendation resolves the authenticated user to a `Medic` entity; if none exists, the request is denied.

## Configuration

`src/main/resources/application.properties`:

```properties
spring.application.name=iHealth
server.port=8080

spring.datasource.url=jdbc:mysql://<host>:<port>/<database>?sslMode=REQUIRED
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

The schema is generated and updated automatically by Hibernate (`ddl-auto=update`), so no manual DDL is required for local development.

The MQTT broker URI is currently declared in `MqttConfig`; move it to a property such as `ihealth.mqtt.broker-url` if you deploy to a different network.

> **Credentials must not be committed.** Supply `DB_USERNAME`, `DB_PASSWORD` and the JWT signing key as environment variables, and keep any local override file out of version control via `.gitignore`.

## Running the project

Prerequisites: JDK 17, Maven 3.9+, a reachable MySQL instance, and an MQTT broker if you want telemetry ingestion.

```bash
# clone and enter the project
git clone <repository-url>
cd iHealth

# provide credentials
export DB_USERNAME=<username>
export DB_PASSWORD=<password>

# run
./mvnw spring-boot:run

# or build a jar
./mvnw clean package
java -jar target/ex-0.0.1-SNAPSHOT.jar
```

The API starts on `http://localhost:8080`. `spring-boot-devtools` is included, so the application restarts automatically on recompilation during development.

### Quick smoke test

```bash
# 1. register a patient
curl -X POST http://localhost:8080/api/v1/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","username":"testp","email":"test@patient.com","password":"secret123"}'

# 2. log in
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@patient.com","password":"secret123"}'

# 3. call a protected endpoint
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <accessToken>"
```

## Project structure

```
src/main/java/com/ex
├── IHealthApplication.java
├── core
│   ├── entities
│   │   ├── Address.java              # @Embeddable
│   │   ├── AlertHistory.java
│   │   ├── AlertRule.java
│   │   ├── Medic.java
│   │   ├── MedicalEvent.java
│   │   ├── Patient.java
│   │   ├── Recommendation.java
│   │   ├── TelemetryMeasurement.java
│   │   └── enums
│   │       ├── AlertCondition.java
│   │       ├── EventType.java
│   │       ├── Gender.java
│   │       └── RecommendationType.java
│   └── repositories                  # 8 Spring Data repositories
├── sv                                # sensor / IoT layer
│   ├── config/MqttConfig.java
│   ├── dto/TelemetryPayloadDTO.java
│   ├── dto/telemetry/{TelemetryData,SensorData}.java
│   └── service/TelemetryService.java
└── web
    ├── auth
    │   ├── config/{ApplicationConfig,CorsConfig,SecurityConfiguration}.java
    │   ├── controller/AuthController.java
    │   ├── entities/{User,RefreshToken,TypeUser}.java
    │   ├── repositories/{UserRepository,RefreshTokenRepository}.java
    │   ├── services/{AuthService,JwtService,RefreshTokenService,AuthFilterService}.java
    │   └── utils/{AuthResponse,LoginRequest,RegisterRequest,CreateDoctorRequest,RefreshTokenRequest,DataLoader}.java
    ├── controllers/{Patient,MedicalEvent,Recommendation,Telemetry,User}Controller.java
    ├── dto/request/*.java
    ├── dto/response/*.java
    └── services/{PatientService,MedicalEventService,RecommendationService}.java
```

## Known limitations

Items that are deliberately open, useful to know before extending the project:

- `AlertRequestDTO` and `AlertResponseDTO` are placeholders; the alerting API on top of `AlertRule` and `AlertHistory` is not exposed yet, and rules are not currently evaluated against incoming telemetry.
- `GET /api/telemetry/me` returns `TelemetryMeasurement` entities directly rather than a response DTO.
- `MedicalEventService.getEventsForPatient` loads all events and filters in memory; switching to `findByPatient` is the natural optimisation.
- `PatientController` mixes the `DOCTOR` and `MEDIC` authority names across endpoints; only `DOCTOR` is issued by the authentication module.
- The JWT signing key and the MQTT broker URI are hardcoded and should be externalised to configuration.
- Access tokens are short-lived by construction (`25 * 100000` ms) and refresh tokens are not rotated on use.
- No automated tests beyond the generated context-load test.
