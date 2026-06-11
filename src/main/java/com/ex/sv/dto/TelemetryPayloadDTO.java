package com.ex.sv.dto;

import com.ex.sv.dto.telemetry.SensorData;
import jakarta.persistence.Embedded;
import lombok.Data;

import java.util.List;

@Data
public class TelemetryPayloadDTO {
    private Long id;
    private String statusGeneral;

    @Embedded
    private SensorData data;      // Păstrăm obiectul de senzori (bpm, spo2 etc.)
    private Long patientId;       // Trimitem DOAR ID-ul ca număr simplu
    private String patientName;
}
