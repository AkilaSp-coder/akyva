import React, { useState } from 'react';
import { User, Conversation } from '../types';
import { userApi } from '../api/userApi';
import { chatApi } from '../api/chatApi';
import { X, ShieldAlert, UserX, Trash2, Globe, Check, AlertCircle } from 'lucide-react';

interface PartnerInfoModalProps {
  conversation: Conversation;
  onClose: () => void;
  onConversationDeleted: (id: string) => void;
}

export const PartnerInfoModal: React.FC<PartnerInfoModalProps> = ({
  conversation,
  onClose,
  onConversationDeleted
}) => {
  const partner = conversation.members[1] || conversation.members[0];
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleBlock = async () => {
    if (!partner) return;
    try {
      await userApi.blockUser(partner.id);
      setStatusMsg(`Blocked @${partner.username}. You will no longer receive messages.`);
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to block user');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner || !reportReason) return;
    try {
      await userApi.reportUser(partner.id, { reason: reportReason });
      setShowReportForm(false);
      setStatusMsg('Report submitted to AKYVA Safety Team.');
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to submit report');
    }
  };

  const handleDeleteChat = async () => {
    try {
      await chatApi.deleteConversation(conversation.id);
      onConversationDeleted(conversation.id);
      onClose();
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to delete conversation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0A0F1D] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">Conversation Details</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="mb-4 p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl text-xs text-[#00E5FF] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        {partner && (
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={partner.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={partner.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#00E5FF]/30 mb-3"
            />
            <h4 className="text-base font-bold text-white">{partner.displayName}</h4>
            <div className="text-xs text-slate-400">@{partner.username}</div>
            <div className="font-mono text-xs text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full mt-1.5 border border-[#00E5FF]/20">
              {partner.akyvaId}
            </div>
            {partner.bio && (
              <p className="text-xs text-slate-300 mt-2 max-w-xs">{partner.bio}</p>
            )}
          </div>
        )}

        {showReportForm ? (
          <form onSubmit={handleReport} className="space-y-3 pt-2 border-t border-white/10">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Report User</span>
            </div>
            <textarea
              required
              rows={2}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe reason (e.g. harassment, financial scam, impersonation)..."
              className="w-full bg-[#050811] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="py-2 px-3 bg-white/5 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setShowReportForm(true)}
              className="w-full p-2.5 bg-[#050811] hover:bg-white/5 text-amber-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report User</span>
            </button>

            <button
              onClick={handleBlock}
              className="w-full p-2.5 bg-[#050811] hover:bg-white/5 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 transition-colors cursor-pointer"
            >
              <UserX className="w-4 h-4" />
              <span>Block User</span>
            </button>

            <button
              onClick={handleDeleteChat}
              className="w-full p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Conversation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
