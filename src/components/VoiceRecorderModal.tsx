import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, AlertCircle } from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (durationSeconds: number, audioBlobUrl: string) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceMessage
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState<number[]>(new Array(20).fill(15));

  const timerRef = useRef<any>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    clearInterval(timerRef.current);
    clearInterval(animRef.current);
    setSeconds(0);
    setIsRecording(false);
    setIsPaused(false);
    setAudioUrl(null);
    setIsPlayingPreview(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setAudioUrl(null);

    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Dynamic wave animation simulation
    animRef.current = setInterval(() => {
      setVolumeLevel(new Array(20).fill(0).map(() => Math.floor(Math.random() * 65) + 15));
    }, 120);
  };

  const pauseRecording = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    clearInterval(animRef.current);
  };

  const resumeRecording = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    animRef.current = setInterval(() => {
      setVolumeLevel(new Array(20).fill(0).map(() => Math.floor(Math.random() * 65) + 15));
    }, 120);
  };

  const stopAndPreview = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    clearInterval(animRef.current);
    // Simulated audio stream representation
    setAudioUrl("blob:akyva-voice-sample");
  };

  const handleSend = () => {
    const finalDuration = Math.max(seconds, 1);
    onSendVoiceMessage(finalDuration, audioUrl || "blob:akyva-voice-sample");
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-2xl p-6 shadow-2xl text-center">
        <h3 className="text-sm font-bold text-white mb-1">AKYVA Voice Recorder</h3>
        <p className="text-xs text-slate-400 mb-6">High-fidelity audio recording with AI transcription</p>

        {/* Live Audio Visualizer Wave */}
        <div className="h-20 bg-[#050811] rounded-2xl border border-white/10 flex items-center justify-center gap-1.5 px-4 mb-4 overflow-hidden">
          {volumeLevel.map((lvl, i) => (
            <div
              key={i}
              style={{ height: `${lvl}%` }}
              className={`w-1 rounded-full transition-all duration-100 ${
                isRecording && !isPaused
                  ? 'bg-gradient-to-t from-[#0066FF] to-[#00E5FF]'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Timer display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`w-2.5 h-2.5 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`}></span>
          <span className="font-mono text-2xl font-bold text-white tracking-widest">
            {formatTimer(seconds)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Discard */}
          <button
            onClick={() => { cleanup(); onClose(); }}
            className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
            title="Discard recording"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Pause / Resume / Stop */}
          {isRecording ? (
            isPaused ? (
              <button
                onClick={resumeRecording}
                className="p-4 rounded-full bg-[#00E5FF] text-black font-bold shadow-lg shadow-[#00E5FF]/30 hover:scale-105 transition-transform cursor-pointer"
                title="Resume recording"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="p-4 rounded-full bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform cursor-pointer"
                title="Pause recording"
              >
                <Pause className="w-6 h-6" />
              </button>
            )
          ) : (
            <button
              onClick={startRecording}
              className="p-4 rounded-full bg-[#00E5FF] text-black font-bold shadow-lg shadow-[#00E5FF]/30 hover:scale-105 transition-transform cursor-pointer"
              title="Record again"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={seconds === 0}
            className="p-3 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white shadow-lg shadow-[#00E5FF]/20 hover:scale-105 transition-transform disabled:opacity-40 cursor-pointer"
            title="Send voice message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
