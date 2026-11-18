import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, Check, Shield, User, Sparkles, LogOut, Edit2, Camera } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || 'Online');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyId = () => {
    if (user?.akyvaId) {
      navigator.clipboard.writeText(user.akyvaId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName,
        bio,
        status,
        profileImage: profileImage || undefined
      });
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed updating profile', err);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=250&q=80'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Your AKYVA Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your identity, bio, and private AKYVA ID.</p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative shrink-0">
            <img
              src={user?.profileImage || sampleAvatars[0]}
              alt={user?.displayName}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#00E5FF]/40 shadow-lg"
            />
            {isEditing && (
              <span className="absolute bottom-0 right-0 p-1.5 bg-[#00E5FF] text-black rounded-full shadow">
                <Camera className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h2 className="text-lg font-bold text-white">{user?.displayName}</h2>
                <div className="text-xs text-slate-400">@{user?.username}</div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 justify-center border border-white/10 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {user?.bio || 'No bio yet. Tap Edit to add your bio.'}
            </p>

            {/* AKYVA ID Copy Box */}
            <div className="p-3 bg-[#050811] border border-[#00E5FF]/30 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#38BDF8]">
                  Private AKYVA ID
                </div>
                <div className="font-mono text-sm font-bold text-[#00E5FF]">
                  {user?.akyvaId || 'AKY-0000-0000'}
                </div>
              </div>

              <button
                onClick={handleCopyId}
                className="px-3 py-1.5 bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 text-[#00E5FF] border border-[#00E5FF]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Avatar</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {sampleAvatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="avatar"
                    onClick={() => setProfileImage(url)}
                    className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 ${
                      (profileImage || user?.profileImage) === url ? 'border-[#00E5FF] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status Message</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                placeholder="e.g. Online, In focus mode, Traveling..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF] resize-none"
                placeholder="Tell others what you do or your global languages..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#00E5FF] text-black font-bold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-xl font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Privacy Card */}
      <div className="p-4 bg-[#0A0F1D] border border-white/5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Private Identity Protected</div>
            <div className="text-xs text-slate-400">
              Only users with your username or AKYVA ID can connect with you.
            </div>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of AKYVA</span>
        </button>
      </div>
    </div>
  );
};
