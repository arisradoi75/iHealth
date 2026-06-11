package com.ex.sv.service;

import com.ex.core.entities.AlertHistory;
import com.ex.core.entities.Patient;
import com.ex.core.entities.TelemetryMeasurement;
import com.ex.core.repositories.PatientRepository;
import com.ex.core.repositories.TelemetryMeasurementRepository;
import com.ex.core.repositories.AlertRuleRepository;
import com.ex.core.repositories.AlertHistoryRepository;
import com.ex.sv.dto.TelemetryPayloadDTO;
import com.ex.sv.dto.telemetry.SensorData;
import com.ex.sv.dto.telemetry.TelemetryData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final PatientRepository patientRepository;
    private final TelemetryMeasurementRepository telemetryMeasurementRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final AlertHistoryRepository alertHistoryRepository;




    @Transactional
    public void processTelemetryData(TelemetryData telemetryData) {
        Long patientId = Long.parseLong(telemetryData.getPatientId().split("_")[1]);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));

        SensorData sensorData = telemetryData.getData();
        sensorData.setTimestamp(LocalDateTime.now());

        TelemetryMeasurement measurement = new TelemetryMeasurement();
        measurement.setPatient(patient);
        measurement.setStatusGeneral(telemetryData.getStatusGeneral());
        measurement.setData(sensorData);

        telemetryMeasurementRepository.save(measurement);

        checkAlerts(patient, sensorData, LocalDateTime.now());
    }

    private void checkAlerts(Patient patient, SensorData sensorData, LocalDateTime timestamp) {
        checkSensor(patient, "bpm", sensorData.getBpm(), timestamp);
        checkSensor(patient, "spo2", sensorData.getSpo2(), timestamp);
        checkSensor(patient, "temp", sensorData.getTemp(), timestamp);
        checkSensor(patient, "pres", sensorData.getPres(), timestamp);
        checkSensor(patient, "ecg", (double) sensorData.getEcg(), timestamp);
    }

    private void checkSensor(Patient patient, String sensorType, Double value, LocalDateTime timestamp) {
        try {
            var rules = alertRuleRepository.findByPatientIdAndSensorType(patient.getId(), sensorType);
            for (var rule : rules) {
                boolean triggered = switch (rule.getCondition()) {
                    case GREATER_THAN -> value != null && value > rule.getValue();
                    case LESS_THAN -> value != null && value < rule.getValue();
                    case EQUALS -> value != null && value.equals(rule.getValue());
                };

                if (triggered) {
                    AlertHistory history = new AlertHistory();
                    history.setPatient(patient);
                    history.setDetails(String.format(
                            "Sensor %s: %.2f (rule: %s %.2f)",
                            sensorType, value, rule.getCondition(), rule.getValue()
                    ));
                    history.setTriggeredAt(timestamp);
                    alertHistoryRepository.save(history);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}