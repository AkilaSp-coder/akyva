package com.akyva.service;

import com.akyva.dto.message.MessageDto;
import com.akyva.dto.message.ReactionDto;
import com.akyva.dto.message.SendMessageRequest;
import com.akyva.entity.*;
import com.akyva.entity.enums.MessageStatus;
import com.akyva.entity.enums.MessageType;
import com.akyva.entity.enums.NotificationType;
import com.akyva.exception.BadRequestException;
import com.akyva.exception.ResourceNotFoundException;
import com.akyva.exception.UnauthorizedException;
import com.akyva.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public List<MessageDto> getConversationMessages(String conversationId, String userId) {
        verifyConversationMembership(conversationId, userId);

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark unread messages sent by others as READ
        boolean hasUnread = false;
        for (Message msg : messages) {
            if (!msg.getSender().getId().equals(userId) && msg.getStatus() != MessageStatus.READ) {
                msg.setStatus(MessageStatus.READ);
                hasUnread = true;
            }
        }
        if (hasUnread) {
            messageRepository.saveAll(messages);
            // Notify WebSocket topic of read status
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read",
                    Map.of("conversationId", conversationId, "readByUserId", userId, "timestamp", Instant.now()));
        }

        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(String conversationId, String senderId, SendMessageRequest request) {
        verifyConversationMembership(conversationId, senderId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Message message = Message.builder()
                .id(UUID.randomUUID().toString())
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent().trim())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .replyToMessageId(request.getReplyToMessageId())
                .mediaUrl(request.getMediaUrl())
                .mediaTypeCustom(request.getMediaTypeCustom())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .durationSeconds(request.getDurationSeconds())
                .transcription(request.getTranscription())
                .forwardedFrom(request.getForwardedFrom())
                .status(MessageStatus.SENT)
                .build();

        message = messageRepository.save(message);

        // Update conversation timestamp
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        MessageDto dto = mapToDto(message);

        // Broadcast to WebSocket topic for instant delivery
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, dto);

        // Notify other conversation members
        List<ConversationMember> members = conversationMemberRepository.findByConversationId(conversationId);
        for (ConversationMember member : members) {
            if (!member.getUser().getId().equals(senderId) && !member.isMuted()) {
                notificationService.createNotification(
                        member.getUser(),
                        NotificationType.NEW_MESSAGE,
                        "New message from " + sender.getDisplayName(),
                        message.getContent().length() > 60 ? message.getContent().substring(0, 60) + "..." : message.getContent(),
                        "{\"conversationId\":\"" + conversationId + "\",\"messageId\":\"" + message.getId() + "\"}"
                );
            }
        }

        return dto;
    }

    @Transactional
    public MessageDto togglePinMessage(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        verifyConversationMembership(message.getConversation().getId(), userId);

        message.setPinned(!message.isPinned());
        message = messageRepository.save(message);

        MessageDto dto = mapToDto(message);
        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getId() + "/pin", dto);
        return dto;
    }

    @Transactional
    public MessageDto toggleStarMessage(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        verifyConversationMembership(message.getConversation().getId(), userId);

        message.setStarred(!message.isStarred());
        message = messageRepository.save(message);

        return mapToDto(message);
    }

    @Transactional
    public MessageDto updateMessage(String messageId, String userId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own messages");
        }
        if (message.getDeletedAt() != null) {
            throw new BadRequestException("Cannot edit a deleted message");
        }

        message.setContent(newContent.trim());
        message.setUpdatedAt(Instant.now());
        message = messageRepository.save(message);

        MessageDto dto = mapToDto(message);
        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getId() + "/update", dto);
        return dto;
    }

    @Transactional
    public void deleteMessage(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own messages");
        }

        message.setDeletedAt(Instant.now());
        messageRepository.save(message);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId() + "/delete",
                Map.of("messageId", messageId, "conversationId", message.getConversation().getId())
        );
    }

    @Transactional
    public ReactionDto addReaction(String messageId, String userId, String emoji) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        verifyConversationMembership(message.getConversation().getId(), userId);

        User user = userRepository.findById(userId).orElseThrow();

        // Remove existing reaction with same emoji by this user if any
        reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, userId, emoji)
                .ifPresent(reactionRepository::delete);

        MessageReaction reaction = MessageReaction.builder()
                .id(UUID.randomUUID().toString())
                .message(message)
                .user(user)
                .emoji(emoji)
                .build();

        reaction = reactionRepository.save(reaction);

        ReactionDto reactionDto = ReactionDto.builder()
                .id(reaction.getId())
                .messageId(messageId)
                .userId(userId)
                .emoji(emoji)
                .createdAt(reaction.getCreatedAt())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId() + "/reaction",
                reactionDto
        );

        return reactionDto;
    }

    @Transactional
    public void removeReaction(String messageId, String userId, String emoji) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        verifyConversationMembership(message.getConversation().getId(), userId);

        reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, userId, emoji);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId() + "/reaction/remove",
                Map.of("messageId", messageId, "userId", userId, "emoji", emoji)
        );
    }

    private void verifyConversationMembership(String conversationId, String userId) {
        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new UnauthorizedException("You do not belong to this conversation");
        }
    }

    public MessageDto mapToDto(Message message) {
        List<ReactionDto> reactions = message.getReactions().stream()
                .map(r -> ReactionDto.builder()
                        .id(r.getId())
                        .messageId(r.getMessage().getId())
                        .userId(r.getUser().getId())
                        .emoji(r.getEmoji())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        MessageDto replyDto = null;
        if (message.getReplyToMessageId() != null) {
            Message replied = messageRepository.findById(message.getReplyToMessageId()).orElse(null);
            if (replied != null) {
                replyDto = MessageDto.builder()
                        .id(replied.getId())
                        .sender(AuthService.mapToDto(replied.getSender()))
                        .content(replied.getDeletedAt() != null ? "Message deleted" : replied.getContent())
                        .build();
            }
        }

        return MessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .sender(AuthService.mapToDto(message.getSender()))
                .content(message.getDeletedAt() != null ? "This message was deleted" : message.getContent())
                .messageType(message.getMessageType())
                .replyToMessageId(message.getReplyToMessageId())
                .replyToMessage(replyDto)
                .status(message.getStatus())
                .reactions(reactions)
                .isPinned(message.isPinned())
                .isStarred(message.isStarred())
                .forwardedFrom(message.getForwardedFrom())
                .mediaUrl(message.getMediaUrl())
                .mediaTypeCustom(message.getMediaTypeCustom())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .durationSeconds(message.getDurationSeconds())
                .transcription(message.getTranscription())
                .expiresAt(message.getExpiresAt())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .deletedAt(message.getDeletedAt())
                .build();
    }
}
