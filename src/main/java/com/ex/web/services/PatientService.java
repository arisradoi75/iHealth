package com.ex.web.services;

import com.ex.core.entities.Patient;
import com.ex.core.repositories.PatientRepository;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.repositories.UserRepository;
import com.ex.web.dto.PatientProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public void createProfile(PatientProfileRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));


        if (patientRepository.findByUser(user).isPresent()) {
            throw new IllegalStateException("Patient profile already exists for this user.");
        }


        Patient patientProfile = Patient.builder()
                .name(request.getName()) // Adăugat
                .bornDate(request.getBornDate())
                .cnp(request.getCnp())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail()) // Adăugat
                .profesion(request.getProfesion()) // Adăugat
                .job(request.getJob()) // Adăugat
                .user(user)
                .build();

        patientRepository.save(patientProfile);
    }
}
