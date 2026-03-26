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

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
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
    @PreAuthorize("hasAnyAuthority('DOCTOR', 'PATIENT')") // Am corectat 'MEDIC' în 'DOCTOR'
    public ResponseEntity<PatientResponseDTO> getDemographics(@PathVariable Long id) {
        PatientResponseDTO patientData = patientService.getPatientDemographics(id);
        return ResponseEntity.ok(patientData);
    }

    @PatchMapping("/{id}/medical-summary")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<PatientResponseDTO> updateMedicalSummary(
            @PathVariable Long id,
            @RequestBody MedicalSummaryRequestDTO request) {
        PatientResponseDTO updatedPatient = patientService.updateMedicalSummary(id, request);
        return ResponseEntity.ok(updatedPatient);
    }

    @PatchMapping("/{id}/demographics") // Am schimbat ruta pentru a fi mai clară
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<PatientResponseDTO> updateDemographics(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequestDTO request
    ) {
        PatientResponseDTO updatedPatient = patientService.saveDemographics(id, request);
        return ok(updatedPatient);
    }

    @DeleteMapping("/{id}/remove")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public void deleteDemographics(@PathVariable Long id) {
        patientService.removeDemographics(id);
    }
}
