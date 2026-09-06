'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import {
  DynamicCanvasFile,
  getStoredCanvasFiles,
  saveCanvasFile,
  deleteCanvasFile,
  getStoredBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  getStoredApiKey,
  saveApiKey,
  getStoredSeoConfig,
  saveSeoConfig,
  SeoConfig,
} from '@/lib/contentStore';
import { BlogPost } from '@/lib/blogData';

type AdminTab =
  | 'quick_photo'
  | 'quick_reel'
  | 'full_project'
  | 'journal'
  | 'seo_analytics'
  | 'system';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function calculateAspect(w: number, h: number): { aspectClass: string; aspectLabel: string } {
  const ratio = w / h;
  if (ratio >= 1.65) return { aspectClass: 'aspect-[16/9]', aspectLabel: '16:9 Broadcast' };
  if (ratio >= 1.45) return { aspectClass: 'aspect-[16/10]', aspectLabel: '16:10 Cinema' };
  if (ratio >= 1.20) return { aspectClass: 'aspect-[4/3]', aspectLabel: '4:3 Medium Format' };
  if (ratio >= 0.85) return { aspectClass: 'aspect-[1/1]', aspectLabel: '1:1 Square Art' };
  if (ratio >= 0.65) return { aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Editorial' };
  return { aspectClass: 'aspect-[9/16]', aspectLabel: '9:16 Vertical Reel' };
}

export default function StudioDeskPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('quick_photo');
  const [deployedFiles, setDeployedFiles] = useState<DynamicCanvasFile[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [seoConfig, setSeoConfig] = useState<SeoConfig>({});
  const [apiKey, setApiKey] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Studio Authentication Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [customPasscode, setCustomPasscode] = useState('');

  // Quick Photo State
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDiscipline, setPhotoDiscipline] = useState('Photography • Stills');
  const [photoYear, setPhotoYear] = useState('2026');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoAspect, setPhotoAspect] = useState({ aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Editorial' });

  // Quick Reel State
  const [reelTitle, setReelTitle] = useState('');
  const [reelDiscipline, setReelDiscipline] = useState('Cinematography • Motion');
  const [reelYear, setReelYear] = useState('2026');
  const [reelAspectChoice, setReelAspectChoice] = useState<'9/16' | '16/9'>('9/16');
  const [reelCoverUrl, setReelCoverUrl] = useState<string | null>(null);
  const [reelVideoLink, setReelVideoLink] = useState('');

  // Full Project State
  const [projName, setProjName] = useState('');
  const [projDiscipline, setProjDiscipline] = useState('Art Direction • Brand Identity');
  const [projRole, setProjRole] = useState('Lead Art Director');
  const [projYear, setProjYear] = useState('2026');
  const [projDesc, setProjDesc] = useState('');
  const [projCoverUrl, setProjCoverUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reelCoverInputRef = useRef<HTMLInputElement>(null);
  const projCoverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('studio_desk_auth') === 'true';
      setIsAuthenticated(isAuth);
      setHasCheckedAuth(true);

      const storedCustom = localStorage.getItem('studio_custom_passcode') || '';
      setCustomPasscode(storedCustom);

      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      if (tabParam) setActiveTab(tabParam);
    }
    refreshData();
  }, []);

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

  const refreshData = () => {
    setDeployedFiles(getStoredCanvasFiles());
    setBlogPosts(getStoredBlogPosts());
    setSeoConfig(getStoredSeoConfig());
    setApiKey(getStoredApiKey());
  };

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Image processing helper
  const handleProcessImage = (file: File, callback: (dataUrl: string, aspect: { aspectClass: string; aspectLabel: string }) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = calculateAspect(img.naturalWidth, img.naturalHeight);
        callback(src, aspect);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // 1. Deploy Quick Single Photo
  const handleDeployQuickPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl || !photoTitle.trim()) {
      showNotice('ERROR: Please provide a photo and a title.');
      return;
    }

    // Random coordinates on infinite canvas so it spreads organically
    const randomX = Math.round((Math.random() - 0.5) * 1100);
    const randomY = Math.round((Math.random() - 0.5) * 1100);
    const randomRot = Math.round((Math.random() - 0.5) * 8);

    const newFile: DynamicCanvasFile = {
      id: `photo-${Date.now()}`,
      code: `STILL_${Math.floor(Math.random() * 89 + 10)}.IMG`,
      name: photoTitle.trim(),
      discipline: photoDiscipline,
      year: photoYear,
      role: 'Art Director & Photographer',
      x: randomX,
      y: randomY,
      rot: randomRot,
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
    showNotice(`SUCCESS: Still "${newFile.name}" deployed to Infinite Canvas!`);
  };

  // 2. Deploy Quick Reel / Video
  const handleDeployQuickReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelCoverUrl || !reelTitle.trim()) {
      showNotice('ERROR: Please provide a poster frame and a title for the reel.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1200);
    const randomY = Math.round((Math.random() - 0.5) * 1200);
    const randomRot = Math.round((Math.random() - 0.5) * 6);

    const newFile: DynamicCanvasFile = {
      id: `reel-${Date.now()}`,
      code: `REEL_${Math.floor(Math.random() * 89 + 10)}.MOV`,
      name: reelTitle.trim(),
      discipline: reelDiscipline,
      year: reelYear,
      role: 'Director / Cinematographer',
      x: randomX,
      y: randomY,
      rot: randomRot,
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
    showNotice(`SUCCESS: Reel "${newFile.name}" deployed to Infinite Canvas!`);
  };

  // 3. Deploy Full Project Folder
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

  // 4. Save SEO & Analytics
  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    saveSeoConfig(seoConfig);
    showNotice('SUCCESS: SEO & Analytics tags saved. Meta tags active across website.');
  };

  // Delete an item from canvas
  const handleDeleteCanvasItem = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from the live canvas?`)) {
      deleteCanvasFile(id);
      refreshData();
      showNotice(`REMOVED: "${name}" has been taken down.`);
    }
  };

  if (!hasCheckedAuth) {
    return <main className="min-h-screen bg-[#0d0d0f]" />;
  }

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
                RESTRICTED DIRECTORIAL ACCESS
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="w-full space-y-3">
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setAuthError(null);
                }}
                placeholder="ENTER PASSCODE"
                autoFocus
                className="w-full px-4 py-3.5 bg-[#151518] border border-white/10 rounded-[10px] text-center text-sm tracking-[0.3em] text-white placeholder:text-[#55555e] focus:outline-none focus:border-[#ff2a2a] transition-all"
              />
            </div>

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
    <main className="min-h-screen bg-[#0d0d0f] text-[#f4f2ee] font-sans selection:bg-[#ff2a2a] selection:text-white pb-24 select-none">
      <CustomCursor />

      {/* Notice Toast */}
      {statusNotice && (
        <div className="fixed top-6 right-6 z-[1000] px-5 py-3 rounded-[10px] bg-white text-black font-mono text-xs font-bold tracking-wider shadow-2xl border border-black/10 flex items-center gap-3 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#ff2a2a] animate-ping" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Studio Desk Header */}
      <header className="border-b border-white/10 bg-[#111114]/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#ff2a2a]" />
          <div>
            <h1 className="font-display font-black text-lg sm:text-xl tracking-tight uppercase">
              MOIZ KHAN <span className="text-secondary font-mono text-xs font-normal ml-2">// STUDIO DESK</span>
            </h1>
            <p className="font-mono text-[10.5px] text-secondary tracking-wider uppercase mt-0.5">
              Directorial CMS &amp; Media Deployer • Local Storage Operational
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-secondary hover:text-white"
          >
            ← View Portfolio
          </Link>
          <Link
            href="/canvas"
            className="px-3.5 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-secondary hover:text-white"
          >
            ⌖ View Canvas
          </Link>
          <Link
            href="/about"
            className="px-3.5 py-1.5 rounded-[10px] bg-[#ff2a2a] text-white hover:bg-[#ff4444] transition-all font-semibold"
          >
            ✦ About Page
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[#ff4444] transition-all font-mono text-xs cursor-pointer"
          >
            🔒 Lock Desk
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-8 sm:pt-10">

        {/* Tab Navigation Pill Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 border-b border-white/10 no-scrollbar">
          {[
            { id: 'quick_photo', label: '01 // QUICK STILL' },
            { id: 'quick_reel', label: '02 // QUICK REEL' },
            { id: 'full_project', label: '03 // FULL CASE ARCHIVE' },
            { id: 'journal', label: '04 // ESSAYS & ARTICLES' },
            { id: 'seo_analytics', label: '05 // SEO & ANALYTICS' },
            { id: 'system', label: '06 // SYSTEM & CLOUD' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2.5 rounded-[10px] font-mono text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* TAB 01: QUICK STILL / PHOTO DROP                             */}
        {/* ============================================================ */}
        {activeTab === 'quick_photo' && (
          <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                  Deploy Single Still / Photo
                </h2>
                <p className="font-mono text-xs text-secondary mt-1">
                  Upload a single standout photo or editorial still directly to the infinite canvas without needing a full project folder.
                </p>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-56 rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  photoDataUrl
                    ? 'border-[#ff2a2a]/60 bg-white/[0.02]'
                    : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProcessImage(file, (dataUrl, aspect) => {
                        setPhotoDataUrl(dataUrl);
                        setPhotoAspect(aspect);
                        if (!photoTitle) setPhotoTitle(file.name.replace(/\.[^/.]+$/, ''));
                      });
                    }
                  }}
                />
                <span className="text-3xl mb-2">📸</span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  {photoDataUrl ? 'Change Selected Still' : 'Drop Single Image or Click to Browse'}
                </p>
                <p className="font-mono text-[10.5px] text-secondary mt-1">
                  Supports JPG, PNG, WebP • Auto-detects aspect ratio &amp; optimizes for display
                </p>
              </div>

              {/* Metadata Form */}
              <form onSubmit={handleDeployQuickPhoto} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                    Still Title / Campaign Name
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

            {/* Live Canvas Card Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-[10px] bg-white/[0.02] border border-white/10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">
                [ LIVE CANVAS CARD PREVIEW ]
              </span>
              {photoDataUrl ? (
                <div className="w-full max-w-[280px] bg-[#faf9f6] text-black rounded-[10px] p-5 shadow-2xl border border-black/10 flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono text-black/60">
                    <span>STILL_DEV.IMG</span>
                    <span className="px-2 py-0.5 rounded-[10px] bg-black/10 font-bold">{photoAspect.aspectLabel}</span>
                  </div>
                  <div className={`w-full ${photoAspect.aspectClass} rounded-[8px] overflow-hidden bg-black/5`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base uppercase leading-tight">
                      {photoTitle || 'Untitled Still'}
                    </h3>
                    <p className="font-mono text-[11px] text-black/70 mt-0.5">{photoDiscipline}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-secondary font-mono text-xs py-16">
                  Select an image above to see live preview
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 02: QUICK REEL / VIDEO DROP                              */}
        {/* ============================================================ */}
        {activeTab === 'quick_reel' && (
          <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                  Deploy Single Reel / Video Cut
                </h2>
                <p className="font-mono text-xs text-secondary mt-1">
                  Deploy standalone 9:16 vertical reels, cinematics, or video clips with cover posters and stream links.
                </p>
              </div>

              {/* Reel Poster Image Drop */}
              <div
                onClick={() => reelCoverInputRef.current?.click()}
                className={`w-full h-48 rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  reelCoverUrl
                    ? 'border-[#0055ff]/60 bg-white/[0.02]'
                    : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={reelCoverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProcessImage(file, (dataUrl) => {
                        setReelCoverUrl(dataUrl);
                        if (!reelTitle) setReelTitle(file.name.replace(/\.[^/.]+$/, ''));
                      });
                    }
                  }}
                />
                <span className="text-3xl mb-2">🎬</span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  {reelCoverUrl ? 'Change Reel Poster Frame' : 'Upload Reel Poster Frame'}
                </p>
                <p className="font-mono text-[10.5px] text-secondary mt-1">
                  9:16 vertical poster or 16:9 cinema frame
                </p>
              </div>

              <form onSubmit={handleDeployQuickReel} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                    Reel / Cut Title
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
                    Video Stream / Cloud Link (MP4 / Vimeo / R2)
                  </label>
                  <input
                    type="text"
                    value={reelVideoLink}
                    onChange={(e) => setReelVideoLink(e.target.value)}
                    placeholder="https://.../video.mp4 or Vimeo link (optional)"
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
                      <option value="9/16">9:16 Vertical Reel (TikTok/IG/Shorts)</option>
                      <option value="16/9">16:9 Cinema / Commercial Master</option>
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

            {/* Live Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-[10px] bg-white/[0.02] border border-white/10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">
                [ LIVE REEL CARD PREVIEW ]
              </span>
              {reelCoverUrl ? (
                <div className={`w-full ${reelAspectChoice === '9/16' ? 'max-w-[220px]' : 'max-w-[320px]'} bg-[#faf9f6] text-black rounded-[10px] p-4 shadow-2xl border border-black/10 flex flex-col justify-between space-y-3`}>
                  <div className="flex justify-between items-center text-[10px] font-mono text-black/60">
                    <span>REEL_MASTER.MOV</span>
                    <span className="px-2 py-0.5 rounded-[10px] bg-blue-100 text-blue-800 font-bold">{reelAspectChoice}</span>
                  </div>
                  <div className={`w-full ${reelAspectChoice === '9/16' ? 'aspect-[9/16]' : 'aspect-[16/9]'} rounded-[8px] overflow-hidden bg-black/10 relative`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reelCoverUrl} alt="Reel Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center pl-0.5 font-bold shadow-md">▶</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase leading-tight">
                      {reelTitle || 'Untitled Reel'}
                    </h3>
                    <p className="font-mono text-[10.5px] text-black/70 mt-0.5">{reelDiscipline}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-secondary font-mono text-xs py-16">
                  Upload a poster frame to see live reel preview
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 03: FULL PROJECT CASE ARCHIVE                            */}
        {/* ============================================================ */}
        {activeTab === 'full_project' && (
          <div className="pt-8 space-y-8">
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                  Deploy Full Case Study Folder
                </h2>
                <p className="font-mono text-xs text-secondary mt-1">
                  Create a complete multi-photo client archive folder with deliverables, role, and gallery lightbox.
                </p>
              </div>

              <div
                onClick={() => projCoverInputRef.current?.click()}
                className={`w-full h-44 rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  projCoverUrl
                    ? 'border-white/60 bg-white/[0.02]'
                    : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={projCoverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProcessImage(file, (dataUrl) => {
                        setProjCoverUrl(dataUrl);
                        if (!projName) setProjName(file.name.replace(/\.[^/.]+$/, ''));
                      });
                    }
                  }}
                />
                <span className="text-3xl mb-2">📁</span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  {projCoverUrl ? 'Change Folder Hero Cover' : 'Upload Primary Case Cover'}
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
                      Role
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
                    placeholder="Short editorial summary of the creative direction and visual challenges..."
                    className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-white outline-none font-mono text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!projCoverUrl}
                  className="w-full py-3.5 rounded-[10px] bg-white text-black hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Deploy Project Folder to Infinite Canvas ↗
                </button>
              </form>
            </div>

            {/* Currently Deployed Custom Items */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="font-display font-black text-xl uppercase tracking-tight mb-4">
                Currently Deployed Custom Items ({deployedFiles.length})
              </h3>
              {deployedFiles.length === 0 ? (
                <p className="font-mono text-xs text-secondary">
                  No custom items deployed yet. Default portfolio archive files are currently active.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {deployedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-[10px] bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img} alt={item.name} className="w-12 h-12 rounded-[6px] object-cover shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-mono text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="font-mono text-[10px] text-secondary">{item.discipline}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCanvasItem(item.id, item.name)}
                        className="px-2.5 py-1 rounded-[6px] bg-red-500/10 hover:bg-red-500/30 text-red-400 font-mono text-[11px] shrink-0 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 04: JOURNAL & ESSAYS                                     */}
        {/* ============================================================ */}
        {activeTab === 'journal' && (
          <div className="pt-8 space-y-6 max-w-4xl">
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                Editorial Journal &amp; Articles
              </h2>
              <p className="font-mono text-xs text-secondary mt-1">
                Published directorial essays and industry perspectives ({blogPosts.length} articles live).
              </p>
            </div>

            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div
                  key={post.slug}
                  className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-mono text-[10px] text-[#ff2a2a] uppercase font-bold tracking-wider">
                      {post.category} • {post.date}
                    </span>
                    <h3 className="font-display font-black text-lg text-white mt-1">
                      {post.title}
                    </h3>
                    <p className="font-mono text-xs text-secondary line-clamp-2 mt-1">
                      {post.excerpt}
                    </p>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="px-4 py-2 rounded-[10px] bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs uppercase font-semibold transition-all shrink-0 text-center"
                  >
                    Read Article ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 05: SEO & ANALYTICS SUITE (The 8 requested tools)        */}
        {/* ============================================================ */}
        {activeTab === 'seo_analytics' && (
          <div className="pt-8 space-y-8 max-w-5xl">
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                SEO, Indexing &amp; Web Analytics Suite
              </h2>
              <p className="font-mono text-xs text-secondary mt-1">
                Configure meta tags and tracking IDs for the 8 essential free SEO &amp; analytics tools.
              </p>
            </div>

            <form onSubmit={handleSaveSeo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Google Search Console */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      01 // Google Search Console
                    </span>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Open Console ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Monitors Google index status, keyword rankings, and search impressions.
                  </p>
                  <div>
                    <label className="block font-mono text-[10px] text-secondary uppercase mb-1">
                      HTML Verification Code / Tag
                    </label>
                    <input
                      type="text"
                      value={seoConfig.googleSearchConsole || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, googleSearchConsole: e.target.value })}
                      placeholder="e.g. google-site-verification=abc123xyz"
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* 2. Google Analytics 4 (GA4) */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      02 // Google Analytics 4
                    </span>
                    <a
                      href="https://analytics.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Open GA4 ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Real-time audience tracking, user retention, bounce rate, and visitor locations.
                  </p>
                  <div>
                    <label className="block font-mono text-[10px] text-secondary uppercase mb-1">
                      Measurement ID
                    </label>
                    <input
                      type="text"
                      value={seoConfig.ga4MeasurementId || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, ga4MeasurementId: e.target.value })}
                      placeholder="e.g. G-XXXXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* 3. Google Tag Manager (GTM) */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      03 // Google Tag Manager
                    </span>
                    <a
                      href="https://tagmanager.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Open GTM ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Manage all marketing and conversion tags in one container without redeploying code.
                  </p>
                  <div>
                    <label className="block font-mono text-[10px] text-secondary uppercase mb-1">
                      GTM Container ID
                    </label>
                    <input
                      type="text"
                      value={seoConfig.gtmContainerId || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, gtmContainerId: e.target.value })}
                      placeholder="e.g. GTM-XXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* 4. Microsoft Clarity */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      04 // Microsoft Clarity
                    </span>
                    <a
                      href="https://clarity.microsoft.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Open Clarity ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Free user session replays, click heatmaps, and scroll depth tracking (100% free forever).
                  </p>
                  <div>
                    <label className="block font-mono text-[10px] text-secondary uppercase mb-1">
                      Clarity Project ID
                    </label>
                    <input
                      type="text"
                      value={seoConfig.microsoftClarityId || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, microsoftClarityId: e.target.value })}
                      placeholder="e.g. xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* 5. Bing Webmaster Tools */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      05 // Bing Webmaster Tools
                    </span>
                    <a
                      href="https://www.bing.com/webmasters"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Open Bing ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Powers indexing on Bing, Yahoo, and DuckDuckGo search engines.
                  </p>
                  <div>
                    <label className="block font-mono text-[10px] text-secondary uppercase mb-1">
                      msvalidate.01 Meta Tag Code
                    </label>
                    <input
                      type="text"
                      value={seoConfig.bingVerification || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, bingVerification: e.target.value })}
                      placeholder="e.g. 1234ABCD5678EFGH"
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* 6. Ahrefs Webmaster Tools */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      06 // Ahrefs Webmaster Tools
                    </span>
                    <a
                      href="https://ahrefs.com/webmaster-tools"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Open Ahrefs ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Free technical SEO health audit, backlink analysis, and organic keyword tracking.
                  </p>
                  <div>
                    <label className="block font-mono text-[10px] text-secondary uppercase mb-1">
                      Ahrefs Verification Key
                    </label>
                    <input
                      type="text"
                      value={seoConfig.ahrefsVerification || ''}
                      onChange={(e) => setSeoConfig({ ...seoConfig, ahrefsVerification: e.target.value })}
                      placeholder="e.g. ahrefs-site-verification_..."
                      className="w-full px-3.5 py-2.5 rounded-[8px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                    />
                  </div>
                </div>

                {/* 7. Screaming Frog SEO Spider */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      07 // Screaming Frog Spider
                    </span>
                    <a
                      href="https://www.screamingfrog.co.uk/seo-spider/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Download App ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Desktop crawler software to crawl up to 500 URLs for broken links (404s), redirect loops, and image ALT tag audits.
                  </p>
                  <div className="p-3 rounded-[6px] bg-white/5 font-mono text-[10.5px] text-white/80 space-y-1">
                    <p className="text-[#ff2a2a] font-bold">Recommended Local Command:</p>
                    <p className="select-all">Target URL: https://moizcreates.com</p>
                  </div>
                </div>

                {/* 8. PageSpeed Insights */}
                <div className="p-5 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      08 // PageSpeed Insights
                    </span>
                    <a
                      href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fmoizcreates.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#ff2a2a] hover:underline"
                    >
                      Run Live Audit ↗
                    </a>
                  </div>
                  <p className="font-mono text-[11px] text-secondary">
                    Measures Google Core Web Vitals (LCP, INP, CLS) on mobile and desktop devices.
                  </p>
                  <div className="p-3 rounded-[6px] bg-white/5 font-mono text-[10.5px] text-white/80">
                    <p className="text-emerald-400 font-bold">Target Metrics:</p>
                    <p>LCP &lt; 1.2s • INP &lt; 50ms • CLS = 0.00</p>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-[10px] bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xl cursor-pointer"
              >
                Save SEO &amp; Analytics Configuration ↗
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 06: SYSTEM & CLOUD BACKEND RESEARCH                      */}
        {/* ============================================================ */}
        {activeTab === 'system' && (
          <div className="pt-8 space-y-8 max-w-4xl">
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                System Config &amp; Cloud Architecture
              </h2>
              <p className="font-mono text-xs text-secondary mt-1">
                Manage local engine settings, Gemini intelligence keys, and cloud database migration.
              </p>
            </div>

            {/* Studio Passcode Configuration */}
            <div className="p-6 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
              <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                <span>Studio Desk Access Passcode</span>
                <span className="text-[10px] text-emerald-400 font-normal">[PROTECTED]</span>
              </span>
              <p className="font-mono text-[11px] text-secondary">
                Guards your backend with a security gate so the public cannot view or edit anything. Master passcode: <code className="text-white">7741</code>, or customize below:
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customPasscode}
                  onChange={(e) => setCustomPasscode(e.target.value)}
                  placeholder="e.g. your-secret-code"
                  className="flex-1 px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomPasscode}
                  className="px-6 py-3 rounded-[10px] bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Update Passcode
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="p-6 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-3">
              <span className="font-mono text-xs font-bold text-white uppercase">
                Gemini 2.5 Intelligence Key
              </span>
              <p className="font-mono text-[11px] text-secondary">
                Enables automated copy generation, metadata titling, and smart portfolio assistants.
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                />
                <button
                  onClick={() => {
                    saveApiKey(apiKey);
                    showNotice('SUCCESS: Gemini API Key saved locally.');
                  }}
                  className="px-6 py-3 rounded-[10px] bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Save Key
                </button>
              </div>
            </div>

            {/* Production Architecture Roadmap */}
            <div className="p-6 rounded-[10px] bg-white/[0.02] border border-white/10 space-y-4">
              <span className="font-mono text-xs font-bold text-[#ff2a2a] uppercase tracking-wider">
                Production Backend Recommendation: Supabase + Cloudflare R2
              </span>
              <p className="font-mono text-xs text-white/90 leading-relaxed">
                For a media-heavy creative director site with 4K reels and uncompressed RAW photo stills, the optimal zero-cost production stack is:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-[8px] bg-white/5 border border-white/5 font-mono text-xs space-y-1.5">
                  <p className="text-white font-bold">1. Cloudflare R2 Storage</p>
                  <p className="text-secondary text-[11px]">
                    10GB free tier • <strong className="text-white">Zero bandwidth egress fees</strong> • Perfect for streaming high-bitrate MP4 reels globally at ultra-fast speeds.
                  </p>
                </div>
                <div className="p-4 rounded-[8px] bg-white/5 border border-white/5 font-mono text-xs space-y-1.5">
                  <p className="text-white font-bold">2. Supabase PostgreSQL</p>
                  <p className="text-secondary text-[11px]">
                    Free 500MB database • Instant REST &amp; GraphQL APIs • Seamlessly syncs portfolio projects across any mobile or desktop device.
                  </p>
                </div>
              </div>
              <p className="font-mono text-[10.5px] text-secondary pt-1">
                A complete architectural guide has been generated in your workspace under <code className="text-white">backend_architecture_research.md</code>.
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
