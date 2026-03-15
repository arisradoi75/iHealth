package com.ex.core.repositories;

import com.ex.core.entities.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordsRepo extends JpaRepository<MedicalRecord, Long> {

}
