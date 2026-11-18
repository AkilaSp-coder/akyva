package com.akyva.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionDto {
    private String id;
    private String messageId;
    private String userId;
    private String emoji;
    private Instant createdAt;
}
