package com.akyva.controller;

import com.akyva.dto.message.MessageDto;
import com.akyva.dto.message.ReactionDto;
import com.akyva.dto.message.ReactionRequest;
import com.akyva.dto.message.SendMessageRequest;
import com.akyva.security.UserPrincipal;
import com.akyva.service.MessageService;
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
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Message exchange, reactions, edits, and deletions")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/api/conversations/{conversationId}/messages")
    @Operation(summary = "Get chronologically ordered messages in a conversation")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable String conversationId,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.getConversationMessages(conversationId, principal.getId()));
    }

    @PostMapping("/api/conversations/{conversationId}/messages")
    @Operation(summary = "Send a new message to a conversation")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable String conversationId,
                                                  @AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody SendMessageRequest request) {
        MessageDto sent = messageService.sendMessage(conversationId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @PutMapping("/api/messages/{id}")
    @Operation(summary = "Edit an existing message sent by current user")
    public ResponseEntity<MessageDto> updateMessage(@PathVariable String id,
                                                    @AuthenticationPrincipal UserPrincipal principal,
                                                    @RequestBody Map<String, String> body) {
        String content = body.get("content");
        return ResponseEntity.ok(messageService.updateMessage(id, principal.getId(), content));
    }

    @DeleteMapping("/api/messages/{id}")
    @Operation(summary = "Soft delete a message sent by current user")
    public ResponseEntity<Map<String, String>> deleteMessage(@PathVariable String id,
                                                             @AuthenticationPrincipal UserPrincipal principal) {
        messageService.deleteMessage(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
    }

    @PostMapping("/api/messages/{id}/reactions")
    @Operation(summary = "Add an emoji reaction to a message")
    public ResponseEntity<ReactionDto> addReaction(@PathVariable String id,
                                                   @AuthenticationPrincipal UserPrincipal principal,
                                                   @Valid @RequestBody ReactionRequest request) {
        return ResponseEntity.ok(messageService.addReaction(id, principal.getId(), request.getEmoji()));
    }

    @DeleteMapping("/api/messages/{id}/reactions")
    @Operation(summary = "Remove an emoji reaction from a message")
    public ResponseEntity<Map<String, String>> removeReaction(@PathVariable String id,
                                                              @AuthenticationPrincipal UserPrincipal principal,
                                                              @RequestParam("emoji") String emoji) {
        messageService.removeReaction(id, principal.getId(), emoji);
        return ResponseEntity.ok(Map.of("message", "Reaction removed"));
    }

    @PutMapping("/api/messages/{id}/pin")
    @Operation(summary = "Toggle pinned state on a message")
    public ResponseEntity<MessageDto> togglePin(@PathVariable String id,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.togglePinMessage(id, principal.getId()));
    }

    @PutMapping("/api/messages/{id}/star")
    @Operation(summary = "Toggle starred state on a message")
    public ResponseEntity<MessageDto> toggleStar(@PathVariable String id,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.toggleStarMessage(id, principal.getId()));
    }
}
