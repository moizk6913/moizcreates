'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CustomCursor from '@/components/CustomCursor';
import {
  getStoredCanvasFiles,
  getStoredCanvasFilesAsync,
  subscribeToCanvasUpdates,
  getStoredWorksAsync,
  WorkItem,
} from '@/lib/contentStore';
import PlaygroundCosmos from '@/components/PlaygroundCosmos';
import ArchiveDirectorDesk from '@/components/ArchiveDirectorDesk';
import { get35CuratedDeliverables, DeliverableAsset } from '@/lib/archiveDeliverables';

import { DEFAULT_DISCIPLINE_FOLDERS, ArchiveFile } from '@/lib/defaultDisciplines';
export type { ArchiveFile };

function mergeDisciplinesWithUploads(uploadedFiles: any[]): ArchiveFile[] {
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return DEFAULT_DISCIPLINE_FOLDERS;
  }

  const merged: ArchiveFile[] = DEFAULT_DISCIPLINE_FOLDERS.map((d) => ({ ...d }));
  const claimedUploadIds = new Set<string>();

  // 1. Check if uploaded files match any of the 7 core disciplines
  merged.forEach((folder, idx) => {
    const match = uploadedFiles.find((upload) => {
      if (claimedUploadIds.has(upload.id)) return false;
      const norm = (upload.discipline || '').toLowerCase();
      const nameNorm = (upload.name || '').toLowerCase();
      const fid = folder.id.toLowerCase().replace(/-/g, ' ');

      if (norm.includes(fid) || nameNorm.includes(fid)) return true;
      if (folder.id === 'video-editing' && (norm.includes('video') || norm.includes('social ads') || norm.includes('reel') || norm.includes('edit'))) return true;
      if (folder.id === 'art-direction' && (norm.includes('art') || norm.includes('direction') || norm.includes('campaign') || norm.includes('concept'))) return true;
      if (folder.id === 'brand-identity' && (norm.includes('brand') || norm.includes('identity') || norm.includes('logo'))) return true;
      if (folder.id === 'cinematography' && (norm.includes('cinema') || norm.includes('camera') || norm.includes('shoot'))) return true;
      if (folder.id === 'motion-graphics' && (norm.includes('motion') || norm.includes('3d') || norm.includes('kinetic') || norm.includes('animation'))) return true;
      if (folder.id === 'color-grading' && (norm.includes('color') || norm.includes('grade') || norm.includes('grading'))) return true;
      if (folder.id === 'photography' && (norm.includes('photo') || norm.includes('stills') || norm.includes('lookbook'))) return true;
      return false;
    });

    if (match) {
      claimedUploadIds.add(match.id);
      merged[idx] = {
        id: match.id,
        code: folder.code,
        name: match.name,
        discipline: match.discipline || folder.discipline,
        year: match.year || '2026',
        role: match.role || folder.role,
        x: folder.x,
        y: folder.y,
        rot: folder.rot,
        img: match.img || (match.photos && match.photos[0]) || '',
        aspect: match.aspect || folder.aspect,
        colorTag: match.colorTag || folder.colorTag,
        desc: match.desc || folder.desc,
        deliverables: match.deliverables && match.deliverables.length > 0 ? match.deliverables : folder.deliverables,
        photos: (match.photos && match.photos.filter((p: string) => p && p.trim().length > 0).length > 0) ? match.photos : folder.photos,
        photoCount: match.photoCount || (match.photos ? match.photos.length : 1),
        stickers: match.stickers || folder.stickers,
        variant: (match.variant as any) || folder.variant,
        isComingSoon: false,
      };
    }
  });

  // 2. Any additional custom uploaded files that were not matched to the 7 core slots
  uploadedFiles.forEach((upload, extraIdx) => {
    if (!claimedUploadIds.has(upload.id)) {
      merged.push({
        id: upload.id,
        code: upload.code || `FILE_${String(extraIdx + 8).padStart(2, '0')}.DIR`,
        name: upload.name,
        discipline: upload.discipline || 'Custom Directorial Campaign',
        year: upload.year || '2026',
        role: upload.role || 'Lead Director',
        x: upload.x || 620 + ((extraIdx % 3) * 220),
        y: upload.y || -180 + (Math.floor(extraIdx / 3) * 240),
        rot: upload.rot || 0,
        img: upload.img || (upload.photos && upload.photos[0]) || '',
        aspect: upload.aspect || 'aspect-[4/5]',
        colorTag: upload.colorTag || 'bg-[#18181b]',
        desc: upload.desc || 'Directorial campaign assets.',
        deliverables: upload.deliverables || ['Campaign Assets'],
        photos: upload.photos || [upload.img],
        photoCount: upload.photoCount || (upload.photos ? upload.photos.length : 1),
        stickers: upload.stickers,
        isComingSoon: false,
      });
    }
  });

  return merged;
}

