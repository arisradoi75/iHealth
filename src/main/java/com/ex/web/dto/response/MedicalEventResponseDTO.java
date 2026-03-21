package com.ex.web.dto.response;

import com.ex.core.entities.enums.EventType;

import java.time.LocalDate;

public class MedicalEventResponseDTO {

    private LocalDate eventDate;
    private EventType eventType;
    private String details;

}
