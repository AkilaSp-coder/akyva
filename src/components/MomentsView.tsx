import React, { useState } from 'react';
import { MomentPost, MomentComment } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Send, 
  UserPlus, 
  Check, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MomentsView: React.FC = () => {
  const { user } = useAuth();
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());

  // High-fidelity vertical sample video moments
  const [posts, setPosts] = useState<MomentPost[]>([
    {
      id: 'mom-1',
      creator: {
        id: 'user-priya',
        username: 'priya_patel',
        displayName: 'Priya Patel',
        email: 'priya@akyva.io',
        akyvaId: 'AKY-4921-8812',
        createdAt: new Date().toISOString(),
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
      },
      videoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=720&q=80',
      caption: "Real-time AI multilingual communication is live on AKYVA! Breaking borders between Tamil, English, and German ✨ #AKYVA #AICommunication #GlobalTech",
      soundTitle: 'Original Audio – AKYVA Tech Beat',
      hashtags: ['AKYVA', 'AICommunication', 'GlobalTech'],
      likesCount: 1420,
      commentsCount: 84,
      sharesCount: 310,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mom-2',
      creator: {
        id: 'user-kenji',
        username: 'kenji_sato',
        displayName: 'Kenji Sato',
        email: 'kenji@akyva.io',
        akyvaId: 'AKY-3391-7411',
        createdAt: new Date().toISOString(),
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      },
      videoUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=720&q=80',
      caption: "Tokyo night coding session. Integrating WebRTC peer-to-peer data channels for seamless video calls. ⛩️⚡ #TokyoTech #WebRTC",
      soundTitle: 'Lofi Cyber Tokyo – Kenji Beat',
      hashtags: ['TokyoTech', 'WebRTC'],
      likesCount: 2890,
      commentsCount: 142,
      sharesCount: 520,
      isLiked: true,
      isSaved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mom-3',
      creator: {
        id: 'user-carlos',
        username: 'carlos_mendez',
        displayName: 'Carlos Mendez',
        email: 'carlos@akyva.io',
        akyvaId: 'AKY-8841-2091',
        createdAt: new Date().toISOString(),
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
      },
      videoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=720&q=80',
      caption: "Live studio remix! Creator Studio tools on AKYVA make audio & script ideation so fast 🎧🇪🇸 #CreatorStudio #MusicProducer",
      soundTitle: 'Madrid Sunset Wave – Carlos Mendez',
      hashtags: ['CreatorStudio', 'MusicProducer'],
      likesCount: 940,
      commentsCount: 38,
      sharesCount: 110,
      isLiked: false,
      isSaved: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const [comments, setComments] = useState<MomentComment[]>([
    {
      id: 'c-1',
      postId: 'mom-1',
      user: {
        id: 'user-elena',
        username: 'elena_vance',
        displayName: 'Elena Vance',
        email: 'elena@akyva.io',
        akyvaId: 'AKY-7102-3940',
        createdAt: new Date().toISOString()
      },
      text: "The instant translation across languages is astonishing!",
      createdAt: '10m ago'
    },
    {
      id: 'c-2',
      postId: 'mom-1',
      user: {
        id: 'user-kenji',
        username: 'kenji_sato',
        displayName: 'Kenji Sato',
        email: 'kenji@akyva.io',
        akyvaId: 'AKY-3391-7411',
        createdAt: new Date().toISOString()
      },
      text: "Love this demonstration. Super crisp UI as well.",
      createdAt: '5m ago'
    }
  ]);

  const currentPost = posts[activePostIndex];

  const handleLike = () => {
    setPosts(prev => prev.map((p, idx) => {
      if (idx === activePostIndex) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));
  };

  const handleSave = () => {
    setPosts(prev => prev.map((p, idx) => {
      if (idx === activePostIndex) {
        return { ...p, isSaved: !p.isSaved };
      }
      return p;
    }));
  };

  const handleToggleFollow = (creatorId: string) => {
    setFollowedCreators(prev => {
      const next = new Set(prev);
      if (next.has(creatorId)) next.delete(creatorId);
      else next.add(creatorId);
      return next;
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;
    const newComment: MomentComment = {
      id: 'cm-' + Date.now(),
      postId: currentPost.id,
      user,
      text: commentInput.trim(),
      createdAt: 'Just now'
    };
    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
  };

  return (
    <div className="flex-1 flex justify-center bg-[#050811] h-full overflow-hidden select-none p-0 sm:p-4">
      {/* Short Video Reel Frame */}
      <div className="w-full max-w-sm h-full sm:h-[88vh] bg-[#0A0F1D] sm:rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Background Visual representation */}
        <img
          src={currentPost.videoUrl}
          alt={currentPost.caption}
          className="absolute inset-0 w-full h-full object-cover filter brightness-90"
        />

        {/* Gradient shadow overlay for readable copy */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

        {/* Top Header: Brand, Audio Mute Toggle */}
        <div className="relative z-10 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-xs font-bold text-[#F43F5E] uppercase tracking-wider">Moments</span>
            <span className="text-[10px] text-white/70">• Trending</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Indicator / Scroll helper */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2 z-20 flex flex-col gap-2">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePostIndex(i)}
              className={`w-1.5 rounded-full transition-all ${
                i === activePostIndex ? 'h-6 bg-[#00E5FF]' : 'h-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Right Sidebar Interaction Bar (Like, Comment, Share, Save) */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like */}
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full backdrop-blur-md transition-transform active:scale-75 ${
              currentPost.isLiked ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-black/40 text-white hover:bg-black/60'
            }`}>
              <Heart className={`w-5 h-5 ${currentPost.isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{currentPost.likesCount}</span>
          </button>

          {/* Comment */}
          <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-transform active:scale-75">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{currentPost.commentsCount}</span>
          </button>

          {/* Share */}
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'AKYVA Moment', text: currentPost.caption });
              }
            }} 
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-transform active:scale-75">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{currentPost.sharesCount}</span>
          </button>

          {/* Save / Bookmark */}
          <button onClick={handleSave} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full backdrop-blur-md transition-transform active:scale-75 ${
              currentPost.isSaved ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30' : 'bg-black/40 text-white hover:bg-black/60'
            }`}>
              <Bookmark className={`w-5 h-5 ${currentPost.isSaved ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{currentPost.isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Bottom Post Metadata (Creator, Caption, Sound, Next) */}
        <div className="relative z-10 p-4 space-y-2.5 text-white pr-16">
          {/* Creator Profile Row */}
          <div className="flex items-center gap-2.5">
            <img
              src={currentPost.creator.profileImage}
              alt={currentPost.creator.displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight truncate">{currentPost.creator.displayName}</div>
              <div className="text-[10px] text-white/70">@{currentPost.creator.username}</div>
            </div>

            <button
              onClick={() => handleToggleFollow(currentPost.creator.id)}
              className={`ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                followedCreators.has(currentPost.creator.id)
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-[#00E5FF] text-black shadow-md'
              }`}
            >
              {followedCreators.has(currentPost.creator.id) ? 'Following' : '+ Follow'}
            </button>
          </div>

          {/* Caption */}
          <p className="text-xs leading-relaxed line-clamp-3 text-slate-100 drop-shadow-md">
            {currentPost.caption}
          </p>

          {/* Audio track tag */}
          <div className="flex items-center gap-2 text-[10px] text-white/80 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md w-fit">
            <Music className="w-3 h-3 text-[#00E5FF] animate-spin" />
            <span className="truncate max-w-[200px]">{currentPost.soundTitle}</span>
          </div>

          {/* Prev/Next Quick Navigation */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => setActivePostIndex(prev => Math.max(0, prev - 1))}
              disabled={activePostIndex === 0}
              className="flex-1 py-1.5 rounded-xl bg-black/50 text-[11px] font-bold border border-white/10 disabled:opacity-30 hover:bg-black/70"
            >
              ▲ Previous
            </button>
            <button
              onClick={() => setActivePostIndex(prev => Math.min(posts.length - 1, prev + 1))}
              disabled={activePostIndex === posts.length - 1}
              className="flex-1 py-1.5 rounded-xl bg-[#00E5FF] text-black text-[11px] font-bold disabled:opacity-30 hover:opacity-90 shadow-md"
            >
              Next Video ▼
            </button>
          </div>
        </div>

        {/* Comment Drawer Modal */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 top-1/3 z-30 bg-[#0A0F1D]/95 border-t border-white/15 rounded-t-3xl backdrop-blur-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Comments ({comments.length})
              </span>
              <button onClick={() => setShowComments(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {comments.map((cm) => (
                <div key={cm.id} className="flex gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-full bg-purple-500/30 text-[#A855F7] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {cm.user.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{cm.user.displayName}</span>
                      <span className="text-[10px] text-slate-500">{cm.createdAt}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{cm.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-3 py-2 bg-[#00E5FF] text-black font-bold text-xs rounded-xl disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
