import React, { useState } from 'react';
import { Smile, Sparkles, Image, Search, Heart, Flame, Zap } from 'lucide-react';

interface StickerGifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (stickerUrl: string, name: string) => void;
  onSelectGif: (gifUrl: string) => void;
}

export const StickerGifPicker: React.FC<StickerGifPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectSticker,
  onSelectGif
}) => {
  const [activeTab, setActiveTab] = useState<'EMOJI' | 'STICKER' | 'GIF'>('EMOJI');
  const [searchGif, setSearchGif] = useState('');

  if (!isOpen) return null;

  const emojiCategories = [
    { title: 'Recent & Popular', items: ['😀', '🔥', '❤️', '🕊️', '✨', '😂', '🚀', '👍', '🎉', '🙏', '💯', '👏', '😍', '🤔', '😎', '💡'] },
    { title: 'Expressions & Faces', items: ['🥳', '🤩', '😇', '🤫', '🥱', '😴', '😜', '🤗', '🤭', '🫡', '🤯', '🤠', '🥺', '😏', '😌', '🤤'] },
    { title: 'Gestures & Hearts', items: ['👋', '🙌', '🤝', '✌️', '🫰', '💖', '💙', '💜', '🤍', '🧡', '💛', '🖤', '💔', '💥', '💫', '⭐'] }
  ];

  const cyberDoveStickers = [
    { name: 'Cyber Dove Flight', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=150&q=80' },
    { name: 'Neon Messenger', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80' },
    { name: 'Digital Peace', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=150&q=80' },
    { name: 'Electric Wings', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=150&q=80' }
  ];

  const gifs = [
    { title: 'Welcome to AKYVA', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=80' },
    { title: 'Celebration', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80' },
    { title: 'Thumbs Up', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80' },
    { title: 'Global World', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80' }
  ];

  return (
    <div className="absolute bottom-14 right-2 z-40 w-80 sm:w-96 bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-96">
      {/* Category selector tabs */}
      <div className="flex items-center justify-around border-b border-white/10 bg-[#050811] p-1.5 shrink-0">
        <button
          onClick={() => setActiveTab('EMOJI')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'EMOJI' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Emojis
        </button>
        <button
          onClick={() => setActiveTab('STICKER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'STICKER' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Stickers
        </button>
        <button
          onClick={() => setActiveTab('GIF')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GIF' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          GIFs
        </button>
      </div>

      {/* Tab contents */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'EMOJI' && (
          <div className="space-y-3">
            {emojiCategories.map((cat, i) => (
              <div key={i}>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] mb-1.5">
                  {cat.title}
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {cat.items.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { onSelectEmoji(emoji); onClose(); }}
                      className="text-xl p-1.5 hover:bg-white/10 rounded-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'STICKER' && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#00E5FF] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>AKYVA Cyber Messenger Pack</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {cyberDoveStickers.map((sticker, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelectSticker(sticker.url, sticker.name); onClose(); }}
                  className="p-2 bg-[#050811] hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/40 rounded-xl cursor-pointer transition-all group text-center"
                >
                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    className="w-16 h-16 object-cover rounded-lg mx-auto mb-1 group-hover:scale-105 transition-transform"
                  />
                  <div className="text-[11px] font-semibold text-white truncate">{sticker.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'GIF' && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchGif}
                onChange={(e) => setSearchGif(e.target.value)}
                placeholder="Search Tenor & Giphy..."
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelectGif(gif.url); onClose(); }}
                  className="rounded-xl overflow-hidden border border-white/10 hover:border-[#00E5FF]/50 cursor-pointer relative group h-24"
                >
                  <img src={gif.url} alt={gif.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate">{gif.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
