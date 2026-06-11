package com.ex.core.entities;

import com.ex.sv.dto.telemetry.SensorData;
import com.ex.web.auth.entities.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_measurements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryMeasurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "status_general")
    private String statusGeneral;

    @Column(name = "sensor_type", nullable = false)
    private String sensorType = "ESP32";

    @Embedded
    private SensorData data;

}