const DISCIPLINE_FILE_MAP: Record<string, string> = {
  'art-direction': 'art-direction',
  'brand-identity': 'brand-identity',
  'cinematography': 'cinematography',
  'motion-graphics': 'motion-graphics',
  'video-editing': 'video-editing',
  'color-grading': 'color-grading',
  'photography': 'photography',
};

function InfiniteCanvasContent() {
  const searchParams = useSearchParams();
  const disciplineParam = searchParams.get('discipline');
  const folderParam = searchParams.get('folder');
  const viewParam = searchParams.get('view');

  const [activeCanvasMode, setActiveCanvasMode] = useState<'archive' | 'playground'>(
    viewParam === 'playground' ? 'playground' : 'archive'
  );
  const [standaloneWorks, setStandaloneWorks] = useState<WorkItem[]>([]);

  useEffect(() => {
    if (viewParam === 'playground') {
      setActiveCanvasMode('playground');
    } else if (viewParam === 'archive') {
      setActiveCanvasMode('archive');
    }
  }, [viewParam]);

  const [allFiles, setAllFiles] = useState<ArchiveFile[]>(DEFAULT_DISCIPLINE_FOLDERS);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);

  const refreshCanvasFiles = useCallback(() => {
    // 1. Instant sync hydration from localStorage cache
    const cached = getStoredCanvasFiles();
    if (cached && cached.length > 0) {
      setAllFiles(mergeDisciplinesWithUploads(cached));
    } else {
      setAllFiles(DEFAULT_DISCIPLINE_FOLDERS);
    }

    // 2. Async hydration from IndexedDB for complete 38+ photo arrays
    getStoredCanvasFilesAsync()
      .then((fullFiles) => {
        if (fullFiles && fullFiles.length > 0) {
          setAllFiles(mergeDisciplinesWithUploads(fullFiles));
        }
      })
      .catch((err) => {
        console.warn('Async canvas files hydration failed:', err);
      });

    // 3. Hydrate standalone works for Playground
    getStoredWorksAsync()
      .then((works) => {
        const standalone = works.filter(
          (w) =>
            (!w.projectId ||
              (w.tags &&
                w.tags.some(
                  (t) =>
                    t.toLowerCase().includes('playground') ||
                    t.toLowerCase().includes('lab') ||
                    t.toLowerCase().includes('experiment')
                ))) &&
            w.status !== 'draft'
        );
        setStandaloneWorks(standalone);
      })
      .catch((err) => {
        console.warn('Async works hydration for playground failed:', err);
      });
  }, []);

  useEffect(() => {
    refreshCanvasFiles();

    // Automatically update canvas when work is published or deleted in admin (live cross-tab)
    const unsubscribe = subscribeToCanvasUpdates(() => {
      refreshCanvasFiles();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshCanvasFiles]);

  const hasAutoNavigatedRef = useRef<string | null>(null);

  // Deep Link Auto-Navigation: Automatically opens discipline or folder if passed in URL
  useEffect(() => {
    if (!disciplineParam && !folderParam) return;
    const targetKey = `${disciplineParam || ''}_${folderParam || ''}`;
    if (hasAutoNavigatedRef.current === targetKey) return;

    const targetId = folderParam || (disciplineParam ? DISCIPLINE_FILE_MAP[disciplineParam] || disciplineParam : null);
    if (!targetId) return;

    const match = allFiles.find((f) =>
      f.id.toLowerCase() === targetId.toLowerCase() ||
      (disciplineParam && f.discipline.toLowerCase().includes(disciplineParam.replace(/-/g, ' ')))
    );

    if (match) {
      hasAutoNavigatedRef.current = targetKey;
      setSelectedFile(match);
      setActiveTab('all');
      setEnlargedIndex(null);
    }
  }, [disciplineParam, folderParam, allFiles]);

  // Gallery filtering & lightbox browsing state
  const [activeTab, setActiveTab] = useState<'all' | 'stills' | 'banners' | 'social'>('all');
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [editingDesc, setEditingDesc] = useState<string | null>(null);
  const bentoScrollRef = useRef<HTMLDivElement>(null);

  // Key handling: Escape to close lightbox or return from detail view to archive
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (enlargedIndex !== null) {
          setEnlargedIndex(null);
        } else if (selectedFile) {
          setSelectedFile(null);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('folder');
            url.searchParams.delete('discipline');
            url.searchParams.delete('tuner');
            window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedFile, enlargedIndex]);

  // Robust Reset internal bento scroll to top whenever a new project is opened or filter tab changes
  useEffect(() => {
    if (selectedFile) {
      setEditingDesc(null);
      requestAnimationFrame(() => {
        if (bentoScrollRef.current) {
          bentoScrollRef.current.scrollTop = 0;
        }
      });
      const t1 = setTimeout(() => {
        if (bentoScrollRef.current) {
          bentoScrollRef.current.scrollTop = 0;
        }
      }, 50);
      const t2 = setTimeout(() => {
        if (bentoScrollRef.current) {
          bentoScrollRef.current.scrollTop = 0;
        }
      }, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [selectedFile, activeTab]);

  const handleSaveDescription = (fileId: string, newDesc: string) => {
    setAllFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, desc: newDesc } : f))
    );
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile((prev) => (prev ? { ...prev, desc: newDesc } : null));
    }
    try {
      const existing = getStoredCanvasFiles();
      const updated = existing.map((f) =>
        f.id === fileId ? { ...f, desc: newDesc } : f
      );
      if (!existing.some((f) => f.id === fileId)) {
        const fileToSave = allFiles.find((f) => f.id === fileId);
        if (fileToSave) {
          updated.push({
            id: fileToSave.id,
            name: fileToSave.name,
            code: fileToSave.code,
            discipline: fileToSave.discipline,
            year: fileToSave.year,
            role: fileToSave.role,
            desc: newDesc,
            img: fileToSave.img,
            photos: fileToSave.photos || [fileToSave.img],
            deliverables: fileToSave.deliverables,
            aspect: fileToSave.aspect,
            colorTag: fileToSave.colorTag,
            stickers: fileToSave.stickers,
            variant: fileToSave.variant,
            x: fileToSave.x,
            y: fileToSave.y,
            rot: fileToSave.rot,
          });
        }
      }
      localStorage.setItem('moiz_custom_canvas_files', JSON.stringify(updated));
    } catch {}
  };

  // Lock document scroll on mount
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // Escape key handler — depends on enlargedIndex to know what to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (enlargedIndex !== null) {
          setEnlargedIndex(null);
        } else {
          setSelectedFile(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enlargedIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (enlargedIndex === null || !selectedFile) return;
    const photos = selectedFile.photos && selectedFile.photos.length > 0 ? selectedFile.photos : [selectedFile.img];
    
    const handleNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setEnlargedIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setEnlargedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      }
    };
    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [enlargedIndex, selectedFile]);

  // Completely lock background scrolling and interactions when modal or lightbox is active
  useEffect(() => {
    if (selectedFile || enlargedIndex !== null) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Pause Lenis smooth scroll so background desk is 100% frozen
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }

      return () => {
        document.body.style.overflow = origBodyOverflow;
        document.documentElement.style.overflow = origHtmlOverflow;
        if (typeof window !== 'undefined' && (window as any).__lenis) {
          (window as any).__lenis.start();
        }
      };
    }
  }, [selectedFile, enlargedIndex]);

  return (
    <main
      className="relative w-screen min-h-screen bg-[#faf9f6] text-black overflow-hidden select-none"
    >
      {/* Luxury Custom Fluid Cursor (Auto-disabled on mobile) */}
      <CustomCursor />

      {/* Floating Minimalist Header: Back on Left, Context Indicator on Right */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 md:p-8 flex justify-between items-center pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] font-mono text-[10.5px] sm:text-xs bg-white/95 text-neutral-900 hover:text-neutral-500 backdrop-blur-xl border border-black/10 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold uppercase tracking-wider">BACK</span>
        </Link>

        {/* Top-Right Contextual Action */}
        <div className="pointer-events-auto flex items-center gap-2">
          {activeCanvasMode === 'archive' ? (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-black/10 font-mono text-[11px] text-neutral-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              <span className="font-bold tracking-wider uppercase">ARCHIVE REPERTORY</span>
            </div>
          ) : (
            <div className="w-[84px] sm:w-[94px] pointer-events-none" />
          )}
        </div>
      </header>

      {/* Bottom Center Floating Mode Switcher (Pure Black & White • Clean Text) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center p-1 apple-pill rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] font-mono text-[11px] font-bold text-neutral-800">
          <button
            type="button"
            onClick={() => setActiveCanvasMode('playground')}
            className={`px-4 py-1.5 apple-pill rounded-full transition-all cursor-pointer ${
              activeCanvasMode === 'playground'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            PLAYGROUND
          </button>
          <button
            type="button"
            onClick={() => setActiveCanvasMode('archive')}
            className={`px-4 py-1.5 apple-pill rounded-full transition-all cursor-pointer ${
              activeCanvasMode === 'archive'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            ARCHIVE
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: HAUTE-COUTURE EDITORIAL ARCHIVE REPERTORY            */}
      {/* ============================================================ */}
      {activeCanvasMode === 'archive' ? (
        <ArchiveDirectorDesk
          files={allFiles}
          onSelectFile={(file) => {
            setSelectedFile(file);
            setActiveTab('all');
            setEnlargedIndex(null);
          }}
        />
      ) : (
        /* ============================================================ */
        /* MODE 2: PLAYGROUND COSMOS (2.5D SPATIAL UNIVERSE & HUD)      */
        /* ============================================================ */
        <PlaygroundCosmos uploadedWorks={standaloneWorks} />
      )}

      {/* Project Detail Lightbox Modal (High-Fashion Directorial Monograph & Archival Dossier) */}
      {selectedFile && (() => {
        // Fetch up to 35 curated high-res visual assets for this discipline
        const curatedDeliverables = get35CuratedDeliverables(selectedFile.id, selectedFile.photos);
        
        // Filter photos based on active category tab (zero numbers, zero brackets, no 'All')
        const displayedDeliverables = curatedDeliverables.filter((asset) => {
          if (activeTab === 'all') return true;
          return asset.type === activeTab;
        });

        return (
          <div
            data-lenis-prevent
            onClick={() => setSelectedFile(null)}
            onWheel={(e) => {
              e.stopPropagation();
              if (bentoScrollRef.current) {
                bentoScrollRef.current.scrollTop += e.deltaY;
              }
            }}
            style={{
              paddingTop: 'var(--modal-top-spacing, 40px)',
              paddingBottom: 'var(--modal-top-spacing, 40px)',
            }}
            className="fixed inset-0 z-[10000] bg-white/40 backdrop-blur-3xl flex items-center justify-center px-3 sm:px-6 md:px-8 overflow-hidden select-text pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label={selectedFile.name}
          >
            {/* STATIONARY SHOWCASE CARD (Stays fixed & centered, never scrolls out of viewport, ZERO black stroke) */}
            <div
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              style={{
                height: 'calc(100vh - (var(--modal-top-spacing, 40px) * 2))',
                maxHeight: '920px',
              }}
              className="relative w-full max-w-[1240px] bg-white apple-widget-lg rounded-[48px] sm:rounded-[56px] shadow-[0_30px_90px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden select-auto"
            >
              {/* TOP NAVIGATION BAR (Clean, Prominent Tabs, Single Close Button) */}
              <header
                onWheel={(e) => {
                  e.stopPropagation();
                  if (bentoScrollRef.current) {
                    bentoScrollRef.current.scrollTop += e.deltaY;
                  }
                }}
                style={{
                  paddingLeft: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
                  paddingRight: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
                  paddingTop: 'var(--modal-nav-top-spacing, 30px)',
                  paddingBottom: 'var(--modal-nav-top-spacing, 30px)',
                }}
                className="flex items-center justify-between flex-shrink-0 bg-white z-20 border-b border-black/[0.04]"
              >
                <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                  {/* Archive Item Title */}
                  <h2 className="text-sm sm:text-base font-black text-neutral-900 uppercase tracking-tight truncate max-w-[140px] sm:max-w-none flex-shrink-0">
                    {selectedFile.name}
                  </h2>

                  {/* Internal Detail View Navigation: Deliverables | Stills | Widescreen | Reels */}
                  <nav className="flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 text-xs sm:text-sm font-semibold py-0.5 ml-1 sm:ml-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-3 sm:px-4 py-1.5 apple-pill rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'all'
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      Deliverables
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stills')}
                      className={`px-3 sm:px-4 py-1.5 apple-pill rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'stills'
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      Stills
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('banners')}
                      className={`px-3 sm:px-4 py-1.5 apple-pill rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'banners'
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      Widescreen
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('social')}
                      className={`px-3 sm:px-4 py-1.5 apple-pill rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'social'
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      Reels
                    </button>
                  </nav>
                </div>

                {/* Header Action Buttons */}
                <div className="relative flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('folder');
                        url.searchParams.delete('discipline');
                        url.searchParams.delete('tuner');
                        window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
                      }
                    }}
                    className="px-4 sm:px-6 py-2 apple-pill rounded-full bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    title="Close and return to Archive"
                  >
                    <span>✕</span>
                    <span>Close</span>
                  </button>
                </div>
              </header>

              {/* INTERNAL SCROLL CONTAINER: ONLY THE BENTO CONTENT MOVES */}
              <div
                ref={bentoScrollRef}
                data-lenis-prevent
                onWheel={(e) => {
                  e.stopPropagation();
                }}
                style={{
                  paddingLeft: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
                  paddingRight: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
                  paddingTop: 'var(--modal-header-gap, 16px)',
                  gap: 'var(--modal-row-gap, 16px)',
                }}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar pb-14 flex flex-col touch-pan-y"
              >

              {/* ======================================================= */}
              {/* 1. DEDICATED PROJECT STATEMENT & OVERVIEW (Deliverables tab only) */}
              {/* Brand Name & Paragraph ONLY on clean canvas */}
              {/* ======================================================= */}
              {activeTab === 'all' && (
                <section
                  style={{
                    marginBottom: 'var(--modal-overview-gap, 34px)',
                  }}
                  className="w-full bg-transparent select-text transition-all pt-1"
                >
                  <div
                    style={{ gap: 'var(--modal-title-gap, 10px)' }}
                    className="flex flex-col max-w-4xl"
                  >
                    <h3
                      style={{ fontSize: 'var(--modal-title-size, 34px)' }}
                      className="font-black text-neutral-900 uppercase tracking-tight leading-tight"
                    >
                      {selectedFile.name}
                    </h3>

                    {editingDesc !== null ? (
                      <div className="space-y-3 mt-1">
                        <textarea
                          value={editingDesc}
                          onChange={(e) => setEditingDesc(e.target.value)}
                          rows={4}
                          placeholder="Describe the project overview, your directorial role, deliverables, creative execution (can be long or short)..."
                          className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-neutral-300 text-neutral-900 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-black shadow-xs font-normal"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleSaveDescription(selectedFile.id, editingDesc);
                              setEditingDesc(null);
                            }}
                            className="px-4 py-1.5 apple-pill rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            Save Narrative
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDesc(null)}
                            className="px-4 py-1.5 apple-pill rounded-full bg-neutral-200 text-neutral-800 hover:bg-neutral-300 text-xs font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p
                          onDoubleClick={() => setEditingDesc(selectedFile.desc || `High-fidelity directorial cut and multi-format production for ${selectedFile.name}. Executed end-to-end creative direction, sound design, visual pacing, and color grading tailored across broadcast widescreen formats and vertical social ecosystems.`)}
                          className="text-neutral-700 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line"
                          title="Double-click to edit narrative"
                        >
                          {selectedFile.desc || `High-fidelity directorial cut and multi-format production for ${selectedFile.name}. Executed end-to-end creative direction, sound design, visual pacing, and color grading tailored across broadcast widescreen formats and vertical social ecosystems.`}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ======================================================= */}
              {/* 2. BENTO DELIVERABLES STREAM (Based on Creative Sizes, ZERO Black Strokes) */}
              {/* 9:16 Reels, 16:10 Widescreen, 21:9 Banners, 4:5 Stills - Strict Tunable Gap */}
              {/* ======================================================= */}
              <section
                id="archival-collection-stream"
                style={{ gap: 'var(--modal-row-gap, 16px)' }}
                className="flex flex-col"
              >

                {/* FILTERED CATEGORY VIEWS */}
                {activeTab === 'stills' ? (
                  /* STILLS ONLY: Clean 3-Column 4:5 Grid */
                  <div
                    style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                    className="grid grid-cols-2 sm:grid-cols-3"
                  >
                    {displayedDeliverables.map((asset) => {
                      const originalIndex = curatedDeliverables.findIndex((d) => d.url === asset.url);
                      const clickIndex = originalIndex >= 0 ? originalIndex : 0;
                      return (
                        <div
                          key={`${asset.url}-${asset.title}`}
                          onClick={() => setEnlargedIndex(clickIndex)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="group relative overflow-hidden bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 aspect-[4/5] w-full"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.url}
                            alt={asset.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4 text-white pointer-events-none">
                            <div className="flex justify-between items-start">
                              <span className="px-3 py-1 apple-pill rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                STILL // 4:5
                              </span>
                              <span className="w-8 h-8 apple-circle rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                ↗
                              </span>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Editorial Frame</p>
                              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">{asset.title}</h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : activeTab === 'banners' ? (
                  /* BANNERS ONLY: Alternating Panoramas and Dual Widescreens */
                  <div
                    style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                    className="flex flex-col"
                  >
                    {Array.from({ length: Math.ceil(displayedDeliverables.length / 3) }).map((_, bIdx) => {
                      const chunk = displayedDeliverables.slice(bIdx * 3, bIdx * 3 + 3);
                      return (
                        <div
                          key={`banner-group-${bIdx}`}
                          style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                          className="flex flex-col"
                        >
                          {chunk[0] && (() => {
                            const origIdx = curatedDeliverables.findIndex((d) => d.url === chunk[0].url);
                            return (
                              <div
                                onClick={() => setEnlargedIndex(origIdx >= 0 ? origIdx : 0)}
                                style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                                className="group relative w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/9] overflow-hidden bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={chunk[0].url}
                                  alt={chunk[0].title}
                                  loading="lazy"
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-5 text-white pointer-events-none">
                                  <div className="flex justify-between items-start">
                                    <span className="px-3 py-1 apple-pill rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                      PANORAMIC BANNER // 21:9
                                    </span>
                                    <span className="w-8 h-8 apple-circle rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                      ↗
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Cinematic Ribbon</p>
                                    <h4 className="text-sm font-bold text-white tracking-tight">{chunk[0].title}</h4>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          {chunk.length > 1 && (
                            <div
                              style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                              className="grid grid-cols-1 sm:grid-cols-2"
                            >
                              {chunk.slice(1).map((item) => {
                                const origIdx = curatedDeliverables.findIndex((d) => d.url === item.url);
                                return (
                                  <div
                                    key={item.url}
                                    onClick={() => setEnlargedIndex(origIdx >= 0 ? origIdx : 0)}
                                    style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                                    className="group relative w-full aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.url}
                                      alt={item.title}
                                      loading="lazy"
                                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                                      onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4 text-white pointer-events-none">
                                      <div className="flex justify-between items-start">
                                        <span className="px-3 py-1 apple-pill rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                          WIDESCREEN // 16:10
                                        </span>
                                        <span className="w-8 h-8 apple-circle rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                          ↗
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Directorial Master</p>
                                        <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">{item.title}</h4>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : activeTab === 'social' ? (
                  /* REELS ONLY: Clean 4-Column 9:16 Vertical Grid */
                  <div
                    style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  >
                    {displayedDeliverables.map((asset) => {
                      const originalIndex = curatedDeliverables.findIndex((d) => d.url === asset.url);
                      const clickIndex = originalIndex >= 0 ? originalIndex : 0;
                      return (
                        <div
                          key={`${asset.url}-${asset.title}`}
                          onClick={() => setEnlargedIndex(clickIndex)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="group relative overflow-hidden bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 aspect-[9/16] w-full"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.url}
                            alt={asset.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4 text-white pointer-events-none">
                            <div className="flex justify-between items-start">
                              <span className="px-3 py-1 apple-pill rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                9:16 REEL
                              </span>
                              <span className="w-8 h-8 apple-circle rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                ↗
                              </span>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] text-white/70 uppercase tracking-wider">Vertical Motion Story</p>
                              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">{asset.title}</h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ALL DELIVERABLES: DYNAMIC BENTO STREAM (With Ending Missing Card Auto-Fill) */
                  (() => {
                    const renderCard = (
                      item: DeliverableAsset,
                      badge: string,
                      sub: string,
                      extraClasses = ''
                    ) => {
                      const origIdx = curatedDeliverables.findIndex((d) => d.url === item.url);
                      const clickIdx = origIdx >= 0 ? origIdx : 0;
                      return (
                        <div
                          key={`${item.url}-${item.title}`}
                          onClick={() => setEnlargedIndex(clickIdx)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className={`group relative overflow-hidden bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 ${extraClasses}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4 text-white pointer-events-none">
                            <div className="flex justify-between items-start">
                              <span className="px-3 py-1 apple-pill rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                {badge}
                              </span>
                              <span className="w-8 h-8 apple-circle rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                ↗
                              </span>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] text-white/70 uppercase tracking-wider">{sub}</p>
                              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">{item.title}</h4>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    const clusters: React.ReactNode[] = [];
                    // All deliverables start from index 0 in authentic bento groupings
                    const allItems = displayedDeliverables;
                    let i = 0;
                    let clusterCount = 0;

                    while (i < allItems.length) {
                      const pattern = clusterCount % 5;
                      clusterCount++;

                      if (pattern === 0) {
                        // HERO BENTO SPLIT: Widescreen Master (16:10) + Vertical Reel (9:16)
                        const item1 = allItems[i];
                        const item2 = allItems[i + 1];
                        i += item2 ? 2 : 1;

                        clusters.push(
                          <div
                            key={`bento-split-${i}`}
                            style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                            className="grid grid-cols-1 md:grid-cols-12"
                          >
                            <div className={`${item2 ? 'md:col-span-7' : 'md:col-span-12'} w-full aspect-[16/10]`}>
                              {renderCard(item1, 'WIDESCREEN // 16:10', 'Directorial Master', 'w-full h-full')}
                            </div>
                            {item2 && (
                              <div className="md:col-span-5 w-full aspect-[16/10] md:aspect-auto">
                                {renderCard(item2, 'VERTICAL REEL // 9:16', 'Motion Keyframe Reel', 'w-full h-full')}
                              </div>
                            )}
                          </div>
                        );
                      } else if (pattern === 1) {
                        // FULL-WIDTH PANORAMIC BANNER (21:9)
                        const it = allItems[i];
                        i += 1;

                        clusters.push(
                          <div key={`bento-ribbon-${i}`} className="w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/9]">
                            {renderCard(it, 'PANORAMIC BANNER // 21:9', 'Cinematic Spread', 'w-full h-full')}
                          </div>
                        );
                      } else if (pattern === 2) {
                        // TRIO STILLS (3 Items, Equal Height 4:5)
                        const items = allItems.slice(i, i + 3);
                        i += items.length;
                        const gridClass = items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3';

                        clusters.push(
                          <div
                            key={`bento-stills-${i}`}
                            style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                            className={`grid ${gridClass}`}
                          >
                            {items.map((it) => (
                              <div key={it.url} className="w-full aspect-[4/5]">
                                {renderCard(it, 'EDITORIAL STILL // 4:5', 'Directorial Stills Cut', 'w-full h-full')}
                              </div>
                            ))}
                          </div>
                        );
                      } else if (pattern === 3) {
                        // VERTICAL REELS (9:16) - Clean edge-to-edge layout, zero empty slot gap
                        const items = allItems.slice(i, i + 4);
                        i += items.length;

                        // Zero Missing Cards: If ending cluster has 3 items, layout dynamically becomes sm:grid-cols-3 so all 3 cards are the same width edge-to-edge!
                        const gridClass = items.length >= 4
                          ? 'grid-cols-2 sm:grid-cols-4'
                          : items.length === 3
                          ? 'grid-cols-1 sm:grid-cols-3'
                          : items.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : 'grid-cols-1';

                        clusters.push(
                          <div
                            key={`bento-reels-${i}`}
                            style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                            className={`grid ${gridClass}`}
                          >
                            {items.map((it, idx) => (
                              <div key={`${it.url}-${idx}`} className="w-full aspect-[9/16]">
                                {renderCard(it, '9:16 REEL // 1080x1920', 'Social Story Master', 'w-full h-full')}
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        // DUAL WIDESCREEN (2 Items, Equal Height 16:10)
                        const items = allItems.slice(i, i + 2);
                        i += items.length;
                        const gridClass = items.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

                        clusters.push(
                          <div
                            key={`bento-widescreen-${i}`}
                            style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                            className={`grid ${gridClass}`}
                          >
                            {items.map((it) => (
                              <div key={it.url} className="w-full aspect-[16/9] sm:aspect-[16/10]">
                                {renderCard(it, 'WIDESCREEN // 16:10', 'Commercial Cut', 'w-full h-full')}
                              </div>
                            ))}
                          </div>
                        );
                      }
                    }

                    return (
                      <div
                        style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                        className="flex flex-col"
                      >
                        {clusters}
                      </div>
                    );
                  })()
                )}
              </section>

              {/* 3. FLUSH COMPACT FOOTER (NO EXTRA GAP, NO BORDER LINE) */}
              <footer className="pt-4 pb-2 flex flex-wrap justify-between items-center text-xs text-neutral-400 font-medium flex-shrink-0">
                <span>Bento Studio Architecture • {selectedFile.name} Archive // {selectedFile.code || selectedFile.id}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-black font-semibold hover:underline cursor-pointer"
                >
                  Back to Desk Canvas ↗
                </button>
              </footer>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Full-Screen High-Resolution Multi-Asset Lightbox Overlay with Next / Prev */}
      {enlargedIndex !== null && selectedFile && (() => {
        const curatedDeliverables = get35CuratedDeliverables(selectedFile.id, selectedFile.photos);
        const photosList = curatedDeliverables.map((d) => d.url);
        const currentPhoto = photosList[enlargedIndex] || photosList[0] || selectedFile.img;
        const currentTitle = curatedDeliverables[enlargedIndex]?.title || selectedFile.name;

        return (
          <div
            onClick={() => setEnlargedIndex(null)}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[20000] bg-black/92 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          >
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photosList.length - 1));
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 apple-circle rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center font-mono text-lg cursor-pointer"
              title="Previous Photo (Left Arrow)"
            >
              ←
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedIndex((prev) => (prev !== null && prev < photosList.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 apple-circle rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center font-mono text-lg cursor-pointer"
              title="Next Photo (Right Arrow)"
            >
              →
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl max-h-[92vh] flex flex-col items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto}
                alt={currentTitle}
                className="max-w-full max-h-[84vh] object-contain apple-widget-md rounded-[36px] overflow-hidden shadow-2xl select-none"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop';
                }}
              />
              <div className="mt-4 flex items-center gap-6 text-white font-mono text-xs">
                <span className="text-white/70 tracking-widest uppercase">
                  Asset {enlargedIndex + 1} of {photosList.length} • {currentTitle}
                </span>
                <button
                  type="button"
                  onClick={() => setEnlargedIndex(null)}
                  className="px-4 py-1.5 apple-pill rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all cursor-pointer font-bold uppercase tracking-wider"
                >
                  Close ✕
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </main>
  );
}

export default function InfiniteCanvasPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-[#faf9f6] flex flex-col items-center justify-center font-mono text-xs text-neutral-800 gap-3 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span className="font-bold tracking-widest uppercase">MOIZ KHAN // ARCHIVAL DESK</span>
          </div>
          <span className="text-neutral-400 text-[10px] tracking-widest uppercase">
            CALIBRATING SPATIAL REPERTORY...
          </span>
        </div>
      }
    >
      <InfiniteCanvasContent />
    </Suspense>
  );
}
