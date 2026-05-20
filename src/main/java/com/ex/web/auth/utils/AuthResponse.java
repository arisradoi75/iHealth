package com.ex.web.auth.utils;

import com.ex.web.auth.entities.TypeUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String name;
    private String email;
    private TypeUser userType;
}

