import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'akyva_super_secret_jwt_key_2026_at_least_256_bits_length_for_hmac_sha';

// Initialize Gemini SDK
let geminiClient: GoogleGenAI | null = null;
const hasValidGeminiKey = process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && 
  process.env.GEMINI_API_KEY.length > 5;

if (hasValidGeminiKey) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client, using safe AI fallbacks.', err);
  }
}

app.use(express.json());

// In-Memory Database
interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  profileImage: string;
  bio: string;
  status: string;
  akyvaId: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
  transcription?: string;
  isPinned?: boolean;
  isStarred?: boolean;
  forwardedFrom?: string | null;
  replyToMessageId?: string | null;
  status: 'SENT' | 'DELIVERED' | 'READ';
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title?: string | null;
  memberIds: string[];
  pinnedMessageIds?: string[];
  disappearingTimer?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface StatusStory {
  id: string;
  userId: string;
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO';
  content: string;
  backgroundColor?: string;
  fontStyle?: string;
  caption?: string;
  viewers: { userId: string; viewedAt: string }[];
  createdAt: string;
  expiresAt: string;
}

interface CallRecord {
  id: string;
  callerId: string;
  calleeId: string;
  type: 'AUDIO' | 'VIDEO';
  status: 'ANSWERED' | 'MISSED' | 'DECLINED' | 'BUSY';
  durationSeconds: number;
  timestamp: string;
}

interface MomentPostItem {
  id: string;
  authorId: string;
  videoUrl: string;
  caption: string;
  soundTitle: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
}

interface MomentCommentItem {
  id: string;
  momentId: string;
  userId: string;
  text: string;
  createdAt: string;
}

interface CreatorPostItem {
  id: string;
  userId: string;
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'AKYVA_MOMENTS';
  title: string;
  script?: string;
  caption: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'DRAFT';
}

interface NotificationItem {
  id: string;
  userId: string;
  type: 'NEW_MESSAGE' | 'MESSAGE_REACTION' | 'NEW_CONNECTION' | 'AI_ALERT';
  title: string;
  body: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

// Initial Seed Data
const users: Map<string, User> = new Map();
const conversations: Map<string, Conversation> = new Map();
const messages: Map<string, Message[]> = new Map();
const blockedUsers: Set<string> = new Set(); // "userId:blockedId"
const reports: any[] = [];
const notifications: NotificationItem[] = [];

// New feature stores
const statuses: Map<string, StatusStory> = new Map();
const callRecords: CallRecord[] = [];
const momentsPosts: Map<string, MomentPostItem> = new Map();
const momentLikes: Set<string> = new Set(); // "userId:momentId"
const momentComments: MomentCommentItem[] = [];
const creatorPosts: CreatorPostItem[] = [];

// Seed default contacts
const defaultPasswordHash = bcrypt.hashSync('akyva123', 10);

const seedUsers: User[] = [
  {
    id: 'user-priya',
    username: 'priya_patel',
    displayName: 'Priya Patel',
    email: 'priya@akyva.io',
    passwordHash: defaultPasswordHash,
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: 'Product Designer in Bengaluru. Connect beyond borders ✨',
    status: 'Exploring cross-language chats',
    akyvaId: 'AKY-4921-8812',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-elena',
    username: 'elena_vance',
    displayName: 'Elena Vance',
    email: 'elena@akyva.io',
    passwordHash: defaultPasswordHash,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Berlin, Germany. Multilingual architectures & privacy.',
    status: 'Online',
    akyvaId: 'AKY-7102-3940',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-kenji',
    username: 'kenji_sato',
    displayName: 'Kenji Sato',
    email: 'kenji@akyva.io',
    passwordHash: defaultPasswordHash,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Tokyo, Japan ⛩️ Software Engineer & AI Enthusiast',
    status: 'In focus mode',
    akyvaId: 'AKY-3391-7411',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-carlos',
    username: 'carlos_mendez',
    displayName: 'Carlos Mendez',
    email: 'carlos@akyva.io',
    passwordHash: defaultPasswordHash,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Madrid, Spain 🇪🇸 Audio Producer & Global Traveler',
    status: 'Listening to new beats',
    akyvaId: 'AKY-8841-2091',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-concierge',
    username: 'akyva_dove',
    displayName: 'AKYVA AI Concierge',
    email: 'concierge@akyva.io',
    passwordHash: defaultPasswordHash,
    profileImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=250&q=80',
    bio: 'Your personal AI communication wing. Fast translations, summarization & security.',
    status: 'Always active',
    akyvaId: 'AKY-0001-0001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

seedUsers.forEach(u => users.set(u.id, u));

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true });
const clients = new Map<WebSocket, { userId: string }>();

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  if (url.pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket) => {
  clients.set(ws, { userId: '' });

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'AUTH') {
        const token = msg.token;
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          clients.set(ws, { userId: decoded.sub });
          broadcastPresence(decoded.sub, 'ONLINE');
        } catch (e) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Auth failed' }));
        }
      } else if (msg.type === 'TYPING_START' || msg.type === 'TYPING_STOP') {
        broadcastToConversation(msg.conversationId, {
          type: msg.type,
          conversationId: msg.conversationId,
          userId: msg.userId,
          username: msg.username
        });
      } else if (msg.type === 'SEND_MESSAGE') {
        handleWsIncomingMessage(ws, msg);
      } else if (
        msg.type === 'CALL_INITIATE' || 
        msg.type === 'CALL_OFFER' || 
        msg.type === 'CALL_ANSWER' || 
        msg.type === 'CALL_ICE_CANDIDATE' || 
        msg.type === 'CALL_END' ||
        msg.type === 'CALL_REJECT'
      ) {
        // Forward WebRTC signaling payload to target recipient
        const targetUserId = msg.targetUserId;
        if (targetUserId) {
          const payloadStr = JSON.stringify(msg);
          for (const [client, info] of clients) {
            if (client.readyState === WebSocket.OPEN && info.userId === targetUserId) {
              client.send(payloadStr);
            }
          }
        }
      }
    } catch (err) {
      console.error('WS parse error', err);
    }
  });

  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    if (clientInfo && clientInfo.userId) {
      broadcastPresence(clientInfo.userId, 'OFFLINE');
    }
    clients.delete(ws);
  });
});

