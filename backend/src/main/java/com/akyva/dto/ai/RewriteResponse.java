package com.akyva.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewriteResponse {
    private String originalText;
    private String rewrittenText;
    private String tone;
}
