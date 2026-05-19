package com.ex.core.repositories;

import com.ex.core.entities.TelemetryMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelemetryMeasurementRepository extends JpaRepository<TelemetryMeasurement, Long> {
}
