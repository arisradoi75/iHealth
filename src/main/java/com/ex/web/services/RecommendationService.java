package com.ex.web.services;

import com.ex.core.entities.Patient;
import com.ex.core.entities.Recommendation;
import com.ex.core.repositories.MedicRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.core.repositories.RecommendationRepository;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.repositories.UserRepository;
import com.ex.web.dto.request.RecommendationRequestDTO;
import com.ex.web.dto.response.RecommendationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final MedicRepository medicRepository;

    @Transactional
    public RecommendationResponseDTO addRecommendation(Long patientId, RecommendationRequestDTO request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        User currentUser = getCurrentUser();
        var medic = medicRepository.findByUser(currentUser)
                .orElseThrow(() -> new AccessDeniedException("Only a logged-in medic can create recommendations."));

        Recommendation recommendation = Recommendation.builder()
                .recommendationType(request.getRecommendationType())
                .details(request.getDetails())
                .patient(patient)
                .build();

        Recommendation savedRecommendation = recommendationRepository.save(recommendation);
        return mapToDto(savedRecommendation);
    }

    public List<RecommendationResponseDTO> getRecommendationsForPatient(Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = getCurrentUser();

        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("DOCTOR"));

        boolean isPatientViewingOwnData = false;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("PATIENT"))) {
            isPatientViewingOwnData = patientRepository.findByUser(currentUser)
                    .map(patient -> patient.getId().equals(patientId))
                    .orElse(false);
        }

        // 1. Verifici securitatea PRIMA dată. Dacă pică aici, arunci direct AccessDeniedException (care dă 403 pe bune)
        if (!isDoctor && !isPatientViewingOwnData) {
            throw new AccessDeniedException("You do not have permission to view these recommendations.");
        }

        // 2. Doar dacă are voie, cauți pacientul în baza de date
        Patient requestedPatient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        List<Recommendation> recommendations = recommendationRepository.findByPatient(requestedPatient);
        return recommendations.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecommendationResponseDTO updateRecommendation(Long recommendationId, RecommendationRequestDTO request) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));

        recommendation.setRecommendationType(request.getRecommendationType());
        recommendation.setDetails(request.getDetails());

        Recommendation updatedRecommendation = recommendationRepository.save(recommendation);
        return mapToDto(updatedRecommendation);
    }

    public void deleteRecommendation(Long recommendationId) {
        if (!recommendationRepository.existsById(recommendationId)) {
            throw new RuntimeException("Recommendation not found");
        }
        recommendationRepository.deleteById(recommendationId);
    }


    private User getCurrentUser() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private void checkPermissions(Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = getCurrentUser();

        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("DOCTOR"));

        if (isDoctor) {
            return;
        }

        boolean isPatientViewingOwnData = patientRepository.findByUser(currentUser)
                .map(patient -> patient.getId().equals(patientId))
                .orElse(false);

        if (!isPatientViewingOwnData) {
            throw new AccessDeniedException("You do not have permission to view these recommendations.");
        }
    }

    private RecommendationResponseDTO mapToDto(Recommendation recommendation) {
        RecommendationResponseDTO dto = new RecommendationResponseDTO();
        dto.setRecommendationType(recommendation.getRecommendationType());
        dto.setDetails(recommendation.getDetails());
        return dto;
    }
}