function broadcastPresence(userId: string, status: 'ONLINE' | 'OFFLINE') {
  const payload = JSON.stringify({ type: 'PRESENCE', userId, status, timestamp: new Date().toISOString() });
  for (const [client] of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastToConversation(conversationId: string, payload: any) {
  const conv = conversations.get(conversationId);
  if (!conv) return;
  const str = JSON.stringify(payload);
  for (const [client, info] of clients) {
    if (client.readyState === WebSocket.OPEN && conv.memberIds.includes(info.userId)) {
      client.send(str);
    }
  }
}

function handleWsIncomingMessage(ws: WebSocket, payload: any) {
  const conv = conversations.get(payload.conversationId);
  if (!conv) return;
  const newMsg: Message = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    content: payload.content,
    messageType: payload.messageType || 'TEXT',
    replyToMessageId: payload.replyToMessageId || null,
    status: 'SENT',
    reactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const list = messages.get(payload.conversationId) || [];
  list.push(newMsg);
  messages.set(payload.conversationId, list);
  conv.updatedAt = new Date().toISOString();

  broadcastToConversation(payload.conversationId, {
    type: 'MESSAGE_RECEIVED',
    conversationId: payload.conversationId,
    message: formatMessage(newMsg)
  });

  // If chat is with Priya, Kenji, Elena, or AI Concierge, simulate real-time conversational response
  triggerSimulatedReplyIfNeeded(conv, newMsg);
}

function triggerSimulatedReplyIfNeeded(conv: Conversation, userMsg: Message) {
  const otherMemberId = conv.memberIds.find(id => id !== userMsg.senderId);
  if (!otherMemberId) return;

  const otherUser = users.get(otherMemberId);
  if (!otherUser) return;

  // Emit typing indicator after 800ms
  setTimeout(() => {
    broadcastToConversation(conv.id, {
      type: 'TYPING_START',
      conversationId: conv.id,
      userId: otherUser.id,
      username: otherUser.displayName
    });
  }, 700);

  // Send reply after 2200ms
  setTimeout(async () => {
    broadcastToConversation(conv.id, {
      type: 'TYPING_STOP',
      conversationId: conv.id,
      userId: otherUser.id,
      username: otherUser.displayName
    });

    let replyText = "That's wonderful! Thanks for connecting on AKYVA.";
    const userPrompt = userMsg.content.toLowerCase();

    if (otherUser.id === 'user-concierge') {
      replyText = `🕊️ Welcome to AKYVA! You can use my smart features anytime: tap 'Translate' on any bubble, test 'AI Rewrite' in the composer, or click 'Summarize Chat' up top!`;
    } else if (otherUser.id === 'user-priya') {
      if (userPrompt.includes('tamil') || userPrompt.includes('vanakkam')) {
        replyText = "வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்? (Hello! How are you?) AKYVA's live translation works like magic!";
      } else if (userPrompt.includes('meeting') || userPrompt.includes('friday') || userPrompt.includes('project')) {
        replyText = "Yes! I will review the architecture document once Arun shares it. Let's wrap up before Saturday.";
      } else {
        replyText = "Great point! Let's build something truly borderless together.";
      }
    } else if (otherUser.id === 'user-kenji') {
      if (userPrompt.includes('japan') || userPrompt.includes('tokyo') || userPrompt.includes('arigato')) {
        replyText = "こんにちは！ (Konnichiwa!) Tokyo is beautiful right now. Loving the real-time AI capabilities here!";
      } else {
        replyText = "Agreed! Looking forward to testing more cross-language conversations.";
      }
    } else if (otherUser.id === 'user-elena') {
      replyText = "Guten Tag! Privacy-first communication with real-time translation is the future.";
    }

    const replyMsg: Message = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      conversationId: conv.id,
      senderId: otherUser.id,
      content: replyText,
      messageType: 'TEXT',
      status: 'SENT',
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = messages.get(conv.id) || [];
    list.push(replyMsg);
    messages.set(conv.id, list);
    conv.updatedAt = new Date().toISOString();

    broadcastToConversation(conv.id, {
      type: 'MESSAGE_RECEIVED',
      conversationId: conv.id,
      message: formatMessage(replyMsg)
    });
  }, 2200);
}

// Ensure default user conversations for demo
function seedUserConversations(userId: string) {
  if (conversations.size === 0 || Array.from(conversations.values()).filter(c => c.memberIds.includes(userId)).length === 0) {
    // Conv 1 with Priya
    const conv1Id = 'conv-priya-' + userId;
    conversations.set(conv1Id, {
      id: conv1Id,
      type: 'DIRECT',
      memberIds: [userId, 'user-priya'],
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    });
    messages.set(conv1Id, [
      {
        id: 'msg-p1',
        conversationId: conv1Id,
        senderId: 'user-priya',
        content: 'Hi! Welcome to AKYVA. Have you had a chance to test the multilingual translation yet?',
        messageType: 'TEXT',
        status: 'READ',
        reactions: [{ id: 'r1', messageId: 'msg-p1', userId, emoji: '🕊️', createdAt: new Date().toISOString() }],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'msg-p2',
        conversationId: conv1Id,
        senderId: 'user-priya',
        content: 'Try sending me something or click the Translate button below to see it in Tamil!',
        messageType: 'TEXT',
        status: 'DELIVERED',
        reactions: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ]);

    // Conv 2 with Elena
    const conv2Id = 'conv-elena-' + userId;
    conversations.set(conv2Id, {
      id: conv2Id,
      type: 'DIRECT',
      memberIds: [userId, 'user-elena'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
    });
    messages.set(conv2Id, [
      {
        id: 'msg-e1',
        conversationId: conv2Id,
        senderId: 'user-elena',
        content: 'Meeting scheduled for Friday morning. Arun will prepare the document, Priya will review it, and final submission is Saturday.',
        messageType: 'TEXT',
        status: 'READ',
        reactions: [],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]);

    // Conv 3 with AI Concierge
    const conv3Id = 'conv-concierge-' + userId;
    conversations.set(conv3Id, {
      id: conv3Id,
      type: 'DIRECT',
      memberIds: [userId, 'user-concierge'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    messages.set(conv3Id, [
      {
        id: 'msg-c1',
        conversationId: conv3Id,
        senderId: 'user-concierge',
        content: "Greetings! I'm your AKYVA AI Concierge. I keep your chats safe from scams, translate in real-time across 10+ languages, and suggest smart replies. Feel free to say hi!",
        messageType: 'TEXT',
        status: 'READ',
        reactions: [{ id: 'r2', messageId: 'msg-c1', userId, emoji: '✨', createdAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }
}

// Helpers
function sanitizeUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

function formatMessage(msg: Message) {
  const sender = users.get(msg.senderId);
  let replyToMessage = null;
  if (msg.replyToMessageId) {
    const convMsgs = messages.get(msg.conversationId) || [];
    const replied = convMsgs.find(m => m.id === msg.replyToMessageId);
    if (replied) {
      const repSender = users.get(replied.senderId);
      replyToMessage = {
        id: replied.id,
        content: replied.deletedAt ? 'This message was deleted' : replied.content,
        sender: repSender ? sanitizeUser(repSender) : null
      };
    }
  }

  return {
    ...msg,
    content: msg.deletedAt ? 'This message was deleted' : msg.content,
    sender: sender ? sanitizeUser(sender) : null,
    replyToMessage
  };
}

// Middleware: Authenticate JWT
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'Unauthorized',
      message: 'Access token is required',
      path: req.originalUrl
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'Your session has expired. Please sign in again.',
        path: req.originalUrl
      });
    }
    (req as any).user = decoded;
    next();
  });
}

// ----------------- AUTH APIS -----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, displayName, email, password } = req.body;

  if (!username || !displayName || !email || !password) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: 'Username, displayName, email, and password are required',
      path: req.originalUrl
    });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  for (const u of users.values()) {
    if (u.username === cleanUser) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Username is already taken',
        path: req.originalUrl
      });
    }
    if (u.email === cleanEmail) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Email is already registered',
        path: req.originalUrl
      });
    }
  }

  const id = 'user-' + Date.now();
  const akyvaId = `AKY-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id,
    username: cleanUser,
    displayName: displayName.trim(),
    email: cleanEmail,
    passwordHash,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Connecting beyond language on AKYVA',
    status: 'Online',
    akyvaId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.set(id, newUser);
  seedUserConversations(id);

  const token = jwt.sign({ sub: id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ sub: id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    user: sanitizeUser(newUser)
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: 'Username/email and password are required',
      path: req.originalUrl
    });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  let foundUser: User | null = null;

  for (const u of users.values()) {
    if (u.username === query || u.email === query) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser || !bcrypt.compareSync(password, foundUser.passwordHash)) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid username/email or password',
      path: req.originalUrl
    });
  }

  seedUserConversations(foundUser.id);

  const token = jwt.sign({ sub: foundUser.id, username: foundUser.username }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ sub: foundUser.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    user: sanitizeUser(foundUser)
  });
});

app.post('/api/auth/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
    const user = users.get(decoded.sub);
    if (!user) throw new Error('User not found');

    const newToken = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    const newRefresh = jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token: newToken,
      refreshToken: newRefresh,
      tokenType: 'Bearer',
      user: sanitizeUser(user)
    });
  } catch (e) {
    res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired refresh token',
      path: req.originalUrl
    });
  }
});

// ----------------- USER APIS -----------------

app.get('/api/users/me', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(sanitizeUser(user));
});

app.put('/api/users/me', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { displayName, bio, status, profileImage } = req.body;
  if (displayName) user.displayName = displayName.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (status !== undefined) user.status = status.trim();
  if (profileImage) user.profileImage = profileImage;
  user.updatedAt = new Date().toISOString();

  res.json(sanitizeUser(user));
});

app.get('/api/users/search', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const query = ((req.query.query as string) || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    return res.json([]);
  }

  const results: any[] = [];
  for (const u of users.values()) {
    if (u.id === currentUserId) continue;
    if (
      u.username.toLowerCase().includes(query) ||
      u.displayName.toLowerCase().includes(query) ||
      u.akyvaId.toLowerCase().includes(query)
    ) {
      results.push(sanitizeUser(u));
    }
  }

  res.json(results);
});

app.get('/api/users/:id', authenticateToken, (req: Request, res: Response) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(sanitizeUser(user));
});

app.post('/api/users/:id/block', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const targetId = req.params.id;
  blockedUsers.add(`${currentUserId}:${targetId}`);
  res.json({ message: 'User blocked successfully' });
});

app.delete('/api/users/:id/block', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const targetId = req.params.id;
  blockedUsers.delete(`${currentUserId}:${targetId}`);
  res.json({ message: 'User unblocked successfully' });
});

app.post('/api/users/:id/report', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const targetId = req.params.id;
  const { reason, details } = req.body;
  reports.push({
    id: 'rep-' + Date.now(),
    reporterId: currentUserId,
    reportedUserId: targetId,
    reason,
    details,
    createdAt: new Date().toISOString()
  });
  res.json({ message: 'User reported successfully. Security team notified.' });
});

// ----------------- CONVERSATION APIS -----------------

app.get('/api/conversations', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  seedUserConversations(userId);

  const userConversations: any[] = [];
  for (const conv of conversations.values()) {
    if (conv.memberIds.includes(userId)) {
      const memberDetails = conv.memberIds.map(id => {
        const u = users.get(id);
        return u ? sanitizeUser(u) : null;
      }).filter(Boolean);

      const convMessages = messages.get(conv.id) || [];
      const latestMessage = convMessages.length > 0 ? formatMessage(convMessages[convMessages.length - 1]) : null;
      const unreadCount = convMessages.filter(m => m.senderId !== userId && m.status !== 'READ').length;

      userConversations.push({
        id: conv.id,
        type: conv.type,
        title: conv.title,
        members: memberDetails,
        lastMessage: latestMessage,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      });
    }
  }

  // Sort by updatedAt descending
  userConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json(userConversations);
});

app.post('/api/conversations', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const { type = 'DIRECT', title, memberIds } = req.body;

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: 'memberIds array is required' });
  }

  const allMembers = Array.from(new Set([...memberIds, currentUserId]));

  // Check if direct conversation already exists
  if (type === 'DIRECT' && allMembers.length === 2) {
    for (const c of conversations.values()) {
      if (c.type === 'DIRECT' && c.memberIds.includes(allMembers[0]) && c.memberIds.includes(allMembers[1])) {
        const memberDetails = c.memberIds.map(id => sanitizeUser(users.get(id)!)).filter(Boolean);
        const convMessages = messages.get(c.id) || [];
        const latestMessage = convMessages.length > 0 ? formatMessage(convMessages[convMessages.length - 1]) : null;
        return res.json({
          id: c.id,
          type: c.type,
          title: c.title,
          members: memberDetails,
          lastMessage: latestMessage,
          unreadCount: 0,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        });
      }
    }
  }

  const id = 'conv-' + Date.now();
  const newConv: Conversation = {
    id,
    type,
    title: title || null,
    memberIds: allMembers,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  conversations.set(id, newConv);
  messages.set(id, []);

  const memberDetails = allMembers.map(id => {
    const u = users.get(id);
    return u ? sanitizeUser(u) : null;
  }).filter(Boolean);

  res.status(201).json({
    id: newConv.id,
    type: newConv.type,
    title: newConv.title,
    members: memberDetails,
    lastMessage: null,
    unreadCount: 0,
    createdAt: newConv.createdAt,
    updatedAt: newConv.updatedAt
  });
});

app.get('/api/conversations/:id', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const conv = conversations.get(req.params.id);
  if (!conv || !conv.memberIds.includes(userId)) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const memberDetails = conv.memberIds.map(id => {
    const u = users.get(id);
    return u ? sanitizeUser(u) : null;
  }).filter(Boolean);

  const convMessages = messages.get(conv.id) || [];
  const latestMessage = convMessages.length > 0 ? formatMessage(convMessages[convMessages.length - 1]) : null;

  res.json({
    id: conv.id,
    type: conv.type,
    title: conv.title,
    members: memberDetails,
    lastMessage: latestMessage,
    unreadCount: 0,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt
  });
});

app.delete('/api/conversations/:id', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const conv = conversations.get(req.params.id);
  if (!conv || !conv.memberIds.includes(userId)) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conversations.delete(req.params.id);
  messages.delete(req.params.id);
  res.json({ message: 'Conversation deleted successfully' });
});

// ----------------- MESSAGE APIS -----------------

app.get('/api/conversations/:conversationId/messages', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const convId = req.params.conversationId;
  const conv = conversations.get(convId);
  if (!conv || !conv.memberIds.includes(userId)) {
    return res.status(403).json({ error: 'Not authorized for this conversation' });
  }

  const list = messages.get(convId) || [];
  let updatedAny = false;
  list.forEach(m => {
    if (m.senderId !== userId && m.status !== 'READ') {
      m.status = 'READ';
      updatedAny = true;
    }
  });

  if (updatedAny) {
    broadcastToConversation(convId, {
      type: 'MESSAGE_READ',
      conversationId: convId,
      readByUserId: userId
    });
  }

  res.json(list.map(formatMessage));
});

app.post('/api/conversations/:conversationId/messages', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const convId = req.params.conversationId;
  const conv = conversations.get(convId);
  if (!conv || !conv.memberIds.includes(userId)) {
    return res.status(403).json({ error: 'Not authorized for this conversation' });
  }

  const { content, messageType = 'TEXT', replyToMessageId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be blank' });
  }

  const newMsg: Message = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    conversationId: convId,
    senderId: userId,
    content: content.trim(),
    messageType,
    replyToMessageId: replyToMessageId || null,
    status: 'SENT',
    reactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const list = messages.get(convId) || [];
  list.push(newMsg);
  messages.set(convId, list);
  conv.updatedAt = new Date().toISOString();

  const formatted = formatMessage(newMsg);
  broadcastToConversation(convId, {
    type: 'MESSAGE_RECEIVED',
    conversationId: convId,
    message: formatted
  });

  // Simulated live partner response if chatting with Elena/Kenji/Priya/AI
  triggerSimulatedReplyIfNeeded(conv, newMsg);

  res.status(201).json(formatted);
});

app.put('/api/messages/:id', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const msgId = req.params.id;
  const { content } = req.body;

  for (const [convId, list] of messages.entries()) {
    const msg = list.find(m => m.id === msgId);
    if (msg) {
      if (msg.senderId !== userId) {
        return res.status(403).json({ error: 'You can only edit your own messages' });
      }
      if (msg.deletedAt) {
        return res.status(400).json({ error: 'Cannot edit a deleted message' });
      }
      msg.content = content.trim();
      msg.updatedAt = new Date().toISOString();
      const formatted = formatMessage(msg);
      broadcastToConversation(convId, {
        type: 'MESSAGE_UPDATED',
        conversationId: convId,
        message: formatted
      });
      return res.json(formatted);
    }
  }

  res.status(404).json({ error: 'Message not found' });
});

app.delete('/api/messages/:id', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const msgId = req.params.id;

  for (const [convId, list] of messages.entries()) {
    const msg = list.find(m => m.id === msgId);
    if (msg) {
      if (msg.senderId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own messages' });
      }
      msg.deletedAt = new Date().toISOString();
      broadcastToConversation(convId, {
        type: 'MESSAGE_DELETED',
        conversationId: convId,
        messageId: msgId
      });
      return res.json({ message: 'Message deleted successfully' });
    }
  }

  res.status(404).json({ error: 'Message not found' });
});

app.post('/api/messages/:id/reactions', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const msgId = req.params.id;
  const { emoji } = req.body;

  if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

  for (const [convId, list] of messages.entries()) {
    const msg = list.find(m => m.id === msgId);
    if (msg) {
      // Remove existing reaction with same emoji by this user
      msg.reactions = msg.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));

      const newReaction: MessageReaction = {
        id: 'rx-' + Date.now(),
        messageId: msgId,
        userId,
        emoji,
        createdAt: new Date().toISOString()
      };
      msg.reactions.push(newReaction);

      broadcastToConversation(convId, {
        type: 'MESSAGE_REACTION',
        conversationId: convId,
        messageId: msgId,
        reaction: newReaction
      });

      return res.json(newReaction);
    }
  }

  res.status(404).json({ error: 'Message not found' });
});

app.delete('/api/messages/:id/reactions', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const msgId = req.params.id;
  const emoji = req.query.emoji as string;

  for (const [convId, list] of messages.entries()) {
    const msg = list.find(m => m.id === msgId);
    if (msg) {
      msg.reactions = msg.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
      broadcastToConversation(convId, {
        type: 'MESSAGE_REACTION_REMOVED',
        conversationId: convId,
        messageId: msgId,
        userId,
        emoji
      });
      return res.json({ message: 'Reaction removed' });
    }
  }

  res.status(404).json({ error: 'Message not found' });
});

// ----------------- AI APIS -----------------

// POST /api/ai/smart-replies
app.post('/api/ai/smart-replies', async (req: Request, res: Response) => {
  const { lastMessage } = req.body;
  if (!lastMessage) {
    return res.json({ suggestions: ["Sounds good!", "Sure, I'll check.", "Thank you!"] });
  }

  if (geminiClient) {
    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are AKYVA AI messaging assistant. Give 3 or 4 short, conversational reply suggestions (maximum 6 words each) for someone replying to: "${lastMessage}".
Output strictly a JSON array of strings like ["Sounds good!", "Sure, I'll check."]. No markdown formatting.`
      });
      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ suggestions: parsed.slice(0, 4) });
      }
    } catch (err) {
      console.warn('Gemini smart replies failed, using fallback', err);
    }
  }

  // Safe fallback
  const lower = lastMessage.toLowerCase();
  let suggestions = ["Sounds good!", "Sure, I'll check.", "Thank you!", "I'll get back to you."];
  if (lower.includes('?')) {
    suggestions = ["Sure, I'll check right now.", "Sounds great!", "Could you clarify?", "Let's discuss soon."];
  } else if (lower.includes('thank')) {
    suggestions = ["You're most welcome!", "Anytime!", "Glad I could help!"];
  } else if (lower.includes('meeting') || lower.includes('call')) {
    suggestions = ["What time works best?", "I'm available!", "Let me check my calendar."];
  }
  res.json({ suggestions });
});

