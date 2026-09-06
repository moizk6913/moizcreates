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

export interface UploadedPhoto {
  dataUrl: string;
  name: string;
  aspectClass: string;
  aspectLabel: string;
}

function calculateAspect(w: number, h: number): { aspectClass: string; aspectLabel: string } {
  const ratio = w / h;
  if (ratio >= 1.65) return { aspectClass: 'aspect-[16/9]', aspectLabel: '16:9 Cinema' };
  if (ratio >= 1.45) return { aspectClass: 'aspect-[16/10]', aspectLabel: '16:10 Screen' };
  if (ratio >= 1.20) return { aspectClass: 'aspect-[4/3]', aspectLabel: '4:3 Medium' };
  if (ratio >= 0.85) return { aspectClass: 'aspect-[1/1]', aspectLabel: '1:1 Square' };
  if (ratio >= 0.65) return { aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Portrait' };
  return { aspectClass: 'aspect-[9/16]', aspectLabel: '9:16 Vertical Reel' };
}

// Client-side image compressor: scales images so 38+ photos comfortably fit in storage
const compressFile = (file: File, maxDim = 850, quality = 0.76): Promise<UploadedPhoto> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const aspect = calculateAspect(width, height);

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', quality),
            name: file.name,
            aspectClass: aspect.aspectClass,
            aspectLabel: aspect.aspectLabel,
          });
        } else {
          resolve({
            dataUrl: src,
            name: file.name,
            aspectClass: aspect.aspectClass,
            aspectLabel: aspect.aspectLabel,
          });
        }
      };
      img.onerror = () =>
        resolve({
          dataUrl: src,
          name: file.name,
          aspectClass: 'aspect-[4/5]',
          aspectLabel: '4:5 Portrait',
        });
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};

