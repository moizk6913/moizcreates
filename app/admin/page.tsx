'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import {
  DynamicCanvasFile,
  getStoredCanvasFiles,
  getStoredCanvasFilesAsync,
  saveCanvasFileAsync,
  deleteCanvasFile,
  getStoredSeoConfig,
  saveSeoConfig,
  SeoConfig,
} from '@/lib/contentStore';

type AdminTab = 'upload' | 'manage' | 'settings';

export interface UploadedAsset {
  dataUrl: string;
  name: string;
  aspectClass: string;
  aspectLabel: string;
  category: 'social' | 'lookbook' | 'banner' | 'square';
}

function detectAspectAndCategory(w: number, h: number): {
  aspectClass: string;
  aspectLabel: string;
  category: 'social' | 'lookbook' | 'banner' | 'square';
} {
  const ratio = w / h;
  if (ratio >= 1.45) {
    return { aspectClass: 'aspect-[16/9]', aspectLabel: '16:9 Banner', category: 'banner' };
  }
  if (ratio >= 1.15) {
    return { aspectClass: 'aspect-[4/3]', aspectLabel: '4:3 Screen', category: 'banner' };
  }
  if (ratio >= 0.88 && ratio <= 1.14) {
    return { aspectClass: 'aspect-[1/1]', aspectLabel: '1:1 Square Feed', category: 'square' };
  }
  if (ratio >= 0.65 && ratio < 0.88) {
    return { aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Lookbook', category: 'lookbook' };
  }
  return { aspectClass: 'aspect-[9/16]', aspectLabel: '9:16 Social Reel', category: 'social' };
}

const isImageFile = (file: File): boolean => {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'bmp'].includes(ext);
};

// Client-side image compressor with aspect & category detection
const compressAsset = (file: File, maxDim = 1000, quality = 0.76): Promise<UploadedAsset | null> => {
  return new Promise((resolve) => {
    if (!isImageFile(file)) {
      resolve(null);
      return;
    }

    const timeout = setTimeout(() => resolve(null), 8000);
    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        clearTimeout(timeout);
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        clearTimeout(timeout);
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const detection = detectAspectAndCategory(width, height);

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve({
              dataUrl: canvas.toDataURL('image/jpeg', quality),
              name: file.name,
              aspectClass: detection.aspectClass,
              aspectLabel: detection.aspectLabel,
              category: detection.category,
            });
            return;
          }
        } catch {
          // Canvas fallback
        }

        resolve({
          dataUrl: src,
          name: file.name,
          aspectClass: detection.aspectClass,
          aspectLabel: detection.aspectLabel,
          category: detection.category,
        });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
      img.src = src;
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };

    reader.readAsDataURL(file);
  });
};

const STAMP_OPTIONS = [
  { flag: '🇮🇹', code: 'IT', label: 'Milan' },
  { flag: '🇯🇵', code: 'JPN', label: 'Tokyo' },
  { flag: '🇫🇷', code: 'PAR', label: 'Paris' },
  { flag: '🇬🇧', code: 'LDN', label: 'London' },
  { flag: '🇨🇭', code: 'ZRH', label: 'Zurich' },
  { flag: '🇦🇪', code: 'DXB', label: 'Dubai' },
  { flag: '🇩🇪', code: 'STR', label: 'Stuttgart' },
  { flag: '🇺🇸', code: 'NYC', label: 'New York' },
];

const STICKER_OPTIONS: Array<{ type: any; label: string }> = [
  { type: 'lemon', label: 'Lemon' },
  { type: 'torii', label: 'Torii Gate' },
  { type: 'eiffel', label: 'Eiffel Tower' },
  { type: 'tulip', label: 'Tulip' },
  { type: 'camera', label: 'Rangefinder' },
  { type: 'film', label: '35mm Film' },
  { type: 'car', label: 'Sports Car' },
  { type: 'airplane', label: 'Jetliner' },
  { type: 'flame', label: 'Flame' },
  { type: 'sneaker', label: 'Sneaker' },
  { type: 'diamond', label: 'Diamond' },
];