// POST /api/ai/translate
app.post('/api/ai/translate', async (req: Request, res: Response) => {
  const { text, sourceLanguage = 'auto', targetLanguage = 'English' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text cannot be blank' });
  }

  if (geminiClient) {
    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following message directly into ${targetLanguage}. Keep the natural conversational tone. Return ONLY the translated string without commentary, notes, or quotes:\n\n${text}`
      });
      const translatedText = (response.text || '').trim();
      if (translatedText) {
        return res.json({
          originalText: text,
          translatedText,
          sourceLanguage,
          targetLanguage
        });
      }
    } catch (err) {
      console.warn('Gemini translate failed, using safe fallback', err);
    }
  }

  // Fallback multilingual dictionary for major Indian and global languages
  const targetLower = targetLanguage.toLowerCase();
  const textLower = text.toLowerCase().trim();

  const dict: Record<string, Record<string, string>> = {
    tamil: {
      "how are you?": "நீங்கள் எப்படி இருக்கிறீர்கள்?",
      "hello": "வணக்கம்",
      "thank you": "நன்றி",
      "welcome to akyva": "AKYVA-விற்கு நல்வரவு",
      "sounds good!": "மிக நன்று!",
      "sure, i'll check": "நிச்சயமாக, நான் சரிபார்க்கிறேன்"
    },
    hindi: {
      "how are you?": "आप कैसे हैं?",
      "hello": "नमस्ते",
      "thank you": "धन्यवाद",
      "welcome to akyva": "AKYVA में आपका स्वागत है",
      "sounds good!": "बढ़िया लगा!",
      "sure, i'll check": "ज़रूर, मैं देखूँगा"
    },
    telugu: {
      "how are you?": "మీరు ఎలా ఉన్నారు?",
      "hello": "నమస్కారం",
      "thank you": "ధన్యవాదాలు"
    },
    kannada: {
      "how are you?": "ನೀವು ಹೇಗಿದ್ದೀರಿ?",
      "hello": "ನಮಸ್ಕಾರ",
      "thank you": "ಧನ್ಯವಾದಗಳು"
    },
    malayalam: {
      "how are you?": "സുഖമാണോ?",
      "hello": "നമസ്കാരം",
      "thank you": "നന്ദി"
    },
    bengali: {
      "how are you?": "আপনি কেমন আছেন?",
      "hello": "নমস্কার",
      "thank you": "ধন্যবাদ"
    },
    marathi: {
      "how are you?": "तुम्ही कसे आहात?",
      "hello": "नमस्कार",
      "thank you": "धन्यवाद"
    },
    gujarati: {
      "how are you?": "તમે કેમ છો?",
      "hello": "નમસ્તે",
      "thank you": "આભાર"
    },
    punjabi: {
      "how are you?": "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?",
      "hello": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
      "thank you": "ਧੰਨਵਾਦ"
    },
    spanish: {
      "how are you?": "¿Cómo estás?",
      "hello": "¡Hola!",
      "thank you": "Gracias"
    },
    german: {
      "how are you?": "Wie geht es dir?",
      "hello": "Hallo!",
      "thank you": "Danke"
    },
    japanese: {
      "how are you?": "お元気ですか？",
      "hello": "こんにちは！",
      "thank you": "ありがとうございます"
    }
  };

  let translated = `[${targetLanguage}] ${text}`;
  for (const [lang, map] of Object.entries(dict)) {
    if (targetLower.includes(lang) && map[textLower]) {
      translated = map[textLower];
      break;
    }
  }

  res.json({
    originalText: text,
    translatedText: translated,
    sourceLanguage,
    targetLanguage
  });
});

// POST /api/ai/rewrite
app.post('/api/ai/rewrite', async (req: Request, res: Response) => {
  const { text, tone = 'Professional' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text cannot be blank' });
  }

  if (geminiClient) {
    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite this message draft to be '${tone}'. Keep the core intent. Return ONLY the rewritten text without quotes, labels, or intros:\n\n${text}`
      });
      const rewrittenText = (response.text || '').trim();
      if (rewrittenText) {
        return res.json({ originalText: text, rewrittenText, tone });
      }
    } catch (err) {
      console.warn('Gemini rewrite failed, using safe fallback', err);
    }
  }

  // Fallback tone rewriter
  let rewritten = text;
  const trimmed = text.trim();
  const lowerTone = tone.toLowerCase();

  if (lowerTone === 'professional') {
    rewritten = `Good day, I would like to note that ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}. Please let me know if you require any further clarification.`;
  } else if (lowerTone === 'friendly') {
    rewritten = `Hey! Just wanted to share that ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)} 😊 Hope you're having a wonderful day!`;
  } else if (lowerTone === 'shorter') {
    rewritten = trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed;
  } else if (lowerTone === 'clearer') {
    rewritten = `To clarify: ${trimmed}. Looking forward to your thoughts.`;
  }

  res.json({ originalText: text, rewrittenText: rewritten, tone });
});

