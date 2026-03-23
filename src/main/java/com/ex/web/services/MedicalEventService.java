package com.ex.web.services;

import com.ex.core.entities.MedicalEvent;
import com.ex.core.entities.Patient;
import com.ex.core.repositories.MedicalEventRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.repositories.UserRepository;
import com.ex.web.dto.request.MedicalEventRequestDTO;
import com.ex.web.dto.response.MedicalEventResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalEventService {

    private final MedicalEventRepository medicalEventRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public void addEvent(Long patientId, MedicalEventRequestDTO request) {
        var patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        var medicalEvent = MedicalEvent.builder()
                .eventData(request.getEventDate())
                .eventType(request.getEventType())
                .details(request.getDetails())
                .patient(patient)
                .build();

        medicalEventRepository.save(medicalEvent);
    }

    public List<MedicalEventResponseDTO> getEventsForPatient(Long patientId) {

        patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        // Pas 1: Obține utilizatorul curent logat
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Pas 2: Aplică logica de securitate
        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("DOCTOR"));

        boolean isPatientViewingOwnData = false;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("PATIENT"))) {
            isPatientViewingOwnData = patientRepository.findByUser(currentUser)
                    .map(patient -> patient.getId().equals(patientId))
                    .orElse(false);
        }

        // Pas 3: Dacă nu este doctor și nici pacientul care își vede propriile date, refuză accesul
        if (!isDoctor && !isPatientViewingOwnData) {
            throw new AccessDeniedException("You do not have permission to view these medical events.");
        }

        // Pas 4: Dacă securitatea a trecut, filtrează și returnează evenimentele
        // Se încarcă toate evenimentele și se filtrează în memorie pentru a nu modifica Repository-ul
        return medicalEventRepository.findAll().stream()
                .filter(event -> event.getPatient().getId().equals(patientId))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Mapper privat pentru a converti Entitatea în DTO
    private MedicalEventResponseDTO mapToDto(MedicalEvent event) {
        MedicalEventResponseDTO dto = new MedicalEventResponseDTO();
        dto.setEventDate(event.getEventData());
        dto.setEventType(event.getEventType());
        dto.setDetails(event.getDetails());
        return dto;
    }
}
