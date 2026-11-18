import React, { useState } from 'react';
import { User, Conversation } from '../types';
import { Users, X, Check, Search, ShieldCheck } from 'lucide-react';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  onCreateGroup: (title: string, memberIds: string[]) => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  availableUsers,
  onCreateGroup
}) => {
  const [title, setTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredUsers = availableUsers.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedIds.length === 0) return;
    onCreateGroup(title.trim(), selectedIds);
    setTitle('');
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00E5FF]/10 text-[#00E5FF] rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Create New Group</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Global Creators, Engineering Team..."
              className="w-full bg-[#050811] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Select Members ({selectedIds.length} chosen)
              </label>
            </div>

            <div className="relative mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-white/[0.03]">
              {filteredUsers.map((usr) => {
                const isSelected = selectedIds.includes(usr.id);
                return (
                  <div
                    key={usr.id}
                    onClick={() => toggleSelect(usr.id)}
                    className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={usr.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={usr.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{usr.displayName}</div>
                        <div className="text-[10px] text-slate-400 truncate">@{usr.username}</div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#00E5FF] border-[#00E5FF] text-black' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!title.trim() || selectedIds.length === 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#00E5FF]/20 hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Create Group
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
