package com.ex.core.repositories;

import com.ex.core.entities.MedicalEvent;
import com.ex.core.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalEventRepository extends JpaRepository<MedicalEvent, Long> {
    // Găsește toate evenimentele pentru un anumit pacient
    List<MedicalEvent> findByPatient(Patient patient);
}
