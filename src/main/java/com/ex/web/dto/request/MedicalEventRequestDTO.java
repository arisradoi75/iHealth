package com.ex.web.dto.request;

import com.ex.core.entities.enums.EventType;
import lombok.Data;

import java.time.LocalDate;
@Data

public class MedicalEventRequestDTO {

    private LocalDate eventDate;
    private EventType eventType;
    private String details;

}
