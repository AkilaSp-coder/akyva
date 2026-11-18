import React, { useState } from 'react';
import { CallRecord, User } from '../types';
import { 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Video, 
  Phone, 
  Calendar, 
  Search, 
  Clock 
} from 'lucide-react';

interface CallsViewProps {
  callHistory: CallRecord[];
  onStartCall: (targetUser: User, type: 'AUDIO' | 'VIDEO') => void;
  availableUsers: User[];
}

export const CallsView: React.FC<CallsViewProps> = ({
  callHistory,
  onStartCall,
  availableUsers
}) => {
  const [filter, setFilter] = useState<'ALL' | 'MISSED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredHistory = callHistory.filter(call => {
    if (filter === 'MISSED' && call.status !== 'MISSED') return false;
    const name = call.callee.displayName || call.caller.displayName;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Missed';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getCallIcon = (status: CallRecord['status']) => {
    if (status === 'MISSED') return <PhoneMissed className="w-4 h-4 text-red-400" />;
    if (status === 'COMPLETED') return <PhoneIncoming className="w-4 h-4 text-emerald-400" />;
    return <PhoneOutgoing className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto space-y-6 select-none">
      {/* Header & Quick Dial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Calls & Logs</span>
            <span className="text-xs bg-[#6366F1]/10 text-[#6366F1] px-2.5 py-0.5 rounded-full font-semibold border border-[#6366F1]/20">
              WebRTC HD
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time peer-to-peer audio and video calling with screen sharing.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex bg-[#050811] p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ALL' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setFilter('MISSED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'MISSED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Quick Direct Dial Row with contacts */}
      <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
          Quick Connect
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {availableUsers.slice(0, 4).map(u => (
            <div
              key={u.id}
              className="p-3 bg-[#050811] rounded-xl border border-white/5 flex flex-col items-center text-center gap-2"
            >
              <img
                src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={u.displayName}
                className="w-10 h-10 rounded-full object-cover border border-[#00E5FF]/30"
              />
              <div className="text-xs font-bold text-white truncate max-w-full">{u.displayName}</div>
              <div className="flex gap-2 w-full pt-1">
                <button
                  onClick={() => onStartCall(u, 'AUDIO')}
                  className="flex-1 py-1 bg-white/5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center transition-colors"
                  title="Voice Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onStartCall(u, 'VIDEO')}
                  className="flex-1 py-1 bg-white/5 hover:bg-[#00E5FF]/20 text-[#00E5FF] rounded-lg flex items-center justify-center transition-colors"
                  title="Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call History List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Call History Logs ({filteredHistory.length})</span>
        </h2>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center bg-[#0A0F1D]/50 border border-white/5 rounded-2xl text-xs text-slate-500">
            No call records found.
          </div>
        ) : (
          <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
            {filteredHistory.map((call) => (
              <div
                key={call.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={call.callee.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={call.callee.displayName}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                      <span>{call.callee.displayName}</span>
                      {call.callType === 'VIDEO' && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.2 rounded font-semibold border border-purple-500/30">
                          Video
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      {getCallIcon(call.status)}
                      <span>
                        {new Date(call.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className={call.status === 'MISSED' ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                        {formatDuration(call.durationSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call back trigger */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onStartCall(call.callee, call.callType)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/20 text-[#00E5FF] transition-all cursor-pointer"
                    title={`Call back ${call.callType}`}
                  >
                    {call.callType === 'VIDEO' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
