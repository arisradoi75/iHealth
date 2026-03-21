package com.ex.web.dto.request;

import com.ex.core.entities.enums.RecommendationType;
import lombok.Data;

@Data
public class RecommendationRequestDTO {

    private RecommendationType recommendationType;
    private String details;
}
