package com.ex.web.controllers;

import com.ex.core.entities.Patient;
import com.ex.web.dto.request.MedicalSummaryRequestDTO;
import com.ex.web.dto.request.PatientRequestDTO;
import com.ex.web.dto.response.PatientResponseDTO;
import com.ex.web.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:5173/")
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/profile")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<Void> createPatientProfile(@RequestBody PatientRequestDTO request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        patientService.createProfile(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{id}/demographics")
    @PreAuthorize("hasAnyAuthority('DOCTOR')")
    public ResponseEntity<PatientResponseDTO> getDemographics(@PathVariable Long id) {

        return patientService.getDemographics(id)
                .map(patient -> ok(patientService.mapToDto(patient)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PATIENT')")
    public ResponseEntity<PatientResponseDTO> getMyProfile() {
        String email = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return patientService.getDemographicsByEmail(email)
                .map(patient -> ok(patientService.mapToDto(patient)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/medical-summary")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<PatientResponseDTO> updateMedicalSummary(
            @PathVariable Long id,
            @RequestBody MedicalSummaryRequestDTO request) {
        PatientResponseDTO updatedPatient = patientService.updateMedicalSummary(id, request);
        return ResponseEntity.ok(updatedPatient);
    }

    @PatchMapping("/create/demographics")
    @PreAuthorize("hasAuthority('MEDIC')")
    public ResponseEntity<Patient> createDemographics(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequestDTO request
    ) {
        return ok(patientService.saveDemographics(id, request));
    }

    @DeleteMapping("/{id}/remove")
    @PreAuthorize("hasAuthority('MEDIC')")
    public void deleteDemographics(@PathVariable Long id) {
        patientService.removeDemographics(id);
    }
}
