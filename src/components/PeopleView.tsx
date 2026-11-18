import React, { useState } from 'react';
import { User } from '../types';
import { userApi } from '../api/userApi';
import { chatApi } from '../api/chatApi';
import { Search, MessageSquare, Shield, Globe, Sparkles, UserPlus, Check } from 'lucide-react';

interface PeopleViewProps {
  onStartChat: (user: User) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ onStartChat }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Suggested community contacts
  const featuredContacts = [
    {
      id: 'user-priya',
      username: 'priya_patel',
      displayName: 'Priya Patel',
      bio: 'Product Designer in Bengaluru. Connect beyond borders ✨',
      status: 'Exploring cross-language chats',
      akyvaId: 'AKY-4921-8812',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      languages: 'Tamil, Hindi, English'
    },
    {
      id: 'user-elena',
      username: 'elena_vance',
      displayName: 'Elena Vance',
      bio: 'Berlin, Germany. Multilingual architectures & privacy.',
      status: 'Online',
      akyvaId: 'AKY-7102-3940',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      languages: 'German, English'
    },
    {
      id: 'user-kenji',
      username: 'kenji_sato',
      displayName: 'Kenji Sato',
      bio: 'Tokyo, Japan ⛩️ Software Engineer & AI Enthusiast',
      status: 'In focus mode',
      akyvaId: 'AKY-3391-7411',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      languages: 'Japanese, English'
    },
    {
      id: 'user-carlos',
      username: 'carlos_mendez',
      displayName: 'Carlos Mendez',
      bio: 'Madrid, Spain 🇪🇸 Audio Producer & Global Traveler',
      status: 'Listening to new beats',
      akyvaId: 'AKY-8841-2091',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      languages: 'Spanish, English'
    }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await userApi.searchUsers(query.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Global People Directory</span>
          <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2.5 py-0.5 rounded-full font-semibold border border-[#00E5FF]/20">
            Privacy Protected
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search users by username, display name, or private AKYVA ID. Phone numbers are never required or made public.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username (e.g. priya_patel) or AKYVA ID (e.g. AKY-4921-8812)..."
            className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00E5FF]/20 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">
            Search Results ({searchResults.length})
          </h2>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center bg-[#0A0F1D]/50 border border-white/5 rounded-2xl text-xs text-slate-400">
              No matching users found with '{query}'. Try searching for 'priya', 'elena', or 'kenji'.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((usr) => (
                <div
                  key={usr.id}
                  className="p-4 bg-[#0A0F1D] border border-white/10 hover:border-[#00E5FF]/40 rounded-2xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={usr.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={usr.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-[#00E5FF]/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">
                        {usr.displayName}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        @{usr.username}
                      </div>
                      <div className="text-[10px] font-mono text-[#00E5FF] mt-0.5">
                        {usr.akyvaId}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartChat(usr)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Featured Global Community Contacts */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Featured Global Connections</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {featuredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 bg-[#0A0F1D] border border-white/5 hover:border-[#00E5FF]/30 rounded-2xl flex flex-col justify-between gap-3 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={contact.profileImage}
                    alt={contact.displayName}
                    className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-[#00E5FF]/40 transition-colors"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{contact.displayName}</h3>
                    <div className="text-xs text-slate-400">@{contact.username}</div>
                    <div className="text-[10px] font-mono text-[#00E5FF]">{contact.akyvaId}</div>
                  </div>
                </div>

                <button
                  onClick={() => onStartChat(contact as any)}
                  className="p-2.5 rounded-xl bg-[#0066FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-black transition-all cursor-pointer shadow"
                  title="Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {contact.bio}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 text-slate-400">
                <span className="flex items-center gap-1 text-[#38BDF8]">
                  <Globe className="w-3 h-3" />
                  <span>{contact.languages}</span>
                </span>
                <span className="text-emerald-400 font-medium">{contact.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
