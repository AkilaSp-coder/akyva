import { request } from './apiClient';
import { User } from '../types';

export const userApi = {
  getMe: () => request<User>('/api/users/me'),

  updateMe: (data: Partial<Pick<User, 'displayName' | 'bio' | 'status' | 'profileImage'>>) =>
    request<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getUserById: (id: string) => request<User>(`/api/users/${id}`),

  searchUsers: (query: string) =>
    request<User[]>(`/api/users/search?query=${encodeURIComponent(query)}`),

  blockUser: (id: string) =>
    request<{ message: string }>(`/api/users/${id}/block`, { method: 'POST' }),

  unblockUser: (id: string) =>
    request<{ message: string }>(`/api/users/${id}/block`, { method: 'DELETE' }),

  reportUser: (id: string, data: { reason: string; details?: string }) =>
    request<{ message: string }>(`/api/users/${id}/report`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
};
