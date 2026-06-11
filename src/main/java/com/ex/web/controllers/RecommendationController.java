package com.ex.web.controllers;

import com.ex.web.dto.request.RecommendationRequestDTO;
import com.ex.web.dto.response.RecommendationResponseDTO;
import com.ex.web.services.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/recommendations")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:5173/")
public class RecommendationController{

    private final RecommendationService recommendationService;

    @PostMapping("/for-patient/{patientId}/doctor")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<Void> addRecommendation(@PathVariable Long patientId, @RequestBody RecommendationRequestDTO request){
        recommendationService.addRecommendation(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/for-patient/{patientId}")
    @PreAuthorize("hasAuthority('PATIENT') or hasAuthority( 'DOCTOR')")
    public ResponseEntity<?> getRecommendations(@PathVariable Long patientId) {
        List<RecommendationResponseDTO> recommendations = recommendationService.getRecommendationsForPatient(patientId);
        return ResponseEntity.ok(recommendationService.getRecommendationsForPatient(patientId));
    }

    @DeleteMapping("/{recommendationId}")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long recommendationId){
        recommendationService.deleteRecommendation(recommendationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{recommendationId}")
    @PreAuthorize("hasAuthority('DOCTOR')")
    public ResponseEntity<RecommendationResponseDTO> updateRecommendation(
            @PathVariable Long recommendationId ,
            @RequestBody RecommendationRequestDTO request){
        return ResponseEntity.ok(recommendationService.updateRecommendation(recommendationId, request));
    }

}
