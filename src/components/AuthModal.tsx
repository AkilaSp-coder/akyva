import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AkyvaLogo } from './AkyvaLogo';
import { Shield, Sparkles, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!username || !displayName || !email || !password) {
          throw new Error('Please fill in all registration fields');
        }
        await register(username, displayName, email, password);
      } else {
        if (!username && !email) {
          throw new Error('Please enter your username or email');
        }
        await login(username || email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = async (demoName: string, demoUser: string, demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      // Try login first with default password 'akyva123'
      try {
        await login(demoUser, 'akyva123');
      } catch (e) {
        // If not registered yet, auto register
        await register(demoUser, demoName, demoEmail, 'akyva123');
      }
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060E]/90 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[#0A0F1D]/95 border border-[#00E5FF]/25 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Cyber glow accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00E5FF]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#0066FF]/25 rounded-full blur-3xl pointer-events-none"></div>

        {/* Branding header */}
        <div className="text-center flex flex-col items-center mb-6">
          <AkyvaLogo size="lg" showTagline={true} />
          <p className="text-xs text-[#94A3B8] mt-3 max-w-xs">
            Global AI-powered messaging. Multilingual translation, privacy-first identity & real-time connection.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 bg-[#050811] p-1 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] shadow border border-[#00E5FF]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] shadow border border-[#00E5FF]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              {isRegister ? 'Username (unique handle)' : 'Username or Email'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={isRegister ? 'e.g. alex_rivera' : 'alex_rivera or alex@akyva.io'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
              />
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white py-3 px-4 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              <>
                <span>{isRegister ? 'Create AKYVA Account' : 'Connect to AKYVA'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login presets */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-semibold text-center mb-3">
            Quick Demo Persona
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoUser('Alex Rivera', 'alex_rivera', 'alex@akyva.io')}
              className="p-2.5 bg-[#050811] hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 rounded-xl text-left transition-colors"
            >
              <div className="font-semibold text-white">Alex Rivera</div>
              <div className="text-[10px] text-[#38BDF8]">Creator (New)</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('Elena Vance', 'elena_vance', 'elena@akyva.io')}
              className="p-2.5 bg-[#050811] hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 rounded-xl text-left transition-colors"
            >
              <div className="font-semibold text-white">Elena Vance</div>
              <div className="text-[10px] text-[#38BDF8]">Berlin, Germany</div>
            </button>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#64748B]">
          <Shield className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Private AKYVA ID generated. No public phone numbers required.</span>
        </div>
      </div>
    </div>
  );
};
