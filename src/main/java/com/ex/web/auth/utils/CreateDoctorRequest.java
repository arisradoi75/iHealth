package com.ex.web.auth.utils;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateDoctorRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private String specializare; // Am adăugat acest câmp
}
