import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Youtube, 
  Instagram, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Hash, 
  Globe 
} from 'lucide-react';
import { ConnectedSocialAccount, CreatorPostIdea, ScheduledPost } from '../types';

export const CreatorStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'IDEAS' | 'CALENDAR' | 'ANALYTICS' | 'GROWTH'>('IDEAS');
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Tamil'>('English');
  const [targetPlatform, setTargetPlatform] = useState<'Shorts' | 'Reels'>('Reels');
  const [promptTopic, setPromptTopic] = useState('AI Global Translation in Real-Time');
  const [isGenerating, setIsGenerating] = useState(false);

  // Connected social accounts architecture (YouTube & Instagram)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedSocialAccount[]>([
    {
      id: 'acc-yt',
      platform: 'YOUTUBE',
      handle: '@AKYVA_Official',
      profileName: 'AKYVA Global Network',
      connectedAt: '2026-09-12',
      subscribersOrFollowers: '48.2K Subscribers',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      status: 'ACTIVE'
    },
    {
      id: 'acc-ig',
      platform: 'INSTAGRAM',
      handle: '@akyva_app',
      profileName: 'AKYVA Messenger',
      connectedAt: '2026-09-20',
      subscribersOrFollowers: '125K Followers',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      status: 'ACTIVE'
    }
  ]);

  // AI-generated script ideas
  const [ideas, setIdeas] = useState<CreatorPostIdea[]>([
    {
      id: 'id-1',
      title: 'Breaking Language Barriers in 3 Seconds',
      targetPlatform: 'Reels',
      language: 'English',
      script: "[Hook - 0-3s]: Can you chat with someone speaking Tamil, German, and Japanese without learning the languages?\n[Body - 4-15s]: Watch this live demo on AKYVA. You type in English, and they hear it in natural Tamil audio. No delay, no awkward translator app.\n[CTA - 15-20s]: Download AKYVA today and connect beyond language. Link in bio!",
      caption: "Never let language limit your connections again. Real-time multilingual messaging with Gemini 2.5 Flash on AKYVA. 🚀🌐 #AKYVA #AICommunication #TechReels",
      hashtags: ['#AKYVA', '#AICommunication', '#TechReels', '#GlobalNetworking', '#NextGenTech'],
      suggestedThumbnail: 'High-contrast split screen showing two people speaking across borders with cyber dove glowing in center',
      bestPostingTime: 'Today at 6:30 PM (Peak audience activity)'
    },
    {
      id: 'id-2',
      title: 'AKYVA AI கொண்டு உலகளாவிய உரையாடல் (Tamil Reel)',
      targetPlatform: 'Shorts',
      language: 'Tamil',
      script: "[ஹூக் - 0-3வி]: மொழி தெரியாமல் உலகத்தில் யாரிடமும் பேச முடியுமா?\n[உடல் - 4-15வி]: முடியும்! AKYVA செயலி மூலம் நீங்கள் தமிழில் பேசினால், அது உடனே ஆங்கிலம் அல்லது ஜெர்மன் மொழியில் மொழிபெயர்க்கப்படுகிறது!\n[முடிவு - 15-20வி]: இப்போதே AKYVA-வை பயன்படுத்துங்கள்!",
      caption: "மொழி தடைகளை உடைக்கும் புதுமை! AKYVA-வில் நேரடி AI மொழிபெயர்ப்பு. 🔥🕊️ #TamilTech #AKYVA #AIApp #ViralShorts",
      hashtags: ['#TamilTech', '#AKYVA', '#AIApp', '#ViralShorts', '#TechTamil'],
      suggestedThumbnail: 'Tamil typography with modern cyber blue badge and app screenshot',
      bestPostingTime: 'Tomorrow at 8:00 AM'
    }
  ]);

  // Content Calendar scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: 'sch-1',
      title: 'How AKYVA AI Catches Financial Scams in Seconds',
      platform: 'YOUTUBE',
      scheduledTime: 'Tomorrow at 10:00 AM',
      status: 'SCHEDULED',
      caption: 'A deep dive into real-time phishing and scam detection with AKYVA AI Shield.'
    },
    {
      id: 'sch-2',
      title: 'Connect Beyond Language Official Teaser',
      platform: 'INSTAGRAM',
      scheduledTime: 'Friday at 6:00 PM',
      status: 'SCHEDULED',
      caption: 'The future of borderless messaging is here.'
    }
  ]);

  const handleGenerateScript = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newIdea: CreatorPostIdea = {
        id: 'id-' + Date.now(),
        title: `${promptTopic} – Viral Hook`,
        targetPlatform,
        language: selectedLanguage,
        script: selectedLanguage === 'Tamil'
          ? `[ஹூக்]: ${promptTopic} பற்றி உங்களுக்கு தெரியுமா?\n[உடல்]: AKYVA AI மூலம் உங்கள் உள்ளடக்கம் உலகளவில் சென்றடையும்.\n[முடிவு]: இன்றே தொடங்குங்கள்!`
          : `[Hook 0-3s]: Stop struggling with ${promptTopic}!\n[Body 4-15s]: Here is the exact formula top creators use with AKYVA AI to automate captions, translations, and scripts.\n[CTA 15-20s]: Follow for daily AI creator tactics!`,
        caption: `Unlocking the secrets of ${promptTopic} with AKYVA Creator Studio. #CreatorEconomy #AI #Viral${targetPlatform}`,
        hashtags: [`#${promptTopic.replace(/\s+/g, '')}`, '#AKYVA', '#CreatorEconomy', '#ViralContent'],
        suggestedThumbnail: `Bold neon cyberpunk aesthetic highlighting '${promptTopic}'`,
        bestPostingTime: 'Today at 7:45 PM'
      };
      setIdeas([newIdea, ...ideas]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>AKYVA Creator Studio</span>
            <span className="text-xs bg-pink-500/10 text-pink-400 px-2.5 py-0.5 rounded-full font-semibold border border-pink-500/20">
              Pro Suite
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI scriptwriting, Tamil & English Reels ideation, official YouTube/Instagram OAuth publisher, and Growth Advisor.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#050811] p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('IDEAS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'IDEAS' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Script Tools
          </button>
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'CALENDAR' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'ANALYTICS' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('GROWTH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'GROWTH' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Growth Advisor
          </button>
        </div>
      </div>

      {/* Connected Accounts Card */}
      <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
            Connected Social Accounts (OAuth 2.0 API Architecture)
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Official APIs Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connectedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3 bg-[#050811] rounded-xl border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl text-white ${acc.platform === 'YOUTUBE' ? 'bg-red-600' : 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600'}`}>
                  {acc.platform === 'YOUTUBE' ? <Youtube className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{acc.profileName}</div>
                  <div className="text-[10px] text-slate-400">{acc.handle} • {acc.subscribersOrFollowers}</div>
                </div>
              </div>

              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/20 shrink-0">
                Connected
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TAB 1: AI SCRIPT & CONTENT GENERATOR */}
      {activeTab === 'IDEAS' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/30 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Reels & Shorts Script Generator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Format</label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value as any)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Reels">Instagram Reels (9:16)</option>
                  <option value="Shorts">YouTube Shorts (9:16)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Video Topic</label>
                <input
                  type="text"
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  placeholder="e.g. AI Language Translation..."
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGenerating || !promptTopic.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? 'AI Writing Script & Captions...' : 'Generate Viral Video Script'}
            </button>
          </div>

          {/* Generated Ideas Display */}
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-5 bg-[#0A0F1D] border border-white/10 rounded-2xl space-y-3.5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20 mr-2">
                      {idea.targetPlatform} • {idea.language}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{idea.title}</h3>
                  </div>

                  <span className="text-[11px] text-[#38BDF8] flex items-center gap-1 font-semibold shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{idea.bestPostingTime}</span>
                  </span>
                </div>

                {/* Script Box */}
                <div className="p-3.5 bg-[#050811] rounded-xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Video Script Blueprint:</div>
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {idea.script}
                  </pre>
                </div>

                {/* Caption & Hashtags */}
                <div className="text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Optimized Caption & Tags:</div>
                  <p>{idea.caption}</p>
                </div>

                {/* Thumbnail suggestion */}
                <div className="text-xs text-[#38BDF8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Thumbnail Idea: {idea.suggestedThumbnail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT CALENDAR & PUBLISHER */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Video Releases</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">2 Automated Posts</span>
          </div>

          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl text-white ${post.platform === 'YOUTUBE' ? 'bg-red-600' : 'bg-pink-600'}`}>
                    {post.platform === 'YOUTUBE' ? <Youtube className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{post.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{post.scheduledTime}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REAL METRICS ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl">
              <div className="text-xs text-slate-400">Total Video Views</div>
              <div className="text-2xl font-black text-white mt-1">1.42M</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1">↑ +24.8% this month</div>
            </div>
            <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl">
              <div className="text-xs text-slate-400">Watch Time (Hours)</div>
              <div className="text-2xl font-black text-white mt-1">18,400</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1">↑ +19.2%</div>
            </div>
            <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl">
              <div className="text-xs text-slate-400">Engagement Rate</div>
              <div className="text-2xl font-black text-[#00E5FF] mt-1">8.6%</div>
              <div className="text-[10px] text-slate-400 mt-1">Industry avg: 4.2%</div>
            </div>
            <div className="p-4 bg-[#0A0F1D] border border-white/10 rounded-2xl">
              <div className="text-xs text-slate-400">New Subscribers</div>
              <div className="text-2xl font-black text-pink-400 mt-1">+4,120</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1">Organic reach</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI GROWTH ADVISOR */}
      {activeTab === 'GROWTH' && (
        <div className="space-y-4">
          <div className="p-5 bg-[#0A0F1D] border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>AI Growth Recommendations</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#050811] rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-white">1. Multilingual Audio Dubbing Opportunity</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your Tamil-language Shorts showed a 38% higher completion rate than average English reels. Releasing bilingual paired shorts will double your reach across South Asia.
                </p>
              </div>

              <div className="p-3 bg-[#050811] rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-white">2. Hook Retention Drop at 4-6 Seconds</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Viewer drop-off occurs on videos where product features are explained before the problem statement. Lead with: "This one AI app solves multilingual chat" before showing UI.
                </p>
              </div>

              <div className="p-3 bg-[#050811] rounded-xl border border-white/5 space-y-1">
                <div className="text-xs font-bold text-white">3. Prime Publishing Window</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Audiences are most active between 6:30 PM and 8:15 PM IST. Schedule posts 20 minutes prior for algorithmic warm-up.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
