import { request } from './apiClient';
import { Message, MessageReaction } from '../types';

export const messageApi = {
  getMessages: (conversationId: string) =>
    request<Message[]>(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, data: { content: string; messageType?: string; replyToMessageId?: string | null }) =>
    request<Message>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateMessage: (id: string, content: string) =>
    request<Message>(`/api/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    }),

  deleteMessage: (id: string) =>
    request<{ message: string }>(`/api/messages/${id}`, { method: 'DELETE' }),

  addReaction: (id: string, emoji: string) =>
    request<MessageReaction>(`/api/messages/${id}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    }),

  removeReaction: (id: string, emoji: string) =>
    request<{ message: string }>(`/api/messages/${id}/reactions?emoji=${encodeURIComponent(emoji)}`, {
      method: 'DELETE'
    })
};
