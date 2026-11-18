import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Message, MessageReaction } from '../types';

export type ConnectionState = 'ONLINE' | 'CONNECTING' | 'OFFLINE';

interface WebSocketContextType {
  connectionState: ConnectionState;
  activeTypers: Record<string, string>; // conversationId -> typing username
  onlineUsers: Set<string>;
  sendMessageWs: (conversationId: string, content: string, replyToMessageId?: string | null) => void;
  sendTypingWs: (conversationId: string, isTyping: boolean) => void;
  onMessageReceived: (callback: (message: Message) => void) => () => void;
  onReactionReceived: (callback: (reaction: MessageReaction) => void) => () => void;
  onReactionRemoved: (callback: (data: { messageId: string; userId: string; emoji: string }) => void) => () => void;
  onMessageDeleted: (callback: (data: { messageId: string }) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>('OFFLINE');
  const [activeTypers, setActiveTypers] = useState<Record<string, string>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const maxReconnectAttempts = 5;

  const messageListenersRef = useRef<Set<(msg: Message) => void>>(new Set());
  const reactionListenersRef = useRef<Set<(rx: MessageReaction) => void>>(new Set());
  const reactionRemovedListenersRef = useRef<Set<(data: any) => void>>(new Set());
  const messageDeletedListenersRef = useRef<Set<(data: any) => void>>(new Set());

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      setConnectionState('OFFLINE');
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionState('CONNECTING');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('ONLINE');
        reconnectAttemptsRef.current = 0;
        // Authenticate WebSocket connection
        ws.send(JSON.stringify({ type: 'AUTH', token }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'MESSAGE_RECEIVED' && data.message) {
            messageListenersRef.current.forEach(listener => listener(data.message));
          } else if (data.type === 'MESSAGE_REACTION' && data.reaction) {
            reactionListenersRef.current.forEach(listener => listener(data.reaction));
          } else if (data.type === 'MESSAGE_REACTION_REMOVED') {
            reactionRemovedListenersRef.current.forEach(listener => listener(data));
          } else if (data.type === 'MESSAGE_DELETED') {
            messageDeletedListenersRef.current.forEach(listener => listener(data));
          } else if (data.type === 'TYPING_START') {
            setActiveTypers(prev => ({ ...prev, [data.conversationId]: data.username }));
          } else if (data.type === 'TYPING_STOP') {
            setActiveTypers(prev => {
              const copy = { ...prev };
              delete copy[data.conversationId];
              return copy;
            });
          } else if (data.type === 'PRESENCE') {
            setOnlineUsers(prev => {
              const next = new Set(prev);
              if (data.status === 'ONLINE') next.add(data.userId);
              else next.delete(data.userId);
              return next;
            });
          }
        } catch (e) {
          console.error('Failed to parse WebSocket packet', e);
        }
      };

      ws.onclose = () => {
        setConnectionState('OFFLINE');
        wsRef.current = null;

        // Auto-reconnect with exponential backoff (up to 5 tries)
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        setConnectionState('OFFLINE');
      };
    } catch (e) {
      setConnectionState('OFFLINE');
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessageWs = (conversationId: string, content: string, replyToMessageId?: string | null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(
        JSON.stringify({
          type: 'SEND_MESSAGE',
          conversationId,
          senderId: user.id,
          content,
          replyToMessageId
        })
      );
    }
  };

  const sendTypingWs = (conversationId: string, isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(
        JSON.stringify({
          type: isTyping ? 'TYPING_START' : 'TYPING_STOP',
          conversationId,
          userId: user.id,
          username: user.displayName
        })
      );
    }
  };

  const onMessageReceived = (callback: (message: Message) => void) => {
    messageListenersRef.current.add(callback);
    return () => {
      messageListenersRef.current.delete(callback);
    };
  };

  const onReactionReceived = (callback: (reaction: MessageReaction) => void) => {
    reactionListenersRef.current.add(callback);
    return () => {
      reactionListenersRef.current.delete(callback);
    };
  };

  const onReactionRemoved = (callback: (data: { messageId: string; userId: string; emoji: string }) => void) => {
    reactionRemovedListenersRef.current.add(callback);
    return () => {
      reactionRemovedListenersRef.current.delete(callback);
    };
  };

  const onMessageDeleted = (callback: (data: { messageId: string }) => void) => {
    messageDeletedListenersRef.current.add(callback);
    return () => {
      messageDeletedListenersRef.current.delete(callback);
    };
  };

  return (
    <WebSocketContext.Provider
      value={{
        connectionState,
        activeTypers,
        onlineUsers,
        sendMessageWs,
        sendTypingWs,
        onMessageReceived,
        onReactionReceived,
        onReactionRemoved,
        onMessageDeleted
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
