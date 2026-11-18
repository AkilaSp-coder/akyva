package com.akyva.dto.conversation;

import com.akyva.entity.enums.ConversationType;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateConversationRequest {

    private ConversationType type = ConversationType.DIRECT;

    private String title;

    @NotEmpty(message = "At least one member ID is required")
    private List<String> memberIds;
}
