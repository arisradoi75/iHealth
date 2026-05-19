package com.ex.sv.services;

import com.ex.core.entities.AlertHistory;
import com.ex.core.entities.AlertRule;
import com.ex.core.entities.Patient;
import com.ex.core.entities.TelemetryMeasurement;
import com.ex.core.repositories.AlertHistoryRepository;
import com.ex.core.repositories.AlertRuleRepository;
import com.ex.core.repositories.PatientRepository;
import com.ex.core.repositories.TelemetryMeasurementRepository;
import com.ex.sv.dto.TelemetryPayloadDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttListenerService implements IMqttMessageListener {

    private final MqttClient mqttClient;
    private final ObjectMapper objectMapper;
    private final PatientRepository patientRepository;
    private final TelemetryMeasurementRepository telemetryMeasurementRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final MqttPublisherService mqttPublisherService;

    @PostConstruct
    public void init() {
        try {
            mqttClient.subscribe("ihealth/telemetry", this);
            log.info("Subscribed to topic: ihealth/telemetry");
        } catch (MqttException e) {
            log.error("Error subscribing to topic: ihealth/telemetry", e);
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        try {
            TelemetryPayloadDTO payload = objectMapper.readValue(message.getPayload(), TelemetryPayloadDTO.class);
            log.info("Received message from topic {}: {}", topic, payload);

            patientRepository.findById(payload.getPatientId()).ifPresent(patient -> {
                saveTelemetryData(payload, patient);
                checkAlertRules(payload, patient);
            });

        } catch (IOException e) {
            log.error("Error parsing MQTT message", e);
        }
    }

    private void saveTelemetryData(TelemetryPayloadDTO payload, Patient patient) {
        TelemetryMeasurement measurement = TelemetryMeasurement.builder()
                .patient(patient)
                .sensorType(payload.getSensorType())
                .value(payload.getValue())
                .ecgData(payload.getEcgValues() != null ? payload.getEcgValues().toString() : null)
                .timestamp(LocalDateTime.now())
                .build();
        telemetryMeasurementRepository.save(measurement);
    }

    private void checkAlertRules(TelemetryPayloadDTO payload, Patient patient) {
        List<AlertRule> rules = alertRuleRepository.findByPatientIdAndSensorType(patient.getId(), payload.getSensorType());
        for (AlertRule rule : rules) {
            boolean alertTriggered = false;
            switch (rule.getCondition()) {
                case GREATER_THAN:
                    if (payload.getValue() > rule.getValue()) {
                        alertTriggered = true;
                    }
                    break;
                case LESS_THAN:
                    if (payload.getValue() < rule.getValue()) {
                        alertTriggered = true;
                    }
                    break;
                case EQUALS:
                    if (payload.getValue().equals(rule.getValue())) {
                        alertTriggered = true;
                    }
                    break;
            }

            if (alertTriggered) {
                saveAlertHistory(patient, rule);
                mqttPublisherService.trimiteAlarmaCatreArduino(patient.getId(), "CRITIC");
            }
        }
    }

    private void saveAlertHistory(Patient patient, AlertRule rule) {
        AlertHistory alertHistory = AlertHistory.builder()
                .patient(patient)
                .details(String.format("Alert triggered for rule: %s %s %s", rule.getSensorType(), rule.getCondition(), rule.getValue()))
                .triggeredAt(LocalDateTime.now())
                .build();
        alertHistoryRepository.save(alertHistory);
    }
}
