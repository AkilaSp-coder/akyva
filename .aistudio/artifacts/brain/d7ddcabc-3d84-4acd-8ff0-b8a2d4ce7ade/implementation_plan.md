# AKYVA Super Platform Upgrade – Phase 1 Complete Project Audit & Architectural Blueprint

> **AKYVA: Connect. Communicate. Create. Grow.**  
> Comprehensive audit of existing frontend/backend codebases, feature completion matrix, architectural gap analysis, and phased upgrade plan.

---

## Executive Summary & Critical Review

> [!IMPORTANT]
> **Audit Status**: Complete. No source code has been altered during Phase 1.
> The existing application is a functioning MVP featuring basic 1-on-1 text messaging, JWT authentication, WebSocket presence/typing, and initial Gemini AI integrations (translation, rewrite, smart replies, scam check). However, all high-tier modules requested in the master specification—**Status Updates (WhatsApp-style stories), WebRTC Audio/Video Calling, Voice Waveform Messages & Real File Sharing, Dedicated AI Assistant Tab, Creator Studio with YouTube/Instagram tools, Moments Social Video Feed, AI Productivity & Reminders, and Subscription Tiers**—are either placeholder mocks, architecture-only stubs, or completely unbuilt.

---

## 1. Complete Project Structure Analysis

The project contains a hybrid architecture: a dual-layer runtime consisting of an active full-stack Express + WebSocket + Vite dev server (`server.ts` on port 3000), paired with an enterprise Java 17 / Spring Boot 3.x / PostgreSQL backend (`/backend`) with Flyway migrations.

```
/
├── .env.example
├── Dockerfile                        (Full-stack containerization)
├── docker-compose.yml                (PostgreSQL + Spring Boot + Frontend cluster)
├── package.json                      (React 19, Vite, Express, ws, @google/genai, lucide-react)
├── server.ts                         (Full-stack runtime: REST endpoints, WebSocket broker, in-memory DB & Vite middleware)
├── index.html                        (HTML5, dark theme, Plus Jakarta Sans typography)
├── metadata.json                     (AI Studio descriptor)
├── README.md                         (Architecture documentation, setup guide)
│
├── src/                              (Frontend Client - React 19 + TypeScript)
│   ├── App.tsx                       (Main shell, tabs, chat room container, modal coordinators)
│   ├── main.tsx                      (React DOM client root)
│   ├── index.css                     (Tailwind CSS v4, custom scrollbars, cyber glow & glassmorphism)
│   ├── api/                          (Client API integration layer)
│   │   ├── apiClient.ts              (Fetch wrapper with JWT injection & 401 interceptor)
│   │   ├── authApi.ts                (Register, login, refresh)
│   │   ├── chatApi.ts                (Conversation CRUD)
│   │   ├── messageApi.ts             (Messages, reactions, edit, delete)
│   │   ├── userApi.ts                (Profile, search, block, report)
│   │   └── aiApi.ts                  (Smart replies, translate, rewrite, summarize, check)
│   ├── components/                   (UI Components)
│   │   ├── AkyvaLogo.tsx             (Messenger-dove vector insignia with cyber glow)
│   │   ├── AuthModal.tsx             (Login/register forms + quick demo persona triggers)
│   │   ├── ChatList.tsx              (Conversation threads, live presence dot, typing snippet)
│   │   ├── ChatHeader.tsx            (Active contact info, summarize trigger, partner menu)
│   │   ├── MessageBubble.tsx         (Chat bubbles, delivery ticks, inline AI translation, reaction pills)
│   │   ├── MessageComposer.tsx       (Input bar, emoji picker, AI tone rewrite menu, simulated voice/attach)
│   │   ├── SmartRepliesBar.tsx       (Contextual AI reply chips above composer)
│   │   ├── AIThreatBanner.tsx        (Real-time scam / phishing warning banner)
│   │   ├── AISummarizeModal.tsx      (Structured chat summary modal with action items)
│   │   ├── PartnerInfoModal.tsx      (Contact details, block user, report user, delete chat)
│   │   ├── PeopleView.tsx            (Search users by handle/AKYVA ID, featured contacts)
│   │   ├── NotificationsView.tsx     (Notification items, unread counter, read marks)
│   │   ├── ProfileView.tsx           (Avatar picker, bio, status, copyable AKYVA ID)
│   │   ├── SettingsView.tsx          (AI toggles, language picker, read receipts, about)
│   │   └── Navigation.tsx            (Desktop sidebar + mobile bottom nav bar)
│   ├── context/
│   │   ├── AuthContext.tsx           (Authentication state, token lifecycle, user profile)
│   │   └── WebSocketContext.tsx      (Native WebSocket manager, auto-reconnect, presence, typing, events)
│   └── types/
│       └── index.ts                  (TypeScript models for User, Message, Conversation, Notification, etc.)
│
└── backend/                          (Java 17 / Spring Boot 3.3.4 Production Service)
    ├── pom.xml                       (Spring Web, WebSocket STOMP, Security, Data JPA, PostgreSQL, Flyway, JJWT)
    ├── Dockerfile                    (Multi-stage Maven + Eclipse Temurin 17 JRE)
    └── src/
        ├── main/
        │   ├── resources/
        │   │   ├── application.yml   (PostgreSQL configuration, JWT params, Gemini keys, Swagger paths)
        │   │   └── db/migration/
        │   │       └── V1__init_schema.sql (PostgreSQL DDL: users, conversations, messages, reactions, reports)
        │   └── java/com/akyva/
        │       ├── AkyvaApplication.java
        │       ├── ai/               (AiService interface, MockAiService, GeminiAiService)
        │       ├── config/           (SecurityConfig, WebSocketConfig, CorsConfig, OpenApiConfig)
        │       ├── controller/       (Auth, User, Conversation, Message, Ai, Notification controllers)
        │       ├── dto/              (Request/response DTOs for auth, users, messages, ai, notifications)
        │       ├── entity/           (JPA Entities: User, Conversation, Message, Reaction, Notification, BlockedUser, Report)
        │       ├── exception/        (GlobalExceptionHandler, ResourceNotFound, BadRequest, Unauthorized)
        │       ├── repository/       (Spring Data JPA repositories with custom queries)
        │       ├── security/         (UserPrincipal, UserDetailsServiceImpl, JwtTokenProvider, JwtAuthFilter)
        │       ├── service/          (AuthService, UserService, ConversationService, MessageService, NotificationService)
        │       └── websocket/        (ChatWebSocketController, WebSocketEventListener)
        └── test/
            └── java/com/akyva/       (AuthServiceTest, AiServiceTest)
```

