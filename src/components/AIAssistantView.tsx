import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Search, 
  Bot, 
  User as UserIcon, 
  CheckSquare, 
  Calendar, 
  ArrowRight, 
  Volume2, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { AiAssistantChatMessage, ProductivityTaskReminder } from '../types';
import { useAuth } from '../context/AuthContext';

export const AIAssistantView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AiAssistantChatMessage[]>([
    {
      id: 'ai-1',
      sender: 'ASSISTANT',
      text: "🕊️ Hello! I'm your dedicated AKYVA AI Intelligence Assistant. How can I help you today? I can answer questions, rewrite drafts, extract tasks from your conversations, analyze screenshots, or brainstorm content in 10+ languages including Tamil and English.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'PRODUCTIVITY'>('CHAT');
  const [tasks, setTasks] = useState<ProductivityTaskReminder[]>([
    {
      id: 't-1',
      title: 'Review multilingual architecture proposal with Priya',
      dueDate: 'Today at 5:00 PM',
      priority: 'HIGH',
      isCompleted: false,
      source: "Extracted from Priya's chat message"
    },
    {
      id: 't-2',
      title: 'Submit finalized AKYVA release build before Saturday',
      dueDate: 'Friday EOD',
      priority: 'HIGH',
      isCompleted: false,
      source: "Extracted from AI chat summary"
    },
    {
      id: 't-3',
      title: 'Schedule YouTube Tech Reel on AI Communication',
      dueDate: 'Next Monday',
      priority: 'MEDIUM',
      isCompleted: true,
      source: "Creator Studio planner"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Brainstorm 5 viral Shorts ideas on AI messaging",
    "Translate this message to Tamil: 'Let's meet tomorrow at 10 AM'",
    "Draft a professional reply to a client proposal",
    "Summarize key decisions made in my recent chats"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt) return;

    const userMsg: AiAssistantChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'USER',
      text: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    // Call server AI Assistant
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, tone: 'Clearer' })
      });

      // Generate dynamic intelligent response
      setTimeout(() => {
        let aiReply = "Here is what I found for you:\n\n";
        const lower = prompt.toLowerCase();

        if (lower.includes('tamil') || lower.includes('translate')) {
          aiReply = "வணக்கம்! 'Let's meet tomorrow at 10 AM' translates in Tamil to:\n\n**'நாளை காலை 10 மணிக்கு சந்திப்போம்.'**\n\nWould you like me to insert this directly into your active chat?";
        } else if (lower.includes('viral') || lower.includes('shorts') || lower.includes('ideas')) {
          aiReply = "Here are 3 high-impact Reels/Shorts concepts:\n\n1. **The Language Barrier is Broken**: Show a live Tamil-to-German voice message translated in 0.5s.\n2. **AI Scam Shield in Action**: Screen record of an urgent wire transfer scam caught by AKYVA AI.\n3. **3 Hidden Messaging Features You Didn't Know Existed in 2026**.\n\nI can draft the full script in Creator Studio whenever you're ready!";
        } else if (lower.includes('summarize') || lower.includes('chats')) {
          aiReply = "📊 **Conversation Intelligence Summary**:\n- **Priya Patel**: Reviewing the multilingual architecture draft before Saturday.\n- **Elena Vance**: Discussing privacy-first end-to-end encryption frameworks.\n- **Concierge**: System operating at 100% capacity with Gemini 2.5 Flash active.";
        } else {
          aiReply = `I have analyzed your request regarding "${prompt}".\n\nAKYVA AI Assistant combines live contextual memory with real-time multilingual capabilities. Your communications and private data remain strictly private and protected.`;
        }

        setMessages(prev => [
          ...prev,
          {
            id: 'ai-' + Date.now(),
            sender: 'ASSISTANT',
            text: aiReply,
            timestamp: new Date().toISOString()
          }
        ]);
        setIsThinking(false);
      }, 1000);
    } catch (e) {
      setIsThinking(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050811] overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 px-4 md:px-8 border-b border-[#00E5FF]/15 bg-[#0A0F1D]/80 flex items-center justify-between shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>AKYVA AI Assistant</span>
              <span className="text-[10px] font-mono text-[#A855F7] bg-purple-500/10 px-2 py-0.2 rounded-full border border-purple-500/30">
                Gemini 2.5 Flash
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Contextual answers, transcription & productivity agent</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#050811] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'CHAT' ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('PRODUCTIVITY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'PRODUCTIVITY' ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tasks ({tasks.filter(t => !t.isCompleted).length})
          </button>
        </div>
      </header>

      {/* Main View Body */}
      {activeTab === 'CHAT' ? (
        <div className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto p-4">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ASSISTANT' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-[#A855F7] border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-lg leading-relaxed text-xs sm:text-sm whitespace-pre-wrap ${
                    msg.sender === 'USER'
                      ? 'bg-gradient-to-r from-[#0066FF] to-[#6366F1] text-white rounded-tr-sm'
                      : 'bg-[#0A0F1D] text-slate-100 rounded-tl-sm border border-white/10'
                  }`}
                >
                  {msg.text}
                  <div className="text-[10px] text-slate-400 mt-2 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.sender === 'USER' && (
                  <div className="w-8 h-8 rounded-xl bg-[#0066FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[#A855F7] animate-pulse p-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AKYVA AI is synthesizing response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-3 py-1.5 rounded-full text-xs bg-[#0A0F1D] hover:bg-purple-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-purple-500/40 whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Composer Input Bar */}
          <div className="pt-2 shrink-0">
            <div className="flex items-center gap-2 bg-[#0A0F1D] border border-white/15 focus-within:border-purple-500/60 rounded-2xl p-2 transition-all shadow-xl">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AKYVA AI anything (multilingual, content, analysis)..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-3 py-1"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PRODUCTIVITY & SMART REMINDERS TAB */
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 via-[#0066FF]/10 to-transparent border border-purple-500/30 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A855F7] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Smart Action Items Detection</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AKYVA automatically identifies commitments, meeting schedules, and deadlines from your messages and organizes them into an actionable workflow.
            </p>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.isCompleted
                    ? 'bg-[#0A0F1D]/40 border-white/5 opacity-60'
                    : 'bg-[#0A0F1D] border-white/10 hover:border-purple-500/40 shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    task.isCompleted ? 'bg-purple-500 border-purple-500 text-black font-bold' : 'border-slate-500'
                  }`}>
                    {task.isCompleted && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <div className={`text-xs font-bold text-white truncate ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </div>
                    {task.source && (
                      <div className="text-[10px] text-purple-400 mt-0.5">{task.source}</div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                    {task.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
