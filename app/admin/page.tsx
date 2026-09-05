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
} from '@/lib/contentStore';
import { BlogPost } from '@/lib/blogData';

export interface ProcessedAsset {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  aspectClass: string;
  aspectLabel: string;
  sizeFormatted: string;
  folderName?: string;
}

type AdminTab = 'uploads' | 'articles' | 'chat' | 'settings';

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

async function processFileToAsset(file: File, folderName?: string): Promise<ProcessedAsset> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 1200;
      const h = img.naturalHeight || 800;
      const { aspectClass, aspectLabel } = calculateAspect(w, h);

      // Safe offscreen downscale for browser storage (max 1200px)
      const MAX = 1200;
      let targetW = w;
      let targetH = h;
      if (targetW > MAX || targetH > MAX) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * MAX) / targetW);
          targetW = MAX;
        } else {
          targetW = Math.round((targetW * MAX) / targetH);
          targetH = MAX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
      URL.revokeObjectURL(objectUrl);

      resolve({
        id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        dataUrl,
        width: w,
        height: h,
        aspectClass,
        aspectLabel,
        sizeFormatted: formatBytes(file.size),
        folderName,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = objectUrl;
  });
}

async function traverseDirectoryEntry(entry: any, folderName: string): Promise<File[]> {
  const files: File[] = [];
  if (entry.isFile) {
    const file: File = await new Promise((resolve) => entry.file(resolve));
    if (file.type.startsWith('image/')) {
      files.push(file);
    }
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const readEntries = (): Promise<any[]> => {
      return new Promise((resolve) => {
        dirReader.readEntries((entries: any[]) => resolve(entries));
      });
    };
    let entries = await readEntries();
    while (entries.length > 0) {
      for (const childEntry of entries) {
        const subFiles = await traverseDirectoryEntry(childEntry, folderName);
        files.push(...subFiles);
      }
      entries = await readEntries();
    }
  }
  return files;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('uploads');
  const [apiKey, setApiKey] = useState('');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  // Private Director Terminal Access Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Advanced Ingestion & Upload state
  const [processedAssets, setProcessedAssets] = useState<ProcessedAsset[]>([]);
  const [selectedAssetIdx, setSelectedAssetIdx] = useState<number>(0);
  const [detectedFolderName, setDetectedFolderName] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [uploadImageUrl, setUploadImageUrl] = useState('');
  const [uploadBrief, setUploadBrief] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Partial<DynamicCanvasFile> | null>(null);
  const [savedUploadSuccess, setSavedUploadSuccess] = useState(false);
  const [isBatchPublishing, setIsBatchPublishing] = useState(false);
  const [canvasFiles, setCanvasFiles] = useState<DynamicCanvasFile[]>([]);

  // Input references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Article state
  const [articleTopic, setArticleTopic] = useState('');
  const [articleCategory, setArticleCategory] = useState<BlogPost['category']>('LIGHTING & ON-SET');
  const [articleNotes, setArticleNotes] = useState('');
  const [articleCover, setArticleCover] = useState('');
  const [isDraftingArticle, setIsDraftingArticle] = useState(false);
  const [draftedArticle, setDraftedArticle] = useState<BlogPost | null>(null);
  const [savedArticleSuccess, setSavedArticleSuccess] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello Moiz. I am your studio AI Co-Pilot. I can help organize uploads, classify disciplines, calculate aspect ratios, and draft technical shoot breakdowns for your journal. What would you like to direct next?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('moiz_studio_auth') === 'true';
    setIsAuthenticated(isAuth);
    setApiKey(getStoredApiKey());
    setCanvasFiles(getStoredCanvasFiles());
    setBlogPosts(getStoredBlogPosts());
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '2026' || passcode.trim().toLowerCase() === 'moiz') {
      localStorage.setItem('moiz_studio_auth', 'true');
      setIsAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLock = () => {
    localStorage.removeItem('moiz_studio_auth');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Save API Key
  const handleSaveApiKey = () => {
    saveApiKey(apiKey);
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2500);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    setIsProcessingFiles(true);
    try {
      const fileList: { file: File; folder?: string }[] = [];
      let detectedFolder = '';

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
        if (entry) {
          if (entry.isDirectory) {
            detectedFolder = entry.name;
            const folderFiles = await traverseDirectoryEntry(entry, entry.name);
            folderFiles.forEach((f) => fileList.push({ file: f, folder: entry.name }));
          } else if (entry.isFile) {
            const file = item.getAsFile();
            if (file && file.type.startsWith('image/')) {
              fileList.push({ file });
            }
          }
        } else {
          const file = item.getAsFile();
          if (file && file.type.startsWith('image/')) {
            fileList.push({ file });
          }
        }
      }

      if (fileList.length > 0) {
        const processed: ProcessedAsset[] = [];
        for (const item of fileList) {
          try {
            const asset = await processFileToAsset(item.file, item.folder);
            processed.push(asset);
          } catch (err) {
            console.error(err);
          }
        }

        if (processed.length > 0) {
          setProcessedAssets((prev) => [...prev, ...processed]);
          setSelectedAssetIdx(0);
          if (detectedFolder) {
            setDetectedFolderName(detectedFolder);
            if (!uploadBrief) {
              setUploadBrief(detectedFolder.replace(/[_-]+/g, ' '));
            }
          } else if (processed[0].name && !uploadBrief) {
            setUploadBrief(processed[0].name.replace(/[_-]+/g, ' '));
          }
          setUploadImageUrl(processed[0].dataUrl);
        }
      }
    } catch (err) {
      console.error('Failed to handle dropped files/folder', err);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    try {
      const folderName = files[0].webkitRelativePath
        ? files[0].webkitRelativePath.split('/')[0]
        : 'Project Collection';
      setDetectedFolderName(folderName);
      if (!uploadBrief) {
        setUploadBrief(folderName.replace(/[_-]+/g, ' '));
      }

      const processed: ProcessedAsset[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          try {
            const asset = await processFileToAsset(file, folderName);
            processed.push(asset);
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (processed.length > 0) {
        setProcessedAssets((prev) => [...prev, ...processed]);
        setSelectedAssetIdx(0);
        setUploadImageUrl(processed[0].dataUrl);
      }
    } catch (err) {
      console.error('Failed to process folder', err);
    } finally {
      setIsProcessingFiles(false);
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    try {
      const processed: ProcessedAsset[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          try {
            const asset = await processFileToAsset(file);
            processed.push(asset);
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (processed.length > 0) {
        setProcessedAssets((prev) => [...prev, ...processed]);
        setSelectedAssetIdx(0);
        setUploadImageUrl(processed[0].dataUrl);
        if (!uploadBrief && processed[0].name) {
          setUploadBrief(processed[0].name.replace(/[_-]+/g, ' '));
        }
      }
    } catch (err) {
      console.error('Failed to process files', err);
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAsset = (idx: number) => {
    const updated = processedAssets.filter((_, i) => i !== idx);
    setProcessedAssets(updated);
    if (selectedAssetIdx >= updated.length) {
      setSelectedAssetIdx(Math.max(0, updated.length - 1));
    }
    if (updated.length > 0) {
      const nextIdx = Math.min(selectedAssetIdx, updated.length - 1);
      setUploadImageUrl(updated[nextIdx].dataUrl);
    } else {
      setUploadImageUrl('');
      setAnalyzedData(null);
    }
  };

  const handleSelectAsset = (idx: number) => {
    setSelectedAssetIdx(idx);
    const asset = processedAssets[idx];
    if (asset) {
      setUploadImageUrl(asset.dataUrl);
      if (analyzedData) {
        setAnalyzedData({
          ...analyzedData,
          img: asset.dataUrl,
          aspect: asset.aspectClass,
        });
      }
    }
  };

  // 1. AI Upload Analysis & Autonomous Director Choice
  const handleAnalyzeUpload = async () => {
    const activeAsset = processedAssets[selectedAssetIdx];
    const currentImg = activeAsset ? activeAsset.dataUrl : uploadImageUrl;
    const currentFileName = activeAsset ? activeAsset.name : (uploadImageUrl.split('/').pop() || 'upload-asset');
    const detectedAspect = activeAsset ? activeAsset.aspectClass : undefined;

    if (!uploadBrief.trim() && !currentImg && !detectedFolderName) return;
    setIsAnalyzing(true);
    setAnalyzedData(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_upload',
          brief: uploadBrief,
          fileName: currentFileName,
          folderName: detectedFolderName,
          detectedAspect,
          geminiKey: apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalyzedData({
          ...json.data,
          id: `custom-${Date.now()}`,
          img: currentImg || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
          aspect: detectedAspect || json.data.aspect || 'aspect-[16/10]',
          x: Math.round(Math.random() * 800 - 400),
          y: Math.round(Math.random() * 800 - 400),
          rot: Math.round(Math.random() * 8 - 4),
        });
      }
    } catch (err) {
      console.error('Failed to analyze upload', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublishUpload = () => {
    if (!analyzedData || !analyzedData.name) return;
    const activeAsset = processedAssets[selectedAssetIdx];
    const finalFile: DynamicCanvasFile = {
      id: analyzedData.id || `custom-${Date.now()}`,
      code: analyzedData.code || 'FILE_99.DIR',
      name: analyzedData.name || 'Untitled Project',
      discipline: analyzedData.discipline || 'Art Direction • Lookbook',
      year: analyzedData.year || '2026',
      role: analyzedData.role || 'Lead Art Director',
      x: analyzedData.x ?? Math.round(Math.random() * 800 - 400),
      y: analyzedData.y ?? Math.round(Math.random() * 800 - 400),
      rot: analyzedData.rot ?? Math.round(Math.random() * 8 - 4),
      img: analyzedData.img || (activeAsset ? activeAsset.dataUrl : uploadImageUrl) || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
      aspect: analyzedData.aspect || (activeAsset ? activeAsset.aspectClass : 'aspect-[16/10]'),
      colorTag: analyzedData.colorTag || 'bg-[#ff3300]',
      desc: analyzedData.desc || 'Tactile commercial shoot direction.',
      deliverables: analyzedData.deliverables || ['Shoot Direction', 'Lighting Spec', 'Composition Deck'],
    };

    saveCanvasFile(finalFile);
    setCanvasFiles(getStoredCanvasFiles());
    setSavedUploadSuccess(true);
    setTimeout(() => {
      setSavedUploadSuccess(false);
    }, 2500);
  };

  // Batch Publish Entire Ingested Folder
  const handlePublishBatch = async () => {
    if (processedAssets.length === 0) return;
    setIsBatchPublishing(true);

    const colors = ['bg-[#ff3300]', 'bg-[#0055ff]', 'bg-[#00e575]', 'bg-[#f59e0b]', 'bg-[#141414]'];
    const disciplines = [
      'Art Direction • Commercial Lookbook',
      'Lighting Direction • Editorial Styling',
      'Brand Identity • Campaign Frame',
      'Cinematography • High-Contrast Master',
    ];

    for (let i = 0; i < processedAssets.length; i++) {
      const asset = processedAssets[i];
      const codeNum = Math.floor(Math.random() * 70 + 20);
      const cleanName = asset.name.replace(/[_-]+/g, ' ');
      const title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      const file: DynamicCanvasFile = {
        id: `custom-${Date.now()}-${i}`,
        code: `FILE_${codeNum}.DIR`,
        name: title || (detectedFolderName ? `${detectedFolderName} — Frame ${i + 1}` : `Project Asset ${i + 1}`),
        discipline: disciplines[i % disciplines.length],
        year: '2026',
        role: 'Lead Art Director',
        x: Math.round(Math.random() * 1000 - 500),
        y: Math.round(Math.random() * 1000 - 500),
        rot: Math.round(Math.random() * 8 - 4),
        img: asset.dataUrl,
        aspect: asset.aspectClass,
        colorTag: colors[i % colors.length],
        desc: uploadBrief || `Tactile commercial shoot asset from ${detectedFolderName || 'project collection'}. High-contrast lighting and surgical precision composition.`,
        deliverables: ['Production Stills', 'Aspect Master', 'Color Pass', 'Deliverable Deck'],
      };

      saveCanvasFile(file);
    }

    setCanvasFiles(getStoredCanvasFiles());
    setSavedUploadSuccess(true);
    setIsBatchPublishing(false);
    setTimeout(() => {
      setSavedUploadSuccess(false);
      setProcessedAssets([]);
      setDetectedFolderName('');
      setUploadImageUrl('');
      setUploadBrief('');
      setAnalyzedData(null);
    }, 2500);
  };

  const handleDeleteCanvasFile = (id: string) => {
    deleteCanvasFile(id);
    setCanvasFiles(getStoredCanvasFiles());
  };

  const handleDeleteBlogPost = (slug: string) => {
    deleteBlogPost(slug);
    setBlogPosts(getStoredBlogPosts());
  };


  // 2. AI Blog Drafting
  const handleDraftArticle = async () => {
    if (!articleTopic.trim()) return;
    setIsDraftingArticle(true);
    setDraftedArticle(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write_article',
          topic: articleTopic,
          category: articleCategory,
          notes: articleNotes,
          geminiKey: apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const article: BlogPost = {
          ...json.data,
          coverImage: articleCover || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
          author: {
            name: 'Moiz Khan',
            role: 'Art Director & Brand Visual Designer',
            avatar: '/assets/logo.png',
          },
        };
        setDraftedArticle(article);
      }
    } catch (err) {
      console.error('Failed to draft article', err);
    } finally {
      setIsDraftingArticle(false);
    }
  };

  const handlePublishArticle = () => {
    if (!draftedArticle) return;
    saveBlogPost(draftedArticle);
    setBlogPosts(getStoredBlogPosts());
    setSavedArticleSuccess(true);
    setTimeout(() => {
      setSavedArticleSuccess(false);
      setDraftedArticle(null);
      setArticleTopic('');
      setArticleNotes('');
      setArticleCover('');
    }, 2000);
  };

  // 3. AI Co-Pilot Chat
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = { role: 'user' as const, content: chatInput };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatting(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: updated,
          geminiKey: apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.reply) {
        setChatMessages([...updated, { role: 'assistant', content: json.reply }]);
      }
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setIsChatting(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <span className="font-mono text-xs text-white/40 tracking-widest uppercase animate-pulse">
          INITIALIZING SECURE STUDIO...
        </span>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-6 sm:p-12 select-none">
        <CustomCursor />
        <div className="flex justify-between items-center font-mono text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2a2a] animate-pulse" />
            <span>DIRECTOR TERMINAL</span>
          </div>
          <Link href="/" className="hover:text-white transition-colors">
            ← RETURN TO SITE
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-12">
          <div className="border border-white/10 bg-[#121215] rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a2a]" />
              <span className="font-mono text-[10px] text-[#ff2a2a] tracking-widest uppercase font-bold">
                RESTRICTED STUDIO ACCESS
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-2">
              MOIZ KHAN STUDIO
            </h1>
            <p className="font-mono text-xs text-white/60 mb-6 leading-relaxed">
              Private backend for creative direction. Enter your director PIN to access the AI Upload Manager, Article Studio, and private Co-Pilot.
            </p>

            <form onSubmit={handleUnlock} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[10px] text-white/50 uppercase block mb-1.5">
                  DIRECTOR PASSCODE / PIN
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter PIN (Default: 2026)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (passcodeError) setPasscodeError(false);
                  }}
                  className={`w-full px-4 py-3 bg-black/60 border ${
                    passcodeError ? 'border-red-500' : 'border-white/20'
                  } rounded-lg font-mono text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a] tracking-widest`}
                />
                {passcodeError && (
                  <span className="font-mono text-[10px] text-red-400 mt-1.5 block">
                    Access Denied. Incorrect director passcode.
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black hover:bg-[#ff2a2a] hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors mt-2"
              >
                UNLOCK TERMINAL →
              </button>
            </form>
          </div>
        </div>

        <div className="text-center font-mono text-[10px] text-white/30">
          MOIZ KHAN • ART DIRECTOR &amp; BRAND VISUAL DESIGNER • PRIVATE BACKEND
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f11] text-white select-none selection:bg-[#ff2a2a] selection:text-white">
      <CustomCursor />

      {/* Studio Top Control Bar */}
      <header className="sticky top-0 z-50 px-6 py-4 md:px-12 bg-[#17171a]/95 backdrop-blur-md border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-pulse" />
          <span className="font-mono text-xs tracking-wider uppercase font-bold text-white">
            MOIZ KHAN • STUDIO AI MANAGER
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono text-white/70">
            {apiKey ? 'GEMINI 1.5 ACTIVE' : 'DIRECTOR ENGINE ACTIVE'}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
          <Link href="/" className="text-white/70 hover:text-white transition-colors uppercase">
            PORTFOLIO ↗
          </Link>
          <Link href="/blog" className="text-white/70 hover:text-white transition-colors uppercase">
            JOURNAL ↗
          </Link>
          <Link href="/canvas" className="text-[#ff2a2a] font-bold hover:underline transition-colors uppercase">
            CANVAS ↗
          </Link>
          <button
            type="button"
            onClick={handleLock}
            className="px-2.5 py-1 bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded font-mono text-[10px] uppercase transition-colors"
            title="Lock Terminal"
          >
            🔒 LOCK
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'uploads'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ⚡ AI Upload Manager
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'articles'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ✍️ AI Article Studio
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            💬 AI Studio Co-Pilot
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ⚙️ AI Settings
          </button>
        </div>

        {/* TAB 1: AI UPLOAD & AUTO-TAGGER */}
        {activeTab === 'uploads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Dropzone, Batch Filmstrip, & AI Direct */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#ff2a2a] tracking-widest uppercase">
                    STUDIO ASSET INGESTION
                  </span>
                  <span className="font-mono text-[10px] text-white/50">
                    FOLDER &amp; MULTI-FILE PIPELINE
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-2">
                  Folder Drop &amp; Auto-Sizing
                </h2>
                <p className="font-mono text-xs text-white/60 mb-6 leading-relaxed">
                  Drop an entire shoot folder or raw stills. The engine auto-computes true dimensions, aspect ratios, file sizes, and lets the AI direct the presentation autonomously.
                </p>

                {/* Hidden Native File & Folder Inputs */}
                <input
                  ref={folderInputRef}
                  type="file"
                  {...({ webkitdirectory: '', directory: '' } as any)}
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesSelect}
                  className="hidden"
                />

                {/* Modernist Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    isDraggingOver
                      ? 'border-[#ff2a2a] bg-[#ff2a2a]/10 scale-[0.99]'
                      : 'border-white/20 bg-black/40 hover:border-white/40'
                  }`}
                  onClick={() => folderInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-2xl">
                    📁
                  </div>
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block mb-1">
                    {isDraggingOver ? 'DROP FOLDER OR ASSETS HERE' : 'DRAG & DROP SHOOT FOLDER OR IMAGES'}
                  </span>
                  <span className="font-mono text-[11px] text-white/40 max-w-sm mb-4">
                    Reads natural dimensions, exact physical aspect ratios, and folder hierarchies automatically
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white text-black hover:bg-[#ff2a2a] hover:text-white rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>📁</span>
                      <span>SELECT FOLDER</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <span>🖼️</span>
                      <span>BROWSE FILES</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-2 text-white/50 hover:text-white rounded-lg font-mono text-[10px] uppercase transition-colors"
                    >
                      {showUrlInput ? 'HIDE URL' : '🔗 URL LINK'}
                    </button>
                  </div>
                </div>

                {/* Optional Fallback URL Input */}
                {showUrlInput && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Direct Image URL (Unsplash or CDN)
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={uploadImageUrl}
                      onChange={(e) => setUploadImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>
                )}

                {/* Ingestion Status Loading */}
                {isProcessingFiles && (
                  <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2.5 font-mono text-xs text-[#00e575] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                    <span>INGESTING ASSETS &amp; COMPUTING PHYSICAL ASPECT RATIOS...</span>
                  </div>
                )}

                {/* Detected Folder & Multi-Asset Filmstrip */}
                {processedAssets.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                        <span className="font-bold text-white uppercase">
                          {detectedFolderName ? `FOLDER: [${detectedFolderName}]` : 'INGESTED BATCH'}
                        </span>
                        <span className="text-white/40">({processedAssets.length} ASSETS)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProcessedAssets([]);
                          setDetectedFolderName('');
                          setUploadImageUrl('');
                          setAnalyzedData(null);
                        }}
                        className="text-[10px] text-white/40 hover:text-red-400 transition-colors uppercase"
                      >
                        CLEAR ALL
                      </button>
                    </div>

                    {/* Horizontal Filmstrip */}
                    <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                      {processedAssets.map((asset, idx) => (
                        <div
                          key={asset.id}
                          onClick={() => handleSelectAsset(idx)}
                          className={`group relative flex-shrink-0 w-28 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                            idx === selectedAssetIdx
                              ? 'border-[#ff2a2a] ring-2 ring-[#ff2a2a]/40 scale-105'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="w-full h-20 bg-black overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.dataUrl}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAsset(idx);
                              }}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="p-1.5 bg-black/90 font-mono text-[8px] flex flex-col gap-0.5">
                            <span className="truncate text-white/90 font-bold">{asset.name}</span>
                            <span className="text-[#00e575] font-bold">{asset.aspectLabel}</span>
                            <span className="text-white/40">{asset.width}×{asset.height} • {asset.sizeFormatted}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brief & Autonomous Directing Input */}
                <div className="mt-5 flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Shoot Concept / Brief (Optional — Or let AI choose)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Lookbook on tarmac at sunset (leave blank to let AI auto-direct everything from the folder name & image composition)"
                      value={uploadBrief}
                      onChange={(e) => setUploadBrief(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={handleAnalyzeUpload}
                      disabled={isAnalyzing || (processedAssets.length === 0 && !uploadBrief && !uploadImageUrl)}
                      className="flex-1 py-3 bg-[#ff2a2a] hover:bg-[#ff4444] disabled:opacity-40 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-md"
                    >
                      {isAnalyzing ? '⚡ AI IS DIRECTING ASSET...' : '⚡ AI AUTO-DIRECT & COMPOSE ASSET'}
                    </button>

                    {processedAssets.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePublishBatch}
                        disabled={isBatchPublishing}
                        className="py-3 px-4 bg-white/10 hover:bg-[#00e575] hover:text-black rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-40"
                      >
                        {isBatchPublishing ? 'PUBLISHING BATCH...' : `🚀 BATCH PUBLISH ALL (${processedAssets.length})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Files Gallery on Canvas with Curate / Delete */}
              {canvasFiles.length > 0 && (
                <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-white/50 tracking-widest uppercase">
                      CUSTOM CANVAS ARCHIVE ({canvasFiles.length})
                    </span>
                    <span className="font-mono text-[10px] text-[#00e575]">LIVE ON /CANVAS</span>
                  </div>
                  <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {canvasFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${file.colorTag}`} />
                          <div className="w-10 h-10 rounded overflow-hidden bg-black/60 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={file.img} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold block truncate">{file.name}</span>
                            <span className="font-mono text-[10px] text-white/50 block truncate">
                              {file.code} • {file.aspect} • {file.discipline}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeleteCanvasFile(file.id)}
                            className="px-2 py-1 text-[10px] font-mono text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors uppercase"
                            title="Delete from Canvas"
                          >
                            🗑️ REMOVE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Archival Canvas Placement & Metadata Review */}
            <div className="lg:col-span-6">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-white/50 tracking-widest uppercase">
                    CANVAS FOLDER COMPOSITION
                  </span>
                  {processedAssets[selectedAssetIdx] && (
                    <span className="font-mono text-[10px] text-[#00e575] font-bold">
                      {processedAssets[selectedAssetIdx].aspectLabel} • {processedAssets[selectedAssetIdx].width}×{processedAssets[selectedAssetIdx].height}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xl uppercase mb-6">
                  Archival Folder Preview
                </h3>

                {analyzedData ? (
                  <div className="flex flex-col gap-6">
                    {/* Archival Folder Mockup */}
                    <div className="p-8 bg-[#faf9f6] text-[#0d0d0e] rounded-2xl flex items-center justify-center">
                      <div className="relative w-[220px] pt-14 pb-4 px-4 bg-[#ede8df] rounded-[12px] shadow-lg">
                        {/* Folder Tab */}
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-[#ded8cc] rounded-t-[6px] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${analyzedData.colorTag || 'bg-[#ff3300]'}`} />
                          <span className="font-mono text-[9px] font-bold text-black/70">
                            {analyzedData.code}
                          </span>
                        </div>

                        {/* Peeking Image with Calculated Proportions */}
                        <div className="absolute -top-10 inset-x-3 h-[110px] rounded-[8px] overflow-hidden bg-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={analyzedData.img}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="relative z-20 mt-12 pt-2.5">
                          <h4 className="font-bold text-xs leading-tight text-black line-clamp-2">
                            {analyzedData.name}
                          </h4>
                          <p className="font-mono text-[9px] text-black/60 mt-1 truncate">
                            {analyzedData.discipline}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-black/40 pt-1.5 border-t border-black/10">
                            <span>{analyzedData.year || '2026'}</span>
                            <span className="text-[#ff3300] font-bold uppercase">{analyzedData.aspect?.replace('aspect-[', '').replace(']', '') || '16:10'} ↗</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Review & Edit */}
                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <span className="text-white/50 block text-[10px] mb-1">PROJECT NAME</span>
                        <input
                          type="text"
                          value={analyzedData.name || ''}
                          onChange={(e) => setAnalyzedData({ ...analyzedData, name: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded px-3 py-1.5 text-white font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-white/50 block text-[10px] mb-1">DISCIPLINE</span>
                        <input
                          type="text"
                          value={analyzedData.discipline || ''}
                          onChange={(e) => setAnalyzedData({ ...analyzedData, discipline: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded px-3 py-1.5 text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <span className="text-white/50 block text-[10px] mb-1">ASPECT RATIO</span>
                        <select
                          value={analyzedData.aspect || 'aspect-[16/10]'}
                          onChange={(e) => setAnalyzedData({ ...analyzedData, aspect: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded px-3 py-1.5 text-white font-mono text-xs"
                        >
                          <option value="aspect-[16/9]">16:9 Broadcast Widescreen</option>
                          <option value="aspect-[16/10]">16:10 Cinema Landscape</option>
                          <option value="aspect-[4/3]">4:3 Medium Format</option>
                          <option value="aspect-[1/1]">1:1 Square Key Art</option>
                          <option value="aspect-[4/5]">4:5 Editorial Portrait</option>
                          <option value="aspect-[9/16]">9:16 Vertical Reel</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-white/50 block text-[10px] mb-1">DIRECTOR ROLE</span>
                        <input
                          type="text"
                          value={analyzedData.role || 'Lead Art Director'}
                          onChange={(e) => setAnalyzedData({ ...analyzedData, role: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded px-3 py-1.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-white/50 block mb-1">DIRECTOR NARRATIVE</span>
                      <textarea
                        rows={2}
                        value={analyzedData.desc || ''}
                        onChange={(e) => setAnalyzedData({ ...analyzedData, desc: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded px-3 py-1.5 font-mono text-xs text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishUpload}
                      className="w-full py-3.5 bg-[#00e575] hover:bg-[#00c565] text-black font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all shadow-lg"
                    >
                      {savedUploadSuccess ? '✓ PUBLISHED TO LIMITLESS CANVAS ARCHIVE!' : '🚀 PUBLISH TO LIMITLESS CANVAS ARCHIVE'}
                    </button>
                  </div>
                ) : (
                  <div className="h-72 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl mb-3">
                      🎯
                    </div>
                    <span className="font-mono text-xs text-white/50 mb-1 font-bold">
                      AWAITING ASSET SELECTION
                    </span>
                    <p className="font-mono text-[11px] text-white/40 max-w-xs leading-relaxed">
                      Select or drop a folder on the left. Click &quot;AI Auto-Direct&quot; and the engine will calculate true dimensions and configure the canvas folder card automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI ARTICLE STUDIO */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <span className="font-mono text-xs text-[#ff2a2a] tracking-widest uppercase block mb-1">
                  NEW JOURNAL ESSAY
                </span>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-4">
                  AI Editorial Ghostwriter
                </h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Essay Topic / Concept
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ACES Color Pipelines for Heritage Silk"
                      value={articleTopic}
                      onChange={(e) => setArticleTopic(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Category
                    </label>
                    <select
                      value={articleCategory}
                      onChange={(e) => setArticleCategory(e.target.value as BlogPost['category'])}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-[#ff2a2a]"
                    >
                      <option value="LIGHTING & ON-SET">LIGHTING &amp; ON-SET</option>
                      <option value="TYPOGRAPHY">TYPOGRAPHY</option>
                      <option value="MOTION & EDITORIAL">MOTION &amp; EDITORIAL</option>
                      <option value="CASE STUDY">CASE STUDY</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={articleCover}
                      onChange={(e) => setArticleCover(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Rough Directorial Notes / Thoughts
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. We avoided digital saturation. Used continuous tungsten lights. Kept highlight rolloff gentle."
                      value={articleNotes}
                      onChange={(e) => setArticleNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDraftArticle}
                    disabled={isDraftingArticle || !articleTopic}
                    className="w-full py-3 bg-[#ff2a2a] hover:bg-[#ff4444] disabled:opacity-40 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all mt-2"
                  >
                    {isDraftingArticle ? '✍️ DRAFTING ESSAY WITH AI...' : '✍️ DRAFT ARTICLE WITH AI COPILOT'}
                  </button>
                </div>
              </div>

              {/* Published Journal Essays Gallery */}
              {blogPosts.length > 0 && (
                <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-white/50 tracking-widest uppercase">
                      PUBLISHED ESSAYS ({blogPosts.length})
                    </span>
                    <Link href="/blog" className="font-mono text-[10px] text-[#00e575] hover:underline uppercase">
                      VIEW /BLOG ↗
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {blogPosts.map((post) => (
                      <div
                        key={post.slug}
                        className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg group"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold block truncate text-white">{post.title}</span>
                          <span className="font-mono text-[10px] text-white/50 block truncate">
                            {post.category} • {post.date}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlogPost(post.slug)}
                          className="px-2 py-1 text-[10px] font-mono text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors uppercase flex-shrink-0"
                          title="Delete from Journal"
                        >
                          🗑️ REMOVE
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Article Preview Panel */}
            <div className="lg:col-span-7">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <span className="font-mono text-xs text-white/50 tracking-widest uppercase block mb-1">
                  ARTICLE PREVIEW
                </span>
                <h3 className="font-display font-bold text-xl uppercase mb-6">
                  Publication Layout
                </h3>

                {draftedArticle ? (
                  <div className="flex flex-col gap-6">
                    <div className="p-6 bg-[#faf9f6] text-[#0d0d0e] rounded-xl">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-black/50 mb-2 uppercase">
                        <span className="px-2 py-0.5 bg-black/10 rounded-full font-bold text-black">{draftedArticle.category}</span>
                        <span>•</span>
                        <span>{draftedArticle.readTime}</span>
                      </div>
                      <h3 className="font-display font-black text-2xl uppercase mb-2">
                        {draftedArticle.title}
                      </h3>
                      <p className="font-mono text-xs text-black/70 mb-4 pb-3 border-b border-black/10">
                        {draftedArticle.subtitle}
                      </p>
                      <div className="flex flex-col gap-3 font-sans text-sm text-black/80 leading-relaxed">
                        {draftedArticle.content.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishArticle}
                      className="w-full py-3 bg-[#00e575] hover:bg-[#00c565] text-black font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all"
                    >
                      {savedArticleSuccess ? '✓ PUBLISHED TO JOURNAL!' : '🚀 PUBLISH TO STANDALONE JOURNAL'}
                    </button>
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                    <span className="font-mono text-xs text-white/40 mb-2">AWAITING ARTICLE DRAFT</span>
                    <p className="font-mono text-[11px] text-white/30 max-w-xs">
                      Enter a concept on the left and click Draft to generate an editorial breakdown.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI STUDIO CO-PILOT CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto bg-[#17171a] border border-white/10 rounded-2xl flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                <span className="font-mono text-xs font-bold tracking-wider uppercase">
                  MOIZ AI STUDIO CO-PILOT
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/50">DIRECTOR LEVEL PROTOCOL</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 font-mono text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#ff2a2a] text-white rounded-br-none'
                        : 'bg-black/60 border border-white/10 text-white/90 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                  <div className="p-4 bg-black/60 border border-white/10 rounded-xl text-white/50 animate-pulse">
                    Moiz Co-Pilot is reasoning...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-4 bg-black/60 border-t border-white/10 flex gap-3">
              <input
                type="text"
                placeholder="Ask about lighting, aspect ratios, typography systems, or asset organization..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
              />
              <button
                type="submit"
                disabled={isChatting || !chatInput.trim()}
                className="px-6 py-2.5 bg-white text-black hover:bg-[#ff2a2a] hover:text-white disabled:opacity-40 rounded-lg font-mono text-xs font-bold uppercase transition-all"
              >
                SEND
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SETTINGS & STORAGE */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-[#17171a] border border-white/10 rounded-2xl p-8">
            <span className="font-mono text-xs text-[#ff2a2a] tracking-widest uppercase block mb-1">
              ENGINE CONFIGURATION
            </span>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-4">
              Google Gemini API Integration
            </h2>
            <p className="font-mono text-xs text-white/70 leading-relaxed mb-6">
              Connect your Google Gemini API key to enable live generative intelligence for asset analysis, article ghostwriting, and studio copilot chat. If no key is set, the system seamlessly uses the built-in studio director engine.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                  Gemini API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  placeholder="Paste your Gemini API key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveApiKey}
                className="w-full py-2.5 bg-white text-black hover:bg-[#00e575] font-mono text-xs font-bold uppercase rounded-lg transition-colors"
              >
                {savedKeySuccess ? '✓ SAVED TO SECURE BROWSER STORAGE!' : 'SAVE GEMINI API KEY'}
              </button>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-white/60">
              <span className="font-bold text-white uppercase block mb-1">PRO-TIP: CLOUD DEPLOYMENT</span>
              You can also set <code className="text-[#00e575]">GEMINI_API_KEY</code> in your Vercel project environment variables, and the backend API will automatically detect and use it for all requests worldwide.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
