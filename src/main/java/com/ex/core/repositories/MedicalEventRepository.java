package com.ex.core.repositories;

import com.ex.core.entities.MedicalEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalEventRepository extends JpaRepository<MedicalEvent, Long> {
}
