package com.ex.web.dto.request;

import com.ex.core.entities.Address;
import com.ex.core.entities.enums.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRequestDTO {
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
