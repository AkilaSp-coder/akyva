import React, { useState, useEffect, useRef } from 'react';
import { ActiveCallSession, User } from '../types';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Volume2, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface CallModalProps {
  session: ActiveCallSession | null;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  currentUser: User | null;
}

export const CallModal: React.FC<CallModalProps> = ({
  session,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  currentUser
}) => {
  const [duration, setDuration] = useState(0);
  const [audioBars, setAudioBars] = useState<number[]>([20, 50, 80, 40, 90, 60, 30, 70, 85, 45]);
  const timerRef = useRef<any>(null);
  const visualizerRef = useRef<any>(null);

  if (!session) return null;

  const isIncoming = session.state === 'RINGING' && session.callee.id === currentUser?.id;
  const isConnected = session.state === 'CONNECTED';
  const otherParty = session.caller.id === currentUser?.id ? session.callee : session.caller;

  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      visualizerRef.current = setInterval(() => {
        setAudioBars(new Array(12).fill(0).map(() => Math.floor(Math.random() * 70) + 20));
      }, 150);
    } else {
      setDuration(0);
      clearInterval(timerRef.current);
      clearInterval(visualizerRef.current);
    }

    return () => {
      clearInterval(timerRef.current);
      clearInterval(visualizerRef.current);
    };
  }, [isConnected]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl select-none">
      <div className="w-full max-w-2xl h-[85vh] bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between relative">
        {/* Top Header: Security, Status, Duration */}
        <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 text-xs text-[#00E5FF] bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">WebRTC Peer Connection • Secure</span>
          </div>

          <div className="text-sm font-mono font-bold text-white bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {isConnected ? formatDuration(duration) : session.state}
          </div>
        </div>

        {/* Center Stage: Video Viewport or Audio Waveform */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-4">
          {session.callType === 'VIDEO' ? (
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#050811] flex items-center justify-center">
              {/* Main remote video placeholder */}
              <img
                src={otherParty.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                alt={otherParty.displayName}
                className="w-full h-full object-cover filter brightness-90"
              />

              {/* Local PiP video window */}
              <div className="absolute bottom-4 right-4 w-28 h-36 sm:w-36 sm:h-48 bg-slate-900 border-2 border-[#00E5FF] rounded-2xl overflow-hidden shadow-2xl">
                {!session.isCameraOff ? (
                  <img
                    src={currentUser?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-slate-400 text-[10px]">
                    <VideoOff className="w-5 h-5 mb-1" />
                    <span>Camera off</span>
                  </div>
                )}
              </div>

              {/* Remote party overlay label */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-white">{otherParty.displayName}</span>
              </div>
            </div>
          ) : (
            /* Audio Call Interface */
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#0066FF] via-[#00E5FF] to-indigo-500 shadow-2xl">
                  <img
                    src={otherParty.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={otherParty.displayName}
                    className="w-full h-full rounded-full object-cover border-4 border-[#0A0F1D]"
                  />
                </div>
                {isConnected && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-[#0A0F1D] rounded-full animate-ping"></span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{otherParty.displayName}</h3>
                <p className="text-xs font-mono text-[#00E5FF] mt-1">{otherParty.akyvaId}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {isConnected ? 'AKYVA HD Audio Connected' : isIncoming ? 'Incoming AKYVA Call...' : 'Calling...'}
                </p>
              </div>

              {/* Audio Wave Visualizer */}
              {isConnected && (
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {audioBars.map((height, i) => (
                    <div
                      key={i}
                      style={{ height: `${height}%` }}
                      className="w-1.5 bg-gradient-to-t from-[#0066FF] to-[#00E5FF] rounded-full transition-all duration-150"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-20">
          {isIncoming ? (
            /* Incoming Call Actions: Accept or Reject */
            <div className="flex items-center justify-around max-w-xs mx-auto">
              <button
                onClick={onRejectCall}
                className="flex flex-col items-center gap-1 text-red-400 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold">Decline</span>
              </button>

              <button
                onClick={onAcceptCall}
                className="flex flex-col items-center gap-1 text-emerald-400 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 animate-pulse">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold">Accept</span>
              </button>
            </div>
          ) : (
            /* Active Call In-progress Controls */
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {/* Mic mute */}
              <button
                onClick={onToggleMute}
                className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                  session.isMuted
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                title={session.isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {session.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video toggle if video call */}
              {session.callType === 'VIDEO' && (
                <button
                  onClick={onToggleCamera}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                    session.isCameraOff
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title={session.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {session.isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Screen sharing */}
              {session.callType === 'VIDEO' && (
                <button
                  onClick={onToggleScreenShare}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                    session.isScreenSharing
                      ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title="Share Screen"
                >
                  <ScreenShare className="w-5 h-5" />
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={onEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 transition-transform active:scale-95 cursor-pointer ml-2"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
