package com.ex.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurrentUserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private Long patientId;
    private Long medicId;
}