---

## 2. Completed Features (What Already Works)

1. **Authentication & Session Management**:
   - Registration and Login with BCrypt password hashing.
   - JWT token issuance (`Bearer` token) and refresh token rotation.
   - Private AKYVA ID generation (`AKY-XXXX-XXXX`). No public phone numbers required.
   - Demo personas (Alex Rivera, Elena Vance, Priya Patel, Kenji Sato) for instant testing.
2. **Basic 1-to-1 Messaging**:
   - Message sending and receipt over WebSocket and REST APIs.
   - Sent, delivered, and read receipt tracking with single/double checkmark icons.
   - In-memory message store with optimistic client-side UI updates.
   - Conversation list with latest message snippet, unread counter, and timestamp.
   - Real-time typing indicators (`TYPING_START` / `TYPING_STOP`).
   - Online/Offline presence indicators across contacts.
3. **Message Actions**:
   - Emoji reactions with count pills and toggle behavior.
   - Message replies with quote preview.
   - Message soft-delete ("This message was deleted").
   - Message text editing.
   - Message clipboard copy.
4. **AI Assistance (Core Engine)**:
   - Provider-independent `AiService` architecture.
   - Gemini 2.5 Flash integration with safe mock fallback when API keys are absent.
   - AI Smart Reply suggestions: non-intrusive chips above the composer (user must tap to insert).
   - AI Multilingual Translation: inline translation option supporting 10+ languages (Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, German, Spanish, Japanese, English).
   - AI Message Rewrite: tone transform (*Professional*, *Friendly*, *Shorter*, *Clearer*) with preview and replace.
   - AI Chat Summarization: extracts executive overview, key decisions, and action items.
   - AI Scam / Phishing Detection: detects urgent wire transfer requests, credential grabs, and suspicious short links.
