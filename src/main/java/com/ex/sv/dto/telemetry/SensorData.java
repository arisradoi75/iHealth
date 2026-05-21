package com.ex.sv.dto.telemetry;

import lombok.Data;

@Data
public class SensorData {

    private double temp;
    private double pres;
    private double bpm;
    private double spo2;
    private int ecg;
}