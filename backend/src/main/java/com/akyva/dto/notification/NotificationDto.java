package com.akyva.dto.notification;

import com.akyva.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String userId;
    private NotificationType type;
    private String title;
    private String body;
    private String metadata;
    private boolean isRead;
    private Instant createdAt;
}
