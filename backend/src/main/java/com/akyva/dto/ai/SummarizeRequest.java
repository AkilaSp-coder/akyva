package com.akyva.dto.ai;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SummarizeRequest {

    private String conversationId;

    @NotEmpty(message = "Message transcripts are required for summarization")
    private List<String> messages;
}
