import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { SecurityCheckResult } from '../types';

interface AIThreatBannerProps {
  checkResult: SecurityCheckResult | null;
  onDismiss: () => void;
  onBlockUser?: () => void;
}

export const AIThreatBanner: React.FC<AIThreatBannerProps> = ({
  checkResult,
  onDismiss,
  onBlockUser
}) => {
  if (!checkResult || checkResult.riskLevel === 'LOW') {
    return null;
  }

  const isHigh = checkResult.riskLevel === 'HIGH';

  return (
    <div className={`mx-4 my-2 p-3.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
      isHigh
        ? 'bg-red-500/15 border-red-500/40 text-red-200'
        : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${isHigh ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isHigh ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isHigh ? 'bg-red-500 text-white' : 'bg-amber-500 text-black font-bold'
              }`}>
                {isHigh ? 'High Risk Threat' : 'Suspicious Message'}
              </span>
              <span className="text-xs font-semibold text-white">AKYVA AI Safety Shield</span>
            </div>

            <p className="text-xs mt-1 leading-relaxed text-slate-200">
              {checkResult.reason}
            </p>

            <div className="mt-2 text-[11px] font-medium text-[#38BDF8] flex items-center gap-1.5">
              <span>Recommendation:</span>
              <span className="text-slate-300">{checkResult.recommendedAction}</span>
            </div>

            {onBlockUser && isHigh && (
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={onBlockUser}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
                >
                  Block Sender
                </button>
                <button
                  onClick={onDismiss}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                >
                  Dismiss Warning
                </button>
              </div>
            )}
          </div>
        </div>

        <button onClick={onDismiss} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
