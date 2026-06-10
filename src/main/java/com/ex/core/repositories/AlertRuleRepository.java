package com.ex.core.repositories;

import com.ex.core.entities.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {
    List<AlertRule> findByPatientIdAndSensorType(Long patientId, String sensorType);
}
