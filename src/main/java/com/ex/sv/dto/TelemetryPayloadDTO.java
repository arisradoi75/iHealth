package com.ex.sv.dto;

import lombok.Data;

import java.util.List;

@Data
public class TelemetryPayloadDTO {
    private Long patientId;
    private String sensorType;
    private Double value;
    private List<Double> ecgValues;
}