5. **Contact & Safety Management**:
   - User search by username, display name, and private AKYVA ID.
   - User blocking (`/api/users/{id}/block`) and unblocking.
   - User reporting (`/api/users/{id}/report`) with reason and details.
6. **Backend Engineering Standards**:
   - Modular Spring Boot architecture (`com.akyva`).
   - Swagger / OpenAPI documentation configured at `/swagger-ui.html`.
   - Flyway database migration `V1__init_schema.sql` with PostgreSQL indexes.
   - Unit tests covering `AuthService` and `AiService`.

---

## 3. Incomplete Features (Started But Need Real Implementation)

1. **Voice Messaging**:
   - *Current State*: The microphone button records for a fake 1.6s timer and outputs text: `🎙️ [Voice note: 0:04s] 'Hello...'`.
   - *Incomplete*: Real MediaRecorder audio recording, audio waveform visualization, audio playback controls (play/pause/seek), playback speed (1x, 1.5x, 2x), and automated AI speech-to-text transcription.
2. **File Sharing**:
   - *Current State*: Paperclip button opens a dialog stating *"AKYVA MVP supports rich text messaging. Full image, voice, and file storage will be enabled in Phase 2"*.
   - *Incomplete*: Multipart file upload, file type validation (images, video, PDF, DOCX, XLSX, ZIP), file size limits, progress indicator, download action, and file preview tiles.
3. **Group Messaging**:
   - *Current State*: `ConversationType.GROUP` exists in Java enum and database schema, but there is no UI to create a group, add/remove participants, manage group admins, or broadcast group mentions.
4. **Message Management**:
   - *Incomplete*: Starred messages, pinned messages, message search (in-chat filtering), chat archiving, and disappearing messages (auto-delete after timer).

---

## 4. Missing Features (From Master Requirements)

| Category | Missing Capability |
| :--- | :--- |
| **Status Update System** | WhatsApp-style 24-hour status stories (Text, Image, Video), viewer list, view counters, seen/unseen avatar gradient rings, status viewer modal, status reply/reactions, and auto-expiry. |
| **Audio/Video Calling** | WebRTC signaling over WebSocket, 1:1 and group audio/video calls, incoming call screen, outgoing call screen, mute microphone, camera toggle, screen sharing, call duration timer, and call history log. |
| **Dedicated AI Assistant Tab** | A standalone conversational AI agent tab (not just composer tools): natural language chat, multi-turn brainstorming, document explanation, image understanding (multimodal vision), and natural language chat history search. |
| **AKYVA Creator Studio** | Separate creator dashboard: Instagram & YouTube OAuth account connection architecture, AI script generators (Shorts/Reels in English and Tamil), caption/hashtag generator, content calendar & post scheduler, analytics dashboard (views, engagement, follower growth), and AI Growth Advisor. |
| **AKYVA Moments** | TikTok/Reels-style vertical short-video feed: smooth scroll/swipe navigation, like, comment, share, save video, creator profile drawer, and trending discover feed. |
| **Stickers & GIFs** | Giphy/Tenor GIF search modal, animated sticker packs, recently used stickers, custom sticker tabs. |
| **AI Productivity** | AI Daily Assistant summary, smart task reminders, meeting commitments detector, and calendar integration architecture. |
| **Subscriptions & Monetization** | Tier configuration (`Free`, `Plus`, `Creator Pro`, `Business`), feature quotas, usage meters, and billing-ready state models. |
| **Advanced Privacy & Security** | Two-factor authentication (2FA), session/device management, account data export, and complete account deletion. |
| **Navigation Overhaul** | Upgrade from 5 tabs (Chats, People, Alerts, Profile, Settings) to the master 7-tab system: **1. Chats, 2. Status, 3. Calls, 4. Moments, 5. AI Assistant, 6. Creator Studio, 7. Profile & Settings**. |

---

## 5. Existing Bugs & Technical Issues

1. **Dual Runtime Divergence**:
   - The dev server runs via `tsx server.ts` (Express + WebSocket + in-memory store) while Java Spring Boot is in `/backend`. Features added to the frontend must have matching endpoints in both `server.ts` (for instant local execution in the web dev container) and `/backend` (for production Spring Boot/Postgres deployment).
