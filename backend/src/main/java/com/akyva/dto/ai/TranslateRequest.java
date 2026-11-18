package com.akyva.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TranslateRequest {

    @NotBlank(message = "Text cannot be blank")
    private String text;

    private String sourceLanguage = "auto";

    @NotBlank(message = "Target language is required")
    private String targetLanguage;
}
