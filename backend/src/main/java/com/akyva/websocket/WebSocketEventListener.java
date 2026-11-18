package com.akyva.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final Map<String, String> activeSessions = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : null;
        if (userId != null && headerAccessor.getSessionId() != null) {
            activeSessions.put(headerAccessor.getSessionId(), userId);
            messagingTemplate.convertAndSend("/topic/presence", Map.of(
                    "userId", userId,
                    "status", "ONLINE",
                    "timestamp", Instant.now()
            ));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null && activeSessions.containsKey(sessionId)) {
            String userId = activeSessions.remove(sessionId);
            messagingTemplate.convertAndSend("/topic/presence", Map.of(
                    "userId", userId,
                    "status", "OFFLINE",
                    "timestamp", Instant.now()
            ));
        }
    }
}
