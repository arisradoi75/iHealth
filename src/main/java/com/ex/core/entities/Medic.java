package com.ex.core.entities;

import com.ex.web.auth.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "medic")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Entity
public class Medic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nume;
    private String specializare;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    // TODO: add MedicalRecordRepository
    // TODO: add MedicalRecordService with validations (patient exists, no duplicate record)
    // TODO: add endpoints in PatientController (POST, GET, PATCH) for medical record
    // TODO: add MedicalRecordRequestDTO and MedicalRecordResponseDTO
    // TODO: restrict medical record access - only MEDIC can create/update, PATIENT can only read
}
