package com.ex.core.entities;

import com.ex.core.entities.enums.EventType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "medical_event") // Am păstrat numele tabelului, poate fi schimbat în medical_record dacă dorești
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate eventData;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    private String details;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
}
