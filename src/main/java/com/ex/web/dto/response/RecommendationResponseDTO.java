package com.ex.web.dto.response;

import com.ex.core.entities.enums.RecommendationType;
import lombok.Data;

@Data
public class RecommendationResponseDTO {

    private RecommendationType recommendationType;
    private String details;
}