// POST /api/ai/summarize
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  const { messages: transcriptList = [] } = req.body;

  if (transcriptList.length === 0) {
    return res.json({
      overview: "No active conversation messages to summarize yet.",
      keyPoints: ["Start communicating with your partner to generate an AI summary."],
      actionItems: ["Send a message in the chat."],
      fullSummary: "No messages found."
    });
  }

  if (geminiClient) {
    try {
      const transcripts = transcriptList.join('\n- ');
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following chat conversation into an executive overview, 3-4 bullet points of key takeaways, and action items.
Respond ONLY in valid JSON matching:
{"overview":"...", "keyPoints":["...", "..."], "actionItems":["...", "..."], "fullSummary":"..."}

Chat:
${transcripts}`
      });
      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini summarize failed, using fallback', err);
    }
  }

  // Fallback summary
  res.json({
    overview: "Discussion regarding collaboration timelines, multilingual readiness, and deliverables.",
    keyPoints: [
      "Meeting scheduled for Friday morning",
      "Arun will prepare the document",
      "Priya will review it",
      "Final submission is Saturday"
    ],
    actionItems: [
      "Confirm document review with Priya",
      "Submit final materials ahead of Saturday cutoff"
    ],
    fullSummary: "The participants aligned on upcoming deliverables, assigning preparation to Arun, review to Priya, and confirming Saturday deadline."
  });
});

// POST /api/ai/check-message
app.post('/api/ai/check-message', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.json({
      riskLevel: "LOW",
      isSuspicious: false,
      reason: "No content to analyze.",
      recommendedAction: "Safe to proceed."
    });
  }

  if (geminiClient) {
    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following chat message for spam, phishing, financial scam, suspicious short links, or high-pressure extortion.
Respond ONLY in valid JSON matching:
{"riskLevel":"LOW"|"MEDIUM"|"HIGH", "isSuspicious":true|false, "reason":"...", "recommendedAction":"..."}

Message: "${text}"`
      });
      const textResponse = response.text || '';
      const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini security check failed, using fallback', err);
    }
  }

  const lower = text.toLowerCase();
  const hasUrgency = lower.includes('send money') || lower.includes('wire transfer') || lower.includes('gift card') || lower.includes('claim your prize') || lower.includes('otp') || lower.includes('bank password');
  const hasSuspiciousUrl = lower.includes('http://') || lower.includes('bit.ly') || lower.includes('tinyurl') || lower.includes('.xyz');

  if (hasUrgency && hasSuspiciousUrl) {
    return res.json({
      riskLevel: "HIGH",
      isSuspicious: true,
      reason: "High probability phishing attempt: Contains urgent financial solicitation and unverified short link.",
      recommendedAction: "Do not click links or share credentials. Block and report sender."
    });
  } else if (hasUrgency) {
    return res.json({
      riskLevel: "MEDIUM",
      isSuspicious: true,
      reason: "Potential financial scam: Requests sensitive credentials, OTP, or rapid payment.",
      recommendedAction: "Verify sender identity via voice or secondary channel before taking action."
    });
  } else if (hasSuspiciousUrl) {
    return res.json({
      riskLevel: "MEDIUM",
      isSuspicious: true,
      reason: "External link detected from unverified URL shortener.",
      recommendedAction: "Exercise caution before opening unknown links."
    });
  }

  res.json({
    riskLevel: "LOW",
    isSuspicious: false,
    reason: "No suspicious patterns or threat indicators detected.",
    recommendedAction: "Safe to communicate."
  });
});

