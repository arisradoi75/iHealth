package com.ex.sv.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttPublisherService {

    private final MqttClient mqttClient;

    public void trimiteAlarmaCatreArduino(Long patientId, String mesajAlarma) {
        String topic = String.format("ihealth/pacient/%d/alarme", patientId);
        MqttMessage message = new MqttMessage(mesajAlarma.getBytes());
        message.setQos(1);
        try {
            mqttClient.publish(topic, message);
            log.info("Alarma publicata pe topicul {}: {}", topic, mesajAlarma);
        } catch (MqttException e) {
            log.error("Eroare la publicarea alarmei pe topicul {}: {}", topic, e.getMessage());
        }
    }
}
