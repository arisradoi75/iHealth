package com.ex.core.repositories;

import com.ex.core.entities.TelemetryMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryMeasurementRepository extends JpaRepository<TelemetryMeasurement, Long> {
    List<TelemetryMeasurement> findTop100ByPatient_User_IdOrderByTimestampDesc(Long userId);
    List<TelemetryMeasurement> findTop100ByPatientIdOrderByTimestampDesc(Long patientId);
}
