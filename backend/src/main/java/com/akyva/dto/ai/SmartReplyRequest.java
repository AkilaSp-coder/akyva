package com.akyva.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class SmartReplyRequest {
    @NotBlank(message = "Last message content is required")
    private String lastMessage;

    private List<String> recentMessages;
}
