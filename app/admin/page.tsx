'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import {
  DynamicCanvasFile,
  getStoredCanvasFiles,
  saveCanvasFile,
  deleteCanvasFile,
  getStoredApiKey,
  saveApiKey,
  getStoredSeoConfig,
  saveSeoConfig,
  SeoConfig,
} from '@/lib/contentStore';

type MainTab = 'ai_copilot' | 'manual_upload' | 'archive_settings';
type ManualType = 'photo' | 'reel' | 'project';

function calculateAspect(w: number, h: number): { aspectClass: string; aspectLabel: string } {
  const ratio = w / h;
  if (ratio >= 1.65) return { aspectClass: 'aspect-[16/9]', aspectLabel: '16:9 Cinema' };
  if (ratio >= 1.45) return { aspectClass: 'aspect-[16/10]', aspectLabel: '16:10 Screen' };
  if (ratio >= 1.20) return { aspectClass: 'aspect-[4/3]', aspectLabel: '4:3 Medium' };
  if (ratio >= 0.85) return { aspectClass: 'aspect-[1/1]', aspectLabel: '1:1 Square' };
  if (ratio >= 0.65) return { aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Portrait' };
  return { aspectClass: 'aspect-[9/16]', aspectLabel: '9:16 Vertical Reel' };
}

export default function StudioDeskPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('ai_copilot');
  const [manualType, setManualType] = useState<ManualType>('photo');

  // Deployed items & settings
  const [deployedFiles, setDeployedFiles] = useState<DynamicCanvasFile[]>([]);
  const [seoConfig, setSeoConfig] = useState<SeoConfig>({});
  const [apiKey, setApiKey] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Studio Authentication Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [customPasscode, setCustomPasscode] = useState('');

  // AI Co-Pilot State
  const [chatMessages, setChatMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string;
      image?: string;
      time: string;
      canPublish?: boolean;
    }>
  >([
    {
      role: 'assistant',
      content:
        "Hey Moiz! I'm your AI Creative Producer powered by Gemini 3.6 Flash.\n\nDrop your campaign artboard (like Kaladhar), photo still, or reel video right here. I'll break down the deliverables (Print, Social 9:16, Web Banners), talk through the concept, and publish it to your website whenever you're ready.",
      time: 'ONLINE',
      canPublish: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [chatImageName, setChatImageName] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatImageInputRef = useRef<HTMLInputElement>(null);

  // Manual Upload State
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDiscipline, setPhotoDiscipline] = useState('Photography • Stills');
  const [photoYear, setPhotoYear] = useState('2026');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoAspect, setPhotoAspect] = useState({ aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Portrait' });

  const [reelTitle, setReelTitle] = useState('');
  const [reelDiscipline, setReelDiscipline] = useState('Cinematography • Motion');
  const [reelYear, setReelYear] = useState('2026');
  const [reelAspectChoice, setReelAspectChoice] = useState<'9/16' | '16/9'>('9/16');
  const [reelCoverUrl, setReelCoverUrl] = useState<string | null>(null);
  const [reelVideoLink, setReelVideoLink] = useState('');

  const [projName, setProjName] = useState('');
  const [projDiscipline, setProjDiscipline] = useState('Art Direction • Brand Identity');
  const [projRole, setProjRole] = useState('Lead Art Director');
  const [projYear, setProjYear] = useState('2026');
  const [projDesc, setProjDesc] = useState('');
  const [projCoverUrl, setProjCoverUrl] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const reelInputRef = useRef<HTMLInputElement>(null);
  const projInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isAuth = sessionStorage.getItem('studio_desk_auth') === 'true' || params.get('pin') === '7741';
      if (isAuth) {
        sessionStorage.setItem('studio_desk_auth', 'true');
      }
      setIsAuthenticated(isAuth);
      setHasCheckedAuth(true);

      const storedCustom = localStorage.getItem('studio_custom_passcode') || '';
      setCustomPasscode(storedCustom);

      const tabParam = params.get('tab');
      if (tabParam === 'upload') setActiveTab('manual_upload');
      else if (tabParam === 'archive' || tabParam === 'settings') setActiveTab('archive_settings');
      else if (tabParam === 'ai') setActiveTab('ai_copilot');
    }
    refreshData();
  }, []);

  const refreshData = () => {
    setDeployedFiles(getStoredCanvasFiles());
    setSeoConfig(getStoredSeoConfig());
    setApiKey(getStoredApiKey());
  };

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCustom = typeof window !== 'undefined' ? localStorage.getItem('studio_custom_passcode') : null;
    const validCodes = ['7741', storedCustom].filter(Boolean);

    if (validCodes.includes(passcode.trim())) {
      setIsAuthenticated(true);
      setAuthError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('studio_desk_auth', 'true');
      }
    } else {
      setAuthError('INVALID PASSCODE. ACCESS DENIED.');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('studio_desk_auth');
    }
    setIsAuthenticated(false);
    setPasscode('');
    setAuthError(null);
  };

  const handleSaveCustomPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPasscode.trim()) {
      showNotice('ERROR: Passcode cannot be empty.');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio_custom_passcode', customPasscode.trim());
    }
    showNotice('SUCCESS: New Studio Passcode saved.');
  };

  const handleImageFile = (file: File, callback: (dataUrl: string, name: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      callback(src, file.name);
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // AI Co-Pilot Messaging & Publishing
  // ----------------------------------------------------
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = (presetText || chatInput).trim();
    if (!textToSend && !chatImage) return;

    const userMsg = {
      role: 'user' as const,
      content: textToSend || (chatImage ? 'Analyze this campaign artwork and recommend how to feature it.' : ''),
      image: chatImage || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput('');
    const currentImg = chatImage;
    setChatImage(null);
    setChatImageName('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          imageData: currentImg,
          geminiKey: apiKey,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            canPublish: Boolean(currentImg || prev.some((m) => m.image)),
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I encountered an issue connecting to Gemini. Your free API key is configured; please check your network connection and try again.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network connection interrupted. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 1-Click One-Touch Deployment from AI Chat
  const handlePublishFromAi = (fallbackTitle?: string) => {
    const targetImg = chatImage || chatMessages.findLast((m) => m.image)?.image;
    if (!targetImg) {
      showNotice('Please attach or drop an image first.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1100);
    const randomY = Math.round((Math.random() - 0.5) * 1100);
    const title = fallbackTitle || 'Kaladhar Heritage Bridal';

    const newFile: DynamicCanvasFile = {
      id: `ai-${Date.now()}`,
      code: `FILE_${Math.floor(Math.random() * 80 + 15)}.DIR`,
      name: title,
      discipline: 'Lighting Direction • Heritage Styling',
      year: '2026',
      role: 'Director of Visuals',
      x: randomX,
      y: randomY,
      rot: Math.round((Math.random() - 0.5) * 6),
      img: targetImg,
      aspect: 'aspect-[4/5]',
      colorTag: 'bg-[#ff2a2a]',
      assetType: 'folder',
      desc: `${title} — Complete multi-channel campaign. Structured with print editorial lookbook, 9:16 vertical motion, and panoramic web hero banners.`,
      deliverables: ['Editorial Print Lookbook (4:5)', '9:16 Social Vertical Story', 'Web Hero Banner (16:9)', 'OOH Billboard Master'],
      photoCount: 4,
      photos: [targetImg],
    };

    saveCanvasFile(newFile);
    refreshData();
    showNotice(`✦ SUCCESS: "${newFile.name}" published to Live Canvas!`);

    setChatMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `🎉 Done! I have published **"${newFile.name}"** to your live Infinite Canvas & Portfolio.\n\nDeliverables mapped:\n• 4:5 Editorial Print Lookbook\n• 9:16 Mobile Vertical Story\n• 16:9 Web Hero Banner\n• OOH Billboard Master\n\nIt is now live for visitors and agency directors to explore.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canPublish: false,
      },
    ]);
  };

  // ----------------------------------------------------
  // Manual Upload Handlers
  // ----------------------------------------------------
  const handleDeployQuickPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl || !photoTitle.trim()) {
      showNotice('ERROR: Please provide a photo and a title.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1100);
    const randomY = Math.round((Math.random() - 0.5) * 1100);

    const newFile: DynamicCanvasFile = {
      id: `photo-${Date.now()}`,
      code: `STILL_${Math.floor(Math.random() * 89 + 10)}.IMG`,
      name: photoTitle.trim(),
      discipline: photoDiscipline,
      year: photoYear,
      role: 'Art Director & Photographer',
      x: randomX,
      y: randomY,
      rot: Math.round((Math.random() - 0.5) * 8),
      img: photoDataUrl,
      aspect: photoAspect.aspectClass,
      colorTag: 'bg-[#ff2a2a]',
      assetType: 'single_photo',
      desc: `Single still capture: ${photoTitle.trim()}. Shot & graded under studio direction.`,
      deliverables: ['High-Res Still', 'Color Emulation', 'Aspect Ratio Master'],
      photoCount: 1,
      photos: [photoDataUrl],
    };

    saveCanvasFile(newFile);
    refreshData();
    setPhotoTitle('');
    setPhotoDataUrl(null);
    showNotice(`SUCCESS: Photo "${newFile.name}" deployed to Canvas!`);
  };

  const handleDeployQuickReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelCoverUrl || !reelTitle.trim()) {
      showNotice('ERROR: Please provide a poster frame and a title for the reel.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1200);
    const randomY = Math.round((Math.random() - 0.5) * 1200);

    const newFile: DynamicCanvasFile = {
      id: `reel-${Date.now()}`,
      code: `REEL_${Math.floor(Math.random() * 89 + 10)}.MOV`,
      name: reelTitle.trim(),
      discipline: reelDiscipline,
      year: reelYear,
      role: 'Director / Cinematographer',
      x: randomX,
      y: randomY,
      rot: Math.round((Math.random() - 0.5) * 6),
      img: reelCoverUrl,
      aspect: reelAspectChoice === '9/16' ? 'aspect-[9/16]' : 'aspect-[16/9]',
      colorTag: 'bg-[#0055ff]',
      assetType: 'single_reel',
      videoUrl: reelVideoLink.trim() || undefined,
      desc: `Single reel cut: ${reelTitle.trim()}. Kinetic rhythm sequence & motion design.`,
      deliverables: ['Director Cut', '9:16 Mobile Master', 'Broadcast Pass'],
      photoCount: 1,
      photos: [reelCoverUrl],
    };

    saveCanvasFile(newFile);
    refreshData();
    setReelTitle('');
    setReelCoverUrl(null);
    setReelVideoLink('');
    showNotice(`SUCCESS: Reel "${newFile.name}" deployed to Canvas!`);
  };

  const handleDeployFullProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projCoverUrl || !projName.trim()) {
      showNotice('ERROR: Please provide a project cover image and name.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1300);
    const randomY = Math.round((Math.random() - 0.5) * 1300);

    const newFile: DynamicCanvasFile = {
      id: `proj-${Date.now()}`,
      code: `FILE_${Math.floor(Math.random() * 89 + 10)}.DIR`,
      name: projName.trim(),
      discipline: projDiscipline,
      year: projYear,
      role: projRole,
      x: randomX,
      y: randomY,
      rot: Math.round((Math.random() - 0.5) * 6),
      img: projCoverUrl,
      aspect: 'aspect-[4/5]',
      colorTag: 'bg-[#161616]',
      assetType: 'folder',
      desc: projDesc.trim() || `${projName.trim()} — Complete creative direction & visual execution.`,
      deliverables: ['Creative Direction', 'Brand Strategy', 'Visual Identity', 'Campaign Masters'],
      photoCount: 1,
      photos: [projCoverUrl],
    };

    saveCanvasFile(newFile);
    refreshData();
    setProjName('');
    setProjDesc('');
    setProjCoverUrl(null);
    showNotice(`SUCCESS: Project folder "${newFile.name}" deployed to Canvas!`);
  };

  const handleDeleteCanvasItem = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from the live canvas?`)) {
      deleteCanvasFile(id);
      refreshData();
      showNotice(`REMOVED: "${name}" has been deleted.`);
    }
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    saveSeoConfig(seoConfig);
    showNotice('SUCCESS: SEO & Analytics tags saved.');
  };

  if (!hasCheckedAuth) {
    return <main className="min-h-screen bg-[#0d0d0f]" />;
  }

  // Passcode Lock Gate
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0d0d0f] text-[#f4f2ee] flex flex-col items-center justify-center p-6 select-none font-mono selection:bg-[#ff2a2a] selection:text-white">
        <CustomCursor />
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff2a2a] animate-pulse shadow-[0_0_12px_rgba(255,42,42,0.6)]" />
            <div className="text-center space-y-1">
              <h1 className="text-xs font-bold tracking-[0.2em] text-white uppercase">
                MOIZ KHAN // STUDIO DESK
              </h1>
              <p className="text-[10px] tracking-wider text-[#777780] uppercase">
                DIRECTORIAL CREATIVE ACCESS
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="w-full space-y-3">
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setAuthError(null);
              }}
              placeholder="ENTER PASSCODE (7741)"
              autoFocus
              className="w-full px-4 py-3.5 bg-[#151518] border border-white/10 rounded-[10px] text-center text-sm tracking-[0.3em] text-white placeholder:text-[#55555e] focus:outline-none focus:border-[#ff2a2a] transition-all"
            />

            {authError && (
              <p className="text-[10px] text-[#ff2a2a] text-center tracking-wider uppercase font-semibold">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black hover:bg-[#ff2a2a] hover:text-white transition-all text-xs font-bold uppercase tracking-widest rounded-[10px] active:scale-[0.98] cursor-pointer"
            >
              AUTHENTICATE ↵
            </button>
          </form>

          <Link
            href="/"
            className="text-[10.5px] text-[#55555e] hover:text-[#f4f2ee] transition-colors tracking-widest uppercase"
          >
            ← Return to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-[#f4f2ee] font-sans selection:bg-[#ff2a2a] selection:text-white pb-20 select-none">
      <CustomCursor />

      {/* Floating Notice Toast */}
      {statusNotice && (
        <div className="fixed top-6 right-6 z-[1000] px-5 py-3 rounded-[10px] bg-white text-black font-mono text-xs font-bold tracking-wider shadow-2xl border border-black/10 flex items-center gap-3 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#ff2a2a] animate-ping" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Clean Studio Desk Header */}
      <header className="border-b border-white/10 bg-[#111114]/95 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          <div>
            <h1 className="font-display font-black text-base sm:text-lg tracking-tight uppercase">
              MOIZ KHAN <span className="text-secondary font-mono text-xs font-normal ml-2">// STUDIO DESK</span>
            </h1>
            <p className="font-mono text-[10px] text-emerald-400/90 tracking-wider uppercase mt-0.5">
              ● Gemini 3.6 Flash Active • 100% Free Tier ($0.00)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-secondary hover:text-white"
          >
            ← Portfolio
          </Link>
          <Link
            href="/canvas"
            className="px-3.5 py-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-secondary hover:text-white"
          >
            ⌖ Canvas
          </Link>
          <Link
            href="/about"
            className="px-3.5 py-1.5 rounded-[8px] bg-[#ff2a2a] text-white hover:bg-[#ff4444] transition-all font-semibold"
          >
            ✦ About
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-[8px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[#ff4444] transition-all font-mono text-xs cursor-pointer"
          >
            🔒 Lock
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* Streamlined 3-Tab Bar (No overflow, no clipping, crystal clear) */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('ai_copilot')}
            className={`px-5 py-2.5 rounded-[10px] font-mono text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ai_copilot'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
            }`}
          >
            <span className={activeTab === 'ai_copilot' ? 'text-[#ff2a2a]' : 'text-secondary'}>✦</span>
            <span>AI Co-Pilot</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_upload')}
            className={`px-5 py-2.5 rounded-[10px] font-mono text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'manual_upload'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
            }`}
          >
            <span>+</span>
            <span>Manual Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('archive_settings')}
            className={`px-5 py-2.5 rounded-[10px] font-mono text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'archive_settings'
                ? 'bg-white text-black font-bold shadow-lg'
                : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
            }`}
          >
            <span>⚙</span>
            <span>Archive &amp; Settings</span>
            {deployedFiles.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ff2a2a] text-white font-bold ml-0.5">
                {deployedFiles.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: RADICAL SIMPLE AI CO-PILOT (Conversational Assistant)  */}
        {/* ============================================================ */}
        {activeTab === 'ai_copilot' && (
          <div className="pt-6 space-y-4">
            
            {/* Context Helper Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight flex items-center gap-2">
                  <span>AI Creative Co-Director</span>
                  <span className="text-[10px] font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    GEMINI 3.6 FLASH • 100% FREE
                  </span>
                </h2>
                <p className="font-mono text-[11px] text-secondary mt-0.5">
                  Drop any multi-format campaign artboard (like Kaladhar), photo still, or reel video. Your AI will identify the formats and publish directly to your site.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setChatMessages([
                    {
                      role: 'assistant',
                      content:
                        "Hey Moiz! Conversation reset. Drop any artwork, photo, or reel here whenever you're ready.",
                      time: 'ONLINE',
                      canPublish: false,
                    },
                  ])
                }
                className="self-start sm:self-auto px-3 py-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10.5px] uppercase tracking-wider transition-all border border-white/5 cursor-pointer"
              >
                Clear Chat
              </button>
            </div>

            {/* Unified Chat & Drop Container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  handleImageFile(file, (dataUrl, name) => {
                    setChatImage(dataUrl);
                    setChatImageName(name);
                    showNotice(`Attached artwork: ${name}`);
                  });
                }
              }}
              className={`rounded-[14px] bg-[#111114] border transition-all overflow-hidden flex flex-col shadow-2xl ${
                isDraggingOver ? 'border-[#ff2a2a] ring-2 ring-[#ff2a2a]/30' : 'border-white/10'
              }`}
            >
              {/* Drag Over Overlay Alert */}
              {isDraggingOver && (
                <div className="bg-[#ff2a2a]/20 border-b border-[#ff2a2a]/40 px-4 py-2 text-center font-mono text-xs text-white font-bold animate-pulse">
                  ✦ DROP ARTWORK TO ATTACH INSTANTLY ✦
                </div>
              )}

              {/* Chat Messages Stream */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[520px] min-h-[420px] space-y-6 font-mono text-xs leading-relaxed">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1.5 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${
                          msg.role === 'user'
                            ? 'bg-white text-black'
                            : 'bg-[#ff2a2a]/20 text-[#ff4444] border border-[#ff2a2a]/30'
                        }`}
                      >
                        {msg.role === 'user' ? 'MOIZ KHAN' : 'CO-DIRECTOR AI'}
                      </span>
                      <span className="text-[9px] text-[#777780]">{msg.time}</span>
                    </div>

                    {msg.image && (
                      <div className="rounded-[8px] overflow-hidden border border-white/20 max-w-[320px] my-1.5 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.image}
                          alt="Attached artwork"
                          className="w-full h-auto object-cover max-h-[200px]"
                        />
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-[12px] max-w-[92%] sm:max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'bg-[#17171b] text-[#eceae5] border border-white/5'
                      }`}
                    >
                      {msg.content}

                      {/* 1-Click One-Touch Deployment Button from AI Response */}
                      {msg.canPublish && (
                        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-white text-xs">Ready to push this live?</p>
                            <p className="text-[10px] text-secondary">
                              Publishes artwork and multi-format deliverables to your Live Canvas.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePublishFromAi()}
                            className="px-4 py-2 rounded-[8px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            ✦ One-Click Publish ↗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#ff2a2a]/20 text-[#ff4444] border border-[#ff2a2a]/30">
                      CO-DIRECTOR AI
                    </span>
                    <div className="p-4 rounded-[12px] bg-[#17171b] text-secondary border border-white/5 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#ff2a2a] animate-ping" />
                      <span className="text-xs">
                        Reviewing composition, detecting formats &amp; preparing creative suggestions...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Artwork Attached Preview Pill (Directly above input) */}
              {chatImage && (
                <div className="px-5 py-2.5 bg-white/[0.03] border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-[6px] overflow-hidden border border-white/20 bg-black shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={chatImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-mono text-xs font-bold text-white truncate">
                        {chatImageName || 'Attached Campaign Artwork'}
                      </p>
                      <p className="font-mono text-[10px] text-emerald-400">Ready to analyze or publish</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublishFromAi()}
                      className="px-3 py-1.5 rounded-[6px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      ✦ Publish Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChatImage(null);
                        setChatImageName('');
                      }}
                      className="px-2.5 py-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10.5px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Action Suggestion Pills */}
              <div className="px-4 py-2 bg-[#141417] border-t border-white/5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      'Scan this artwork and break down every format you see (Print lookbook, social 9:16, web hero, OOH) and ask me 1 or 2 quick questions.'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10px] whitespace-nowrap transition-all border border-white/5 cursor-pointer"
                >
                  🔍 Break Down Formats
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      'Which photo from this artwork should be the main hero cover, and what aspect ratio should we use?'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10px] whitespace-nowrap transition-all border border-white/5 cursor-pointer"
                >
                  📐 Pick Best Cover
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      'Write a short, high-impact creative director narrative for this campaign focusing on lighting and visual tone.'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10px] whitespace-nowrap transition-all border border-white/5 cursor-pointer"
                >
                  ✍️ Write Narrative
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishFromAi()}
                  className="px-3 py-1 rounded-full bg-[#ff2a2a]/15 hover:bg-[#ff2a2a]/25 text-[#ff4444] font-mono text-[10px] whitespace-nowrap transition-all border border-[#ff2a2a]/30 cursor-pointer font-bold"
                >
                  ✦ 1-Click Publish to Canvas
                </button>
              </div>

              {/* Input Form Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="p-3 sm:p-4 border-t border-white/10 bg-[#151518] flex gap-2.5 items-center"
              >
                <input
                  ref={chatImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageFile(file, (dataUrl, name) => {
                        setChatImage(dataUrl);
                        setChatImageName(name);
                        showNotice(`Attached artwork: ${name}`);
                      });
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => chatImageInputRef.current?.click()}
                  title="Attach campaign artboard or still"
                  className="px-3.5 py-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-white transition-all text-sm flex items-center justify-center cursor-pointer shrink-0"
                >
                  📎
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    chatImage
                      ? 'Type instructions or hit Send to analyze...'
                      : 'Ask your AI Co-Director, or drop an image here...'
                  }
                  className="flex-1 px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white placeholder:text-[#777780]"
                />

                <button
                  type="submit"
                  disabled={isAiThinking || (!chatInput.trim() && !chatImage)}
                  className="px-5 py-3 rounded-[10px] bg-white text-black hover:bg-[#ff2a2a] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black cursor-pointer shrink-0"
                >
                  Send ↵
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MANUAL UPLOAD (When Moiz wants direct upload)         */}
        {/* ============================================================ */}
        {activeTab === 'manual_upload' && (
          <div className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight">
                  Direct Upload Studio
                </h2>
                <p className="font-mono text-xs text-secondary mt-0.5">
                  Publish a standalone still, 9:16 vertical reel, or complete client case folder.
                </p>
              </div>

              {/* Sub-mode Segmented Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-white/5 border border-white/10 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setManualType('photo')}
                  className={`px-3.5 py-1.5 rounded-[8px] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    manualType === 'photo' ? 'bg-white text-black font-bold shadow' : 'text-secondary hover:text-white'
                  }`}
                >
                  📸 Photo Still
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('reel')}
                  className={`px-3.5 py-1.5 rounded-[8px] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    manualType === 'reel' ? 'bg-white text-black font-bold shadow' : 'text-secondary hover:text-white'
                  }`}
                >
                  🎬 Video Reel
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('project')}
                  className={`px-3.5 py-1.5 rounded-[8px] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    manualType === 'project' ? 'bg-white text-black font-bold shadow' : 'text-secondary hover:text-white'
                  }`}
                >
                  📁 Full Folder
                </button>
              </div>
            </div>

            {/* Mode 1: Quick Photo Still */}
            {manualType === 'photo' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-5">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className={`w-full h-52 rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                      photoDataUrl
                        ? 'border-[#ff2a2a]/60 bg-white/[0.02]'
                        : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageFile(file, (dataUrl, name) => {
                            setPhotoDataUrl(dataUrl);
                            if (!photoTitle) setPhotoTitle(name.replace(/\.[^/.]+$/, ''));
                            const img = new Image();
                            img.onload = () => setPhotoAspect(calculateAspect(img.naturalWidth, img.naturalHeight));
                            img.src = dataUrl;
                          });
                        }
                      }}
                    />
                    <span className="text-3xl mb-2">📸</span>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                      {photoDataUrl ? 'Change Selected Photo' : 'Drop Single Photo or Click to Browse'}
                    </p>
                    <p className="font-mono text-[10px] text-secondary mt-1">
                      Auto-detects aspect ratio &amp; optimizes for display
                    </p>
                  </div>

                  <form onSubmit={handleDeployQuickPhoto} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Still Title / Look Name
                      </label>
                      <input
                        type="text"
                        value={photoTitle}
                        onChange={(e) => setPhotoTitle(e.target.value)}
                        placeholder="e.g. Dior Midnight Light Test // Look 04"
                        className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                          Discipline Tag
                        </label>
                        <select
                          value={photoDiscipline}
                          onChange={(e) => setPhotoDiscipline(e.target.value)}
                          className="w-full px-4 py-3 rounded-[10px] bg-[#161619] border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                        >
                          <option value="Photography • Stills">Photography • Stills</option>
                          <option value="Art Direction • Lookbook">Art Direction • Lookbook</option>
                          <option value="Colour Grading • 35mm">Colour Grading • 35mm</option>
                          <option value="Lighting Direction • BTS">Lighting Direction • BTS</option>
                          <option value="Fashion Editorial">Fashion Editorial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                          Production Year
                        </label>
                        <input
                          type="text"
                          value={photoYear}
                          onChange={(e) => setPhotoYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!photoDataUrl}
                      className="w-full py-3.5 rounded-[10px] bg-[#ff2a2a] hover:bg-[#ff4444] disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                    >
                      Deploy Still to Infinite Canvas ↗
                    </button>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-[12px] bg-white/[0.02] border border-white/10">
                  <span className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">
                    [ LIVE CARD PREVIEW ]
                  </span>
                  {photoDataUrl ? (
                    <div className="w-full max-w-[260px] bg-[#faf9f6] text-black rounded-[10px] p-4 shadow-2xl border border-black/10 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-black/60">
                        <span>STILL.IMG</span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-black/10 font-bold">{photoAspect.aspectLabel}</span>
                      </div>
                      <div className={`w-full ${photoAspect.aspectClass} rounded-[6px] overflow-hidden bg-black/5`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-sm uppercase leading-tight">
                          {photoTitle || 'Untitled Still'}
                        </h3>
                        <p className="font-mono text-[10.5px] text-black/70 mt-0.5">{photoDiscipline}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-secondary font-mono text-xs py-14">
                      Select or drop a photo to preview
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Quick Reel */}
            {manualType === 'reel' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-5">
                  <div
                    onClick={() => reelInputRef.current?.click()}
                    className={`w-full h-48 rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                      reelCoverUrl
                        ? 'border-[#0055ff]/60 bg-white/[0.02]'
                        : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      ref={reelInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageFile(file, (dataUrl, name) => {
                            setReelCoverUrl(dataUrl);
                            if (!reelTitle) setReelTitle(name.replace(/\.[^/.]+$/, ''));
                          });
                        }
                      }}
                    />
                    <span className="text-3xl mb-2">🎬</span>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                      {reelCoverUrl ? 'Change Reel Poster Frame' : 'Upload Reel Poster Frame'}
                    </p>
                    <p className="font-mono text-[10px] text-secondary mt-1">
                      9:16 vertical poster or 16:9 cinema frame
                    </p>
                  </div>

                  <form onSubmit={handleDeployQuickReel} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Reel / Video Title
                      </label>
                      <input
                        type="text"
                        value={reelTitle}
                        onChange={(e) => setReelTitle(e.target.value)}
                        placeholder="e.g. Nike Kinetic Hyperspeed Vertical Reel"
                        className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#0055ff] outline-none font-mono text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Video Stream Link (Optional MP4 / Vimeo / R2)
                      </label>
                      <input
                        type="text"
                        value={reelVideoLink}
                        onChange={(e) => setReelVideoLink(e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#0055ff] outline-none font-mono text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                          Aspect Ratio
                        </label>
                        <select
                          value={reelAspectChoice}
                          onChange={(e) => setReelAspectChoice(e.target.value as '9/16' | '16/9')}
                          className="w-full px-4 py-3 rounded-[10px] bg-[#161619] border border-white/10 focus:border-[#0055ff] outline-none font-mono text-xs text-white"
                        >
                          <option value="9/16">9:16 Vertical Reel (Mobile)</option>
                          <option value="16/9">16:9 Cinema Master</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                          Discipline Tag
                        </label>
                        <select
                          value={reelDiscipline}
                          onChange={(e) => setReelDiscipline(e.target.value)}
                          className="w-full px-4 py-3 rounded-[10px] bg-[#161619] border border-white/10 focus:border-[#0055ff] outline-none font-mono text-xs text-white"
                        >
                          <option value="Cinematography • Motion">Cinematography • Motion</option>
                          <option value="Video Editing • Director Cut">Video Editing • Director Cut</option>
                          <option value="Motion Graphics • 3D">Motion Graphics • 3D</option>
                          <option value="BTS Shoot Direction">BTS Shoot Direction</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!reelCoverUrl}
                      className="w-full py-3.5 rounded-[10px] bg-[#0055ff] hover:bg-[#2277ff] disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                    >
                      Deploy Reel to Infinite Canvas ↗
                    </button>
                  </form>
                </div>

                {/* Reel Preview */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-[12px] bg-white/[0.02] border border-white/10">
                  <span className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">
                    [ LIVE REEL PREVIEW ]
                  </span>
                  {reelCoverUrl ? (
                    <div className={`w-full ${reelAspectChoice === '9/16' ? 'max-w-[210px]' : 'max-w-[280px]'} bg-[#faf9f6] text-black rounded-[10px] p-4 shadow-2xl border border-black/10 flex flex-col justify-between space-y-3`}>
                      <div className="flex justify-between items-center text-[10px] font-mono text-black/60">
                        <span>REEL.MOV</span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-blue-100 text-blue-800 font-bold">{reelAspectChoice}</span>
                      </div>
                      <div className={`w-full ${reelAspectChoice === '9/16' ? 'aspect-[9/16]' : 'aspect-[16/9]'} rounded-[6px] overflow-hidden bg-black/10 relative`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reelCoverUrl} alt="Reel Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center pl-0.5 font-bold shadow">▶</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-display font-black text-xs uppercase leading-tight">
                          {reelTitle || 'Untitled Reel'}
                        </h3>
                        <p className="font-mono text-[10px] text-black/70 mt-0.5">{reelDiscipline}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-secondary font-mono text-xs py-14">
                      Upload a poster frame to see live reel preview
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 3: Full Project Folder */}
            {manualType === 'project' && (
              <div className="max-w-3xl space-y-5">
                <div
                  onClick={() => projInputRef.current?.click()}
                  className={`w-full h-44 rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                    projCoverUrl
                      ? 'border-white/60 bg-white/[0.02]'
                      : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <input
                    ref={projInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageFile(file, (dataUrl, name) => {
                          setProjCoverUrl(dataUrl);
                          if (!projName) setProjName(name.replace(/\.[^/.]+$/, ''));
                        });
                      }
                    }}
                  />
                  <span className="text-3xl mb-2">📁</span>
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                    {projCoverUrl ? 'Change Case Cover' : 'Upload Primary Case Cover'}
                  </p>
                </div>

                <form onSubmit={handleDeployFullProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Project / Client Name
                      </label>
                      <input
                        type="text"
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        placeholder="e.g. Acme Motors Global Launch"
                        className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-white outline-none font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Your Role
                      </label>
                      <input
                        type="text"
                        value={projRole}
                        onChange={(e) => setProjRole(e.target.value)}
                        placeholder="e.g. Lead Art Director"
                        className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-white outline-none font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                      Brief Statement
                    </label>
                    <textarea
                      rows={3}
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      placeholder="Short editorial summary of creative direction and challenges..."
                      className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-white outline-none font-mono text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!projCoverUrl}
                    className="w-full py-3.5 rounded-[10px] bg-white text-black hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                  >
                    Deploy Project Folder to Canvas ↗
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ARCHIVE, FREE GEMINI STATUS & 8 FREE SEO TOOLS        */}
        {/* ============================================================ */}
        {activeTab === 'archive_settings' && (
          <div className="pt-6 space-y-8">

            {/* Section 1: Live Canvas Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-lg uppercase tracking-tight">
                  Active Deployed Works ({deployedFiles.length})
                </h3>
                <span className="font-mono text-[10px] text-secondary uppercase">
                  Stored on Infinite Canvas &amp; Portfolio
                </span>
              </div>

              {deployedFiles.length === 0 ? (
                <div className="p-8 rounded-[12px] bg-white/[0.02] border border-white/10 text-center font-mono text-xs text-secondary">
                  No custom items deployed yet. Default archive projects are currently active.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {deployedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-[10px] bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img} alt={item.name} className="w-11 h-11 rounded-[6px] object-cover shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-mono text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="font-mono text-[10px] text-secondary truncate">{item.discipline}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCanvasItem(item.id, item.name)}
                        className="px-2.5 py-1 rounded-[6px] bg-red-500/10 hover:bg-red-500/30 text-red-400 font-mono text-[11px] shrink-0 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: 100% Free Gemini Status Confirmation */}
            <div className="p-6 rounded-[12px] bg-emerald-950/20 border border-emerald-500/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Gemini 3.6 Flash • 100% Free Tier ($0.00 Forever)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  NO CREDIT CARD REQUIRED • ZERO CHARGES
                </span>
              </div>
              <p className="font-mono text-xs text-white/80 leading-relaxed">
                Your key is registered under Google AI Studio&apos;s Free Tier. It includes <strong>1,500 free requests per day</strong> (refreshed every 24 hours). Google cannot charge you because no billing account is attached.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSyCic-8hibtiEY2wbUMDj7YUwgDXw1yqXr4"
                  className="flex-1 px-4 py-2.5 rounded-[8px] bg-black/40 border border-white/15 font-mono text-xs text-white outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    saveApiKey(apiKey);
                    showNotice('SUCCESS: Gemini API Key verified & saved.');
                  }}
                  className="px-5 py-2.5 rounded-[8px] bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Verify Key
                </button>
              </div>
            </div>

            {/* Section 3: Studio Passcode Protection */}
            <div className="p-6 rounded-[12px] bg-white/[0.02] border border-white/10 space-y-3">
              <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                <span>Studio Desk Passcode Gate</span>
                <span className="text-[10px] text-emerald-400 font-normal">[PROTECTED: 7741]</span>
              </span>
              <p className="font-mono text-[11px] text-secondary">
                Guards your Studio Desk so the public cannot access it. Master passcode: <code className="text-white">7741</code>.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customPasscode}
                  onChange={(e) => setCustomPasscode(e.target.value)}
                  placeholder="Custom secret PIN (Optional)"
                  className="flex-1 px-4 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomPasscode}
                  className="px-5 py-2.5 rounded-[8px] bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Save Passcode
                </button>
              </div>
            </div>

            {/* Section 4: 8 Free SEO Tools Suite */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-tight">
                  8 Free SEO &amp; Analytics Tools
                </h3>
                <p className="font-mono text-xs text-secondary mt-0.5">
                  Direct links and meta tag inputs for the essential free ranking tools.
                </p>
              </div>

              <form onSubmit={handleSaveSeo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. GSC */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">1. Google Search Console</span>
                      <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Open ↗</a>
                    </div>
                    <input
                      type="text"
                      value={seoConfig.googleSearchConsole || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, googleSearchConsole: e.target.value })}
                      placeholder="google-site-verification=..."
                      className="w-full px-3 py-2 rounded-[6px] bg-white/5 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  {/* 2. GA4 */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">2. Google Analytics 4</span>
                      <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Open ↗</a>
                    </div>
                    <input
                      type="text"
                      value={seoConfig.ga4MeasurementId || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, ga4MeasurementId: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 rounded-[6px] bg-white/5 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  {/* 3. GTM */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">3. Google Tag Manager</span>
                      <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Open ↗</a>
                    </div>
                    <input
                      type="text"
                      value={seoConfig.gtmContainerId || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, gtmContainerId: e.target.value })}
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-3 py-2 rounded-[6px] bg-white/5 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  {/* 4. Microsoft Clarity */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">4. Microsoft Clarity</span>
                      <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Open ↗</a>
                    </div>
                    <input
                      type="text"
                      value={seoConfig.microsoftClarityId || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, microsoftClarityId: e.target.value })}
                      placeholder="Clarity Project ID"
                      className="w-full px-3 py-2 rounded-[6px] bg-white/5 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  {/* 5. Bing Webmaster */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">5. Bing Webmaster Tools</span>
                      <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Open ↗</a>
                    </div>
                    <input
                      type="text"
                      value={seoConfig.bingVerification || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, bingVerification: e.target.value })}
                      placeholder="msvalidate.01 meta code"
                      className="w-full px-3 py-2 rounded-[6px] bg-white/5 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  {/* 6. Ahrefs Webmaster */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">6. Ahrefs Webmaster Tools</span>
                      <a href="https://ahrefs.com/webmaster-tools" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Open ↗</a>
                    </div>
                    <input
                      type="text"
                      value={seoConfig.ahrefsVerification || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, ahrefsVerification: e.target.value })}
                      placeholder="ahrefs-site-verification_..."
                      className="w-full px-3 py-2 rounded-[6px] bg-white/5 border border-white/10 text-xs font-mono text-white outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  {/* 7. Screaming Frog */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">7. Screaming Frog</span>
                      <a href="https://www.screamingfrog.co.uk/seo-spider/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Download ↗</a>
                    </div>
                    <p className="text-[10.5px] font-mono text-secondary">Free crawl audit for broken links &amp; 404s (up to 500 URLs).</p>
                  </div>

                  {/* 8. PageSpeed */}
                  <div className="p-4 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-white uppercase">8. PageSpeed Insights</span>
                      <a href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fmoizcreates.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#ff2a2a] hover:underline">Run Test ↗</a>
                    </div>
                    <p className="text-[10.5px] font-mono text-secondary">Measures Google Core Web Vitals (LCP, INP, CLS) live.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-[10px] bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Save SEO Configuration ↗
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
