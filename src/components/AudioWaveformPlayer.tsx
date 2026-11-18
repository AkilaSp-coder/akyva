import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, FastForward } from 'lucide-react';
import { aiApi } from '../api/aiApi';

interface AudioWaveformPlayerProps {
  duration?: number;
  audioUrl?: string;
  transcription?: string;
  isCurrentUser?: boolean;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  duration = 8,
  audioUrl,
  transcription: initialTranscription,
  isCurrentUser = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [transcription, setTranscription] = useState<string | null>(initialTranscription || null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Pseudo-waveform bar heights
  const bars = [25, 45, 75, 30, 90, 65, 40, 85, 95, 60, 35, 70, 80, 50, 65, 90, 45, 80, 30, 70, 50, 40, 85, 60, 35];
  const intervalRef = useRef<any>(null);

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const stepTime = (duration * 1000) / (100 * speed);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, stepTime);
    }
  };

  const cycleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed as any);
  };

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      // In a real audio setup or fallback, request transcription
      setTimeout(() => {
        setTranscription("Hi team! Just following up on our project milestones. Everything is looking solid for the Friday review.");
        setIsTranscribing(false);
      }, 1200);
    } catch (e) {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSeconds = (progress / 100) * duration;

  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] pt-1">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer ${
            isCurrentUser
              ? 'bg-white text-[#0066FF] hover:bg-slate-100'
              : 'bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Waveform graphic */}
        <div className="flex-1 flex items-center gap-[3px] h-9 cursor-pointer select-none">
          {bars.map((heightPercent, idx) => {
            const barPos = (idx / bars.length) * 100;
            const isPlayed = progress >= barPos;
            return (
              <div
                key={idx}
                onClick={() => setProgress(barPos)}
                style={{ height: `${heightPercent}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isPlayed
                    ? isCurrentUser ? 'bg-white' : 'bg-[#00E5FF]'
                    : isCurrentUser ? 'bg-white/35' : 'bg-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Speed toggle */}
        <button
          onClick={cycleSpeed}
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border transition-all ${
            isCurrentUser 
              ? 'bg-white/15 text-white border-white/30' 
              : 'bg-white/10 text-slate-300 border-white/15 hover:text-white'
          }`}
          title="Playback speed"
        >
          {speed}x
        </button>
      </div>

      {/* Duration and controls */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
        <span className="font-mono">{formatTime(currentSeconds)} / {formatTime(duration)}</span>

        {!transcription && (
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className="flex items-center gap-1 text-[#00E5FF] hover:underline cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isTranscribing ? 'Transcribing...' : 'AI Transcribe'}</span>
          </button>
        )}
      </div>

      {/* Transcription snippet */}
      {transcription && (
        <div className="mt-2 p-2 rounded-xl bg-black/30 border border-white/10 text-[11px] leading-relaxed text-slate-200">
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#38BDF8] mb-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Voice-to-Text Transcript</span>
          </div>
          <p className="italic">"{transcription}"</p>
        </div>
      )}
    </div>
  );
};
