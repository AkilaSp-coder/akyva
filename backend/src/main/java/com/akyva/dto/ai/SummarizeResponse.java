package com.akyva.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummarizeResponse {
    private String overview;
    private List<String> keyPoints;
    private List<String> actionItems;
    private String fullSummary;
}
