package com.ex.core.entities;

import com.ex.web.auth.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_measurements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String sensorType;

    private Double value;

    @Lob
    private String ecgData;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