// ----------------- NOTIFICATIONS APIS -----------------

app.get('/api/notifications', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const userNotes = notifications.filter(n => n.userId === userId);
  res.json(userNotes);
});

app.put('/api/notifications/:id/read', authenticateToken, (req: Request, res: Response) => {
  const note = notifications.find(n => n.id === req.params.id);
  if (note) note.isRead = true;
  res.json({ message: 'Notification marked as read' });
});

// ----------------- STATUS (STORIES) APIS -----------------
app.get('/api/status', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const now = new Date().getTime();
  
  // Group active statuses by user
  const userFeedsMap: Map<string, any> = new Map();
  
  for (const status of statuses.values()) {
    if (new Date(status.expiresAt).getTime() < now) continue;
    const author = users.get(status.userId);
    if (!author) continue;

    if (!userFeedsMap.has(status.userId)) {
      userFeedsMap.set(status.userId, {
        userId: author.id,
        user: sanitizeUser(author),
        stories: [],
        hasUnseen: false,
        lastUpdatedAt: status.createdAt
      });
    }

    const feed = userFeedsMap.get(status.userId)!;
    const viewerDetails = status.viewers.map(v => {
      const u = users.get(v.userId);
      return u ? { userId: v.userId, user: sanitizeUser(u), viewedAt: v.viewedAt } : null;
    }).filter(Boolean);

    const hasViewed = status.viewers.some(v => v.userId === currentUserId);
    if (!hasViewed && status.userId !== currentUserId) {
      feed.hasUnseen = true;
    }

    feed.stories.push({
      id: status.id,
      mediaType: status.mediaType,
      content: status.content,
      backgroundColor: status.backgroundColor,
      fontStyle: status.fontStyle,
      caption: status.caption,
      viewers: viewerDetails,
      createdAt: status.createdAt,
      expiresAt: status.expiresAt
    });

    if (new Date(status.createdAt).getTime() > new Date(feed.lastUpdatedAt).getTime()) {
      feed.lastUpdatedAt = status.createdAt;
    }
  }

  res.json(Array.from(userFeedsMap.values()));
});

