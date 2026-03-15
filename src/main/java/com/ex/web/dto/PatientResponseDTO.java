package com.ex.web.dto;

import com.ex.core.entities.Address;
import com.ex.core.entities.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientResponseDTO {
    private String name;
    private LocalDate bornDate;
    private String cnp;
    private Gender gender;
    private Address address;
    private String phone;
    private String email;
    private String occupation;
    private String workplace;
}
