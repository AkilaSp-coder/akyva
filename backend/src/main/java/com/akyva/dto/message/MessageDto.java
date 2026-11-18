package com.akyva.dto.message;

import com.akyva.dto.user.UserDto;
import com.akyva.entity.enums.MessageStatus;
import com.akyva.entity.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String id;
    private String conversationId;
    private UserDto sender;
    private String content;
    private MessageType messageType;
    private String replyToMessageId;
    private MessageDto replyToMessage;
    private MessageStatus status;
    private List<ReactionDto> reactions;
    private boolean isPinned;
    private boolean isStarred;
    private String forwardedFrom;
    private String mediaUrl;
    private String mediaTypeCustom;
    private String fileName;
    private Long fileSize;
    private Integer durationSeconds;
    private String transcription;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
}
