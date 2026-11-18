import React, { useState } from 'react';
import { Message, MessageReaction, User } from '../types';
import { 
  Check, 
  CheckCheck, 
  Globe, 
  Smile, 
  Reply, 
  Copy, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  ChevronDown, 
  Pin, 
  Star, 
  Share2, 
  Download, 
  FileText 
} from 'lucide-react';
import { aiApi } from '../api/aiApi';
import { AudioWaveformPlayer } from './AudioWaveformPlayer';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  currentUser: User | null;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onCheckSecurity: (message: Message) => void;
  onPinMessage?: (messageId: string) => void;
  onStarMessage?: (messageId: string) => void;
  onForwardMessage?: (message: Message) => void;
  preferredLanguage?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  currentUser,
  onReply,
  onDelete,
  onReact,
  onCheckSecurity,
  onPinMessage,
  onStarMessage,
  onForwardMessage,
  preferredLanguage = 'Tamil'
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(message.translatedText || null);
  const [translatedLang, setTranslatedLang] = useState<string | null>(message.translatedLanguage || null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const availableLanguages = [
    'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam',
    'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Spanish', 'German', 'Japanese', 'English'
  ];

  const quickEmojis = ['❤️', '👍', '😂', '🔥', '🕊️', '😮'];

  const handleTranslate = async (targetLang: string) => {
    setShowLangMenu(false);
    setIsTranslating(true);
    try {
      const res = await aiApi.translate(message.content, targetLang);
      setTranslatedText(res.translatedText);
      setTranslatedLang(targetLang);
    } catch (e) {
      console.error('Translation failed', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText || message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group reactions by emoji
  const reactionCounts: Record<string, { count: number; reactedByMe: boolean }> = {};
  (message.reactions || []).forEach(r => {
    if (!reactionCounts[r.emoji]) {
      reactionCounts[r.emoji] = { count: 0, reactedByMe: false };
    }
    reactionCounts[r.emoji].count += 1;
    if (r.userId === currentUser?.id) {
      reactionCounts[r.emoji].reactedByMe = true;
    }
  });

  const formatTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isDeleted = !!message.deletedAt;

  return (
    <div
      className={`group relative flex flex-col mb-3 px-4 ${
        isCurrentUser ? 'items-end' : 'items-start'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); setShowLangMenu(false); }}
    >
      {/* Forwarded label */}
      {message.forwardedFrom && (
        <span className="text-[10px] italic text-slate-400 mb-0.5 flex items-center gap-1">
          <Share2 className="w-3 h-3 text-[#38BDF8]" />
          <span>Forwarded</span>
        </span>
      )}

      {/* Sender name for group/incoming */}
      {!isCurrentUser && message.sender && (
        <span className="text-[11px] font-semibold text-[#38BDF8] ml-1 mb-1">
          {message.sender.displayName}
        </span>
      )}

      {/* Bubble Container */}
      <div className="relative max-w-[85%] sm:max-w-[70%]">
        {/* Reply Quote preview if applicable */}
        {message.replyToMessage && (
          <div
            className={`text-xs px-3 py-1.5 rounded-t-xl border-l-2 mb-0.5 opacity-80 ${
              isCurrentUser
                ? 'bg-[#0055D4]/40 border-[#00E5FF] text-slate-200'
                : 'bg-[#1E293B]/60 border-[#38BDF8] text-slate-300'
            }`}
          >
            <div className="font-semibold text-[10px] text-[#38BDF8]">
              {message.replyToMessage.sender?.displayName || 'Reply'}
            </div>
            <div className="truncate text-[11px] italic">
              {message.replyToMessage.content}
            </div>
          </div>
        )}

        {/* Core Bubble */}
        <div
          className={`p-3.5 rounded-2xl shadow-lg relative transition-all ${
            isCurrentUser
              ? 'bg-gradient-to-br from-[#0055D4] to-[#0041A8] text-white rounded-tr-sm border border-[#00E5FF]/20'
              : 'bg-[#0E172A] text-slate-100 rounded-tl-sm border border-white/10'
          } ${isDeleted ? 'opacity-50 italic' : ''}`}
        >
          {/* Top Indicators: Pinned / Starred */}
          {(message.isPinned || message.isStarred) && (
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[#00E5FF]">
              {message.isPinned && (
                <span className="flex items-center gap-1 bg-[#00E5FF]/10 px-1.5 py-0.2 rounded font-semibold border border-[#00E5FF]/20">
                  <Pin className="w-2.5 h-2.5 fill-current" />
                  <span>Pinned</span>
                </span>
              )}
              {message.isStarred && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-2.5 h-2.5 fill-current" />
                </span>
              )}
            </div>
          )}

          {/* VOICE MESSAGE TYPE */}
          {message.messageType === 'VOICE' ? (
            <AudioWaveformPlayer
              duration={message.duration || 8}
              audioUrl={message.mediaUrl}
              transcription={message.transcription}
              isCurrentUser={isCurrentUser}
            />
          ) : message.messageType === 'IMAGE' ? (
            /* IMAGE ATTACHMENT TYPE */
            <div className="space-y-2">
              <a href={message.mediaUrl || '#'} target="_blank" rel="noreferrer">
                <img
                  src={message.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80'}
                  alt="Attachment"
                  className="rounded-xl max-h-64 w-auto object-cover border border-white/10 hover:opacity-95 transition-opacity"
                />
              </a>
              {message.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </div>
          ) : message.messageType === 'FILE' ? (
            /* DOCUMENT / FILE ATTACHMENT TYPE */
            <div className="space-y-2">
              <div className="p-3 bg-black/30 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-6 h-6 text-[#00E5FF] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{message.fileName || 'document.pdf'}</div>
                    <div className="text-[10px] text-slate-400">{message.fileSize || '1.4 MB'}</div>
                  </div>
                </div>
                <a
                  href={message.mediaUrl || '#'}
                  download={message.fileName || 'file'}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-[#00E5FF] hover:text-black transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              {message.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </div>
          ) : (
            /* STANDARD TEXT MESSAGE */
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* AI Translation block if active */}
          {translatedText && !isDeleted && (
            <div className="mt-2.5 pt-2 border-t border-white/15 text-xs bg-black/20 p-2 rounded-xl">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[#00E5FF] mb-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Translated into {translatedLang}</span>
                </span>
                <button
                  onClick={() => setTranslatedText(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm font-medium text-white leading-relaxed">
                {translatedText}
              </p>
            </div>
          )}

          {isTranslating && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[#00E5FF] animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Translating with AI...</span>
            </div>
          )}

          {/* Timestamp and delivery receipts */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 select-none">
            <span>{formatTimestamp(message.createdAt)}</span>
            {isCurrentUser && !isDeleted && (
              <span>
                {message.status === 'READ' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                ) : message.status === 'DELIVERED' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction badges pill below bubble */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactionCounts).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-all ${
                  data.reactedByMe
                    ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-white'
                    : 'bg-[#0E172A] border border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-bold">{data.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hover / Long-press Actions Menu */}
        {showActions && !isDeleted && (
          <div
            className={`absolute -top-9 z-20 flex items-center gap-1 bg-[#0A0F1D]/95 border border-[#00E5FF]/30 rounded-xl p-1 shadow-xl backdrop-blur-md ${
              isCurrentUser ? 'right-0' : 'left-0'
            }`}
          >
            {/* Quick emoji reaction picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-slate-400 hover:text-[#00E5FF] rounded-lg hover:bg-white/5"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute top-8 left-0 z-30 flex items-center gap-1.5 bg-[#0A0F1D] border border-white/15 rounded-xl p-2 shadow-2xl">
                  {quickEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { onReact(message.id, emoji); setShowEmojiPicker(false); }}
                      className="text-base hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Translate button */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1.5 text-slate-400 hover:text-[#00E5FF] rounded-lg hover:bg-white/5 flex items-center gap-0.5"
                title={`Translate (Default: ${preferredLanguage})`}
              >
                <Globe className="w-3.5 h-3.5" />
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showLangMenu && (
                <div className="absolute top-8 left-0 z-30 w-36 max-h-48 overflow-y-auto bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-xl py-1 shadow-2xl divide-y divide-white/5">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                    Translate to:
                  </div>
                  {availableLanguages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleTranslate(lang)}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-white hover:bg-[#00E5FF]/20 flex items-center justify-between"
                    >
                      <span>{lang}</span>
                      {lang === preferredLanguage && (
                        <span className="text-[9px] text-[#00E5FF] font-bold">Default</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reply */}
            <button
              onClick={() => onReply(message)}
              className="p-1.5 text-slate-400 hover:text-[#00E5FF] rounded-lg hover:bg-white/5"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>

            {/* Star */}
            {onStarMessage && (
              <button
                onClick={() => onStarMessage(message.id)}
                className={`p-1.5 rounded-lg hover:bg-white/5 ${
                  message.isStarred ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                }`}
                title="Star Message"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            {/* Pin */}
            {onPinMessage && (
              <button
                onClick={() => onPinMessage(message.id)}
                className={`p-1.5 rounded-lg hover:bg-white/5 ${
                  message.isPinned ? 'text-[#00E5FF]' : 'text-slate-400 hover:text-[#00E5FF]'
                }`}
                title="Pin Message"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Forward */}
            {onForwardMessage && (
              <button
                onClick={() => onForwardMessage(message)}
                className="p-1.5 text-slate-400 hover:text-[#00E5FF] rounded-lg hover:bg-white/5"
                title="Forward Message"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-[#00E5FF] rounded-lg hover:bg-white/5"
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* AI Threat / Phishing inspect */}
            {!isCurrentUser && (
              <button
                onClick={() => onCheckSecurity(message)}
                className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/5"
                title="AI Threat & Scam Check"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete for own messages */}
            {isCurrentUser && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
