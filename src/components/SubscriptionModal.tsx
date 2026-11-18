import React, { useState } from 'react';
import { Crown, Check, Sparkles, X, Shield, Zap } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { useAuth } from '../context/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'PLUS' | 'CREATOR_PRO' | 'BUSINESS'>('CREATOR_PRO');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  if (!isOpen) return null;

  const plans: SubscriptionPlan[] = [
    {
      id: 'FREE',
      name: 'Free Forever',
      price: '$0',
      period: 'forever',
      features: [
        'Unlimited 1-on-1 & Group Messaging',
        'Basic AI Smart Replies & Translations (50/day)',
        'Standard 720p Audio/Video Calls',
        '24-Hour Status Stories'
      ]
    },
    {
      id: 'PLUS',
      name: 'AKYVA Plus',
      price: billingCycle === 'YEARLY' ? '$3.99' : '$4.99',
      period: 'per month',
      features: [
        'Unlimited AI Multilingual Translations',
        '1080p Full HD WebRTC Calls with Screen Sharing',
        'AI Voice-to-Text Transcription',
        'Up to 2GB File Sharing per upload',
        'Custom Cyber Dove Stickers'
      ]
    },
    {
      id: 'CREATOR_PRO',
      name: 'Creator Pro',
      price: billingCycle === 'YEARLY' ? '$15.99' : '$19.99',
      period: 'per month',
      badge: 'Most Popular',
      highlight: true,
      features: [
        'Everything in AKYVA Plus',
        'Full AKYVA Creator Studio Access',
        'YouTube & Instagram OAuth Publisher',
        'AI Shorts & Reels Script Generator (English & Tamil)',
        'Content Calendar & Post Scheduler',
        'AI Growth Advisor & Channel Analytics'
      ]
    },
    {
      id: 'BUSINESS',
      name: 'AKYVA Business',
      price: billingCycle === 'YEARLY' ? '$39.99' : '$49.99',
      period: 'per month',
      features: [
        'Everything in Creator Pro',
        'Multi-user team management & admin roles',
        'Dedicated Gemini 2.5 Flash API quotas',
        'Audit logs & priority SLA support',
        'Centralized billing & workspace privacy controls'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0A0F1D] border border-yellow-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl text-black shadow-lg shadow-yellow-500/20">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Upgrade AKYVA Membership</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Scale your communication, unlock full Creator Studio tools, and access unmetered AI.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing cycle switch */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-[#050811] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                billingCycle === 'MONTHLY' ? 'bg-[#00E5FF] text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                billingCycle === 'YEARLY' ? 'bg-[#00E5FF] text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-black">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#0E172A] to-[#1E1B4B] border-pink-500/60 shadow-xl shadow-pink-500/10'
                    : isSelected
                    ? 'bg-[#0E172A] border-[#00E5FF]'
                    : 'bg-[#050811] border-white/10 hover:border-white/20'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-sm text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-2xl font-black text-white">{plan.price}</span>
                    <span className="text-[11px] text-slate-400">/{plan.period}</span>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-white/5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      alert(`Subscribed to ${plan.name} (${billingCycle.toLowerCase()})! Subscription status active.`);
                      onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90'
                        : isSelected
                        ? 'bg-[#00E5FF] text-black hover:opacity-90'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {plan.id === 'FREE' ? 'Current Plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted payment processing architecture. Cancel or switch plans anytime.</span>
        </div>
      </div>
    </div>
  );
};
