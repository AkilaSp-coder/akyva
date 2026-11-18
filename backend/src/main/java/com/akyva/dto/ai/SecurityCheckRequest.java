package com.akyva.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SecurityCheckRequest {
    @NotBlank(message = "Message text is required")
    private String text;
}
