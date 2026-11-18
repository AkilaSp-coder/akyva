package com.akyva.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslateResponse {
    private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
}
