import React from 'react';
import { NavTab } from '../types';
import { 
  MessageSquare, 
  CircleDashed, 
  PhoneCall, 
  Film, 
  Sparkles, 
  Video, 
  Settings, 
  Users, 
  Bell, 
  Crown 
} from 'lucide-react';
import { AkyvaLogo } from './AkyvaLogo';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
  missedCallsCount?: number;
  hasUnseenStatus?: boolean;
  onOpenSubscription?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentTab, 
  onSelectTab, 
  unreadCount = 0,
  missedCallsCount = 0,
  hasUnseenStatus = false,
  onOpenSubscription
}) => {
  const { connectionState } = useWebSocket();
  const { user } = useAuth();

  // Master 7 primary navigation items specified in requirements
  const primaryNavItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, badge: unreadCount, color: '#00E5FF' },
    { id: 'status', label: 'Status', icon: CircleDashed, hasDot: hasUnseenStatus, color: '#10B981' },
    { id: 'calls', label: 'Calls', icon: PhoneCall, badge: missedCallsCount, color: '#6366F1' },
    { id: 'moments', label: 'Moments', icon: Film, color: '#F43F5E' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, color: '#A855F7', glow: true },
    { id: 'creator-studio', label: 'Creator Studio', icon: Video, color: '#EC4899' },
    { id: 'settings', label: 'Settings', icon: Settings, color: '#94A3B8' },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#0A0F1D]/90 border-r border-[#00E5FF]/15 p-4 shrink-0 backdrop-blur-xl z-20">
        <div>
          {/* Logo */}
          <div className="px-2 py-3 mb-4">
            <AkyvaLogo size="md" showTagline={true} />
          </div>

          {/* Connection state pill & Plan indicator */}
          <div className="px-2 mb-5 flex items-center justify-between gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              connectionState === 'ONLINE'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : connectionState === 'CONNECTING'
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse'
                : 'bg-red-500/10 border-red-500/25 text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionState === 'ONLINE'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
                  : connectionState === 'CONNECTING'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}></span>
              <span>{connectionState === 'ONLINE' ? 'Live' : connectionState === 'CONNECTING' ? 'Connecting...' : 'Offline'}</span>
            </div>

            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:scale-105 transition-transform"
                title="View AKYVA Plans"
              >
                <Crown className="w-3 h-3 text-yellow-400" />
                <span>{user?.plan || 'Free'}</span>
              </button>
            )}
          </div>

          {/* Primary Nav links */}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0066FF]/25 to-[#00E5FF]/20 text-white border border-[#00E5FF]/40 shadow-lg shadow-[#00E5FF]/10'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#00E5FF]' : 'text-[#94A3B8] group-hover:text-white'
                      }`} />
                      {item.hasDot && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
                      )}
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span className="bg-[#00E5FF] text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-md">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Secondary Quick Access Links (People directory & Alerts) */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] px-3 mb-1">
              Community & Safety
            </div>
            <button
              onClick={() => onSelectTab('people')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'people' ? 'text-[#00E5FF] bg-white/5' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>People Directory</span>
            </button>
            <button
              onClick={() => onSelectTab('notifications')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'notifications' ? 'text-[#00E5FF] bg-white/5' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Safety Alerts</span>
            </button>
          </div>
        </div>

        {/* User Mini Profile in sidebar bottom */}
        {user && (
          <div 
            onClick={() => onSelectTab('profile')}
            className="p-2.5 rounded-xl bg-[#050811]/90 border border-white/5 hover:border-[#00E5FF]/30 transition-all flex items-center gap-3 cursor-pointer"
          >
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user.displayName}
              className="w-9 h-9 rounded-full object-cover border border-[#00E5FF]/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user.displayName}</div>
              <div className="text-[10px] font-mono text-[#00E5FF] truncate">{user.akyvaId}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar (compact high-density 5 primary + scrollable/overflow) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F1D]/95 border-t border-[#00E5FF]/20 backdrop-blur-2xl px-1 py-1.5 flex items-center justify-around shadow-2xl">
        {primaryNavItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl relative transition-all active:scale-95 ${
                isActive ? 'text-[#00E5FF]' : 'text-[#94A3B8]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#00E5FF] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                ) : item.hasDot ? (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10B981]"></span>
                ) : null}
              </div>
              <span className="text-[9px] font-semibold mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-3 h-0.5 bg-[#00E5FF] rounded-full mt-0.5 shadow-[0_0_6px_#00E5FF]"></div>
              )}
            </button>
          );
        })}

        {/* 7th item on mobile: More/Settings toggle */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all active:scale-95 ${
            currentTab === 'settings' ? 'text-[#00E5FF]' : 'text-[#94A3B8]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-semibold mt-0.5 tracking-tight">More</span>
          {currentTab === 'settings' && (
            <div className="w-3 h-0.5 bg-[#00E5FF] rounded-full mt-0.5 shadow-[0_0_6px_#00E5FF]"></div>
          )}
        </button>
      </nav>
    </>
  );
};
