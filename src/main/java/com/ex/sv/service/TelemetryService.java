package com.ex.sv.service;

import com.ex.core.entities.Patient;
import com.ex.core.entities.TelemetryMeasurement;
import com.ex.core.repositories.PatientRepository;
import com.ex.core.repositories.TelemetryMeasurementRepository;
import com.ex.core.repositories.AlertRuleRepository;
import com.ex.core.repositories.AlertHistoryRepository;
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
        // Extragem ID-ul numeric din string-ul "PT_102"
        Long patientId = Long.parseLong(telemetryData.getPatientId().split("_")[1]);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        SensorData sensorData = telemetryData.getData();
        LocalDateTime now = LocalDateTime.now();

        // Salvăm fiecare măsurătoare individual
        saveMeasurement(patient, "temp", sensorData.getTemp(), now);
        saveMeasurement(patient, "pres", sensorData.getPres(), now);
        saveMeasurement(patient, "bpm", sensorData.getBpm(), now);
        saveMeasurement(patient, "spo2", sensorData.getSpo2(), now);
        saveMeasurement(patient, "ecg", (double) sensorData.getEcg(), now);

        System.out.println("Successfully saved telemetry data for patient: " + patient.getId());
    }

    private void saveMeasurement(Patient patient, String sensorType, Double value, LocalDateTime timestamp) {
        TelemetryMeasurement measurement = new TelemetryMeasurement();
        measurement.setPatient(patient);
        measurement.setSensorType(sensorType);
        measurement.setValue(value);
        measurement.setTimestamp(timestamp);
        telemetryMeasurementRepository.save(measurement);

        // Check alert rules for this patient and sensor type
        try {
            var rules = alertRuleRepository.findByPatientIdAndSensorType(patient.getId(), sensorType);
            for (var rule : rules) {
                boolean triggered = false;
                switch (rule.getCondition()) {
                    case GREATER_THAN:
                        triggered = value != null && value > rule.getValue();
                        break;
                    case LESS_THAN:
                        triggered = value != null && value < rule.getValue();
                        break;
                    case EQUALS:
                        triggered = value != null && value.equals(rule.getValue());
                        break;
                }

                if (triggered) {
                    com.ex.core.entities.AlertHistory history = new com.ex.core.entities.AlertHistory();
                    history.setPatient(patient);
                    history.setDetails(String.format("Sensor %s triggered rule %s %s %s (value=%.2f)", sensorType, rule.getCondition(), rule.getValue(), "", value));
                    history.setTriggeredAt(timestamp);
                    alertHistoryRepository.save(history);
                }
            }
        } catch (Exception e) {
            // log and continue
            e.printStackTrace();
        }
    }
}
