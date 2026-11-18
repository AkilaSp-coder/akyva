import React from 'react';
import { Conversation, User } from '../types';
import { 
  ArrowLeft, 
  Sparkles, 
  MoreVertical, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Video, 
  Pin, 
  Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onOpenSummarize: () => void;
  onOpenInfo: () => void;
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
  onOpenPinnedList?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onBack,
  onOpenSummarize,
  onOpenInfo,
  onStartVoiceCall,
  onStartVideoCall,
  onOpenPinnedList
}) => {
  const { user } = useAuth();
  const { onlineUsers } = useWebSocket();

  const isGroup = conversation.type === 'GROUP';
  const partner = conversation.members.find(m => m.id !== user?.id) || conversation.members[0];
  const isOnline = !isGroup && partner && (onlineUsers.has(partner.id) || partner.id === 'user-concierge' || partner.id === 'user-priya');

  return (
    <header className="h-16 px-4 bg-[#0A0F1D]/90 border-b border-[#00E5FF]/15 flex items-center justify-between shrink-0 backdrop-blur-xl z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile back button */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Partner or Group avatar */}
        <div className="relative shrink-0 cursor-pointer" onClick={onOpenInfo}>
          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0066FF] to-[#00E5FF] flex items-center justify-center text-white border border-[#00E5FF]/30 shadow-md">
              <Users className="w-5 h-5" />
            </div>
          ) : (
            <img
              src={partner?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={partner?.displayName}
              className="w-10 h-10 rounded-full object-cover border border-[#00E5FF]/30"
            />
          )}

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0A0F1D] rounded-full shadow-[0_0_6px_#10B981]"></span>
          )}
        </div>

        {/* Title & metadata */}
        <div className="min-w-0 cursor-pointer" onClick={onOpenInfo}>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white truncate">
              {conversation.title || (isGroup ? 'Group Discussion' : partner?.displayName) || 'Chat'}
            </h2>
            {!isGroup && partner?.akyvaId && (
              <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.2 rounded border border-[#00E5FF]/20 hidden sm:inline-block">
                {partner.akyvaId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {isGroup ? (
              <span>{conversation.members.length} members</span>
            ) : (
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1 text-[#38BDF8]">
              <Globe className="w-3 h-3" />
              <span>Multilingual</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons (Calls, Summarize, Menu) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Voice Call */}
        {onStartVoiceCall && (
          <button
            onClick={onStartVoiceCall}
            className="p-2 text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Start HD Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
        )}

        {/* Video Call */}
        {onStartVideoCall && (
          <button
            onClick={onStartVideoCall}
            className="p-2 text-slate-300 hover:text-[#00E5FF] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Start HD Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        )}

        {/* AI Summarize Chat */}
        <button
          onClick={onOpenSummarize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0066FF]/20 to-[#00E5FF]/20 hover:from-[#0066FF]/30 hover:to-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          title="Summarize chat with AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
          <span className="hidden sm:inline">Summarize Chat</span>
        </button>

        {/* More details */}
        <button
          onClick={onOpenInfo}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          title="Chat details & privacy"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
