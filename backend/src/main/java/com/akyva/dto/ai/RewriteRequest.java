package com.akyva.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RewriteRequest {

    @NotBlank(message = "Text cannot be blank")
    private String text;

    @NotBlank(message = "Tone style is required (e.g. Professional, Friendly, Shorter, Clearer)")
    private String tone;
}
