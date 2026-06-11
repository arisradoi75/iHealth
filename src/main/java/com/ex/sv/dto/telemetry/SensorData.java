package com.ex.sv.dto.telemetry;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.time.LocalDateTime;

@Embeddable
@Data
public class SensorData {

    private double bpm;
    private double spo2;
    private int ecg;

    @JsonProperty("ecg_status")
    private String ecgStatus;

    private double temp;
    private double pres;

    private LocalDateTime timestamp;
}