export default function AdminPage() {
  // Passcode Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('upload');

  // Campaign Upload State
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState('');
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Form Fields
  const [campaignTitle, setCampaignTitle] = useState('');
  const [clientBrand, setClientBrand] = useState('');
  const [year, setYear] = useState('2026');
  const [discipline, setDiscipline] = useState('Social Media Ads & Campaign Graphics');
  const [role, setRole] = useState('Art Director & Visual Designer');
  const [narrative, setNarrative] = useState('');
  const [deliverablesInput, setDeliverablesInput] = useState(
    'Social Media Ads (9:16), Editorial Lookbook (4:5), Print Media, Campaign Banners'
  );
  const [selectedStamp, setSelectedStamp] = useState(STAMP_OPTIONS[0]);
  const [selectedSticker, setSelectedSticker] = useState(STICKER_OPTIONS[0].type);

  // Live Work State
  const [liveFiles, setLiveFiles] = useState<DynamicCanvasFile[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // SEO & Passcode Settings
  const [seo, setSeo] = useState<SeoConfig>({});
  const [seoSaved, setSeoSaved] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  // Hidden File & Folder Input Refs
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Check Session Unlock on Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem('moiz_admin_unlocked');
      if (unlocked === 'true') {
        setIsUnlocked(true);
      }
    }
  }, []);

  // Hydrate Live Work & Settings when unlocked
  useEffect(() => {
    if (!isUnlocked) return;
    refreshLiveWork();
    setSeo(getStoredSeoConfig());
  }, [isUnlocked]);

  const refreshLiveWork = () => {
    const cached = getStoredCanvasFiles();
    setLiveFiles(cached);
    getStoredCanvasFilesAsync()
      .then((full) => {
        if (full && full.length > 0) {
          setLiveFiles(full);
        }
      })
      .catch(console.warn);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = typeof window !== 'undefined' ? localStorage.getItem('moiz_admin_passcode') : null;
    const requiredPasscode = stored || '7741';

    if (passcode === requiredPasscode) {
      setIsUnlocked(true);
      setPasscodeError('');
      sessionStorage.setItem('moiz_admin_unlocked', 'true');
    } else {
      setPasscodeError('ACCESS DENIED: Invalid passcode key.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('moiz_admin_unlocked');
  };

  // Process Batch of Files (supports 88+ images seamlessly)
  const processFiles = async (rawFiles: FileList | File[]) => {
    const fileArray = Array.from(rawFiles).filter(isImageFile);
    if (fileArray.length === 0) {
      alert('No supported image files found. Please select JPG, PNG, WEBP, or AVIF files.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Auto-detect campaign title from first file's directory if available
    const firstFile = fileArray[0] as any;
    if (firstFile.webkitRelativePath) {
      const parts = firstFile.webkitRelativePath.split('/');
      if (parts.length > 1 && !campaignTitle) {
        const folderName = parts[0];
        setCampaignTitle(folderName);
        if (!clientBrand) setClientBrand(folderName);
        if (!narrative) {
          setNarrative(
            `Comprehensive multi-channel campaign directed for ${folderName}, executed across vertical social ads, lookbook spreads, and high-impact print media.`
          );
        }
      }
    }

    const compressed: UploadedAsset[] = [];
    const total = fileArray.length;

    // Process in batches of 4 to keep UI buttery smooth
    for (let i = 0; i < total; i += 4) {
      const chunk = fileArray.slice(i, i + 4);
      const results = await Promise.all(chunk.map((f) => compressAsset(f, 900, 0.74)));
      for (const res of results) {
        if (res) compressed.push(res);
      }
      setProcessingProgress(Math.round(((i + chunk.length) / total) * 100));
    }

    setUploadedAssets((prev) => [...prev, ...compressed]);
    setIsProcessing(false);
    setPublishSuccess(null);
  };

  // Category counts
  const categoryCounts = {
    social: uploadedAssets.filter((a) => a.category === 'social').length,
    lookbook: uploadedAssets.filter((a) => a.category === 'lookbook').length,
    banner: uploadedAssets.filter((a) => a.category === 'banner').length,
    square: uploadedAssets.filter((a) => a.category === 'square').length,
  };

  // 1-Click Publish to Canvas and Portfolio
  const handlePublish = async () => {
    if (uploadedAssets.length === 0) {
      alert('Please upload at least one image asset first.');
      return;
    }

    const finalTitle = campaignTitle.trim() || 'Untitled Campaign';
    const finalBrand = clientBrand.trim() || finalTitle;
    const finalId = `camp-${Date.now()}-${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const code = `FILE_${String(Math.floor(Math.random() * 89 + 10)).padStart(2, '0')}.DIR`;

    const deliverablesList = deliverablesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const photosList = uploadedAssets.map((a) => a.dataUrl);
    const coverPhoto = uploadedAssets[coverIndex]?.dataUrl || photosList[0];

    setIsPublishing(true);
    setPublishProgress(`Storing ${photosList.length} assets safely in IndexedDB...`);

    const newCanvasFile: DynamicCanvasFile = {
      id: finalId,
      code,
      name: finalTitle,
      discipline: discipline.trim() || 'Creative Direction • Campaign',
      year: year.trim() || '2026',
      role: role.trim() || 'Art Director',
      x: Math.floor(Math.random() * 800 - 400),
      y: Math.floor(Math.random() * 600 - 300),
      rot: Number((Math.random() * 6 - 3).toFixed(1)),
      img: coverPhoto,
      aspect: uploadedAssets[coverIndex]?.aspectClass || 'aspect-[4/5]',
      colorTag: 'bg-[#121212]',
      assetType: 'folder',
      photos: photosList,
      photoCount: photosList.length,
      stickers: {
        stamp: {
          flag: selectedStamp.flag,
          countryCode: selectedStamp.code,
          bgColor: '#ffffff',
        },
        sticker: {
          type: selectedSticker,
          name: finalBrand,
        },
      },
      desc:
        narrative.trim() ||
        `Directorial campaign for ${finalBrand}, spanning vertical social media ads (9:16), editorial lookbook layouts, and print brand collateral.`,
      deliverables:
        deliverablesList.length > 0
          ? deliverablesList
          : ['Social Media Ads (9:16)', 'Lookbook Spreads', 'Print Media', 'Campaign Graphics'],
    };

    try {
      await saveCanvasFileAsync(newCanvasFile);
      setIsPublishing(false);
      setPublishSuccess(
        `✓ Campaign "${finalTitle}" published successfully with ${photosList.length} assets!`
      );
      refreshLiveWork();
    } catch (err) {
      console.error(err);
      setIsPublishing(false);
      alert('Error saving campaign. Please check console.');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      deleteCanvasFile(id);
      setTimeout(() => {
        refreshLiveWork();
        setDeletingId(null);
      }, 300);
    } catch {
      setDeletingId(null);
    }
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    saveSeoConfig(seo);
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 2500);
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length < 4) {
      alert('Passcode must be at least 4 characters.');
      return;
    }
    localStorage.setItem('moiz_admin_passcode', newPasscode.trim());
    setPasscodeSaved(true);
    setNewPasscode('');
    setTimeout(() => setPasscodeSaved(false), 2500);
  };

  // If Locked: Clean Brutalist Black & White Passcode Screen
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
        <CustomCursor />
        <div className="w-full max-w-md bg-[#121215] border border-white/10 rounded-[12px] p-6 sm:p-8 shadow-2xl">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] text-white/70 uppercase tracking-widest">
              <span>●</span> STUDIO SYSTEM ACCESS
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight uppercase">
              MOIZ KHAN STUDIO
            </h1>
            <p className="font-mono text-xs text-white/50">
              Enter your master authorization passcode to manage portfolio assets.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-white/60 mb-1.5">
                Passcode Key
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (e.g. 7741)"
                autoFocus
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-[8px] font-mono text-sm tracking-widest text-center text-white placeholder-white/25 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
            </div>

            {passcodeError && (
              <p className="font-mono text-xs text-red-400 text-center font-bold">{passcodeError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[8px] hover:bg-neutral-200 active:scale-98 transition-all cursor-pointer shadow-md"
            >
              UNLOCK STUDIO CMS [↵]
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-white/40">
            <span>DEFAULT: 7741</span>
            <Link href="/" className="hover:text-white transition-colors">
              ← Return to Portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white select-none font-sans pb-24">
      <CustomCursor />

      {/* Hidden File Upload Inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        // @ts-ignore
        directory=""
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
        }}
      />
      <input
        ref={filesInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
        }}
      />

      {/* Top Black & White Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-display font-black text-sm sm:text-base tracking-tight hover:text-neutral-300 transition-colors uppercase"
          >
            MOIZ KHAN <span className="font-mono font-normal text-xs text-neutral-400">/ STUDIO CMS</span>
          </Link>
          <span className="hidden md:inline-block font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            ● SYSTEM ACTIVE
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#141417] p-1 rounded-[8px] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 sm:px-4 py-1.5 rounded-[6px] font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            01. Upload Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`px-3 sm:px-4 py-1.5 rounded-[6px] font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            02. Live Work ({liveFiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 sm:px-4 py-1.5 rounded-[6px] font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            03. Settings
          </button>
        </div>

        {/* Direct Action Links */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            href="/canvas"
            target="_blank"
            className="px-3 py-1.5 rounded-[6px] bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-200 transition-all cursor-pointer"
          >
            View Canvas ↗
          </Link>
          <button
            type="button"
            onClick={handleLock}
            className="px-3 py-1.5 rounded-[6px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer font-bold"
            title="Lock Admin Session"
          >
            Lock ⎋
          </button>
        </div>
      </header>

      {/* TAB 1: UPLOAD STUDIO */}
      {activeTab === 'upload' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 space-y-8">
          {/* Section Heading */}
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase block">
                DIRECT CAMPAIGN PUBLISHER
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                Upload &amp; Direct Campaign
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-400">
              Supports 88+ Assets • IndexedDB 500MB+ Engine
            </span>
          </div>

          {/* Success Banner */}
          {publishSuccess && (
            <div className="p-4 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col sm:flex-row justify-between items-center gap-3 animate-fadeIn">
              <span className="font-mono text-xs sm:text-sm font-bold">{publishSuccess}</span>
              <div className="flex gap-2">
                <Link
                  href="/canvas"
                  target="_blank"
                  className="px-3.5 py-1.5 rounded-[6px] bg-emerald-500 text-black font-mono text-xs font-bold hover:bg-emerald-400 transition-all"
                >
                  OPEN ON CANVAS →
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="px-3.5 py-1.5 rounded-[6px] bg-white/10 text-white font-mono text-xs font-bold hover:bg-white/20 transition-all"
                >
                  VIEW PORTFOLIO →
                </Link>
              </div>
            </div>
          )}

          {/* Main Dropzone Container */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
            }}
            className="relative rounded-[12px] border-2 border-dashed border-white/20 hover:border-white/50 bg-[#121215] p-6 sm:p-10 transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📁
            </div>

            <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight">
              Drag &amp; Drop Campaign Folder or Assets Here
            </h3>
            <p className="font-mono text-xs text-neutral-400 mt-1 max-w-lg leading-relaxed">
              Drop entire folders (like <span className="text-white font-bold">Kaldhar</span> with 88
              photos), multi-channel social ads, or select pictures directly from your computer.
            </p>

            {/* Direct Action Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-5 py-3 rounded-[8px] bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>📁</span> SELECT CAMPAIGN FOLDER (38+ PHOTOS)
              </button>
              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="px-5 py-3 rounded-[8px] bg-[#222227] hover:bg-[#2b2b32] text-white border border-white/15 font-mono font-bold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>🖼️</span> SELECT INDIVIDUAL PHOTOS (CTRL+A)
              </button>
            </div>

            {/* Live Processing Progress Bar */}
            {isProcessing && (
              <div className="w-full max-w-md mt-6 space-y-2">
                <div className="flex justify-between font-mono text-xs text-neutral-300">
                  <span>Optimizing and analyzing assets...</span>
                  <span className="font-bold">{processingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-200"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Assets Breakdown & Thumbnail Grid */}
          {uploadedAssets.length > 0 && (
            <div className="bg-[#121215] border border-white/10 rounded-[12px] p-5 sm:p-7 space-y-6">
              {/* Asset Metrics Header */}
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-base uppercase">
                    Ready to Publish:
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white text-black font-bold">
                    {uploadedAssets.length} Assets Loaded
                  </span>
                </div>

                {/* Categorization Badges */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  {categoryCounts.social > 0 && (
                    <span className="px-2.5 py-1 rounded-[6px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      📱 9:16 Social: {categoryCounts.social}
                    </span>
                  )}
                  {categoryCounts.lookbook > 0 && (
                    <span className="px-2.5 py-1 rounded-[6px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      📖 4:5 Lookbook: {categoryCounts.lookbook}
                    </span>
                  )}
                  {categoryCounts.banner > 0 && (
                    <span className="px-2.5 py-1 rounded-[6px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      🖥️ 16:9 Banner: {categoryCounts.banner}
                    </span>
                  )}
                  {categoryCounts.square > 0 && (
                    <span className="px-2.5 py-1 rounded-[6px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ⬜ 1:1 Feed: {categoryCounts.square}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setUploadedAssets([])}
                  className="font-mono text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Clear All [✕]
                </button>
              </div>

              {/* Photo Thumbnails Strip / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[360px] overflow-y-auto p-1 no-scrollbar">
                {uploadedAssets.map((asset, idx) => {
                  const isCover = coverIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setCoverIndex(idx)}
                      className={`relative rounded-[8px] overflow-hidden border transition-all cursor-pointer group bg-black/40 ${
                        isCover ? 'border-white ring-2 ring-white/50' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.dataUrl}
                        alt={asset.name}
                        className="w-full h-24 sm:h-28 object-cover block group-hover:scale-105 transition-transform"
                      />

                      {/* Format Badge */}
                      <span className="absolute bottom-1 left-1 font-mono text-[8px] px-1.5 py-0.5 rounded bg-black/80 text-white/90">
                        {asset.aspectLabel.split(' ')[0]}
                      </span>

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-1 left-1 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-white text-black">
                          COVER
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedAssets((prev) => prev.filter((_, i) => i !== idx));
                          if (coverIndex === idx) setCoverIndex(0);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="font-mono text-[10px] text-neutral-400">
                Tip: Click any photo above to set it as the front cover plate for this campaign folder.
              </p>
            </div>
          )}

          {/* Campaign Metadata Fields Form */}
          <div className="bg-[#121215] border border-white/10 rounded-[12px] p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-black text-lg uppercase tracking-tight border-b border-white/10 pb-3">
              Campaign Information &amp; Archival Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Campaign Title */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Kaldhar Heritage Bridal Collection"
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all"
                />
              </div>

              {/* Client / Brand */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Client / Brand *
                </label>
                <input
                  type="text"
                  value={clientBrand}
                  onChange={(e) => setClientBrand(e.target.value)}
                  placeholder="e.g. Kaldhar"
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all"
                />
              </div>

              {/* Discipline */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Discipline / Category
                </label>
                <input
                  type="text"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  placeholder="e.g. Social Media Ads • Editorial Lookbook • Print"
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all"
                />
              </div>

              {/* Year & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                    Year
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Art Director"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Scope of Deliverables */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                Scope of Deliverables (comma separated)
              </label>
              <input
                type="text"
                value={deliverablesInput}
                onChange={(e) => setDeliverablesInput(e.target.value)}
                placeholder="Social Media Ads (9:16), Lookbook Spreads (4:5), Print Media, Campaign Banners"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Social Media Ads (9:16)',
                  'Editorial Lookbook (4:5)',
                  'Print Media & Billboards',
                  'Motion Video Reels',
                  'Typography & Layout',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!deliverablesInput.includes(tag)) {
                        setDeliverablesInput((prev) => (prev ? `${prev}, ${tag}` : tag));
                      }
                    }}
                    className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Directorial Narrative */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                Directorial Narrative / Campaign Story
              </label>
              <textarea
                rows={3}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Describe the aesthetic concept, visual treatment, and multi-channel campaign direction..."
                className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white transition-all resize-none"
              />
            </div>

            {/* Folder Customization: Stamp & Sticker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-white/10">
              {/* Stamp Select */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Archival Postage Stamp
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAMP_OPTIONS.map((stamp) => (
                    <button
                      key={stamp.code}
                      type="button"
                      onClick={() => setSelectedStamp(stamp)}
                      className={`px-3 py-1.5 rounded-[6px] border font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedStamp.code === stamp.code
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black/50 text-neutral-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span>{stamp.flag}</span>
                      <span>{stamp.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticker Select */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Tactile Die-Cut Sticker
                </label>
                <div className="flex flex-wrap gap-2">
                  {STICKER_OPTIONS.map((sticker) => (
                    <button
                      key={sticker.type}
                      type="button"
                      onClick={() => setSelectedSticker(sticker.type)}
                      className={`px-3 py-1.5 rounded-[6px] border font-mono text-xs cursor-pointer transition-all ${
                        selectedSticker === sticker.type
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black/50 text-neutral-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {sticker.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Big Publish Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={isPublishing || uploadedAssets.length === 0}
                onClick={handlePublish}
                className="w-full py-4 bg-white text-black font-display font-black text-sm sm:text-base uppercase tracking-wider rounded-[8px] hover:bg-neutral-200 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl cursor-pointer flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <span>{publishProgress || 'Publishing to Database...'}</span>
                ) : (
                  <span>✦ PUBLISH CAMPAIGN TO PORTFOLIO &amp; ARCHIVE</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE LIVE WORK */}
      {activeTab === 'manage' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 space-y-6">
          <div className="border-b border-white/10 pb-4 flex justify-between items-end">
            <div>
              <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase block">
                ACTIVE WORK DATABASE
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                Manage Live Campaigns
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-400">
              {liveFiles.length} Total Campaigns
            </span>
          </div>

          {liveFiles.length === 0 ? (
            <div className="p-12 rounded-[12px] bg-[#121215] border border-white/10 text-center space-y-3">
              <p className="font-mono text-sm text-neutral-400">
                No custom campaigns published yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2 bg-white text-black font-mono text-xs font-bold rounded-[6px] uppercase"
              >
                Upload First Campaign →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveFiles.map((file) => (
                <div
                  key={file.id}
                  className="rounded-[10px] bg-[#121215] border border-white/10 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-white/30 transition-all"
                >
                  <div className="flex gap-4 items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.img}
                      alt={file.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-[8px] object-cover bg-black flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-base uppercase leading-tight">
                          {file.name}
                        </h4>
                      </div>
                      <p className="font-mono text-xs text-neutral-400">
                        {file.discipline} • {file.year}
                      </p>
                      <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                        {file.photoCount || (file.photos ? file.photos.length : 0)} photos stored
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10 font-mono text-xs">
                    <Link
                      href="/canvas"
                      target="_blank"
                      className="text-white hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>View on Canvas</span>
                      <span>↗</span>
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === file.id}
                      onClick={() => handleDeleteCampaign(file.id)}
                      className="text-red-400 hover:text-red-300 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === file.id ? 'Deleting...' : 'Delete Campaign [✕]'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS & PASSCODE */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-8 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase block">
              STUDIO PREFERENCES
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
              Security &amp; SEO Configuration
            </h2>
          </div>

          {/* Master Passcode Update */}
          <div className="bg-[#121215] border border-white/10 rounded-[12px] p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-black text-lg uppercase tracking-tight">
              Change Studio Access Passcode
            </h3>
            <p className="font-mono text-xs text-neutral-400">
              Current default passcode is <span className="text-white font-bold">7741</span>. You can
              update it to any secure PIN.
            </p>

            <form onSubmit={handleUpdatePasscode} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new 4+ digit passcode"
                className="flex-1 px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[8px] hover:bg-neutral-200 transition-all cursor-pointer"
              >
                UPDATE PASSCODE
              </button>
            </form>
            {passcodeSaved && (
              <p className="font-mono text-xs text-emerald-400 font-bold">
                ✓ Passcode successfully updated!
              </p>
            )}
          </div>

          {/* Google SEO & Analytics */}
          <div className="bg-[#121215] border border-white/10 rounded-[12px] p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-black text-lg uppercase tracking-tight">
              Google SEO &amp; Verification Tags
            </h3>
            <p className="font-mono text-xs text-neutral-400">
              Connect Google Search Console, Google Analytics (GA4), or Microsoft Clarity.
            </p>

            <form onSubmit={handleSaveSeo} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={seo.googleSearchConsole || ''}
                  onChange={(e) => setSeo({ ...seo, googleSearchConsole: e.target.value })}
                  placeholder="google-site-verification=..."
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                  GA4 Measurement ID
                </label>
                <input
                  type="text"
                  value={seo.ga4MeasurementId || ''}
                  onChange={(e) => setSeo({ ...seo, ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-[8px] font-mono text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-[8px] hover:bg-neutral-200 transition-all cursor-pointer"
              >
                SAVE SEO TAGS
              </button>
            </form>
            {seoSaved && (
              <p className="font-mono text-xs text-emerald-400 font-bold">
                ✓ SEO configuration saved to portfolio!
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
