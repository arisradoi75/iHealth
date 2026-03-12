package com.ex.web.controllers;

import com.ex.web.dto.PatientProfileRequest;
import com.ex.web.services.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/profile")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<Void> createPatientProfile(@RequestBody PatientProfileRequest request) {
        // Preia email-ul utilizatorului logat din contextul de securitate
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        patientService.createProfile(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
