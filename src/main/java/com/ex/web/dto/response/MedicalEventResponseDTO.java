package com.ex.web.dto.response;

import com.ex.core.entities.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalEventResponseDTO {

    private LocalDate eventDate;
    private EventType eventType;
    private String details;

}
