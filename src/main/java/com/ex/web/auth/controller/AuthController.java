package com.ex.web.auth.controller;

import com.ex.web.auth.entities.RefreshToken;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.services.AuthService;
import com.ex.web.auth.services.JwtService;
import com.ex.web.auth.services.RefreshTokenService;
import com.ex.web.auth.utils.AuthResponse;
import com.ex.web.auth.utils.CreateDoctorRequest;
import com.ex.web.auth.utils.LoginRequest;
import com.ex.web.auth.utils.RefreshTokenRequest;
import com.ex.web.auth.utils.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(value = "http://localhost:5173/")
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, JwtService jwtService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
    }

    /**
     * PACIENT se înregistrează singur
     * Public endpoint - oricine poate se înregistreze ca pacient
     */
    @PostMapping("/register/patient")
    public ResponseEntity<AuthResponse> registerPatient(@RequestBody RegisterRequest patientRequest) {
        AuthResponse response = authService.registerPatient(patientRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ADMIN creează conturi de DOCTOR
     * Protejat - doar ADMIN poate accesa
     */
    @PostMapping("/register/doctor")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AuthResponse> createDoctorAccount(@RequestBody CreateDoctorRequest doctorRequest) {
        AuthResponse response = authService.createDoctorAccount(doctorRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * LOGIN pentru toți utilizatorii (ADMIN, DOCTOR, PATIENT)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * REFRESH TOKEN pentru toți utilizatorii autentificați
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenRequest.getRefreshToken());
        User user = refreshToken.getUser();
        String accessToken = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .name(user.getName())
                .email(user.getEmail())
                .build());
    }
}
