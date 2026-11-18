import React, { useState } from 'react';
import { Conversation, User } from '../types';
import { Search, Plus, Sparkles, Users, Pin, Archive, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onNewGroup
}) => {
  const { user } = useAuth();
  const { activeTypers, onlineUsers } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    if (!showArchived && conv.isArchived) return false;
    if (showArchived && !conv.isArchived) return false;
    const partner = conv.members.find(m => m.id !== user?.id);
    const title = conv.title || partner?.displayName || partner?.username || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-[#050811]/95 border-r border-white/5 select-none">
      {/* Search & Actions bar */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Chats</span>
            <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full font-semibold border border-[#00E5FF]/20">
              {conversations.length}
            </span>
          </h1>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onNewGroup}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="New Group Chat"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={onNewChat}
              className="p-2 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00E5FF]/20 cursor-pointer"
              title="Start New Direct Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {searchQuery ? 'No matching conversations' : 'No active chats yet. Start one now!'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.type === 'GROUP';
            const partner = conv.members.find(m => m.id !== user?.id) || conv.members[0];
            const isSelected = selectedConversationId === conv.id;
            const isOnline = !isGroup && partner && (onlineUsers.has(partner.id) || partner.id === 'user-concierge' || partner.id === 'user-priya');
            const typingUser = activeTypers[conv.id];

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-[#0E172A] border-l-2 border-[#00E5FF]'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Avatar with live presence dot or Group Icon */}
                <div className="relative shrink-0">
                  {isGroup ? (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0066FF] to-[#00E5FF] flex items-center justify-center text-white border border-[#00E5FF]/30 shadow-md">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <img
                      src={partner?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={partner?.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-white/10"
                    />
                  )}

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050811] rounded-full shadow-[0_0_8px_#10B981]"></span>
                  )}
                  {partner?.id === 'user-concierge' && (
                    <span className="absolute -top-1 -right-1 bg-[#00E5FF] text-black text-[9px] font-black px-1 rounded-full">
                      AI
                    </span>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      {conv.title || (isGroup ? 'Group Discussion' : partner?.displayName) || 'Chat'}
                      {partner?.id === 'user-concierge' && (
                        <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-1">
                      {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  {/* Snippet / Typing */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 truncate pr-2">
                      {typingUser ? (
                        <span className="text-[#00E5FF] font-medium flex items-center gap-1 animate-pulse">
                          <span>{typingUser} is typing</span>
                          <span className="inline-block w-1 h-1 bg-[#00E5FF] rounded-full animate-bounce"></span>
                        </span>
                      ) : (
                        conv.lastMessage?.content || 'No messages yet'
                      )}
                    </p>

                    {conv.unreadCount > 0 && (
                      <span className="bg-[#00E5FF] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
