import { request } from './apiClient';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export const authApi = {
  register: (data: { username: string; displayName: string; email: string; password: string }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { usernameOrEmail: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  refreshToken: (refreshToken: string) =>
    request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
};
