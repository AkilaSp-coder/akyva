import { request } from './apiClient';
import { SecurityCheckResult, SummarizeResult } from '../types';

export const aiApi = {
  getSmartReplies: (lastMessage: string, recentMessages: string[] = []) =>
    request<{ suggestions: string[] }>('/api/ai/smart-replies', {
      method: 'POST',
      body: JSON.stringify({ lastMessage, recentMessages })
    }),

  translate: (text: string, targetLanguage: string, sourceLanguage = 'auto') =>
    request<{ originalText: string; translatedText: string; sourceLanguage: string; targetLanguage: string }>('/api/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage, sourceLanguage })
    }),

  rewrite: (text: string, tone: 'Professional' | 'Friendly' | 'Shorter' | 'Clearer') =>
    request<{ originalText: string; rewrittenText: string; tone: string }>('/api/ai/rewrite', {
      method: 'POST',
      body: JSON.stringify({ text, tone })
    }),

  summarize: (messages: string[], conversationId?: string) =>
    request<SummarizeResult>('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ messages, conversationId })
    }),

  checkMessage: (text: string) =>
    request<SecurityCheckResult>('/api/ai/check-message', {
      method: 'POST',
      body: JSON.stringify({ text })
    })
};
