import React, { useState } from 'react';
import { UserStatusFeed, StatusStoryItem, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Camera, Type, Image, Sparkles, Clock, Eye } from 'lucide-react';

interface StatusViewProps {
  statusFeeds: UserStatusFeed[];
  onOpenViewer: (feed: UserStatusFeed) => void;
  onAddTextStatus: (text: string, bgColor: string) => void;
  onAddMediaStatus: (mediaUrl: string, caption: string) => void;
}

export const StatusView: React.FC<StatusViewProps> = ({
  statusFeeds,
  onOpenViewer,
  onAddTextStatus,
  onAddMediaStatus
}) => {
  const { user } = useAuth();
  const [showCreateTextModal, setShowCreateTextModal] = useState(false);
  const [textStatus, setTextStatus] = useState('');
  const [selectedBg, setSelectedBg] = useState('#0055D4');

  const bgColors = ['#0055D4', '#7C3AED', '#DB2777', '#059669', '#D97706', '#0E172A'];

  const myFeed = statusFeeds.find(f => f.userId === user?.id) || {
    userId: user?.id || '',
    user: user as User,
    stories: [],
    hasUnseen: false,
    lastUpdatedAt: new Date().toISOString()
  };

  const otherFeeds = statusFeeds.filter(f => f.userId !== user?.id);

  const handlePostTextStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textStatus.trim()) return;
    onAddTextStatus(textStatus.trim(), selectedBg);
    setTextStatus('');
    setShowCreateTextModal(false);
  };

  const handleQuickPhotoStatus = () => {
    onAddMediaStatus(
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
      'Building the future with AKYVA ✨'
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Status Stories</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20">
              24h Expiry
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Share updates with photos, videos, and styled text. Disappears automatically after 24 hours.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateTextModal(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Create Text Story"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={handleQuickPhotoStatus}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white font-bold text-xs shadow-md shadow-[#00E5FF]/20 hover:opacity-90 active:scale-95 transition-all"
            title="Post Photo Story"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Post Photo</span>
          </button>
        </div>
      </div>

      {/* MY STATUS CARD */}
      <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl flex items-center justify-between gap-4">
        <div
          onClick={() => myFeed.stories.length > 0 && onOpenViewer(myFeed)}
          className={`flex items-center gap-3.5 min-w-0 ${myFeed.stories.length > 0 ? 'cursor-pointer' : ''}`}
        >
          <div className="relative shrink-0">
            <div className={`p-0.5 rounded-full ${
              myFeed.stories.length > 0
                ? 'bg-gradient-to-tr from-[#0066FF] via-[#00E5FF] to-emerald-400'
                : 'border border-dashed border-slate-600'
            }`}>
              <img
                src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.displayName}
                className="w-13 h-13 rounded-full object-cover border-2 border-[#0A0F1D]"
              />
            </div>
            {myFeed.stories.length === 0 && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#00E5FF] text-black font-bold text-xs rounded-full flex items-center justify-center border-2 border-[#0A0F1D]">
                +
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>My Status</span>
              {myFeed.stories.length > 0 && (
                <span className="text-[10px] text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-2 py-0.2 rounded-full border border-[#00E5FF]/20">
                  {myFeed.stories.length} updates active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {myFeed.stories.length > 0 
                ? 'Tap to view your 24-hour status story'
                : 'Tap + or use top buttons to add a status update'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateTextModal(true)}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-[#00E5FF] border border-white/5 hover:border-[#00E5FF]/30 transition-all shrink-0"
          title="Add status update"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* RECENT UPDATES SECTION */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Recent Updates ({otherFeeds.length})</span>
        </h2>

        {otherFeeds.length === 0 ? (
          <div className="p-8 text-center bg-[#0A0F1D]/50 border border-white/5 rounded-2xl text-xs text-slate-500">
            No recent status updates from your contacts yet.
          </div>
        ) : (
          <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
            {otherFeeds.map((feed) => (
              <div
                key={feed.userId}
                onClick={() => onOpenViewer(feed)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-0.5 rounded-full shrink-0 ${
                    feed.hasUnseen
                      ? 'bg-gradient-to-tr from-[#00E5FF] via-emerald-400 to-[#6366F1] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                      : 'border border-slate-600'
                  }`}>
                    <img
                      src={feed.user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={feed.user.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#0A0F1D]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <span>{feed.user.displayName}</span>
                      {feed.hasUnseen && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(feed.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded-full border border-[#00E5FF]/20">
                  {feed.stories.length} stories
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE TEXT STATUS MODAL */}
      {showCreateTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between min-h-[350px] transition-colors"
            style={{ backgroundColor: selectedBg }}
          >
            <div className="flex items-center justify-between text-white pb-2">
              <span className="text-xs font-bold uppercase tracking-wider">New Status Update</span>
              <button onClick={() => setShowCreateTextModal(false)} className="p-1 rounded-full bg-black/30">
                ✕
              </button>
            </div>

            <textarea
              autoFocus
              required
              rows={4}
              value={textStatus}
              onChange={(e) => setTextStatus(e.target.value)}
              placeholder="What's on your mind? Type a status update..."
              className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white placeholder-white/60 focus:outline-none resize-none text-center my-auto leading-relaxed"
            />

            <div className="space-y-4 pt-4">
              {/* Color swatches */}
              <div className="flex items-center justify-center gap-2">
                {bgColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedBg(col)}
                    style={{ backgroundColor: col }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedBg === col ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-80'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePostTextStatus}
                  disabled={!textStatus.trim()}
                  className="flex-1 py-3 bg-white text-black font-extrabold text-xs rounded-xl shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Share to Status
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTextModal(false)}
                  className="py-3 px-4 bg-black/40 text-white text-xs rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
