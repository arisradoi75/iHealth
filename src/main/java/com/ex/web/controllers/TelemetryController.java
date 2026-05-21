package com.ex.web.controllers;

import com.ex.core.entities.TelemetryMeasurement;
import com.ex.core.entities.Patient;
import com.ex.core.repositories.TelemetryMeasurementRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.web.auth.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;


import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:5173")
public class TelemetryController {

    private final TelemetryMeasurementRepository telemetryMeasurementRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<List<TelemetryMeasurement>> getMyTelemetryData(@AuthenticationPrincipal User user) {
        // Presupunem că ID-ul pacientului este același cu ID-ul utilizatorului.
        // Aceasta este o presupunere care ar putea necesita ajustare în funcție de modelul de date exact.
        List<TelemetryMeasurement> measurements = telemetryMeasurementRepository.findTop100ByPatient_User_IdOrderByTimestampDesc(user.getId());
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('PATIENT','DOCTOR')")
    public ResponseEntity<List<TelemetryMeasurement>> getTelemetryForPatient(@PathVariable Long patientId, @AuthenticationPrincipal User user) {

        // If patient, validate ownership via patient repository
        if (user.getType().name().equals("PATIENT")) {
            Patient patient = patientRepository.findById(patientId).orElseThrow(() -> new RuntimeException("Patient not found"));
            if (patient.getUser() == null || !patient.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        List<TelemetryMeasurement> measurements = telemetryMeasurementRepository.findTop100ByPatientIdOrderByTimestampDesc(patientId);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<List<TelemetryMeasurement>> getAllTelemetry() {
        // For doctors: return recent measurements across patients
        List<TelemetryMeasurement> measurements = telemetryMeasurementRepository.findAll();
        return ResponseEntity.ok(measurements);
    }
}
