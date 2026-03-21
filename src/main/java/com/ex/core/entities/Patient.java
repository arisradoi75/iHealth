package com.ex.core.entities;

import com.ex.core.entities.enums.Gender;
import com.ex.web.auth.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "patient")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate bornDate;

    @Column(unique = true)
    private String cnp;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Embedded
    private Address address;

    @Column(unique = true)
    private String phone;

    private String email;
    private String profesion;
    private String job;

    // Am păstrat aceste câmpuri, deoarece corespund cerințelor
    private String generalMedicalHistory;
    private String knownAllergies;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    // Am păstrat doar relația relevantă
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalEvent> medicalEvents;

}
