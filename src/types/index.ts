export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  status?: string;
  akyvaId: string;
  createdAt: string;
  updatedAt?: string;
  plan?: 'FREE' | 'PLUS' | 'CREATOR_PRO' | 'BUSINESS';
  isTwoFactorEnabled?: boolean;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  sender?: User;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number; // duration in seconds for audio/voice
  replyToMessageId?: string | null;
  replyToMessage?: {
    id: string;
    content: string;
    sender?: User | null;
  } | null;
  status: 'SENT' | 'DELIVERED' | 'READ';
  reactions: MessageReaction[];
  isPinned?: boolean;
  isStarred?: boolean;
  forwardedFrom?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Client-side translated text cache
  translatedText?: string;
  translatedLanguage?: string;
  // Audio transcription cache
  transcription?: string;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title?: string | null;
  avatar?: string | null;
  adminIds?: string[];
  members: User[];
  lastMessage?: Message | null;
  unreadCount: number;
  isArchived?: boolean;
  isMuted?: boolean;
  disappearingTimer?: number | null; // e.g. 86400 for 24h, null for off
  pinnedMessageIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------- STATUS UPDATE SYSTEM (24-Hour Stories) ----------------
export interface StatusStoryItem {
  id: string;
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO';
  content: string; // text caption or image/video URL
  backgroundColor?: string;
  fontStyle?: string;
  viewers: { userId: string; user: User; viewedAt: string }[];
  createdAt: string;
  expiresAt: string;
}

export interface UserStatusFeed {
  userId: string;
  user: User;
  stories: StatusStoryItem[];
  hasUnseen: boolean;
  lastUpdatedAt: string;
}

// ---------------- AUDIO & VIDEO CALLING (WebRTC) ----------------
export type CallType = 'AUDIO' | 'VIDEO';
export type CallState = 'IDLE' | 'CALLING' | 'RINGING' | 'CONNECTED' | 'ENDED';

export interface CallRecord {
  id: string;
  caller: User;
  callee: User;
  callType: CallType;
  status: 'COMPLETED' | 'MISSED' | 'REJECTED' | 'FAILED';
  durationSeconds: number;
  createdAt: string;
}

export interface ActiveCallSession {
  callId: string;
  caller: User;
  callee: User;
  callType: CallType;
  state: CallState;
  startTime?: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

// ---------------- AKYVA MOMENTS (Social Short-Video Feed) ----------------
export interface MomentPost {
  id: string;
  creator: User;
  videoUrl: string;
  caption: string;
  soundTitle: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface MomentComment {
  id: string;
  postId: string;
  user: User;
  text: string;
  createdAt: string;
}

// ---------------- AKYVA CREATOR STUDIO ----------------
export interface ConnectedSocialAccount {
  id: string;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  handle: string;
  profileName: string;
  connectedAt: string;
  subscribersOrFollowers: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface CreatorPostIdea {
  id: string;
  title: string;
  script: string;
  caption: string;
  hashtags: string[];
  suggestedThumbnail: string;
  bestPostingTime: string;
  language: 'English' | 'Tamil';
  targetPlatform: 'Reels' | 'Shorts';
}

export interface ScheduledPost {
  id: string;
  title: string;
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'AKYVA_MOMENTS';
  scheduledTime: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  caption: string;
}

// ---------------- AI ASSISTANT & PRODUCTIVITY ----------------
export interface AiAssistantChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface ProductivityTaskReminder {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  source?: string; // e.g. "Extracted from Priya's message"
}

// ---------------- NOTIFICATIONS & SUBSCRIPTIONS ----------------
export interface NotificationItem {
  id: string;
  userId: string;
  type: 'NEW_MESSAGE' | 'MESSAGE_REACTION' | 'NEW_CONNECTION' | 'AI_ALERT' | 'MISSED_CALL' | 'STATUS_REPLY' | 'CREATOR_MILESTONE';
  title: string;
  body: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

export interface SecurityCheckResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isSuspicious: boolean;
  reason: string;
  recommendedAction: string;
}

export interface SummarizeResult {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
  fullSummary: string;
}

export interface SubscriptionPlan {
  id: 'FREE' | 'PLUS' | 'CREATOR_PRO' | 'BUSINESS';
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
}

export type NavTab = 
  | 'chats' 
  | 'status' 
  | 'calls' 
  | 'moments' 
  | 'ai-assistant' 
  | 'creator-studio' 
  | 'people' 
  | 'notifications' 
  | 'profile' 
  | 'settings';