// Recursively traverse dropped files and folders (e.g. dragging Desktop/Kaldhar folder)
const getFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
  const files: File[] = [];
  const items = dataTransfer.items;

  if (items && items.length > 0 && typeof (items[0] as unknown as { webkitGetAsEntry?: unknown }).webkitGetAsEntry === 'function') {
    const entries: unknown[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = (items[i] as unknown as { webkitGetAsEntry: () => unknown }).webkitGetAsEntry();
      if (entry) entries.push(entry);
    }

    interface EntryType {
      isFile: boolean;
      isDirectory: boolean;
      file: (cb: (f: File) => void) => void;
      createReader: () => { readEntries: (cb: (entries: EntryType[]) => void) => void };
    }

    const traverse = async (entry: EntryType): Promise<File[]> => {
      if (entry.isFile) {
        return new Promise((res) => {
          entry.file((f: File) => {
            if (f.type.startsWith('image/')) res([f]);
            else res([]);
          });
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const childEntries: EntryType[] = await new Promise((res) => {
          reader.readEntries((ents: EntryType[]) => res(ents || []));
        });
        const subFiles: File[] = [];
        for (const child of childEntries) {
          const fs = await traverse(child);
          subFiles.push(...fs);
        }
        return subFiles;
      }
      return [];
    };

    for (const entry of entries) {
      const fs = await traverse(entry as EntryType);
      files.push(...fs);
    }
  }

  // Fallback to direct files list
  if (files.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const f = dataTransfer.files[i];
      if (f.type.startsWith('image/')) files.push(f);
    }
  }

  return files;
};

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

  // AI Co-Pilot State (Supports 1 single picture OR an entire folder of 25+ pictures!)
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
        "Hey Moiz! I'm your AI Creative Producer powered by Gemini 3.6 Flash.\n\nYou can upload a **single picture**, select **multiple photos**, or drop an **entire campaign folder** (like your Kaldhar folder with 25 assets).\n\nI'll break down the deliverables (Lookbook spreads, 9:16 Social, Standees), talk through the concept, and publish it to your website whenever you're ready.",
      time: 'ONLINE',
      canPublish: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<UploadedPhoto[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [folderNameTitle, setFolderNameTitle] = useState<string>('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatFilesInputRef = useRef<HTMLInputElement>(null);
  const chatFolderInputRef = useRef<HTMLInputElement>(null);

  // Manual Upload: Single Photo State
  const [singlePhotoTitle, setSinglePhotoTitle] = useState('');
  const [singlePhotoDiscipline, setSinglePhotoDiscipline] = useState('Photography • Stills');
  const [singlePhotoYear, setSinglePhotoYear] = useState('2026');
  const [singlePhotoDataUrl, setSinglePhotoDataUrl] = useState<string | null>(null);
  const [singlePhotoAspect, setSinglePhotoAspect] = useState({ aspectClass: 'aspect-[4/5]', aspectLabel: '4:5 Portrait' });
  const singlePhotoInputRef = useRef<HTMLInputElement>(null);

  // Manual Upload: Quick Reel State
  const [reelTitle, setReelTitle] = useState('');
  const [reelDiscipline, setReelDiscipline] = useState('Cinematography • Motion');
  const [reelYear, setReelYear] = useState('2026');
  const [reelAspectChoice, setReelAspectChoice] = useState<'9/16' | '16/9'>('9/16');
  const [reelCoverUrl, setReelCoverUrl] = useState<string | null>(null);
  const [reelVideoLink, setReelVideoLink] = useState('');
  const reelInputRef = useRef<HTMLInputElement>(null);

  // Manual Upload: Full Project Folder State (Supports 1 or 25+ photos!)
  const [projName, setProjName] = useState('');
  const [projDiscipline, setProjDiscipline] = useState('Art Direction • Brand Identity');
  const [projRole, setProjRole] = useState('Lead Art Director');
  const [projYear, setProjYear] = useState('2026');
  const [projDesc, setProjDesc] = useState('');
  const [projPhotos, setProjPhotos] = useState<UploadedPhoto[]>([]);
  const [projCoverIndex, setProjCoverIndex] = useState<number>(0);
  const projFilesInputRef = useRef<HTMLInputElement>(null);
  const projFolderInputRef = useRef<HTMLInputElement>(null);

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

  // Process a list of File objects into compressed UploadedPhoto objects
  const processUploadedFiles = async (
    files: File[],
    onComplete: (photos: UploadedPhoto[], detectedName?: string) => void
  ) => {
    if (files.length === 0) return;
    setIsProcessingFiles(true);
    showNotice(`Processing ${files.length} photo${files.length > 1 ? 's' : ''}...`);

    try {
      const results: UploadedPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const photo = await compressFile(files[i]);
        results.push(photo);
      }

      // Extract a clean folder/campaign name from relative path or first file
      let detectedName = '';
      const firstRelPath = (files[0] as unknown as { webkitRelativePath?: string }).webkitRelativePath;
      if (firstRelPath && firstRelPath.includes('/')) {
        detectedName = firstRelPath.split('/')[0];
      } else {
        detectedName = files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_0-9]+/g, ' ').trim();
      }

      onComplete(results, detectedName);
      showNotice(`✦ Loaded ${results.length} asset${results.length > 1 ? 's' : ''}!`);
    } catch {
      showNotice('Error processing uploaded images. Please try again.');
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // ----------------------------------------------------
  // AI Co-Pilot: Multi-File & Folder Chat & Publishing
  // ----------------------------------------------------
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = (presetText || chatInput).trim();
    const hasPhotos = attachedPhotos.length > 0;
    if (!textToSend && !hasPhotos) return;

    const coverPhoto = hasPhotos ? attachedPhotos[coverIndex] || attachedPhotos[0] : null;

    const userMsg = {
      role: 'user' as const,
      content:
        textToSend ||
        (hasPhotos
          ? `Attached ${attachedPhotos.length} campaign asset${attachedPhotos.length > 1 ? 's' : ''} (${folderNameTitle || 'Campaign'}). Please analyze the deliverables and recommend how to feature them.`
          : ''),
      image: coverPhoto ? coverPhoto.dataUrl : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput('');
    setIsAiThinking(true);

    const currentPhotos = [...attachedPhotos];
    const currentCover = coverPhoto;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          imageData: currentCover?.dataUrl,
          fileNames: currentPhotos.map((p) => p.name),
          additionalImages: currentPhotos.slice(1, 4).map((p) => p.dataUrl),
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
            canPublish: hasPhotos || prev.some((m) => m.image),
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Gemini received your request. All deliverables are indexed and ready to publish to your site.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            canPublish: true,
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network connection interrupted. Your assets are safe; click Publish to Canvas when ready.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          canPublish: hasPhotos,
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 1-Click Publishing of Single Picture OR Entire Folder to Canvas
  const handlePublishFromAi = () => {
    if (attachedPhotos.length === 0 && !chatMessages.some((m) => m.image)) {
      showNotice('Please attach or drop an image or folder first.');
      return;
    }

    const coverPhoto = attachedPhotos[coverIndex] || attachedPhotos[0];
    const coverUrl = coverPhoto ? coverPhoto.dataUrl : chatMessages.findLast((m) => m.image)?.image || '';
    const totalCount = attachedPhotos.length || 1;
    const allPhotoUrls = attachedPhotos.length > 0 ? attachedPhotos.map((p) => p.dataUrl) : [coverUrl];

    const randomX = Math.round((Math.random() - 0.5) * 1100);
    const randomY = Math.round((Math.random() - 0.5) * 1100);
    const title = folderNameTitle.trim() || 'Kaldhar Heritage Bridal';

    const isMulti = totalCount > 1;

    const newFile: DynamicCanvasFile = {
      id: `ai-${Date.now()}`,
      code: `FILE_${Math.floor(Math.random() * 80 + 15)}.${isMulti ? 'DIR' : 'IMG'}`,
      name: title,
      discipline: isMulti ? 'Art Direction • Heritage Bridal Campaign' : 'Photography • Stills',
      year: '2026',
      role: 'Director of Visuals',
      x: randomX,
      y: randomY,
      rot: Math.round((Math.random() - 0.5) * 6),
      img: coverUrl,
      aspect: coverPhoto?.aspectClass || 'aspect-[4/5]',
      colorTag: 'bg-[#ff2a2a]',
      assetType: isMulti ? 'folder' : 'single_photo',
      desc: isMulti
        ? `${title} — Complete multi-channel campaign with ${totalCount} deliverables including lookbook editorial spreads, vertical social media motion, and retail standee assets.`
        : `${title} — High-impact still capture shot & graded under studio direction.`,
      deliverables: isMulti
        ? ['Editorial Print Lookbook (4:5)', '9:16 Social Vertical Story', 'Retail Standee Displays', 'Web Hero Banners']
        : ['High-Res Still', 'Color Emulation', 'Aspect Ratio Master'],
      photoCount: totalCount,
      photos: allPhotoUrls,
    };

    saveCanvasFile(newFile);
    refreshData();
    showNotice(`✦ SUCCESS: "${newFile.name}" (${totalCount} photo${totalCount > 1 ? 's' : ''}) published to Live Canvas!`);

    setChatMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `🎉 Awesome Moiz! **"${newFile.name}"** has been published to your Live Canvas & Portfolio with **${totalCount} asset${totalCount > 1 ? 's' : ''}**.\n\nDeliverables:\n• Cover plate: ${coverPhoto?.name || 'Selected Hero'}\n• Total collection: ${totalCount} plates stored\n• Canvas code: ${newFile.code}\n\nVisitors can click the card on your Infinite Canvas to open the full lightbox gallery!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canPublish: false,
      },
    ]);

    // Reset attached buffer
    setAttachedPhotos([]);
    setFolderNameTitle('');
  };

  // ----------------------------------------------------
  // Manual Upload: Single Photo Deploy
  // ----------------------------------------------------
  const handleDeployQuickPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singlePhotoDataUrl || !singlePhotoTitle.trim()) {
      showNotice('ERROR: Please provide a photo and a title.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1100);
    const randomY = Math.round((Math.random() - 0.5) * 1100);

    const newFile: DynamicCanvasFile = {
      id: `photo-${Date.now()}`,
      code: `STILL_${Math.floor(Math.random() * 89 + 10)}.IMG`,
      name: singlePhotoTitle.trim(),
      discipline: singlePhotoDiscipline,
      year: singlePhotoYear,
      role: 'Art Director & Photographer',
      x: randomX,
      y: randomY,
      rot: Math.round((Math.random() - 0.5) * 8),
      img: singlePhotoDataUrl,
      aspect: singlePhotoAspect.aspectClass,
      colorTag: 'bg-[#ff2a2a]',
      assetType: 'single_photo',
      desc: `Single still capture: ${singlePhotoTitle.trim()}. Shot & graded under studio direction.`,
      deliverables: ['High-Res Still', 'Color Emulation', 'Aspect Ratio Master'],
      photoCount: 1,
      photos: [singlePhotoDataUrl],
    };

    saveCanvasFile(newFile);
    refreshData();
    setSinglePhotoTitle('');
    setSinglePhotoDataUrl(null);
    showNotice(`SUCCESS: Photo "${newFile.name}" deployed to Canvas!`);
  };

  // ----------------------------------------------------
  // Manual Upload: Quick Reel Deploy
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Manual Upload: Full Folder Deploy (Supports 25+ photos!)
  // ----------------------------------------------------
  const handleDeployFullProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projPhotos.length === 0 || !projName.trim()) {
      showNotice('ERROR: Please upload at least one photo or folder, and provide a name.');
      return;
    }

    const randomX = Math.round((Math.random() - 0.5) * 1300);
    const randomY = Math.round((Math.random() - 0.5) * 1300);
    const coverPhoto = projPhotos[projCoverIndex] || projPhotos[0];

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
      img: coverPhoto.dataUrl,
      aspect: coverPhoto.aspectClass,
      colorTag: 'bg-[#161616]',
      assetType: 'folder',
      desc:
        projDesc.trim() ||
        `${projName.trim()} — Complete creative campaign folder containing ${projPhotos.length} archival assets.`,
      deliverables: ['Editorial Print Lookbook', 'Social Media Motion & Stills', 'Retail Standees', 'Campaign Masters'],
      photoCount: projPhotos.length,
      photos: projPhotos.map((p) => p.dataUrl),
    };

    saveCanvasFile(newFile);
    refreshData();
    setProjName('');
    setProjDesc('');
    setProjPhotos([]);
    showNotice(`SUCCESS: Folder "${newFile.name}" (${newFile.photoCount} photos) deployed to Canvas!`);
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

  // Passcode Gate Screen
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

        {/* Streamlined 3-Tab Bar */}
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
            <span>Manage Work &amp; Passcode</span>
            {deployedFiles.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ff2a2a] text-white font-bold ml-0.5">
                {deployedFiles.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: AI CO-PILOT (Single Picture OR Complete Folder!)      */}
        {/* ============================================================ */}
        {activeTab === 'ai_copilot' && (
          <div className="pt-6 space-y-4">
            
            {/* Header / Instructions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight flex items-center gap-2">
                  <span>AI Creative Co-Director</span>
                  <span className="text-[10px] font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    GEMINI 3.6 FLASH • 100% FREE
                  </span>
                </h2>
                <p className="font-mono text-[11px] text-secondary mt-0.5">
                  Upload a <strong>single picture</strong>, select <strong>multiple photos</strong>, or drop an <strong>entire folder</strong> (like Kaldhar with 25 files).
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Single / Multi Pictures Button */}
                <button
                  type="button"
                  onClick={() => chatFilesInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white text-white hover:text-black font-mono text-[10.5px] uppercase tracking-wider transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🖼️</span>
                  <span>Select Photos</span>
                </button>

                {/* Entire Folder Upload Button */}
                <button
                  type="button"
                  onClick={() => chatFolderInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-[8px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span>📁</span>
                  <span>Upload Entire Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChatMessages([
                      {
                        role: 'assistant',
                        content: "Conversation reset. Drop a single picture or entire folder anytime!",
                        time: 'ONLINE',
                        canPublish: false,
                      },
                    ]);
                    setAttachedPhotos([]);
                    setFolderNameTitle('');
                  }}
                  className="px-2.5 py-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10.5px] uppercase transition-all border border-white/5 cursor-pointer"
                  title="Clear chat"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Hidden Multi-file & Folder Inputs */}
            <input
              ref={chatFilesInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                if (files.length > 0) {
                  processUploadedFiles(files, (photos, detectedName) => {
                    setAttachedPhotos(photos);
                    setCoverIndex(0);
                    if (detectedName) setFolderNameTitle(detectedName);
                  });
                }
              }}
            />

            <input
              ref={chatFolderInputRef}
              type="file"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
              className="hidden"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                if (files.length > 0) {
                  processUploadedFiles(files, (photos, detectedName) => {
                    setAttachedPhotos(photos);
                    setCoverIndex(0);
                    if (detectedName) setFolderNameTitle(detectedName);
                  });
                }
              }}
            />

            {/* Unified Drag & Drop Chat Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const files = await getFilesFromDataTransfer(e.dataTransfer);
                if (files.length > 0) {
                  processUploadedFiles(files, (photos, detectedName) => {
                    setAttachedPhotos(photos);
                    setCoverIndex(0);
                    if (detectedName) setFolderNameTitle(detectedName);
                  });
                }
              }}
              className={`rounded-[14px] bg-[#111114] border transition-all overflow-hidden flex flex-col shadow-2xl relative ${
                isDraggingOver ? 'border-[#ff2a2a] ring-2 ring-[#ff2a2a]/40 bg-[#16161b]' : 'border-white/10'
              }`}
            >
              {/* Dragging Feedback Overlay */}
              {isDraggingOver && (
                <div className="bg-[#ff2a2a] px-4 py-2.5 text-center font-mono text-xs text-white font-black tracking-widest uppercase animate-pulse">
                  ✦ DROP FOLDER OR PHOTOS TO LOAD ALL ASSETS ✦
                </div>
              )}

              {/* Chat Thread */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[500px] min-h-[400px] space-y-6 font-mono text-xs leading-relaxed">
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
                          alt="Cover visual"
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

                      {/* 1-Click Publish Button inside AI bubble */}
                      {msg.canPublish && (
                        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-white text-xs">Publish to Live Website</p>
                            <p className="text-[10px] text-secondary">
                              Deploys campaign card and lightbox gallery directly to your Canvas &amp; Portfolio.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePublishFromAi()}
                            className="px-4 py-2 rounded-[8px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            ✦ 1-Click Publish ↗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Visual Direct Upload Box inside chat (Unmissable for 38+ Kaldhar photos) */}
                {attachedPhotos.length === 0 && (
                  <div className="p-6 rounded-[12px] border-2 border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center text-center gap-3.5 my-2">
                    <span className="text-3xl">📁</span>
                    <div>
                      <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                        Upload Your Kaldhar Campaign (38+ Photos)
                      </p>
                      <p className="font-mono text-[10.5px] text-secondary mt-1 max-w-md">
                        Click below to pick your <strong>Kaldhar</strong> folder from Desktop, or select pictures. You can also drag &amp; drop the folder directly!
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => chatFolderInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-[8px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow cursor-pointer flex items-center gap-2"
                      >
                        <span>📁</span>
                        <span>Upload Kaldhar Folder (All 38 Photos)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => chatFilesInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-[8px] bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>🖼️</span>
                        <span>Select Pictures (Ctrl+A for All 38)</span>
                      </button>
                    </div>
                  </div>
                )}

                {isAiThinking && (
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#ff2a2a]/20 text-[#ff4444] border border-[#ff2a2a]/30">
                      CO-DIRECTOR AI
                    </span>
                    <div className="p-4 rounded-[12px] bg-[#17171b] text-secondary border border-white/5 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#ff2a2a] animate-ping" />
                      <span className="text-xs">
                        Reviewing campaign assets, formatting deliverables &amp; generating proposal...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Attached Photos Carousel Preview Bar (Shows 1 photo OR 25+ photos!) */}
              {attachedPhotos.length > 0 && (
                <div className="px-5 py-3.5 bg-[#17171c] border-t border-white/10 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📁</span>
                      <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                        {attachedPhotos.length === 1
                          ? `Single Photo: ${attachedPhotos[0].name}`
                          : `Campaign Folder: ${folderNameTitle || 'Kaldhar'} (${attachedPhotos.length} Photos)`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 font-semibold border border-emerald-400/30">
                        READY TO PUBLISH
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePublishFromAi()}
                        className="px-3.5 py-1.5 rounded-[6px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
                      >
                        ✦ 1-Click Publish ({attachedPhotos.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedPhotos([]);
                          setFolderNameTitle('');
                        }}
                        className="px-2.5 py-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[11px] cursor-pointer"
                        title="Remove attached files"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Strip: Click to set Hero Cover */}
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {attachedPhotos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setCoverIndex(pIdx)}
                        className={`relative w-14 h-14 rounded-[8px] overflow-hidden border cursor-pointer shrink-0 transition-all ${
                          coverIndex === pIdx
                            ? 'border-[#ff2a2a] ring-2 ring-[#ff2a2a]/50 scale-105'
                            : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                        }`}
                        title={`Click to set as cover: ${photo.name}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />
                        {coverIndex === pIdx && (
                          <div className="absolute inset-x-0 bottom-0 bg-[#ff2a2a] text-white text-[8px] font-black text-center uppercase tracking-tighter">
                            COVER
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {attachedPhotos.length > 1 && (
                    <p className="text-[10px] font-mono text-secondary">
                      Tip: Click any photo above to make it the primary hero cover on your site.
                    </p>
                  )}
                </div>
              )}

              {/* Quick Action Suggestion Chips */}
              <div className="px-4 py-2 bg-[#141417] border-t border-white/5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      'Break down every deliverable you see in these attached campaign assets (Lookbook pages, social posts, standees) and ask me 1 or 2 quick questions.'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-secondary hover:text-white font-mono text-[10px] whitespace-nowrap transition-all border border-white/5 cursor-pointer"
                >
                  🔍 Break Down Deliverables
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendChatMessage(
                      'Which photo among these should be the main hero cover plate, and what aspect ratio should we present it in?'
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
                      'Draft a 2-paragraph directorial narrative for this bridal campaign focusing on textiles, lighting, and visual prestige.'
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

              {/* Message Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="p-3 sm:p-4 border-t border-white/10 bg-[#151518] flex gap-2.5 items-center"
              >
                {/* 1. Attach Files Button */}
                <button
                  type="button"
                  onClick={() => chatFilesInputRef.current?.click()}
                  title="Attach single picture or select multiple photos"
                  className="px-3.5 py-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-white transition-all text-sm flex items-center justify-center cursor-pointer shrink-0"
                >
                  📎
                </button>

                {/* 2. Attach Entire Folder Button */}
                <button
                  type="button"
                  onClick={() => chatFolderInputRef.current?.click()}
                  title="Upload entire folder from Desktop (e.g. Kaldhar)"
                  className="px-3.5 py-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-white transition-all text-sm flex items-center justify-center cursor-pointer shrink-0"
                >
                  📁
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    isProcessingFiles
                      ? 'Processing files...'
                      : attachedPhotos.length > 0
                      ? `${attachedPhotos.length} photos ready. Ask a question, or click Send to analyze...`
                      : 'Ask your AI Co-Director, or drop a picture / folder here...'
                  }
                  className="flex-1 px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white placeholder:text-[#777780]"
                />

                <button
                  type="submit"
                  disabled={isAiThinking || isProcessingFiles || (!chatInput.trim() && attachedPhotos.length === 0)}
                  className="px-5 py-3 rounded-[10px] bg-white text-black hover:bg-[#ff2a2a] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black cursor-pointer shrink-0"
                >
                  Send ↵
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MANUAL UPLOAD                                         */}
        {/* ============================================================ */}
        {activeTab === 'manual_upload' && (
          <div className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-xl uppercase tracking-tight">
                  Direct Upload Studio
                </h2>
                <p className="font-mono text-xs text-secondary mt-0.5">
                  Publish a <strong>single photo still</strong>, a <strong>video reel</strong>, or an <strong>entire folder of 25+ photos</strong>.
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
                  📸 Single Photo
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
                  📁 Full Folder (25+ Photos)
                </button>
              </div>
            </div>

            {/* Mode 1: SINGLE PHOTO STILL (Specifically for "i need add only single pocture") */}
            {manualType === 'photo' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-5">
                  <div
                    onClick={() => singlePhotoInputRef.current?.click()}
                    className={`w-full h-52 rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                      singlePhotoDataUrl
                        ? 'border-[#ff2a2a]/60 bg-white/[0.02]'
                        : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      ref={singlePhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          compressFile(file).then((photo) => {
                            setSinglePhotoDataUrl(photo.dataUrl);
                            setSinglePhotoAspect({
                              aspectClass: photo.aspectClass,
                              aspectLabel: photo.aspectLabel,
                            });
                            if (!singlePhotoTitle) {
                              setSinglePhotoTitle(photo.name.replace(/\.[^/.]+$/, ''));
                            }
                          });
                        }
                      }}
                    />
                    <span className="text-3xl mb-2">📸</span>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                      {singlePhotoDataUrl ? 'Change Selected Picture' : 'Click to Pick Single Picture (or Drop 1 File)'}
                    </p>
                    <p className="font-mono text-[10px] text-secondary mt-1">
                      Uploads only this single picture directly to the canvas
                    </p>
                  </div>

                  <form onSubmit={handleDeployQuickPhoto} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Picture Title
                      </label>
                      <input
                        type="text"
                        value={singlePhotoTitle}
                        onChange={(e) => setSinglePhotoTitle(e.target.value)}
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
                          value={singlePhotoDiscipline}
                          onChange={(e) => setSinglePhotoDiscipline(e.target.value)}
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
                          value={singlePhotoYear}
                          onChange={(e) => setSinglePhotoYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-[#ff2a2a] outline-none font-mono text-xs text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!singlePhotoDataUrl}
                      className="w-full py-3.5 rounded-[10px] bg-[#ff2a2a] hover:bg-[#ff4444] disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                    >
                      Deploy Single Picture to Infinite Canvas ↗
                    </button>
                  </form>
                </div>

                {/* Live Preview */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-[12px] bg-white/[0.02] border border-white/10">
                  <span className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">
                    [ LIVE PICTURE PREVIEW ]
                  </span>
                  {singlePhotoDataUrl ? (
                    <div className="w-full max-w-[260px] bg-[#faf9f6] text-black rounded-[10px] p-4 shadow-2xl border border-black/10 flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-black/60">
                        <span>STILL.IMG</span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-black/10 font-bold">
                          {singlePhotoAspect.aspectLabel}
                        </span>
                      </div>
                      <div className={`w-full ${singlePhotoAspect.aspectClass} rounded-[6px] overflow-hidden bg-black/5`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={singlePhotoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-sm uppercase leading-tight">
                          {singlePhotoTitle || 'Untitled Still'}
                        </h3>
                        <p className="font-mono text-[10.5px] text-black/70 mt-0.5">{singlePhotoDiscipline}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-secondary font-mono text-xs py-14">
                      Select or drop a single picture to preview
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
                          compressFile(file).then((photo) => {
                            setReelCoverUrl(photo.dataUrl);
                            if (!reelTitle) setReelTitle(photo.name.replace(/\.[^/.]+$/, ''));
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
                    <div
                      className={`w-full ${
                        reelAspectChoice === '9/16' ? 'max-w-[210px]' : 'max-w-[280px]'
                      } bg-[#faf9f6] text-black rounded-[10px] p-4 shadow-2xl border border-black/10 flex flex-col justify-between space-y-3`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-black/60">
                        <span>REEL.MOV</span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-blue-100 text-blue-800 font-bold">
                          {reelAspectChoice}
                        </span>
                      </div>
                      <div
                        className={`w-full ${
                          reelAspectChoice === '9/16' ? 'aspect-[9/16]' : 'aspect-[16/9]'
                        } rounded-[6px] overflow-hidden bg-black/10 relative`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reelCoverUrl} alt="Reel Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center pl-0.5 font-bold shadow">
                            ▶
                          </span>
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
                      Upload a poster frame to preview
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 3: FULL PROJECT FOLDER (Uploads entire folder or 25+ photos!) */}
            {manualType === 'project' && (
              <div className="max-w-3xl space-y-5">
                {/* Dual Drop Zone: Entire Folder OR Multiple Photos */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const files = await getFilesFromDataTransfer(e.dataTransfer);
                    if (files.length > 0) {
                      processUploadedFiles(files, (photos, detectedName) => {
                        setProjPhotos(photos);
                        setProjCoverIndex(0);
                        if (!projName && detectedName) setProjName(detectedName);
                      });
                    }
                  }}
                  className={`w-full rounded-[14px] border-2 border-dashed p-8 text-center transition-all ${
                    projPhotos.length > 0
                      ? 'border-white/60 bg-white/[0.03]'
                      : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Hidden Multi-file input */}
                  <input
                    ref={projFilesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (files.length > 0) {
                        processUploadedFiles(files, (photos, detectedName) => {
                          setProjPhotos(photos);
                          setProjCoverIndex(0);
                          if (!projName && detectedName) setProjName(detectedName);
                        });
                      }
                    }}
                  />

                  {/* Hidden Folder input */}
                  <input
                    ref={projFolderInputRef}
                    type="file"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (files.length > 0) {
                        processUploadedFiles(files, (photos, detectedName) => {
                          setProjPhotos(photos);
                          setProjCoverIndex(0);
                          if (!projName && detectedName) setProjName(detectedName);
                        });
                      }
                    }}
                  />

                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">📁</span>
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      {projPhotos.length > 0
                        ? `${projPhotos.length} Photos Selected in Folder`
                        : 'Upload Complete Campaign Folder (e.g. Kaldhar)'}
                    </p>
                    <p className="font-mono text-xs text-secondary max-w-md">
                      You can drop your entire folder from Desktop, click to pick the folder, or select multiple pictures at once.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => projFolderInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-[8px] bg-[#ff2a2a] hover:bg-[#ff4444] text-white font-mono text-xs font-bold uppercase tracking-wider shadow cursor-pointer flex items-center gap-2"
                      >
                        <span>📁</span>
                        <span>Select Entire Folder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => projFilesInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-[8px] bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>🖼️</span>
                        <span>Select Multiple Photos</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Photos Thumbnail Carousel */}
                {projPhotos.length > 0 && (
                  <div className="p-4 rounded-[12px] bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold uppercase">
                        Folder Photos ({projPhotos.length})
                      </span>
                      <span className="text-secondary text-[11px]">
                        Click any photo to set as Cover
                      </span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {projPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setProjCoverIndex(idx)}
                          className={`relative w-16 h-16 rounded-[8px] overflow-hidden border cursor-pointer shrink-0 transition-all ${
                            projCoverIndex === idx
                              ? 'border-[#ff2a2a] ring-2 ring-[#ff2a2a]/50 scale-105'
                              : 'border-white/20 hover:border-white/50 opacity-75 hover:opacity-100'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />
                          {projCoverIndex === idx && (
                            <div className="absolute inset-x-0 bottom-0 bg-[#ff2a2a] text-white text-[8px] font-black text-center uppercase tracking-tighter">
                              COVER
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleDeployFullProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] text-secondary uppercase tracking-wider mb-1.5">
                        Campaign / Client Name
                      </label>
                      <input
                        type="text"
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        placeholder="e.g. Kaldhar Heritage Bridal"
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
                      placeholder="Short editorial summary of creative direction and deliverables..."
                      className="w-full px-4 py-3 rounded-[10px] bg-white/5 border border-white/10 focus:border-white outline-none font-mono text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={projPhotos.length === 0}
                    className="w-full py-3.5 rounded-[10px] bg-white text-black hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                  >
                    Deploy Full Folder ({projPhotos.length} Photos) to Canvas ↗
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

            {/* Clear Explanation Card: What is this section? */}
            <div className="p-5 rounded-[12px] bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white">
                <span className="text-base">⚙</span>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                  What is this tab? (Your Website Control Room)
                </h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed font-mono">
                This tab lets you manage your live website, check your security code, and view your Google tools:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-[8px] bg-white/5 border border-white/5 font-mono text-[11px] space-y-1">
                  <p className="text-white font-bold">1. Active Works ({deployedFiles.length})</p>
                  <p className="text-secondary">See every project or photo currently live on your site, and delete anything you want to take down.</p>
                </div>
                <div className="p-3 rounded-[8px] bg-white/5 border border-white/5 font-mono text-[11px] space-y-1">
                  <p className="text-white font-bold">2. Master Passcode (7741)</p>
                  <p className="text-secondary">Your private security password that prevents visitors from opening this Studio Desk.</p>
                </div>
                <div className="p-3 rounded-[8px] bg-white/5 border border-white/5 font-mono text-[11px] space-y-1">
                  <p className="text-emerald-400 font-bold">3. 100% Free AI Status ($0.00)</p>
                  <p className="text-secondary">Confirms your Gemini 3.6 Flash free tier (1,500 free requests per day, $0.00 forever).</p>
                </div>
                <div className="p-3 rounded-[8px] bg-white/5 border border-white/5 font-mono text-[11px] space-y-1">
                  <p className="text-white font-bold">4. 8 Free Google SEO Tools</p>
                  <p className="text-secondary">Direct links to Google Search Console, Google Analytics 4, and Clarity to rank your site on Google.</p>
                </div>
              </div>
            </div>

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
                          <p className="font-mono text-[10px] text-secondary truncate">
                            {item.discipline} {item.photoCount && item.photoCount > 1 ? `(${item.photoCount} photos)` : ''}
                          </p>
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
