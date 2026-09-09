'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CustomCursor from '@/components/CustomCursor';
import { getStoredCanvasFiles, getStoredCanvasFilesAsync, subscribeToCanvasUpdates, deleteCanvasFile } from '@/lib/contentStore';
import ArchiveFolderCard, { FolderStickerData } from '@/components/ArchiveFolderCard';

export interface ArchiveFile {
  id: string;
  code: string;
  name: string;
  discipline: string;
  year: string;
  role: string;
  x: number;
  y: number;
  rot: number;
  img: string;
  aspect: string;
  colorTag: string;
  desc: string;
  deliverables: string[];
  photos?: string[];
  photoCount?: number;
  stickers?: FolderStickerData;
  isComingSoon?: boolean;
}

const DEFAULT_DISCIPLINE_FOLDERS: ArchiveFile[] = [
  {
    id: 'art-direction',
    code: '01 / CONCEPT',
    name: 'Art Direction',
    discipline: 'Art Direction • Concept Architecture',
    year: '2026',
    role: 'Lead Art Director',
    x: -320,
    y: -190,
    rot: -2,
    img: '',
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Concept architecture, high-impact creative direction, and commercial worldbuilding. Full campaign assets and pitch deliverables currently in production.',
    deliverables: ['Creative Direction', 'Shoot Concepts', 'Visual Architecture', 'Brand Worldbuilding'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇦🇪', countryCode: 'DXB', bgColor: '#ffffff' },
      sticker: { type: 'airplane', name: 'Directorial' },
    },
    isComingSoon: true,
  },
  {
    id: 'brand-identity',
    code: '02 / IDENTITY',
    name: 'Brand Identity',
    discipline: 'Brand Identity • Visual Systems',
    year: '2026',
    role: 'Creative Director',
    x: 280,
    y: -220,
    rot: 3,
    img: '',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#ede8df]',
    desc: 'Visual architecture, kinetic identity decks, and comprehensive brand guidelines. Full identity systems currently in production.',
    deliverables: ['Visual Identity', 'Typography Systems', 'Guidelines Deck', 'Packaging Design'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇯🇵', countryCode: 'TYO', bgColor: '#ffffff' },
      sticker: { type: 'torii', name: 'Identity Deck' },
    },
    isComingSoon: true,
  },
  {
    id: 'cinematography',
    code: '03 / CINEMA',
    name: 'Cinematography',
    discipline: 'Cinematography • Shoot Direction',
    year: '2026',
    role: 'Director of Photography',
    x: -520,
    y: 80,
    rot: 4,
    img: '',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#0055ff]',
    desc: 'High-contrast commercial lighting direction, frame composition, and on-set technical direction. Director reels currently in production.',
    deliverables: ['On-Set Direction', 'Lighting Setups', 'Camera Movement', 'Master Reels'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇫🇷', countryCode: 'PAR', bgColor: '#ffffff' },
      sticker: { type: 'camera', name: '35mm Stills' },
    },
    isComingSoon: true,
  },
  {
    id: 'motion-graphics',
    code: '04 / KINETIC',
    name: 'Motion Graphics',
    discipline: 'Motion Graphics • 2D / 3D',
    year: '2026',
    role: 'Motion Director',
    x: 0,
    y: 0,
    rot: 0,
    img: '',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#00e575]',
    desc: 'Distorted typography, kinetic title sequences, and frame-by-frame rhythmic pacing. Experimental 3D reels currently in production.',
    deliverables: ['Kinetic Titles', '3D Motion', 'Broadcast Packages', 'Social Loops'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇨🇭', countryCode: 'ZRH', bgColor: '#ffffff' },
      sticker: { type: 'diamond', name: 'Motion Deck' },
    },
    isComingSoon: true,
  },
  {
    id: 'video-editing',
    code: '05 / EDITORIAL',
    name: 'Video Editing',
    discipline: 'Video Editing • Commercial & Social Reels (9:16)',
    year: '2026',
    role: 'Lead Video Editor',
    x: 500,
    y: 90,
    rot: -3,
    img: '',
    aspect: 'aspect-[9/16]',
    colorTag: 'bg-[#141414]',
    desc: 'High-paced vertical social reels (9:16), director cuts, and 16:9 commercial broadcast masters. Timeline cuts currently in post-production.',
    deliverables: ['9:16 Social Ads', 'Director Cuts', 'Sound Rescoring', 'Multi-Format Masters'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇬🇧', countryCode: 'LDN', bgColor: '#ffffff' },
      sticker: { type: 'film', name: 'Editorial' },
    },
    isComingSoon: true,
  },
  {
    id: 'color-grading',
    code: '06 / GRADE',
    name: 'Colour Grading',
    discipline: 'Colour Grading • Film Stock Emulation',
    year: '2026',
    role: 'Colorist & Finisher',
    x: -260,
    y: 260,
    rot: -2,
    img: '',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Tungsten warmth, analogue 35mm film stock emulation, and saturated commercial pop. Color grading passes currently in mastering.',
    deliverables: ['Film Emulation', 'Tungsten Grading', 'Commercial Finish', 'Look LUTs'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇩🇪', countryCode: 'STR', bgColor: '#ffffff' },
      sticker: { type: 'flame', name: 'Tungsten' },
    },
    isComingSoon: true,
  },
  {
    id: 'photography',
    code: '07 / VISION',
    name: 'Photography',
    discipline: 'Photography • Stills & Editorial Lookbook',
    year: '2026',
    role: 'Lead Photographer',
    x: 260,
    y: 250,
    rot: 3,
    img: '',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#eeeae1]',
    desc: 'Fashion editorial, model staging, analogue grain, and lighting precision. High-resolution lookbook stills currently in curation.',
    deliverables: ['Editorial Stills', 'Model Staging', 'Analogue Grain', 'Lookbook Spreads'],
    photos: [],
    photoCount: 0,
    stickers: {
      stamp: { flag: '🇮🇹', countryCode: 'MIL', bgColor: '#ffffff' },
      sticker: { type: 'lemon', name: 'Lookbook' },
    },
    isComingSoon: true,
  },
];

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
        photos: match.photos && match.photos.length > 0 ? match.photos : [match.img],
        photoCount: match.photoCount || (match.photos ? match.photos.length : 1),
        stickers: match.stickers || folder.stickers,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [allFiles, setAllFiles] = useState<ArchiveFile[]>(DEFAULT_DISCIPLINE_FOLDERS);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [customFolderIds, setCustomFolderIds] = useState<Set<string>>(new Set());
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const refreshCanvasFiles = useCallback(() => {
    // 1. Instant sync hydration from localStorage cache
    const cached = getStoredCanvasFiles();
    if (cached && cached.length > 0) {
      setAllFiles(mergeDisciplinesWithUploads(cached));
      setCustomFolderIds(new Set(cached.map((c) => c.id)));
    } else {
      setAllFiles(DEFAULT_DISCIPLINE_FOLDERS);
      setCustomFolderIds(new Set());
    }

    // 2. Async hydration from IndexedDB for complete 38+ photo arrays
    getStoredCanvasFilesAsync()
      .then((fullFiles) => {
        if (fullFiles && fullFiles.length > 0) {
          setAllFiles(mergeDisciplinesWithUploads(fullFiles));
          setCustomFolderIds(new Set(fullFiles.map((f) => f.id)));
        }
      })
      .catch((err) => {
        console.warn('Async canvas files hydration failed:', err);
      });
  }, []);

  useEffect(() => {
    refreshCanvasFiles();

    // 3. Automatically update canvas when work is published or deleted in admin (live cross-tab)
    const unsubscribe = subscribeToCanvasUpdates(() => {
      refreshCanvasFiles();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshCanvasFiles]);

  const hasAutoNavigatedRef = useRef<string | null>(null);

  // Deep Link Auto-Navigation: Pans and automatically opens discipline or folder if passed in URL
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
      setPan({ x: -match.x, y: -match.y });
      setSelectedFile(match);
      setActiveTab('all');
      setEnlargedIndex(null);
    }
  }, [disciplineParam, folderParam, allFiles]);

  // Gesture tracking references
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1);

  // Gallery filtering & lightbox browsing state
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'lookbook' | 'banners' | 'stills'>('all');
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [photoRatios, setPhotoRatios] = useState<Record<string, number>>({});

  // Asynchronously detect & cache natural aspect ratios for accurate deliverable classification
  useEffect(() => {
    if (!selectedFile) return;
    const photos = selectedFile.photos && selectedFile.photos.length > 0 ? selectedFile.photos : [selectedFile.img];
    photos.forEach((url) => {
      if (photoRatios[url]) return;
      const img = new Image();
      img.onload = () => {
        if (img.naturalHeight > 0) {
          const ratio = img.naturalWidth / img.naturalHeight;
          setPhotoRatios((prev) => ({ ...prev, [url]: ratio }));
        }
      };
      img.onerror = () => {
        setPhotoRatios((prev) => ({ ...prev, [url]: 1.0 }));
      };
      img.src = url;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  // Lock document scroll on mount (BUG-01 fix: separated from keyboard handler so it doesn't re-run on enlargedIndex change)
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []); // Runs ONCE on mount/unmount only

  // Mobile viewport detection and smooth 3D tilt tracking (separate from overflow lock)
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
    };
    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setZoom(0.75);
      } else {
        setZoom(1.0);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, []); // Runs ONCE on mount/unmount only

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

  // --- UNIFIED POINTER & TOUCH GESTURE HANDLING ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary button (mouse left or single touch)
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Fallback safe
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 8) {
      hasMovedRef.current = true;
    }

    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Fallback safe
    }
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 120);
  };

  // --- TWO-FINGER PINCH-TO-ZOOM FOR MOBILE TOUCH ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / initialPinchDistRef.current;
      const newZoom = Math.min(Math.max(initialZoomRef.current * scale, 0.4), 1.8);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
  };

  // --- DESKTOP WHEEL ZOOM ---
  const handleWheel = (e: React.WheelEvent) => {
    // Zoom on pinch trackpad or Ctrl + Wheel
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 1.8));
    } else {
      // Scroll to pan
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  const handleFileClick = (file: ArchiveFile) => {
    // If the user was dragging/panning the canvas, don't open the modal
    if (hasMovedRef.current) return;
    setSelectedFile(file);
  };

  // Smoothly animated re-center back to (0, 0) and default zoom
  const handleRecenter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startPan = { ...pan };
    const startZoom = zoom;
    const targetPan = { x: 0, y: 0 };
    const targetZoom = isMobile ? 0.75 : 1.0;
    const startTime = performance.now();
    const duration = 450; // ms

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out curve
      const ease = 1 - Math.pow(1 - progress, 3);

      setPan({
        x: startPan.x + (targetPan.x - startPan.x) * ease,
        y: startPan.y + (targetPan.y - startPan.y) * ease,
      });
      setZoom(startZoom + (targetZoom - startZoom) * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <main
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#faf9f6] select-none touch-none"
      style={{ touchAction: 'none' }}
      data-cursor="drag"
    >
      {/* Luxury Custom Fluid Cursor (Auto-disabled on mobile) */}
      <CustomCursor />

      {/* Limitless Dotted Grid Infinite Canvas (Fine subtle architectural dots) */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          backgroundImage: 'radial-gradient(#dcdad2 0.9px, transparent 0.9px)',
          backgroundSize: `${(isMobile ? 22 : 28) * zoom}px ${(isMobile ? 22 : 28) * zoom}px`,
          backgroundPosition: `${pan.x % ((isMobile ? 22 : 28) * zoom)}px ${pan.y % ((isMobile ? 22 : 28) * zoom)}px`,
        }}
      />

      {/* Floating Minimalist Header: Back on Left, Re-Center Button on Top-Right */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-6 md:p-8 flex justify-between items-center pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2 px-4 sm:px-4 py-2.5 sm:py-2.5 bg-white/95 backdrop-blur-md rounded-[10px] font-mono text-[10.5px] sm:text-xs text-primary hover:text-accent-red active:scale-95 transition-all shadow-sm border border-black/5"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold">PORTFOLIO</span>
        </Link>

        {/* Top-Right Re-Center Button (Guarantees user never gets lost) */}
        <button
          type="button"
          onClick={handleRecenter}
          className="group pointer-events-auto inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-3.5 py-2.5 sm:py-2.5 bg-white/95 backdrop-blur-md rounded-[10px] font-mono text-[10.5px] sm:text-xs text-primary hover:text-[#e60000] active:scale-95 transition-all shadow-sm border border-black/5 cursor-pointer"
          title="Reset canvas view to center"
        >
          <span className="text-xs transition-transform duration-300 group-hover:rotate-90">⌖</span>
          <span className="font-bold uppercase tracking-wider">CENTER</span>
        </button>
      </header>

      {/* 3D Perspective Stage Wrapper (Adds authentic spatial depth to infinite canvas) */}
      <div
        className="w-full h-full relative flex items-center justify-center pointer-events-none overflow-hidden"
        style={{ perspective: '1600px' }}
      >
        {/* Limitless World Stage (Pans, Zooms & 3D Tilts smoothly with gestures) */}
        <div
          className="absolute top-1/2 left-1/2 will-change-transform transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotateX(${tilt.y * -3.5}deg) rotateY(${tilt.x * 5}deg)`,
            transformOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
          }}
        >
        {/* Archival Frosted-Glass 3D Folders (Images 1, 3, 4, 5 Reference) */}
        {allFiles.map((file) => (
          <div
            key={file.id}
            data-cursor="view"
            data-cursor-text="OPEN ↗"
            style={{
              left: `${file.x}px`,
              top: `${file.y}px`,
              transform: `translate(-50%, -50%) rotate(${file.rot}deg)`,
            }}
            className="absolute transition-transform duration-300 hover:z-50 select-none touch-manipulation pointer-events-auto cursor-pointer"
          >
            <ArchiveFolderCard
              id={file.id}
              code={file.code}
              name={file.name}
              discipline={file.discipline}
              year={file.year}
              role={file.role}
              photos={file.photos && file.photos.length > 0 ? file.photos : (file.img ? [file.img] : [])}
              photoCount={file.photoCount || (file.photos ? file.photos.length : 0)}
              stickers={file.stickers}
              colorTag={file.colorTag}
              isComingSoon={file.isComingSoon}
              onClick={() => {
                if (hasMovedRef.current) return;
                setSelectedFile(file);
                setActiveTab('all');
                setEnlargedIndex(null);
              }}
            />
          </div>
        ))}
        </div>
      </div>

      {/* Project Detail Lightbox Modal (Expansive Luxury Masonry Showcase) */}
      {selectedFile && (() => {
        const rawPhotos = selectedFile.photos && selectedFile.photos.length > 0 ? selectedFile.photos : [selectedFile.img];
        
        // Accurate real aspect-ratio classification
        const getCategory = (url: string): 'social' | 'lookbook' | 'banner' => {
          const r = photoRatios[url];
          if (!r) return 'lookbook';
          if (r < 0.78) return 'social'; // 9:16 vertical reels & stories
          if (r >= 1.20) return 'banner'; // 16:9 & 16:10 widescreen banners
          return 'lookbook'; // 4:5 editorial portrait / 1:1 square
        };

        const socialCount = rawPhotos.filter((u) => getCategory(u) === 'social').length;
        const lookbookCount = rawPhotos.filter((u) => getCategory(u) === 'lookbook').length;
        const bannerCount = rawPhotos.filter((u) => getCategory(u) === 'banner').length;

        // Filter photos based on active category tab
        const displayedPhotos = rawPhotos.filter((url) => {
          if (activeTab === 'all') return true;
          const cat = getCategory(url);
          if (activeTab === 'social') return cat === 'social';
          if (activeTab === 'lookbook') return cat === 'lookbook';
          if (activeTab === 'banners') return cat === 'banner';
          return true;
        });

        return (
          <div
            data-lenis-prevent
            onClick={() => setSelectedFile(null)}
            className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 md:p-8 animate-fadeIn overscroll-contain"
          >
            <div
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[96vw] xl:max-w-[1550px] h-[94dvh] sm:h-[92vh] bg-[#faf9f6] rounded-[18px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.35)] border border-black/10 flex flex-col overscroll-contain"
            >
              {/* Luxury Gallery Header */}
              <div className="px-5 py-4 sm:px-8 sm:py-5 bg-white/95 backdrop-blur-md border-b border-black/[0.06] flex flex-wrap justify-between items-center gap-4 z-20 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-black/10 hover:bg-black hover:text-white active:scale-95 text-primary flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
                    title="Back to Canvas"
                  >
                    ←
                  </button>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-primary uppercase leading-tight">
                      {selectedFile.name}
                    </h2>
                    {selectedFile.isComingSoon || rawPhotos.length === 0 ? (
                      <span className="font-mono text-xs px-3 py-1 rounded-full bg-accent-red/10 text-accent-red font-bold uppercase tracking-wider">
                        COMING SOON
                      </span>
                    ) : (
                      <span className="font-mono text-xs px-3 py-1 rounded-full bg-black/5 text-secondary font-bold">
                        {rawPhotos.length} ASSETS
                      </span>
                    )}
                  </div>
                </div>

                {/* Filter Pills Bar (Only show if there are photos) */}
                {!selectedFile.isComingSoon && rawPhotos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                        activeTab === 'all'
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-black/5 text-secondary hover:bg-black/10'
                      }`}
                    >
                      All ({rawPhotos.length})
                    </button>
                    {socialCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('social')}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                          activeTab === 'social'
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-black/5 text-secondary hover:bg-black/10'
                        }`}
                      >
                        📱 9:16 Social Ads ({socialCount})
                      </button>
                    )}
                    {lookbookCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('lookbook')}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                          activeTab === 'lookbook'
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-black/5 text-secondary hover:bg-black/10'
                        }`}
                      >
                        📖 4:5 Lookbook ({lookbookCount})
                      </button>
                    )}
                    {bannerCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('banners')}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                          activeTab === 'banners'
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-black/5 text-secondary hover:bg-black/10'
                        }`}
                      >
                        🖥️ 16:9 Banners ({bannerCount})
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {customFolderIds.has(selectedFile.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to completely delete "${selectedFile.name}" from your portfolio? This cannot be undone.`)) {
                          deleteCanvasFile(selectedFile.id);
                          setSelectedFile(null);
                          refreshCanvasFiles();
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full font-mono text-xs font-bold text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Completely delete this campaign"
                    >
                      <span>🗑️</span>
                      <span className="hidden sm:inline">Delete Campaign</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-black/5 hover:bg-black/15 active:scale-95 text-secondary flex items-center justify-center font-mono text-sm transition-all cursor-pointer"
                    title="Close Gallery"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body: Coming Soon Showcase OR Photo Gallery */}
              {selectedFile.isComingSoon || rawPhotos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 overflow-y-auto">
                  <div className="w-20 h-20 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center text-4xl shadow-inner">
                    📁
                  </div>
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-accent-red bg-accent-red/10 border border-accent-red/25 px-3 py-1 rounded-full">
                      DIRECTORIAL ARCHIVE IN PRODUCTION
                    </span>
                    <h3 className="font-display font-black text-3xl sm:text-5xl text-primary uppercase tracking-tight pt-3">
                      {selectedFile.name}
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-secondary tracking-wider uppercase font-semibold">
                      {selectedFile.discipline} • {selectedFile.role}
                    </p>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-secondary/90 leading-relaxed max-w-lg">
                    {selectedFile.desc}
                  </p>
                  {selectedFile.deliverables && selectedFile.deliverables.length > 0 && (
                    <div className="w-full pt-6 border-t border-black/5">
                      <span className="font-mono text-[10px] text-muted tracking-widest uppercase block mb-3 font-bold">
                        PLANNED DELIVERABLES &amp; RELEASES
                      </span>
                      <div className="flex flex-wrap justify-center gap-2">
                        {selectedFile.deliverables.map((deliv, i) => (
                          <span key={i} className="font-mono text-xs px-3.5 py-1.5 rounded-lg bg-black/5 text-primary border border-black/5 font-medium">
                            {deliv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/admin"
                      className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-accent-red font-mono text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm active:scale-95"
                    >
                      <span>⚡</span> Upload Work in Studio Desk ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="px-5 py-3 rounded-xl bg-black/5 hover:bg-black/10 text-primary font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Back to Canvas
                    </button>
                  </div>
                </div>
              ) : (
                /* Adaptive Luxury Editorial Gallery (Zero Padding Holes, Zero Clutter) */
                <div className="flex-1 p-5 sm:p-8 md:p-10 overflow-y-auto space-y-10">
                {displayedPhotos.length === 0 ? (
                  <div className="py-20 text-center space-y-4 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-black/5 mx-auto flex items-center justify-center font-mono text-lg text-secondary">
                      ∅
                    </div>
                    <p className="font-mono text-xs text-secondary uppercase tracking-wider">
                      No assets found in this format.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className="px-5 py-2 bg-black text-white rounded-full font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      Show All Assets ({rawPhotos.length}) →
                    </button>
                  </div>
                ) : displayedPhotos.length === 1 ? (
                  /* Focused Centered Luxury Showcase for 1 Filtered Photo */
                  <div className="max-w-xl mx-auto flex flex-col items-center">
                    {(() => {
                      const photoUrl = displayedPhotos[0];
                      const rawIndex = rawPhotos.indexOf(photoUrl);
                      const cat = getCategory(photoUrl);
                      return (
                        <div
                          onClick={() => setEnlargedIndex(rawIndex)}
                          className="w-full relative rounded-[18px] overflow-hidden group cursor-zoom-in transition-all duration-300 hover:scale-[1.01] shadow-[0_24px_60px_rgba(0,0,0,0.18)] bg-[#eae7de] border border-black/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={`${selectedFile.name} asset ${rawIndex + 1}`}
                            className="w-full h-auto max-h-[68vh] object-contain mx-auto block rounded-[18px] transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop';
                            }}
                          />

                          {/* Minimal Luxury Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 pointer-events-none">
                            <div className="flex justify-end">
                              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/15">
                                {cat === 'social' ? '9:16 Social Reel' : cat === 'banner' ? '16:9 Widescreen' : '4:5 Editorial Lookbook'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-white">
                              <span className="font-mono text-xs font-bold tracking-wide">
                                Asset {String(rawIndex + 1).padStart(2, '0')} of {rawPhotos.length}
                              </span>
                              <span className="font-mono text-xs font-bold text-accent-red flex items-center gap-1">
                                <span>Click to Enlarge</span>
                                <span>↗</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-3 flex items-center gap-3 text-secondary font-mono text-[11px]">
                      <span>Single Format Focus</span>
                      <span>•</span>
                      <span className="uppercase text-accent-red font-bold">
                        {getCategory(displayedPhotos[0]) === 'social' ? '9:16 Vertical Reel' : getCategory(displayedPhotos[0]) === 'banner' ? '16:9 Widescreen Banner' : '4:5 Editorial Lookbook'}
                      </span>
                    </div>
                  </div>
                ) : displayedPhotos.length <= 3 ? (
                  /* Balanced Centered Grid for 2-3 Photos */
                  <div className={`grid gap-6 max-w-5xl mx-auto ${
                    displayedPhotos.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                  }`}>
                    {displayedPhotos.map((photoUrl, idx) => {
                      const rawIndex = rawPhotos.indexOf(photoUrl);
                      const cat = getCategory(photoUrl);
                      return (
                        <div
                          key={idx}
                          onClick={() => setEnlargedIndex(rawIndex)}
                          className="break-inside-avoid relative rounded-[14px] overflow-hidden group cursor-zoom-in transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] bg-[#eae7de] border border-black/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={`${selectedFile.name} asset ${rawIndex + 1}`}
                            className="w-full h-auto block rounded-[14px] transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop';
                            }}
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                            <div className="flex justify-end">
                              <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/15">
                                {cat === 'social' ? '9:16 Social Reel' : cat === 'banner' ? '16:9 Widescreen' : '4:5 Editorial Lookbook'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-white">
                              <span className="font-mono text-[11px] font-bold tracking-wide">
                                Asset {String(rawIndex + 1).padStart(2, '0')}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-accent-red flex items-center gap-1">
                                <span>Enlarge</span>
                                <span>↗</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Rich Editorial Masonry Columns for 4+ Photos */
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 sm:gap-6 space-y-5 sm:space-y-6">
                    {displayedPhotos.map((photoUrl, idx) => {
                      const rawIndex = rawPhotos.indexOf(photoUrl);
                      const cat = getCategory(photoUrl);

                      return (
                        <div
                          key={idx}
                          onClick={() => setEnlargedIndex(rawIndex)}
                          className="break-inside-avoid relative rounded-[14px] overflow-hidden group cursor-zoom-in transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] bg-[#eae7de] border border-black/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl}
                            alt={`${selectedFile.name} asset ${rawIndex + 1}`}
                            className="w-full h-auto block rounded-[14px] transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop';
                            }}
                          />

                          {/* Minimal Luxury Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                            <div className="flex justify-end">
                              <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/15">
                                {cat === 'social' ? '9:16 Social Reel' : cat === 'banner' ? '16:9 Widescreen' : '4:5 Editorial Lookbook'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-white">
                              <span className="font-mono text-[11px] font-bold tracking-wide">
                                Asset {String(rawIndex + 1).padStart(2, '0')}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-accent-red flex items-center gap-1">
                                <span>Enlarge</span>
                                <span>↗</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Directorial Narrative & Deliverables */}
                {selectedFile.desc && (
                  <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-4 max-w-4xl mx-auto mt-8">
                    <div>
                      <span className="font-mono text-xs text-accent-red font-bold uppercase tracking-wider block mb-1.5">
                        Directorial Vision &amp; Strategy
                      </span>
                      <p className="text-sm sm:text-base text-secondary leading-relaxed">
                        {selectedFile.desc}
                      </p>
                    </div>

                    {selectedFile.deliverables && selectedFile.deliverables.length > 0 && (
                      <div className="border-t border-black/5 pt-4">
                        <span className="font-mono text-xs font-bold text-primary uppercase block mb-2.5">
                          Campaign Scope:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedFile.deliverables.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1.5 bg-[#f5f4f0] border border-black/5 rounded-[8px] font-mono text-xs text-secondary"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="mt-8 pt-6 border-t border-black/10 flex flex-wrap justify-between items-center gap-4 max-w-4xl mx-auto">
                  <span className="font-mono text-xs text-secondary tracking-wider uppercase">
                    {rawPhotos.length} {rawPhotos.length === 1 ? 'Asset' : 'Assets'} Available • {selectedFile.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {customFolderIds.has(selectedFile.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to completely delete "${selectedFile.name}" from your portfolio? This cannot be undone.`)) {
                            deleteCanvasFile(selectedFile.id);
                            setSelectedFile(null);
                            refreshCanvasFiles();
                          }
                        }}
                        className="font-mono text-xs px-4 py-2 rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold flex items-center gap-1.5"
                      >
                        <span>🗑️</span>
                        <span>Delete Campaign</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="font-mono text-xs px-5 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition-all font-bold uppercase cursor-pointer"
                    >
                      Close Gallery
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        );
      })()}

      {/* Full-Screen High-Resolution Multi-Asset Lightbox Overlay with Next / Prev */}
      {enlargedIndex !== null && selectedFile && (() => {
        const rawPhotos = selectedFile.photos && selectedFile.photos.length > 0 ? selectedFile.photos : [selectedFile.img];
        const currentPhoto = rawPhotos[enlargedIndex] || rawPhotos[0];

        return (
          <div
            onClick={() => setEnlargedIndex(null)}
            className="fixed inset-0 z-[20000] bg-black/92 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          >
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : rawPhotos.length - 1));
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center font-mono text-lg cursor-pointer"
              title="Previous Photo (Left Arrow)"
            >
              ←
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedIndex((prev) => (prev !== null && prev < rawPhotos.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center font-mono text-lg cursor-pointer"
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
                alt={`Asset ${enlargedIndex + 1}`}
                className="max-w-full max-h-[84vh] object-contain rounded-[10px] shadow-2xl select-none"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop';
                }}
              />
              <div className="mt-4 flex items-center gap-6 text-white font-mono text-xs">
                <span className="text-white/70 tracking-widest uppercase">
                  Asset {enlargedIndex + 1} of {rawPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setEnlargedIndex(null)}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all cursor-pointer font-bold uppercase tracking-wider"
                >
                  Close [ESC]
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
        <div className="w-screen h-screen bg-[#faf9f6] flex flex-col items-center justify-center font-mono text-xs text-neutral-500 gap-3">
          <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="tracking-wider uppercase">Loading Spatial Archive...</span>
        </div>
      }
    >
      <InfiniteCanvasContent />
    </Suspense>
  );
}