2. **Missing Mobile Status & Calling Routes**:
   - Mobile navigation only exposes 5 tabs, which will crowd the bottom bar unless organized into an elegant 5-primary + expandable "More" menu or compact icon bar with modern tooltips.
3. **No Audio Context / Blob Handling**:
   - Browser audio recording requires handling Safari/Chrome `MediaRecorder` mime types (`audio/webm;codecs=opus` vs `audio/mp4`), permission denial fallback, and memory cleanup.
4. **WebRTC Signaling Missing in WebSocket**:
   - WebSocket handler in `server.ts` and `ChatWebSocketController.java` only routes chat messages; it lacks signaling payloads (`OFFER`, `ANSWER`, `ICE_CANDIDATE`, `CALL_USER`, `CALL_ACCEPTED`, `CALL_ENDED`).
5. **Hardcoded Avatar URLs**:
   - Unsplash avatar URLs work when connected to the internet, but local SVG/gradient identicon fallbacks are needed if external image CDNs fail.

---

## 6. Database & API Analysis

### Current Database Schema (V1__init_schema.sql)
- Tables: `users`, `conversations`, `conversation_members`, `messages`, `message_reactions`, `notifications`, `blocked_users`, `reports`.
- Missing Tables required for Master Platform:
  1. `statuses` & `status_views`: For 24-hour expiring status stories.
  2. `call_records`: For audio/video call history, caller, callee, type, status, and duration.
  3. `moments_posts`, `moments_likes`, `moments_comments`: For short-video discovery platform.
  4. `creator_posts`, `creator_analytics`: For scheduled posts, video scripts, metrics, and connected social accounts.
  5. `ai_reminders` & `ai_tasks`: For personal productivity layer.
  6. `subscriptions`: For plan tiers, limits, and active status.
  7. Add message flags: `is_pinned`, `is_starred`, `forwarded_from_id`, `media_url`, `media_type`, `file_size`, `duration`.

---

## 7. Phased Implementation Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AKYVA MASTER UPGRADE ROADMAP                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
  ┌────────────────────────────────────┴────────────────────────────────────┐
  ▼                                                                         ▼
[ Phase 2: Core Messaging & Media ]                       [ Phase 3: Real-Time WebRTC Calling ]
  - Group chat creation & member admin                      - WebRTC 1:1 and Group signaling (WS)
  - Real voice recorder with waveform & playback            - Incoming / Outgoing call UI modals
  - Voice-to-text AI transcription                          - Mute, video toggle, screen share
  - Real file & media sharing with previews                 - Call history & missed call alerts
  - Stickers & GIF picker, pin/star messages                - Device selection (mic, camera, speaker)
  - Disappearing messages timer                             
                                       │
  ┌────────────────────────────────────┴────────────────────────────────────┐
  ▼                                                                         ▼
[ Phase 4: Status Stories & Social Moments ]              [ Phase 5: Dedicated AI Assistant & Productivity ]
  - 24-hour expiring Status updates (Text, Image, Video)    - Standalone "AI Assistant" full-screen chat tab
  - Seen/unseen status rings & viewer counter modal         - Multimodal image reasoning & document explainer
  - "AKYVA Moments" vertical short-video feed               - Natural language search across chat history
  - Like, comment, share, save, creator profiles            - AI Daily Assistant & smart task reminders
                                       │
  ┌────────────────────────────────────┴────────────────────────────────────┐
  ▼                                                                         ▼
[ Phase 6: Creator Studio & Monetization ]                [ Phase 7: Polish, Security & Production Sync ]
  - YouTube & Instagram OAuth integration architecture      - 2FA authentication & device management
  - AI Video Script & Reels generator (English & Tamil)     - Account data export & deletion
  - Content calendar & post scheduler                       - Database migration V2__expanded_features.sql
  - Growth Advisor & engagement metrics                     - Spring Boot backend synchronization
  - Subscriptions: Free, Plus, Creator Pro, Business        - End-to-end compilation & mobile responsiveness
