package com.akyva.controller;

import com.akyva.dto.conversation.ConversationDto;
import com.akyva.dto.conversation.CreateConversationRequest;
import com.akyva.security.UserPrincipal;
import com.akyva.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversations", description = "Conversation lifecycle and participant management")
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    @Operation(summary = "Get all active conversations for the current authenticated user")
    public ResponseEntity<List<ConversationDto>> getConversations(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(conversationService.getUserConversations(principal.getId()));
    }

    @PostMapping
    @Operation(summary = "Create a new DIRECT or GROUP conversation")
    public ResponseEntity<ConversationDto> createConversation(@AuthenticationPrincipal UserPrincipal principal,
                                                              @Valid @RequestBody CreateConversationRequest request) {
        ConversationDto created = conversationService.createConversation(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get conversation details and members")
    public ResponseEntity<ConversationDto> getConversation(@PathVariable String id,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(conversationService.getConversationById(id, principal.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete conversation thread")
    public ResponseEntity<Map<String, String>> deleteConversation(@PathVariable String id,
                                                                  @AuthenticationPrincipal UserPrincipal principal) {
        conversationService.deleteConversation(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
    }
}
