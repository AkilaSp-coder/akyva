import { request } from './apiClient';
import { Conversation } from '../types';

export const chatApi = {
  getConversations: () => request<Conversation[]>('/api/conversations'),

  createConversation: (data: { type?: 'DIRECT' | 'GROUP'; title?: string; memberIds: string[] }) =>
    request<Conversation>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getConversationById: (id: string) => request<Conversation>(`/api/conversations/${id}`),

  deleteConversation: (id: string) =>
    request<{ message: string }>(`/api/conversations/${id}`, { method: 'DELETE' })
};