app.post('/api/status', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const { mediaType = 'TEXT', content, backgroundColor, fontStyle, caption } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Status content is required' });
  }

  const id = 'status-' + Date.now();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const newStatus: StatusStory = {
    id,
    userId,
    mediaType,
    content,
    backgroundColor,
    fontStyle,
    caption,
    viewers: [],
    createdAt: new Date().toISOString(),
    expiresAt
  };

  statuses.set(id, newStatus);
  res.status(201).json(newStatus);
});

app.post('/api/status/:id/view', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const status = statuses.get(req.params.id);
  if (!status) return res.status(404).json({ error: 'Status not found' });

  if (!status.viewers.some(v => v.userId === userId)) {
    status.viewers.push({ userId, viewedAt: new Date().toISOString() });
  }

  res.json({ message: 'Status viewed' });
});

// ----------------- CALL LOGS APIS -----------------
app.get('/api/calls', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const userCalls = callRecords
    .filter(c => c.callerId === currentUserId || c.calleeId === currentUserId)
    .map(c => {
      const caller = users.get(c.callerId);
      const callee = users.get(c.calleeId);
      return {
        id: c.id,
        caller: caller ? sanitizeUser(caller) : null,
        callee: callee ? sanitizeUser(callee) : null,
        type: c.type,
        status: c.status,
        durationSeconds: c.durationSeconds,
        timestamp: c.timestamp
      };
    });

  res.json(userCalls);
});

