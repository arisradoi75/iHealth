package com.ex.web.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientProfileRequest {
    private String name;
    private LocalDate bornDate;
    private String cnp;
    private String address;
    private String phone;
    private String email;
    private String profesion;
    private String job;
}
