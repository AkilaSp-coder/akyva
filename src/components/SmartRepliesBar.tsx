import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiApi } from '../api/aiApi';

interface SmartRepliesBarProps {
  lastMessageContent?: string;
  onSelectSuggestion: (text: string) => void;
  enabled?: boolean;
}

export const SmartRepliesBar: React.FC<SmartRepliesBarProps> = ({
  lastMessageContent,
  onSelectSuggestion,
  enabled = true
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !lastMessageContent || lastMessageContent.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    aiApi.getSmartReplies(lastMessageContent)
      .then(res => {
        if (isMounted && res.suggestions) {
          setSuggestions(res.suggestions);
        }
      })
      .catch(err => {
        if (isMounted) {
          setSuggestions(["Sounds good!", "Sure, I'll check.", "Thank you!"]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lastMessageContent, enabled]);

  if (!enabled || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-[#050811]/90 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00E5FF] shrink-0 mr-1 select-none">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AI Smart Replies:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(item)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#0E172A] hover:bg-[#00E5FF]/20 text-slate-200 hover:text-white border border-[#00E5FF]/30 hover:border-[#00E5FF] whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Tap to insert in composer (AI will not auto-send)"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};
