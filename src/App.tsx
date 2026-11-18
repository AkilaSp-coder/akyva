import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';
import { 
  Conversation, 
  Message, 
  NavTab, 
  SecurityCheckResult, 
  SummarizeResult, 
  User, 
  UserStatusFeed, 
  StatusStoryItem, 
  CallRecord, 
  ActiveCallSession 
} from './types';
import { chatApi } from './api/chatApi';
import { messageApi } from './api/messageApi';
import { aiApi } from './api/aiApi';
import { userApi } from './api/userApi';
import { Navigation } from './components/Navigation';
import { ChatList } from './components/ChatList';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { MessageComposer } from './components/MessageComposer';
import { SmartRepliesBar } from './components/SmartRepliesBar';
import { AIThreatBanner } from './components/AIThreatBanner';
import { AISummarizeModal } from './components/AISummarizeModal';
import { PartnerInfoModal } from './components/PartnerInfoModal';
import { PeopleView } from './components/PeopleView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { AkyvaLogo } from './components/AkyvaLogo';
import { StatusView } from './components/StatusView';
import { StatusViewerModal } from './components/StatusViewerModal';
import { CallsView } from './components/CallsView';
import { CallModal } from './components/CallModal';
import { MomentsView } from './components/MomentsView';
import { AIAssistantView } from './components/AIAssistantView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { SubscriptionModal } from './components/SubscriptionModal';
import { NewGroupModal } from './components/NewGroupModal';
import { Sparkles, MessageSquare, Shield, Globe, Users } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onMessageReceived, onReactionReceived, onReactionRemoved, onMessageDeleted, sendTypingWs } = useWebSocket();

  // Master 7 Navigation Tabs
  const [currentTab, setCurrentTab] = useState<NavTab>('chats');

  // Conversations & Messages State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Composer & Interaction State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [insertedComposerText, setInsertedComposerText] = useState<string | null>(null);

  // Modals & Popups State
  const [threatCheck, setThreatCheck] = useState<SecurityCheckResult | null>(null);
  const [summarizeResult, setSummarizeResult] = useState<SummarizeResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  // Status Stories State (WhatsApp-style)
  const [statusFeeds, setStatusFeeds] = useState<UserStatusFeed[]>([]);
  const [activeStatusFeed, setActiveStatusFeed] = useState<UserStatusFeed | null>(null);

  // WebRTC Audio/Video Calls State
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);

  // User Settings State
  const [preferredLanguage, setPreferredLanguage] = useState<string>('Tamil');
  const [aiSmartRepliesEnabled, setAiSmartRepliesEnabled] = useState<boolean>(true);
  const [aiTranslationEnabled, setAiTranslationEnabled] = useState<boolean>(true);
  const [aiScamProtectionEnabled, setAiScamProtectionEnabled] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Seed sample status stories & call history
  useEffect(() => {
    if (!user) return;

    // Default status stories from global community contacts
    setStatusFeeds([
      {
        userId: user.id,
        user,
        stories: [
          {
            id: 'st-me-1',
            mediaType: 'TEXT',
            content: 'Exploring the new AKYVA Super Platform! 🕊️✨',
            backgroundColor: '#0055D4',
            viewers: [],
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString()
          }
        ],
        hasUnseen: false,
        lastUpdatedAt: new Date().toISOString()
      },
      {
        userId: 'user-priya',
        user: {
          id: 'user-priya',
          username: 'priya_patel',
          displayName: 'Priya Patel',
          email: 'priya@akyva.io',
          akyvaId: 'AKY-4921-8812',
          profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          createdAt: new Date().toISOString()
        },
        stories: [
          {
            id: 'st-p1',
            mediaType: 'TEXT',
            content: 'வணக்கம்! AKYVA Tamil AI மொழிபெயர்ப்பு மிக அருமையாக இயங்குகிறது! ✨',
            backgroundColor: '#7C3AED',
            viewers: [{ userId: user.id, user, viewedAt: new Date().toISOString() }],
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 - 3600000 * 2).toISOString()
          },
          {
            id: 'st-p2',
            mediaType: 'IMAGE',
            content: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
            viewers: [],
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 - 3600000 * 1).toISOString()
          }
        ],
        hasUnseen: true,
        lastUpdatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
      },
      {
        userId: 'user-kenji',
        user: {
          id: 'user-kenji',
          username: 'kenji_sato',
          displayName: 'Kenji Sato',
          email: 'kenji@akyva.io',
          akyvaId: 'AKY-3391-7411',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          createdAt: new Date().toISOString()
        },
        stories: [
          {
            id: 'st-k1',
            mediaType: 'IMAGE',
            content: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
            viewers: [],
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 - 3600000 * 4).toISOString()
          }
        ],
        hasUnseen: true,
        lastUpdatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]);

    // Sample call history records
    setCallHistory([
      {
        id: 'call-1',
        caller: user,
        callee: {
          id: 'user-priya',
          username: 'priya_patel',
          displayName: 'Priya Patel',
          email: 'priya@akyva.io',
          akyvaId: 'AKY-4921-8812',
          profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          createdAt: new Date().toISOString()
        },
        callType: 'VIDEO',
        status: 'COMPLETED',
        durationSeconds: 342,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 'call-2',
        caller: {
          id: 'user-elena',
          username: 'elena_vance',
          displayName: 'Elena Vance',
          email: 'elena@akyva.io',
          akyvaId: 'AKY-7102-3940',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          createdAt: new Date().toISOString()
        },
        callee: user,
        callType: 'AUDIO',
        status: 'MISSED',
        durationSeconds: 0,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ]);
  }, [user]);

  // Fetch Conversations & Contacts
  const fetchConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
      if (!activeConversation && data.length > 0) {
        if (window.innerWidth >= 768) {
          setActiveConversation(data[0]);
        }
      }

      // Extract unique contact list
      const contactsMap = new Map<string, User>();
      data.forEach(c => {
        c.members.forEach(m => {
          if (m.id !== user?.id) contactsMap.set(m.id, m);
        });
      });
      setAvailableUsers(Array.from(contactsMap.values()));
    } catch (err) {
      console.error('Failed fetching conversations', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Load Messages
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);
    messageApi.getMessages(activeConversation.id)
      .then(msgs => {
        if (isMounted) setMessages(msgs);
      })
      .catch(err => {
        console.error('Failed loading messages', err);
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConversation?.id]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, activeConversation?.id]);

  // WebSocket Event Listeners
  useEffect(() => {
    const unsubMsg = onMessageReceived((newMsg) => {
      if (activeConversation && newMsg.conversationId === activeConversation.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();

        if (aiScamProtectionEnabled && newMsg.sender?.id !== user?.id) {
          aiApi.checkMessage(newMsg.content).then(res => {
            if (res.isSuspicious) {
              setThreatCheck(res);
            }
          }).catch(() => {});
        }
      }
      fetchConversations();
    });

    const unsubRx = onReactionReceived((rx) => {
      setMessages(prev => prev.map(m => {
        if (m.id === rx.messageId) {
          const filtered = (m.reactions || []).filter(r => !(r.userId === rx.userId && r.emoji === rx.emoji));
          return { ...m, reactions: [...filtered, rx] };
        }
        return m;
      }));
    });

    const unsubRxRem = onReactionRemoved((data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          return {
            ...m,
            reactions: (m.reactions || []).filter(r => !(r.userId === data.userId && r.emoji === data.emoji))
          };
        }
        return m;
      }));
    });

    const unsubDel = onMessageDeleted((data) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.messageId) {
          return { ...m, deletedAt: new Date().toISOString(), content: 'This message was deleted' };
        }
        return m;
      }));
    });

    return () => {
      unsubMsg();
      unsubRx();
      unsubRxRem();
      unsubDel();
    };
  }, [activeConversation?.id, aiScamProtectionEnabled, user?.id]);

  // Send Message with full media/voice support
  const handleSendMessage = async (
    content: string, 
    replyToMessageId?: string | null,
    extra?: {
      messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
      mediaUrl?: string;
      fileName?: string;
      fileSize?: string;
      duration?: number;
    }
  ) => {
    if (!activeConversation) return;

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: activeConversation.id,
      senderId: user?.id,
      sender: user || undefined,
      content,
      messageType: extra?.messageType || 'TEXT',
      mediaUrl: extra?.mediaUrl,
      fileName: extra?.fileName,
      fileSize: extra?.fileSize,
      duration: extra?.duration,
      replyToMessageId: replyToMessageId || null,
      status: 'SENT',
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const savedMsg = await messageApi.sendMessage(activeConversation.id, {
        content,
        replyToMessageId,
        messageType: extra?.messageType
      });

      setMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, ...extra } : m));
      fetchConversations();
    } catch (err) {
      console.error('Failed sending message', err);
    }
  };

  // Reactions & Soft-delete
  const handleReact = async (messageId: string, emoji: string) => {
    const msg = messages.find(m => m.id === messageId);
    const hasReacted = msg?.reactions?.some(r => r.userId === user?.id && r.emoji === emoji);

    try {
      if (hasReacted) {
        await messageApi.removeReaction(messageId, emoji);
      } else {
        await messageApi.addReaction(messageId, emoji);
      }
    } catch (err) {
      console.error('Reaction failed', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageApi.deleteMessage(messageId);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deletedAt: new Date().toISOString(), content: 'This message was deleted' } : m));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Pin & Star & Forward
  const handlePinMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m));
  };

  const handleStarMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: !m.isStarred } : m));
  };

  const handleForwardMessage = (msg: Message) => {
    if (!activeConversation) return;
    handleSendMessage(`[Forwarded]: ${msg.content}`, null, {
      messageType: msg.messageType,
      mediaUrl: msg.mediaUrl
    });
  };

  // Security check manually
  const handleCheckSecurity = async (msg: Message) => {
    try {
      const res = await aiApi.checkMessage(msg.content);
      setThreatCheck(res);
    } catch (err) {
      console.error('Security check failed', err);
    }
  };

  // Summarize chat
  const handleSummarizeChat = async () => {
    if (messages.length === 0) return;
    setShowSummarizeModal(true);
    setIsSummarizing(true);
    try {
      const transcripts = messages.map(m => `${m.sender?.displayName || 'User'}: ${m.content}`);
      const res = await aiApi.summarize(transcripts, activeConversation?.id);
      setSummarizeResult(res);
    } catch (err) {
      console.error('Summarize failed', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Create Group Chat
  const handleCreateGroup = async (title: string, memberIds: string[]) => {
    try {
      const newGroup = await chatApi.createConversation({
        type: 'GROUP',
        title,
        memberIds
      });
      await fetchConversations();
      setActiveConversation(newGroup);
      setCurrentTab('chats');
    } catch (err) {
      console.error('Failed creating group', err);
    }
  };

  // Start chat with user from Directory
  const handleStartChatWithUser = async (targetUser: User) => {
    try {
      const newConv = await chatApi.createConversation({
        type: 'DIRECT',
        memberIds: [targetUser.id]
      });
      await fetchConversations();
      setActiveConversation(newConv);
      setCurrentTab('chats');
    } catch (err) {
      console.error('Failed to start chat', err);
    }
  };

  // Status Story handlers
  const handleAddTextStatus = (text: string, bgColor: string) => {
    if (!user) return;
    const newStory: StatusStoryItem = {
      id: 'st-' + Date.now(),
      mediaType: 'TEXT',
      content: text,
      backgroundColor: bgColor,
      viewers: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };

    setStatusFeeds(prev => prev.map(feed => {
      if (feed.userId === user.id) {
        return {
          ...feed,
          stories: [newStory, ...feed.stories],
          lastUpdatedAt: new Date().toISOString()
        };
      }
      return feed;
    }));
  };

  const handleAddMediaStatus = (mediaUrl: string, caption: string) => {
    if (!user) return;
    const newStory: StatusStoryItem = {
      id: 'st-' + Date.now(),
      mediaType: 'IMAGE',
      content: mediaUrl,
      viewers: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    };

    setStatusFeeds(prev => prev.map(feed => {
      if (feed.userId === user.id) {
        return {
          ...feed,
          stories: [newStory, ...feed.stories],
          lastUpdatedAt: new Date().toISOString()
        };
      }
      return feed;
    }));
  };

  const handleReplyToStatus = (text: string, story: StatusStoryItem) => {
    if (!activeStatusFeed || !user) return;
    // Auto-create direct chat message with quote
    handleSendMessage(`Replying to status story: "${story.content.substring(0, 30)}..."\n\n${text}`);
    setCurrentTab('chats');
  };

  // WebRTC Call Initiation & Controls
  const handleStartCall = (targetUser: User, type: 'AUDIO' | 'VIDEO') => {
    if (!user) return;
    const session: ActiveCallSession = {
      callId: 'call-' + Date.now(),
      caller: user,
      callee: targetUser,
      callType: type,
      state: 'CALLING',
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false
    };
    setActiveCallSession(session);

    // Simulate connection after ringing
    setTimeout(() => {
      setActiveCallSession(prev => prev ? { ...prev, state: 'CONNECTED', startTime: Date.now() } : null);
    }, 1800);
  };

  const handleAcceptCall = () => {
    setActiveCallSession(prev => prev ? { ...prev, state: 'CONNECTED', startTime: Date.now() } : null);
  };

  const handleRejectCall = () => {
    if (activeCallSession) {
      setCallHistory(prev => [
        {
          id: 'cr-' + Date.now(),
          caller: activeCallSession.caller,
          callee: activeCallSession.callee,
          callType: activeCallSession.callType,
          status: 'REJECTED',
          durationSeconds: 0,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }
    setActiveCallSession(null);
  };

  const handleEndCall = () => {
    if (activeCallSession) {
      const dur = activeCallSession.startTime ? Math.floor((Date.now() - activeCallSession.startTime) / 1000) : 14;
      setCallHistory(prev => [
        {
          id: 'cr-' + Date.now(),
          caller: activeCallSession.caller,
          callee: activeCallSession.callee,
          callType: activeCallSession.callType,
          status: 'COMPLETED',
          durationSeconds: Math.max(dur, 5),
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }
    setActiveCallSession(null);
  };

  const lastIncomingMessage = [...messages].reverse().find(m => m.sender?.id !== user?.id && !m.deletedAt);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center p-4">
        <AkyvaLogo size="lg" showTagline={true} />
        <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-[#00E5FF] animate-pulse">
          <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-ping"></span>
          <span>Connecting to AKYVA Super Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="h-screen w-screen bg-[#050811] flex overflow-hidden select-none">
      {/* Primary Navigation (Desktop Sidebar & Mobile Bottom Bar) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadCount={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
        missedCallsCount={callHistory.filter(c => c.status === 'MISSED').length}
        hasUnseenStatus={statusFeeds.some(f => f.userId !== user?.id && f.hasUnseen)}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
      />

      {/* Main Content Area based on currentTab */}
      <main className="flex-1 flex overflow-hidden pb-16 md:pb-0 relative">
        {/* TAB 1: CHATS */}
        {currentTab === 'chats' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations list column */}
            <div className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
              activeConversation ? 'hidden md:flex md:flex-col' : 'flex flex-col'
            }`}>
              <ChatList
                conversations={conversations}
                selectedConversationId={activeConversation?.id || null}
                onSelectConversation={(conv) => setActiveConversation(conv)}
                onNewChat={() => setCurrentTab('people')}
                onNewGroup={() => setShowNewGroupModal(true)}
              />
            </div>

            {/* Chat Room detail column */}
            <div className={`flex-1 h-full flex flex-col bg-[#050811] ${
              !activeConversation ? 'hidden md:flex md:items-center md:justify-center' : 'flex'
            }`}>
              {activeConversation ? (
                <>
                  <ChatHeader
                    conversation={activeConversation}
                    onBack={() => setActiveConversation(null)}
                    onOpenSummarize={handleSummarizeChat}
                    onOpenInfo={() => setShowPartnerModal(true)}
                    onStartVoiceCall={() => {
                      const partner = activeConversation.members.find(m => m.id !== user?.id) || activeConversation.members[0];
                      if (partner) handleStartCall(partner, 'AUDIO');
                    }}
                    onStartVideoCall={() => {
                      const partner = activeConversation.members.find(m => m.id !== user?.id) || activeConversation.members[0];
                      if (partner) handleStartCall(partner, 'VIDEO');
                    }}
                  />

                  {/* AI Threat Warning Banner if triggered */}
                  <AIThreatBanner
                    checkResult={threatCheck}
                    onDismiss={() => setThreatCheck(null)}
                    onBlockUser={() => {
                      setThreatCheck(null);
                      setShowPartnerModal(true);
                    }}
                  />

                  {/* Message List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {loadingMessages ? (
                      <div className="py-12 flex justify-center items-center gap-2 text-xs text-[#00E5FF] animate-pulse">
                        <Sparkles className="w-4 h-4" />
                        <span>Decrypting conversation stream...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-24 text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] mx-auto flex items-center justify-center border border-[#00E5FF]/20 shadow-lg">
                          <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-white">No messages yet</h3>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          Say hello! Multilingual translation, voice notes & real file sharing are active.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isCurrentUser={msg.sender?.id === user?.id || msg.senderId === user?.id}
                          currentUser={user}
                          onReply={(m) => setReplyingTo(m)}
                          onDelete={handleDeleteMessage}
                          onReact={handleReact}
                          onCheckSecurity={handleCheckSecurity}
                          onPinMessage={handlePinMessage}
                          onStarMessage={handleStarMessage}
                          onForwardMessage={handleForwardMessage}
                          preferredLanguage={preferredLanguage}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* AI Smart Replies Suggestions Bar */}
                  <SmartRepliesBar
                    enabled={aiSmartRepliesEnabled}
                    lastMessageContent={lastIncomingMessage?.content}
                    onSelectSuggestion={(text) => setInsertedComposerText(text)}
                  />

                  {/* Message Composer with Voice/Attach/Emoji/AI rewrite */}
                  <MessageComposer
                    onSendMessage={handleSendMessage}
                    onTyping={(isTyping) => sendTypingWs(activeConversation.id, isTyping)}
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    insertedText={insertedComposerText}
                    onClearInsertedText={() => setInsertedComposerText(null)}
                  />
                </>
              ) : (
                <div className="text-center p-8 space-y-4 max-w-md">
                  <AkyvaLogo size="xl" showTagline={true} />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Select a conversation or start a new group discussion. Multilingual translation, voice notes, and WebRTC calls are active.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-[#38BDF8] pt-2">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#00E5FF]" />
                      <span>10+ Languages</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#00E5FF]" />
                      <span>Scam Protection</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STATUS UPDATE SYSTEM */}
        {currentTab === 'status' && (
          <StatusView
            statusFeeds={statusFeeds}
            onOpenViewer={(feed) => setActiveStatusFeed(feed)}
            onAddTextStatus={handleAddTextStatus}
            onAddMediaStatus={handleAddMediaStatus}
          />
        )}

        {/* TAB 3: AUDIO & VIDEO CALLS */}
        {currentTab === 'calls' && (
          <CallsView
            callHistory={callHistory}
            onStartCall={handleStartCall}
            availableUsers={availableUsers}
          />
        )}

        {/* TAB 4: MOMENTS SOCIAL VIDEO FEED */}
        {currentTab === 'moments' && (
          <MomentsView />
        )}

        {/* TAB 5: DEDICATED AI ASSISTANT */}
        {currentTab === 'ai-assistant' && (
          <AIAssistantView />
        )}

        {/* TAB 6: CREATOR STUDIO */}
        {currentTab === 'creator-studio' && (
          <CreatorStudioView />
        )}

        {/* TAB 7: SETTINGS & PREFERENCES */}
        {currentTab === 'settings' && (
          <SettingsView
            preferredLanguage={preferredLanguage}
            onLanguageChange={setPreferredLanguage}
            aiSmartRepliesEnabled={aiSmartRepliesEnabled}
            onToggleSmartReplies={setAiSmartRepliesEnabled}
            aiTranslationEnabled={aiTranslationEnabled}
            onToggleTranslation={setAiTranslationEnabled}
            aiScamProtectionEnabled={aiScamProtectionEnabled}
            onToggleScamProtection={setAiScamProtectionEnabled}
          />
        )}

        {/* SECONDARY TABS: PEOPLE, ALERTS, PROFILE */}
        {currentTab === 'people' && (
          <PeopleView onStartChat={handleStartChatWithUser} />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView />
        )}

        {currentTab === 'profile' && (
          <ProfileView />
        )}
      </main>

      {/* MODALS */}

      {/* WebRTC Video/Audio Call Modal */}
      {activeCallSession && (
        <CallModal
          session={activeCallSession}
          onAcceptCall={handleAcceptCall}
          onRejectCall={handleRejectCall}
          onEndCall={handleEndCall}
          onToggleMute={() => setActiveCallSession(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
          onToggleCamera={() => setActiveCallSession(prev => prev ? { ...prev, isCameraOff: !prev.isCameraOff } : null)}
          onToggleScreenShare={() => setActiveCallSession(prev => prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null)}
          currentUser={user}
        />
      )}

      {/* 24-Hour Status Story Viewer Modal */}
      {activeStatusFeed && (
        <StatusViewerModal
          isOpen={!!activeStatusFeed}
          onClose={() => setActiveStatusFeed(null)}
          statusFeed={activeStatusFeed}
          onReplyToStatus={handleReplyToStatus}
        />
      )}

      {/* AI Summarize Chat Modal */}
      {showSummarizeModal && (
        <AISummarizeModal
          summary={summarizeResult}
          loading={isSummarizing}
          onClose={() => setShowSummarizeModal(false)}
        />
      )}

      {/* Partner Info & Privacy Modal */}
      {showPartnerModal && activeConversation && (
        <PartnerInfoModal
          conversation={activeConversation}
          onClose={() => setShowPartnerModal(false)}
          onConversationDeleted={(id) => {
            setConversations(prev => prev.filter(c => c.id !== id));
            setActiveConversation(null);
          }}
        />
      )}

      {/* Subscription & Pricing Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* New Group Chat Modal */}
      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        availableUsers={availableUsers}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <MainApp />
      </WebSocketProvider>
    </AuthProvider>
  );
}
