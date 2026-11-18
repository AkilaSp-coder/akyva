package com.akyva.websocket;

import com.akyva.dto.message.SendMessageRequest;
import com.akyva.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.sendMessage/{conversationId}")
    public void handleSendMessage(@DestinationVariable String conversationId,
                                  @Payload SendMessageRequest request,
                                  Principal principal) {
        if (principal != null) {
            messageService.sendMessage(conversationId, principal.getName(), request);
        }
    }

    @MessageMapping("/chat.typing/{conversationId}")
    public void handleTyping(@DestinationVariable String conversationId,
                             @Payload Map<String, Object> payload,
                             Principal principal) {
        String event = (String) payload.getOrDefault("event", "TYPING_START");
        String username = (String) payload.getOrDefault("username", principal != null ? principal.getName() : "Someone");

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", Map.of(
                "conversationId", conversationId,
                "userId", principal != null ? principal.getName() : "",
                "username", username,
                "event", event
        ));
    }

    @MessageMapping("/chat.read/{conversationId}")
    public void handleMessageRead(@DestinationVariable String conversationId,
                                  @Payload Map<String, Object> payload,
                                  Principal principal) {
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read", Map.of(
                "conversationId", conversationId,
                "userId", principal != null ? principal.getName() : "",
                "lastReadMessageId", payload.getOrDefault("lastReadMessageId", "")
        ));
    }
}
