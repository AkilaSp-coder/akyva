import React from 'react';
import { SummarizeResult } from '../types';
import { Sparkles, CheckCircle2, ListChecks, FileText, X, Copy } from 'lucide-react';

interface AISummarizeModalProps {
  summary: SummarizeResult | null;
  loading: boolean;
  onClose: () => void;
}

export const AISummarizeModal: React.FC<AISummarizeModalProps> = ({
  summary,
  loading,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    if (!summary) return;
    const text = `AKYVA Chat Summary:\n\nOverview:\n${summary.overview}\n\nKey Points:\n${summary.keyPoints.map(p => `- ${p}`).join('\n')}\n\nAction Items:\n${summary.actionItems.map(a => `- ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Conversation Summary</h3>
              <p className="text-xs text-slate-400">Distilled takeaways & action items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-[#00E5FF] animate-pulse">
              AKYVA AI is synthesizing conversation...
            </p>
            <p className="text-xs text-slate-500">Extracting key decisions, timelines, and commitments</p>
          </div>
        ) : summary ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Overview */}
            <div className="p-3.5 bg-[#050811] rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Overview</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {summary.overview}
              </p>
            </div>

            {/* Key Points */}
            <div className="p-3.5 bg-[#050811] rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00E5FF] uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Key Takeaways</span>
              </div>
              <ul className="space-y-1.5">
                {summary.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-[#00E5FF] font-bold mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <div className="p-3.5 bg-[#050811] rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Action Items & Next Steps</span>
                </div>
                <ul className="space-y-1.5">
                  {summary.actionItems.map((action, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Copy / Dismiss */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0E172A] hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#00E5FF] text-black font-bold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
