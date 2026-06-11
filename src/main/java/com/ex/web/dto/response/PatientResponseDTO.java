package com.ex.web.dto.response;

import com.ex.core.entities.Address;
import com.ex.core.entities.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientResponseDTO {
    private Long id;
    private String name;
    private LocalDate bornDate;
    private String cnp;
    private Gender gender;
    private Address address;
    private String phone;
    private String email;
    private String profesion;
    private String job;
    private String generalMedicalHistory; // Adăugat
    private String knownAllergies;      // Adăugat
}
