import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { Bell, ShieldAlert, Sparkles, MessageSquare, Check, Trash2 } from 'lucide-react';

interface NotificationsViewProps {
  notifications?: NotificationItem[];
}

export const NotificationsView: React.FC<NotificationsViewProps> = () => {
  // Demo interactive notifications state
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'user-me',
      type: 'AI_ALERT',
      title: 'AKYVA Scam Shield Active',
      body: 'Real-time phishing & scam detection is monitoring incoming messages for suspicious links and urgent wire transfer requests.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 'notif-2',
      userId: 'user-me',
      type: 'MESSAGE_REACTION',
      title: 'Reaction from Priya Patel',
      body: 'Priya reacted with 🕊️ to your message in the chat thread.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    },
    {
      id: 'notif-3',
      userId: 'user-me',
      type: 'NEW_CONNECTION',
      title: 'Multilingual Hub Ready',
      body: 'Tamil, Hindi, Telugu, and 10+ global languages are available for real-time translation with Gemini 2.5 Flash.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 3600 * 4).toISOString()
    }
  ]);

  const markAllRead = () => {
    setItems(items.map(item => ({ ...item, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Alerts & Notifications</span>
            <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2.5 py-0.5 rounded-full font-semibold border border-[#00E5FF]/20">
              {items.filter(i => !i.isRead).length} Unread
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications for messages, reactions, connections, and AI safety alerts.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-[#00E5FF] hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0F1D] border border-white/5 rounded-2xl text-slate-400 text-xs">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p>You have no notifications at the moment.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.isRead
                  ? 'bg-[#0A0F1D]/50 border-white/5 text-slate-400'
                  : 'bg-[#0A0F1D] border-[#00E5FF]/25 shadow-lg shadow-[#00E5FF]/5 text-white'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  item.type === 'AI_ALERT'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : item.type === 'MESSAGE_REACTION'
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                    : 'bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20'
                }`}>
                  {item.type === 'AI_ALERT' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : item.type === 'MESSAGE_REACTION' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.body}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => clearNotification(item.id)}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
                title="Dismiss"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
