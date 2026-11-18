package com.akyva.service;

import com.akyva.dto.notification.NotificationDto;
import com.akyva.entity.Notification;
import com.akyva.entity.User;
import com.akyva.entity.enums.NotificationType;
import com.akyva.exception.ResourceNotFoundException;
import com.akyva.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (notification.getUser().getId().equals(userId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public NotificationDto createNotification(User recipient, NotificationType type, String title, String body, String metadata) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .user(recipient)
                .type(type)
                .title(title)
                .body(body)
                .metadata(metadata)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        NotificationDto dto = mapToDto(notification);

        // Push to user queue
        messagingTemplate.convertAndSendToUser(recipient.getId(), "/queue/notifications", dto);

        return dto;
    }

    public NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .metadata(notification.getMetadata())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
