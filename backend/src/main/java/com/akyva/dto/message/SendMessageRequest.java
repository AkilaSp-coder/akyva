package com.akyva.dto.message;

import com.akyva.entity.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotBlank(message = "Message content cannot be blank")
    private String content;

    private MessageType messageType = MessageType.TEXT;

    private String replyToMessageId;

    private String mediaUrl;
    private String mediaTypeCustom;
    private String fileName;
    private Long fileSize;
    private Integer durationSeconds;
    private String transcription;
    private String forwardedFrom;
}
