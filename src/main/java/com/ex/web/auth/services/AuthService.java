package com.ex.web.auth.services;

import com.ex.core.entities.Medic;
import com.ex.core.entities.Patient;
import com.ex.core.repositories.MedicRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.entities.TypeUser;
import com.ex.web.auth.repositories.UserRepository;
import com.ex.web.auth.utils.AuthResponse;
import com.ex.web.auth.utils.CreateDoctorRequest;
import com.ex.web.auth.utils.LoginRequest;
import com.ex.web.auth.utils.RegisterRequest;
import com.ex.web.dto.response.CurrentUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final MedicRepository medicRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    /**
     * ADMIN creează conturi de DOCTOR
     * Email TREBUIE să conțină @medic.com
     */
    @Transactional
    public AuthResponse createDoctorAccount(CreateDoctorRequest doctorRequest) {
        // Verifică dacă utilizatorul curent este ADMIN
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException("Only ADMIN can create doctor accounts!");
        }

        String email = doctorRequest.getEmail();
        
        // Validează că email-ul conține @medic.com
        if (!email.endsWith("@medic.com")) {
            throw new IllegalArgumentException("Doctor email must end with @medic.com");
        }

        // Verifică dacă email-ul este deja folosit
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use!");
        }

        // Pasul A: Crează și salvează User
        var user = User.builder()
                .name(doctorRequest.getName())
                .email(email)
                .username(doctorRequest.getUsername())
                .password(passwordEncoder.encode(doctorRequest.getPassword()))
                .type(TypeUser.DOCTOR)
                .build();
        User savedUser = userRepository.save(user);

        // Pasul B: Crează și salvează Medic
        var medic = Medic.builder()
                .nume(savedUser.getName())
                .specializare(doctorRequest.getSpecializare())
                .user(savedUser) // Legătura către User
                .build();
        medicRepository.save(medic);

        return generateAuthResponse(savedUser);
    }

    /**
     * PACIENT se înregistrează singur
     * Email TREBUIE să conțină @patient.com
     */
    @Transactional
    public AuthResponse registerPatient(RegisterRequest patientRequest) {
        String email = patientRequest.getEmail();
        
        // Validează că email-ul conține @patient.com
        if (!email.endsWith("@patient.com")) {
            throw new IllegalArgumentException("Patient email must end with @patient.com");
        }

        // Verifică dacă email-ul este deja folosit
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use!");
        }

        // Crează cont de pacient
        var patient = User.builder()
                .name(patientRequest.getName())
                .email(email)
                .username(patientRequest.getUsername())
                .password(passwordEncoder.encode(patientRequest.getPassword()))
                .type(TypeUser.PATIENT)
                .build();

        User savedPatient = userRepository.save(patient);
        return generateAuthResponse(savedPatient);
    }

    /**
     * LOGIN pentru toți utilizatorii (ADMIN, DOCTOR, PATIENT)
     */
    public AuthResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        
        var user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
        
        return generateAuthResponse(user);
    }

    /**
     * Generează JWT token și refresh token
     */
    private AuthResponse generateAuthResponse(User user) {
        var accessToken = jwtService.generateToken(user);
        var refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .name(user.getName())
                .email(user.getEmail())
                .userType(user.getType())
                .build();
    }

    public CurrentUserResponse createCurrentUserResponse(User user) {
        CurrentUserResponse.CurrentUserResponseBuilder responseBuilder = CurrentUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getType().name());

        if (user.getType() == TypeUser.PATIENT) {
            Optional<Patient> patient = patientRepository.findByUser(user);
            patient.ifPresent(p -> responseBuilder.patientId(p.getId()));
        } else if (user.getType() == TypeUser.DOCTOR) {
            Optional<Medic> medic = medicRepository.findByUser(user);
            medic.ifPresent(m -> responseBuilder.medicId(m.getId()));
        }

        return responseBuilder.build();
    }
}
