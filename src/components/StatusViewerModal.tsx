import React, { useState, useEffect, useRef } from 'react';
import { UserStatusFeed, StatusStoryItem } from '../types';
import { X, Eye, Heart, Send, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StatusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusFeed: UserStatusFeed | null;
  onReplyToStatus: (text: string, story: StatusStoryItem) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  isOpen,
  onClose,
  statusFeed,
  onReplyToStatus
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showViewers, setShowViewers] = useState(false);

  const timerRef = useRef<any>(null);

  const stories = statusFeed?.stories || [];
  const currentStory = stories[currentIndex];
  const isMyStatus = statusFeed?.userId === user?.id;

  useEffect(() => {
    if (!isOpen || stories.length === 0) {
      setProgress(0);
      setCurrentIndex(0);
      return;
    }

    setProgress(0);
    clearInterval(timerRef.current);

    if (!isPaused) {
      const stepMs = 50; // Total 5000ms = 5s per story
      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, stepMs);
    }

    return () => clearInterval(timerRef.current);
  }, [isOpen, currentIndex, isPaused, stories.length]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    onReplyToStatus(replyText.trim(), currentStory);
    setReplyText('');
    onClose();
  };

  if (!isOpen || !statusFeed || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none">
      <div 
        className="w-full max-w-md h-full sm:h-[85vh] sm:rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl"
        style={{ backgroundColor: currentStory.backgroundColor || '#0A0F1D' }}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Segmented Progress Bars */}
        <div className="flex gap-1.5 z-20 pt-2">
          {stories.map((story, i) => (
            <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                }}
                className="h-full bg-white transition-all duration-75"
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="flex items-center justify-between z-20 pt-3 text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={statusFeed.user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={statusFeed.user.displayName}
              className="w-10 h-10 rounded-full object-cover border border-white/40"
            />
            <div>
              <div className="text-xs font-bold leading-tight">{statusFeed.user.displayName}</div>
              <div className="text-[10px] text-white/70">
                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-full bg-black/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content: Image, Video or Styled Text */}
        <div className="flex-1 flex items-center justify-center z-10 my-4 relative">
          {currentStory.mediaType === 'IMAGE' ? (
            <img
              src={currentStory.content}
              alt="Story"
              className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : currentStory.mediaType === 'VIDEO' ? (
            <video
              src={currentStory.content}
              autoPlay
              loop
              muted
              playsInline
              className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <div className="text-center px-6 py-12">
              <p className="text-2xl sm:text-3xl font-extrabold text-white leading-relaxed drop-shadow-md">
                {currentStory.content}
              </p>
            </div>
          )}

          {/* Invisible touch hotspots for prev/next */}
          <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={handleNext} />
        </div>

        {/* Bottom Bar: Reply or View Count */}
        <div className="z-20 pb-2">
          {isMyStatus ? (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowViewers(!showViewers)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/20 text-white text-xs font-semibold backdrop-blur-md hover:bg-black/80 transition-colors"
              >
                <Eye className="w-4 h-4 text-[#00E5FF]" />
                <span>{currentStory.viewers.length} Views</span>
              </button>

              {showViewers && (
                <div className="w-full mt-3 p-3 bg-black/90 border border-white/10 rounded-2xl max-h-40 overflow-y-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Viewed by:</div>
                  {currentStory.viewers.length === 0 ? (
                    <div className="text-xs text-slate-500 py-1">No views yet</div>
                  ) : (
                    currentStory.viewers.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 text-xs text-white">
                        <span>{v.user.displayName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(v.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${statusFeed.user.displayName}...`}
                className="flex-1 bg-black/50 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:border-[#00E5FF] backdrop-blur-md"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2.5 bg-[#00E5FF] text-black font-bold rounded-full disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
