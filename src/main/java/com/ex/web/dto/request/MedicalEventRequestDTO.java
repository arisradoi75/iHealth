package com.ex.web.dto.request;

import com.ex.core.entities.enums.EventType;

import java.time.LocalDate;

public class MedicalEventRequestDTO {

    private LocalDate eventDate;
    private EventType eventType;
    private String details;

}
