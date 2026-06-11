package com.ex.web.controllers;

import com.ex.core.entities.TelemetryMeasurement;
import com.ex.core.entities.Patient;
import com.ex.core.repositories.TelemetryMeasurementRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.sv.dto.TelemetryPayloadDTO;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:5173")
public class TelemetryController {

    private final TelemetryMeasurementRepository telemetryMeasurementRepository;
    private final PatientRepository patientRepository;

    private TelemetryPayloadDTO convertToDto(TelemetryMeasurement measurement) {
        TelemetryPayloadDTO dto = new TelemetryPayloadDTO();
        dto.setId(measurement.getId());
        dto.setStatusGeneral(measurement.getStatusGeneral());
        dto.setData(measurement.getData());

        if (measurement.getPatient() != null) {
            dto.setPatientId(measurement.getPatient().getId());
            dto.setPatientName(measurement.getPatient().getName());
        }
        return dto;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<List<TelemetryPayloadDTO>> getMyTelemetryData(@AuthenticationPrincipal Patient patient) {
        List<TelemetryMeasurement> measurements = telemetryMeasurementRepository.findTop100ByPatient_IdOrderByData_TimestampDesc(patient.getId());

        // Convertim lista de entități în listă de DTO-uri
        List<TelemetryPayloadDTO> dtos = measurements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('PATIENT','DOCTOR')")
    public ResponseEntity<List<TelemetryPayloadDTO>> getTelemetryForPatient(@PathVariable Long patientId, @AuthenticationPrincipal User user) {

        if (user.getType().name().equals("PATIENT")) {
            Patient patient = patientRepository.findById(patientId).orElseThrow(() -> new RuntimeException("Patient not found"));
            if (patient.getUser() == null || !patient.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        List<TelemetryMeasurement> measurements = telemetryMeasurementRepository.findTop100ByPatient_IdOrderByData_TimestampDesc(patientId);

        List<TelemetryPayloadDTO> dtos = measurements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<List<TelemetryPayloadDTO>> getAllTelemetry() {
        List<TelemetryMeasurement> measurements = telemetryMeasurementRepository.findAll();

        List<TelemetryPayloadDTO> dtos = measurements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}


