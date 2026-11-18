import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Smile, Sparkles, X, Wand2, Check, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Message } from '../types';
import { aiApi } from '../api/aiApi';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { FileUploadModal } from './FileUploadModal';
import { StickerGifPicker } from './StickerGifPicker';

interface MessageComposerProps {
  onSendMessage: (content: string, replyToMessageId?: string | null, extra?: {
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    duration?: number;
  }) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  insertedText?: string | null;
  onClearInsertedText?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
  insertedText,
  onClearInsertedText
}) => {
  const [content, setContent] = useState('');
  const [showStickerGifPicker, setShowStickerGifPicker] = useState(false);
  const [showRewriteMenu, setShowRewriteMenu] = useState(false);
  const [rewriteSuggestion, setRewriteSuggestion] = useState<{ text: string; tone: string } | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showVoiceRecorderModal, setShowVoiceRecorderModal] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Synchronize when a Smart Reply chip is tapped
  useEffect(() => {
    if (insertedText) {
      setContent(insertedText);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      onClearInsertedText?.();
    }
  }, [insertedText, onClearInsertedText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Typing presence notification
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(content.trim(), replyingTo ? replyingTo.id : null);
    setContent('');
    onCancelReply();
    setShowStickerGifPicker(false);
    setShowRewriteMenu(false);
    setRewriteSuggestion(null);
    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleRewrite = async (tone: 'Professional' | 'Friendly' | 'Shorter' | 'Clearer') => {
    if (!content.trim()) return;
    setShowRewriteMenu(false);
    setIsRewriting(true);
    try {
      const res = await aiApi.rewrite(content, tone);
      setRewriteSuggestion({ text: res.rewrittenText, tone });
    } catch (err) {
      console.error('Rewrite failed', err);
    } finally {
      setIsRewriting(false);
    }
  };

  const applyRewrite = () => {
    if (rewriteSuggestion) {
      setContent(rewriteSuggestion.text);
      setRewriteSuggestion(null);
    }
  };

  // Voice message sent from VoiceRecorderModal
  const handleSendVoiceMessage = (durationSeconds: number, audioBlobUrl: string) => {
    onSendMessage(
      `🎙️ Voice note (${durationSeconds}s)`,
      replyingTo ? replyingTo.id : null,
      {
        messageType: 'VOICE',
        duration: durationSeconds,
        mediaUrl: audioBlobUrl
      }
    );
  };

  // File sent from FileUploadModal
  const handleSendFile = (fileInfo: { fileName: string; fileSize: string; mediaUrl: string; messageType: 'IMAGE' | 'FILE' | 'VOICE' }) => {
    onSendMessage(
      fileInfo.messageType === 'IMAGE' ? 'Shared an image' : `Shared ${fileInfo.fileName}`,
      replyingTo ? replyingTo.id : null,
      {
        messageType: fileInfo.messageType,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize,
        mediaUrl: fileInfo.mediaUrl
      }
    );
  };

  // Sticker or GIF selected
  const handleSelectSticker = (stickerUrl: string, name: string) => {
    onSendMessage(
      name,
      replyingTo ? replyingTo.id : null,
      {
        messageType: 'IMAGE',
        mediaUrl: stickerUrl
      }
    );
  };

  const handleSelectGif = (gifUrl: string) => {
    onSendMessage(
      'GIF',
      replyingTo ? replyingTo.id : null,
      {
        messageType: 'IMAGE',
        mediaUrl: gifUrl
      }
    );
  };

  return (
    <div className="bg-[#0A0F1D] border-t border-[#00E5FF]/15 p-3 relative">
      {/* Reply Preview Header */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-[#0E172A] border-l-4 border-[#00E5FF] px-3 py-2 rounded-t-xl mb-2 text-xs">
          <div className="truncate">
            <span className="text-[#38BDF8] font-semibold mr-2">
              Replying to {replyingTo.sender?.displayName || 'message'}:
            </span>
            <span className="text-slate-300 italic truncate">{replyingTo.content}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-white p-1"
            title="Cancel reply"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Rewrite Suggestion Card */}
      {rewriteSuggestion && (
        <div className="mb-3 p-3 bg-gradient-to-r from-[#0066FF]/15 to-[#00E5FF]/15 border border-[#00E5FF]/40 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-[#00E5FF] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Rewrite ({rewriteSuggestion.tone} Style)</span>
            </span>
            <button onClick={() => setRewriteSuggestion(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          <p className="text-xs text-white leading-relaxed mb-2.5 bg-black/30 p-2.5 rounded-lg border border-white/5">
            {rewriteSuggestion.text}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={applyRewrite}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#00E5FF] text-black font-bold text-xs rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Replace Draft</span>
            </button>
            <button
              onClick={() => setRewriteSuggestion(null)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Composer Input Box */}
      <div className="flex items-end gap-2 bg-[#050811] border border-white/10 focus-within:border-[#00E5FF]/50 rounded-2xl p-1.5 transition-all">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => setShowFileUploadModal(true)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
          title="Share files, images, documents"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji / Sticker / GIF picker toggle */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowStickerGifPicker(!showStickerGifPicker)}
            className="p-2 text-slate-400 hover:text-[#00E5FF] rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Emojis, Stickers & GIFs"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Shift + Enter for new line)"
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none py-2 px-1 max-h-32 leading-relaxed"
        />

        {/* AI Rewrite Assistant Button */}
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={!content.trim() || isRewriting}
            onClick={() => setShowRewriteMenu(!showRewriteMenu)}
            className={`p-2 rounded-xl transition-all ${
              content.trim()
                ? 'text-[#00E5FF] hover:bg-[#00E5FF]/10 cursor-pointer'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
            title="AI Tone Rewrite (Professional, Friendly, Shorter, Clearer)"
          >
            <Wand2 className={`w-5 h-5 ${isRewriting ? 'animate-spin text-[#00E5FF]' : ''}`} />
          </button>

          {showRewriteMenu && (
            <div className="absolute bottom-12 right-0 z-30 w-44 bg-[#0A0F1D] border border-[#00E5FF]/40 rounded-xl p-1 shadow-2xl divide-y divide-white/5">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                AI Tone Rewrite:
              </div>
              <button
                type="button"
                onClick={() => handleRewrite('Professional')}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#00E5FF]/20 rounded-lg cursor-pointer"
              >
                👔 Professional
              </button>
              <button
                type="button"
                onClick={() => handleRewrite('Friendly')}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#00E5FF]/20 rounded-lg cursor-pointer"
              >
                😊 Friendly
              </button>
              <button
                type="button"
                onClick={() => handleRewrite('Shorter')}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#00E5FF]/20 rounded-lg cursor-pointer"
              >
                ⚡ Shorter
              </button>
              <button
                type="button"
                onClick={() => handleRewrite('Clearer')}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#00E5FF]/20 rounded-lg cursor-pointer"
              >
                🎯 Clearer
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Send vs Mic button */}
        {content.trim() ? (
          <button
            type="button"
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00E5FF]/20 shrink-0 cursor-pointer"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowVoiceRecorderModal(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-[#00E5FF] hover:bg-white/5 transition-all shrink-0 cursor-pointer"
            title="Record Voice Message"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stickers & GIF Picker */}
      <StickerGifPicker
        isOpen={showStickerGifPicker}
        onClose={() => setShowStickerGifPicker(false)}
        onSelectEmoji={(em) => setContent(prev => prev + em)}
        onSelectSticker={handleSelectSticker}
        onSelectGif={handleSelectGif}
      />

      {/* Real File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onSendFile={handleSendFile}
      />

      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={showVoiceRecorderModal}
        onClose={() => setShowVoiceRecorderModal(false)}
        onSendVoiceMessage={handleSendVoiceMessage}
      />
    </div>
  );
};
