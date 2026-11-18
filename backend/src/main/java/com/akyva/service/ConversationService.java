package com.akyva.service;

import com.akyva.dto.conversation.ConversationDto;
import com.akyva.dto.conversation.CreateConversationRequest;
import com.akyva.dto.message.MessageDto;
import com.akyva.dto.user.UserDto;
import com.akyva.entity.Conversation;
import com.akyva.entity.ConversationMember;
import com.akyva.entity.Message;
import com.akyva.entity.User;
import com.akyva.entity.enums.ConversationType;
import com.akyva.exception.BadRequestException;
import com.akyva.exception.ResourceNotFoundException;
import com.akyva.exception.UnauthorizedException;
import com.akyva.repository.ConversationMemberRepository;
import com.akyva.repository.ConversationRepository;
import com.akyva.repository.MessageRepository;
import com.akyva.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(String userId) {
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(userId);
        return conversations.stream()
                .map(conv -> mapToDto(conv, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto createConversation(String currentUserId, CreateConversationRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        Set<String> memberIds = new HashSet<>(request.getMemberIds());
        memberIds.add(currentUserId);

        // If direct conversation and exactly 2 members, check if conversation already exists
        if (request.getType() == ConversationType.DIRECT && memberIds.size() == 2) {
            String otherUserId = memberIds.stream().filter(id -> !id.equals(currentUserId)).findFirst().orElseThrow();
            List<Conversation> existing = conversationRepository.findDirectConversationBetween(currentUserId, otherUserId);
            if (!existing.isEmpty()) {
                return mapToDto(existing.get(0), currentUserId);
            }
        }

        Conversation conversation = Conversation.builder()
                .id(UUID.randomUUID().toString())
                .type(request.getType() != null ? request.getType() : ConversationType.DIRECT)
                .title(request.getTitle())
                .createdBy(currentUser)
                .build();

        conversation = conversationRepository.save(conversation);

        List<ConversationMember> members = new ArrayList<>();
        for (String mId : memberIds) {
            User mUser = userRepository.findById(mId)
                    .orElseThrow(() -> new BadRequestException("Member not found with id: " + mId));

            ConversationMember member = ConversationMember.builder()
                    .id(UUID.randomUUID().toString())
                    .conversation(conversation)
                    .user(mUser)
                    .role(mId.equals(currentUserId) ? "ADMIN" : "MEMBER")
                    .build();

            members.add(conversationMemberRepository.save(member));
        }

        conversation.setMembers(members);
        return mapToDto(conversation, currentUserId);
    }

    @Transactional(readOnly = true)
    public ConversationDto getConversationById(String conversationId, String userId) {
        verifyMembership(conversationId, userId);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));
        return mapToDto(conversation, userId);
    }

    @Transactional
    public void deleteConversation(String conversationId, String userId) {
        verifyMembership(conversationId, userId);
        conversationRepository.deleteById(conversationId);
    }

    public void verifyMembership(String conversationId, String userId) {
        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }
    }

    public ConversationDto mapToDto(Conversation conv, String currentUserId) {
        List<UserDto> members = conv.getMembers().stream()
                .map(m -> AuthService.mapToDto(m.getUser()))
                .collect(Collectors.toList());

        Message latest = messageRepository.findLatestMessageByConversationId(conv.getId());
        long unreadCount = messageRepository.countUnreadMessages(conv.getId(), currentUserId);

        MessageDto lastMessageDto = null;
        if (latest != null) {
            lastMessageDto = MessageDto.builder()
                    .id(latest.getId())
                    .conversationId(conv.getId())
                    .sender(AuthService.mapToDto(latest.getSender()))
                    .content(latest.getDeletedAt() != null ? "This message was deleted" : latest.getContent())
                    .messageType(latest.getMessageType())
                    .status(latest.getStatus())
                    .createdAt(latest.getCreatedAt())
                    .build();
        }

        return ConversationDto.builder()
                .id(conv.getId())
                .type(conv.getType())
                .title(conv.getTitle())
                .members(members)
                .lastMessage(lastMessageDto)
                .unreadCount(unreadCount)
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .build();
    }
}