```

---

## 8. Step-by-Step Execution Plan

### **Phase 2: Complete Messaging, Voice, Media, Groups & Stickers**
1. **Groups & Advanced Message Management**:
   - Create `NewGroupModal.tsx` allowing multi-user selection, group name, avatar, and admin assignment.
   - Add pinned messages banner at top of chat, starred message filter, message search bar, and chat archive toggle.
   - Implement Disappearing Messages setting (Off, 24 Hours, 7 Days, 90 Days).
2. **Real Audio Voice Recorder & Player**:
   - Build `VoiceRecorder.tsx` using HTML5 `MediaRecorder` API with real-time audio level visualizer.
   - Add waveform playback component (`AudioWaveformPlayer.tsx`) with 1x/1.5x/2x speed toggle and scrubber.
   - Integrate AI Voice-to-Text: tap "Transcribe" to convert voice messages into text.
3. **File & Media Sharing**:
   - Implement `FileUploadModal.tsx` supporting images, videos, audio, PDF, DOCX, XLSX, and ZIP with file size inspection and upload progress simulation.
   - Add media viewer lightbox for fullscreen image/video viewing.
4. **Stickers & GIFs**:
   - Build `StickerGifPicker.tsx` with categorized tabs: Emojis, Animated Stickers, Trending GIFs, and Favorites.

### **Phase 3: WebRTC Audio & Video Calling**
1. **WebRTC Signaling Infrastructure**:
   - Extend WebSocket handlers in `server.ts` and backend to handle `CALL_INITIATE`, `CALL_OFFER`, `CALL_ANSWER`, `ICE_CANDIDATE`, `CALL_REJECT`, and `CALL_END`.
2. **Call Interface & History**:
   - Build `CallModal.tsx` supporting 1:1 and group video/audio calls with local/remote video streams, audio waveform for audio calls, camera flip, mute, and screen sharing.
   - Add `CallsView.tsx` with incoming/outgoing/missed call history logs and 1-tap call-back buttons.

### **Phase 4: Status Update System & AKYVA Moments**
1. **WhatsApp-Style Status Stories**:
   - Build `StatusView.tsx` featuring "My Status" (add text/image/video status with color themes/captions) and "Recent Updates" grouped by contact.
   - Add `StatusViewerModal.tsx` with progress bar segments, 24h auto-expiry calculation, viewer list drawer, and direct status reply.
2. **AKYVA Moments (Social Video Platform)**:
   - Build `MomentsView.tsx` featuring a vertical short-video feed with snap-scrolling, sound toggle, like count, comment drawer, share modal, and creator follow buttons.

### **Phase 5: Dedicated AI Assistant & Productivity Layer**
1. **Dedicated AI Assistant Tab**:
   - Build `AIAssistantView.tsx` with prompt templates (Brainstorming, Explaining, Translating, Writing, Code), multi-turn conversation memory, and multimodal image analysis.
   - Implement natural language chat search across message archives.
2. **Productivity & Reminders**:
   - Add Smart Reminders and Daily AI briefing widget (tasks, meeting commitments, unread summaries).

### **Phase 6: AKYVA Creator Studio & Subscription Architecture**
1. **Creator Studio (`CreatorStudioView.tsx`)**:
   - Social accounts connector (Instagram Professional & YouTube official OAuth architecture).
   - AI Content Tools: Reels & Shorts script generation, viral title generator, hashtags, and Tamil + English multilingual support.
   - Content calendar with scheduling and AI Growth Advisor insights.
2. **Subscription Plans**:
   - Build `SubscriptionModal.tsx` showcasing Free, Plus ($4.99/mo), Creator Pro ($19.99/mo), and Business ($49.99/mo) with tier comparison and usage meters.

### **Phase 7: Security Hardening, Database V2 Migration & Full Verification**
1. **Security & Privacy Enhancements**:
   - 2FA toggle with authenticator code verification simulation, active session/device manager, account export, and account deletion.
2. **Database V2 Flyway Migration**:
   - Create `V2__complete_platform_schema.sql` in `/backend/src/main/resources/db/migration/` covering all new entities.
3. **Verification**:
   - Verify TypeScript compilation (`tsc --noEmit`), Vite build (`npm run build`), server health checks, and responsive mobile-first UI across all screen widths.
