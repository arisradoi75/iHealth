package com.ex.web.controllers;

import com.ex.core.entities.AlertHistory;
import com.ex.core.entities.Patient;
import com.ex.core.repositories.AlertHistoryRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.web.auth.entities.TypeUser;
import com.ex.web.auth.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts/history")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:5173")
public class AlertHistoryController {

    private final AlertHistoryRepository alertHistoryRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('PATIENT','DOCTOR')")
    public ResponseEntity<List<AlertHistory>> getHistoryForPatient(@PathVariable Long patientId, @AuthenticationPrincipal User user) {
        if (user.getType() == TypeUser.PATIENT) {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            if (patient.getUser() == null || !patient.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        List<AlertHistory> histories = alertHistoryRepository.findAllByPatientIdOrderByTriggeredAtDesc(patientId);
        return ResponseEntity.ok(histories);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<List<AlertHistory>> getAllHistories() {
        return ResponseEntity.ok(alertHistoryRepository.findAllByOrderByTriggeredAtDesc());
    }
}

