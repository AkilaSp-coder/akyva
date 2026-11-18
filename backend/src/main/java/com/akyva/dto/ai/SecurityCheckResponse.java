package com.akyva.dto.ai;

import com.akyva.entity.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityCheckResponse {
    private RiskLevel riskLevel;
    private String reason;
    private String recommendedAction;
    private boolean isSuspicious;
}
