package com.ex.web.dto;

import com.ex.core.entities.Address;
import com.ex.core.entities.Gender;
import jakarta.persistence.Embedded;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRequestDto {
    private String name;
    private LocalDate bornDate;
    private String cnp;
    private Address address;
    private Gender gender;
    private String phone;
    private String email;
    private String profesion;
    private String job;
}
