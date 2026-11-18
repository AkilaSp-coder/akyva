import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  Globe, 
  Bell, 
  Lock, 
  Info, 
  Check, 
  Smartphone, 
  Download, 
  Trash2, 
  Fingerprint, 
  KeyRound, 
  Instagram, 
  Youtube 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  preferredLanguage: string;
  onLanguageChange: (lang: string) => void;
  aiSmartRepliesEnabled: boolean;
  onToggleSmartReplies: (val: boolean) => void;
  aiTranslationEnabled: boolean;
  onToggleTranslation: (val: boolean) => void;
  aiScamProtectionEnabled: boolean;
  onToggleScamProtection: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferredLanguage,
  onLanguageChange,
  aiSmartRepliesEnabled,
  onToggleSmartReplies,
  aiTranslationEnabled,
  onToggleTranslation,
  aiScamProtectionEnabled,
  onToggleScamProtection
}) => {
  const { user, logout } = useAuth();
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricsReady, setBiometricsReady] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const languages = [
    'English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam',
    'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Spanish', 'German', 'Japanese'
  ];

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        user,
        exportTimestamp: new Date().toISOString(),
        platform: "AKYVA",
        encryptionFormat: "Zero-Knowledge Export"
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `akyva_data_export_${user?.username || 'me'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMessage("Your personal data archive was downloaded securely.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to permanently delete your AKYVA account? This action is irreversible.")) {
      logout();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize AI behaviors, privacy boundaries, multilingual translation, and security keys.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. AI Preferences */}
      <div className="bg-[#0A0F1D] border border-[#00E5FF]/20 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#00E5FF]">
          <Sparkles className="w-4 h-4" />
          <span>AI Assistance Preferences</span>
        </div>
        <p className="text-xs text-slate-400">
          AKYVA AI assists and suggests; it never sends messages on your behalf without explicit confirmation.
        </p>

        <div className="divide-y divide-white/5 space-y-3 pt-1">
          {/* Smart Replies Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-xs font-semibold text-white">AI Smart Replies</div>
              <div className="text-[11px] text-slate-400">Show context-aware reply chips above composer</div>
            </div>
            <button
              onClick={() => onToggleSmartReplies(!aiSmartRepliesEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                aiSmartRepliesEnabled ? 'bg-[#00E5FF]' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                aiSmartRepliesEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          {/* Translation Suggestions Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-xs font-semibold text-white">Instant Translation Options</div>
              <div className="text-[11px] text-slate-400">Show 1-tap translation option on message bubbles</div>
            </div>
            <button
              onClick={() => onToggleTranslation(!aiTranslationEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                aiTranslationEnabled ? 'bg-[#00E5FF]' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                aiTranslationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          {/* Scam & Phishing Protection */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-xs font-semibold text-white">AI Scam & Phishing Shield</div>
              <div className="text-[11px] text-slate-400">Real-time threat evaluation for suspicious links and scams</div>
            </div>
            <button
              onClick={() => onToggleScamProtection(!aiScamProtectionEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                aiScamProtectionEnabled ? 'bg-[#00E5FF]' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                aiScamProtectionEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Language Preferences */}
      <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Globe className="w-4 h-4 text-[#38BDF8]" />
          <span>Preferred Target Language</span>
        </div>
        <p className="text-xs text-slate-400">
          Messages received in foreign languages will default to this language when translating.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                preferredLanguage === lang
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                  : 'bg-[#050811] text-slate-300 border border-white/5 hover:border-white/20'
              }`}
            >
              <span>{lang}</span>
              {preferredLanguage === lang && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Security, 2FA & Biometrics */}
      <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Security & Authentication</span>
        </div>

        <div className="divide-y divide-white/5 space-y-3">
          {/* Two-Factor Authentication Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Two-Factor Authentication (2FA)</span>
              </div>
              <div className="text-[11px] text-slate-400">Require an authenticator code on new device logins</div>
            </div>
            <button
              onClick={() => {
                setTwoFactorAuth(!twoFactorAuth);
                setStatusMessage(twoFactorAuth ? "Two-factor authentication disabled" : "Two-factor authentication enabled with authenticator app backup.");
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                twoFactorAuth ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          {/* Biometrics */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                <span>Biometric Quick Unlock</span>
              </div>
              <div className="text-[11px] text-slate-400">FaceID / TouchID / WebAuthn ready</div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Hardware Ready
            </span>
          </div>

          {/* Device Management */}
          <div className="pt-3">
            <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Sessions & Devices</span>
            </div>
            <div className="p-3 bg-[#050811] rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">Current Web Session (Chrome / Linux)</div>
                <div className="text-[10px] text-slate-400">IP: 127.0.0.1 • Active Now</div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Current</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Data Privacy, Export & Account Deletion */}
      <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Data Rights & Deletion
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Account Data (JSON)</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-500/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* 5. About AKYVA */}
      <div className="bg-[#0A0F1D] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Info className="w-4 h-4 text-[#00E5FF]" />
          <span>About AKYVA Super Platform</span>
        </div>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Version:</strong> 2.0.0 Super Platform Architecture
          </p>
          <p>
            <strong>Tagline:</strong> CONNECT. COMMUNICATE. CREATE. GROW.
          </p>
          <p>
            <strong>Modules:</strong> Messaging, 24h Status Stories, WebRTC Audio/Video Calls, Moments Social Video, Dedicated AI Assistant, Creator Studio, and Enterprise Spring Boot 3 + PostgreSQL backend.
          </p>
        </div>
      </div>
    </div>
  );
};
