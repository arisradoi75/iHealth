package com.ex.web.controllers;

import com.ex.web.dto.request.MedicalEventRequestDTO;
import com.ex.web.dto.response.MedicalEventResponseDTO;
import com.ex.web.services.MedicalEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/medical-events")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:5173")
public class MedicalEventController {

    private final MedicalEventService medicalEventService;

    @PostMapping("/add")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<Void> addMedicalEvent(
            @PathVariable Long patientId,
            @RequestBody MedicalEventRequestDTO request) {
        medicalEventService.addEvent(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/view")
    @PreAuthorize("hasAnyAuthority('DOCTOR', 'PATIENT')")
    public ResponseEntity<List<MedicalEventResponseDTO>> getMedicalEvents(
            @PathVariable Long patientId) {
        List<MedicalEventResponseDTO> events = medicalEventService.getEventsForPatient(patientId);
        return ResponseEntity.ok(events);
    }


}