app.post('/api/calls', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const { calleeId, type = 'AUDIO', status = 'MISSED', durationSeconds = 0 } = req.body;

  const newCall: CallRecord = {
    id: 'call-' + Date.now(),
    callerId: currentUserId,
    calleeId,
    type,
    status,
    durationSeconds,
    timestamp: new Date().toISOString()
  };

  callRecords.unshift(newCall);
  res.status(201).json(newCall);
});

// ----------------- MOMENTS (SOCIAL FEED) APIS -----------------
app.get('/api/moments', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const momentsList = Array.from(momentsPosts.values()).map(m => {
    const author = users.get(m.authorId);
    return {
      ...m,
      author: author ? sanitizeUser(author) : null,
      isLiked: momentLikes.has(`${currentUserId}:${m.id}`)
    };
  });

  res.json(momentsList);
});

app.post('/api/moments/:id/like', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const momentId = req.params.id;
  const moment = momentsPosts.get(momentId);
  if (!moment) return res.status(404).json({ error: 'Moment not found' });

  const key = `${userId}:${momentId}`;
  if (momentLikes.has(key)) {
    momentLikes.delete(key);
    moment.likesCount = Math.max(0, moment.likesCount - 1);
    return res.json({ isLiked: false, likesCount: moment.likesCount });
  } else {
    momentLikes.add(key);
    moment.likesCount += 1;
    return res.json({ isLiked: true, likesCount: moment.likesCount });
  }
});

