package com.akyva.dto.conversation;

import com.akyva.dto.message.MessageDto;
import com.akyva.dto.user.UserDto;
import com.akyva.entity.enums.ConversationType;
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
public class ConversationDto {
    private String id;
    private ConversationType type;
    private String title;
    private List<UserDto> members;
    private MessageDto lastMessage;
    private long unreadCount;
    private Instant createdAt;
    private Instant updatedAt;
}
