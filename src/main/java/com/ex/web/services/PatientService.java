package com.ex.web.services;

import com.ex.core.entities.Patient;
import com.ex.core.repositories.PatientRepository;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.repositories.UserRepository;
import com.ex.web.dto.request.MedicalSummaryRequestDTO;
import com.ex.web.dto.request.PatientRequestDTO;
import com.ex.web.dto.response.PatientResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    //Mapper din entity in DTO
    public PatientResponseDTO mapToDto(Patient patient) {
        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setName(patient.getName());
        dto.setBornDate(patient.getBornDate());
        dto.setCnp(patient.getCnp());
        dto.setGender(patient.getGender());
        dto.setAddress(patient.getAddress());
        dto.setPhone(patient.getPhone());
        dto.setEmail(patient.getEmail());
        dto.setProfesion(patient.getProfesion());
        dto.setJob(patient.getJob());
        dto.setGeneralMedicalHistory(patient.getGeneralMedicalHistory());
        dto.setKnownAllergies(patient.getKnownAllergies());
        return dto;
    }

    //2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9 sunt cifrele de control
    private static final int[] CNP_WEIGHTS = {2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9};
    private static final Set<Integer> VALID_FIRST_DIGITS = Set.of(1, 2, 3, 4, 5, 6, 7, 8);

    private void validateCnp(String cnp) {
        Optional.ofNullable(cnp)
                .filter(c -> c.matches("^[0-9]{13}$"))
                .filter(c -> isFirstDigitValid(c))
                .filter(c -> isMonthValid(c))
                .filter(c -> isDayValid(c))
                .filter(c -> isCountyValid(c))
                .filter(c -> isOrderNumberValid(c))
                .filter(c -> isControlDigitValid(c))
                .orElseThrow(() -> new IllegalArgumentException("CNP invalid"));
    }

    // Prima cifra - sex si secol
    private boolean isFirstDigitValid(String cnp) {
        int firstDigit = cnp.charAt(0) - '0';
        return VALID_FIRST_DIGITS.contains(firstDigit);
    }

    // Cifrele 4-5 - luna nasterii
    private boolean isMonthValid(String cnp) {
        int month = Integer.parseInt(cnp.substring(3, 5));
        return month >= 1 && month <= 12;
    }

    // Cifrele 6-7 - ziua nasterii
    private boolean isDayValid(String cnp) {
        int day = Integer.parseInt(cnp.substring(5, 7));
        return day >= 1 && day <= 31;
    }

    // Cifrele 8-9 - codul judetului
    private boolean isCountyValid(String cnp) {
        int county = Integer.parseInt(cnp.substring(7, 9));
        return county >= 1 && county <= 52;
    }

    // Cifrele 10-12 - numarul de ordine
    private boolean isOrderNumberValid(String cnp) {
        int orderNumber = Integer.parseInt(cnp.substring(9, 12));
        return orderNumber >= 1 && orderNumber <= 999;
    }

    // Ultima cifra - cifra de control
    private boolean isControlDigitValid(String cnp) {
        int sum = IntStream.range(0, 12)
                .map(i -> (cnp.charAt(i) - '0') * CNP_WEIGHTS[i])
                .sum();

        int remainder = sum % 11;
        int controlDigit = (remainder == 10) ? 1 : remainder;

        return controlDigit == (cnp.charAt(12) - '0');
    }

    private void validateCnpUniqueness(String cnp) {
        if(patientRepository.existsPatientByCnp(cnp)) {
            throw new IllegalArgumentException("CNP already exists");
        }
    }


    @Transactional
    public void createProfile(PatientRequestDTO request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));


        if (patientRepository.findByUser(user).isPresent()) {
            throw new IllegalStateException("Patient profile already exists for this user.");
        }


        Patient patientProfile = Patient.builder()
                .name(request.getName())
                .bornDate(request.getBornDate())
                .cnp(request.getCnp())
                .gender(request.getGender())
                .address(request.getAddress())
                .phone(request.getPhone())  
                .email(request.getEmail())
                .profesion(request.getProfesion())
                .job(request.getJob())
                .user(user)
                .build();

        patientRepository.save(patientProfile);
    }

    public Optional<Patient> getDemographics(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getDemographicsByEmail(String email){
        return patientRepository.findByUserEmail(email);
    }

    @Transactional
    public PatientResponseDTO updateMedicalSummary(Long patientId, MedicalSummaryRequestDTO request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        patient.setGeneralMedicalHistory(request.getGeneralMedicalHistory());
        patient.setKnownAllergies(request.getKnownAllergies());

        Patient updatedPatient = patientRepository.save(patient);
        return mapToDto(updatedPatient);
    }

    public Patient saveDemographics(Long id, PatientRequestDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setName(dto.getName());
        patient.setBornDate(dto.getBornDate());
        patient.setCnp(dto.getCnp());
        patient.setAddress(dto.getAddress());
        patient.setGender(dto.getGender());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setProfesion(dto.getProfesion());
        patient.setJob(dto.getJob());

        return patientRepository.save(patient);

    }

    public void removeDemographics(Long id) {
        patientRepository.deleteById(id);
    }


}