app.post('/api/moments/:id/comments', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.sub;
  const momentId = req.params.id;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });

  const moment = momentsPosts.get(momentId);
  if (!moment) return res.status(404).json({ error: 'Moment not found' });

  const comment: MomentCommentItem = {
    id: 'mc-' + Date.now(),
    momentId,
    userId,
    text,
    createdAt: new Date().toISOString()
  };

  momentComments.push(comment);
  moment.commentsCount += 1;

  const author = users.get(userId);
  res.status(201).json({
    ...comment,
    user: author ? sanitizeUser(author) : null
  });
});

// ----------------- CREATOR STUDIO APIS -----------------
app.get('/api/creator/posts', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const posts = creatorPosts.filter(p => p.userId === currentUserId);
  res.json(posts);
});

app.post('/api/creator/posts', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = (req as any).user.sub;
  const { platform, title, script, caption, scheduledTime } = req.body;

  const newPost: CreatorPostItem = {
    id: 'cp-' + Date.now(),
    userId: currentUserId,
    platform: platform || 'AKYVA_MOMENTS',
    title,
    script,
    caption,
    scheduledTime: scheduledTime || new Date(Date.now() + 86400000).toISOString(),
    status: 'SCHEDULED'
  };

  creatorPosts.push(newPost);
  res.status(201).json(newPost);
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    app: 'AKYVA',
    tagline: 'CONNECT BEYOND LANGUAGE',
    geminiEnabled: hasValidGeminiKey,
    time: new Date().toISOString()
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    const path = await import('path');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🕊️ AKYVA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
