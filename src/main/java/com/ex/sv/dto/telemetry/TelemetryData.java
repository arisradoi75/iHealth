package com.ex.sv.dto.telemetry;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TelemetryData {

    @JsonProperty("p_id")
    private String patientId;

    private SensorData data;
}