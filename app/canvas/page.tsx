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
  stickers?: any;
  isComingSoon?: boolean;
  variant?: string;
}

const DEFAULT_DISCIPLINE_FOLDERS: ArchiveFile[] = [
  {
    id: 'art-direction',
    code: '01 / CONCEPT',
    name: 'Art Direction',
    discipline: 'Art Direction • Concept Architecture',
    year: '2026',
    role: 'Lead Art Director',
    x: -300,
    y: -170,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'amber-moov',
    desc: 'Concept architecture, high-impact creative direction, and commercial worldbuilding. Full campaign assets and pitch deliverables.',
    deliverables: ['Creative Direction', 'Shoot Concepts', 'Visual Architecture', 'Brand Worldbuilding'],
    photos: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 28,
    stickers: {
      stamp: { flag: '🇦🇪', countryCode: 'DXB', bgColor: '#ffffff' },
      sticker: { type: 'airplane', name: 'Directorial' },
    },
    isComingSoon: false,
  },
  {
    id: 'brand-identity',
    code: '02 / IDENTITY',
    name: 'Brand Identity',
    discipline: 'Brand Identity • Visual Systems',
    year: '2026',
    role: 'Creative Director',
    x: 270,
    y: -190,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'cobalt-modern',
    desc: 'Visual architecture, kinetic identity decks, and comprehensive brand guidelines. Full identity systems and packaging design.',
    deliverables: ['Visual Identity', 'Typography Systems', 'Guidelines Deck', 'Packaging Design'],
    photos: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
    ],
    photoCount: 42,
    stickers: {
      stamp: { flag: '🇯🇵', countryCode: 'TYO', bgColor: '#ffffff' },
      sticker: { type: 'torii', name: 'Identity Deck' },
    },
    isComingSoon: false,
  },
  {
    id: 'cinematography',
    code: '03 / CINEMA',
    name: 'Cinematography',
    discipline: 'Cinematography • Shoot Direction',
    year: '2026',
    role: 'Director of Photography',
    x: -480,
    y: 70,
    rot: 4,
    img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'cinema-slate',
    desc: 'High-contrast commercial lighting direction, frame composition, and on-set technical direction. 35mm anamorphic stills and reels.',
    deliverables: ['On-Set Direction', 'Lighting Setups', 'Camera Movement', 'Master Reels'],
    photos: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 36,
    stickers: {
      stamp: { flag: '🇫🇷', countryCode: 'PAR', bgColor: '#ffffff' },
      sticker: { type: 'camera', name: '35mm Stills' },
    },
    isComingSoon: false,
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
    img: '/assets/bento/bento_chrome_3d_cutout.png',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'neon-violet',
    desc: 'Distorted typography, kinetic title sequences, and frame-by-frame rhythmic pacing. Experimental 3D reels and iridescent forms.',
    deliverables: ['Kinetic Titles', '3D Motion', 'Broadcast Packages', 'Social Loops'],
    photos: [
      '/assets/bento/bento_chrome_3d_cutout.png',
      '/assets/bento/bento_sphere_3d_cutout.png',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1000&auto=format&fit=crop&q=80',
    ],
    photoCount: 19,
    stickers: {
      stamp: { flag: '🇨🇭', countryCode: 'ZRH', bgColor: '#ffffff' },
      sticker: { type: 'diamond', name: 'Motion Deck' },
    },
    isComingSoon: false,
  },
  {
    id: 'video-editing',
    code: '05 / EDITORIAL',
    name: 'Video Editing',
    discipline: 'Video Editing • Commercial & Social Reels (9:16)',
    year: '2026',
    role: 'Lead Video Editor',
    x: 480,
    y: 80,
    rot: -3,
    img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[9/16]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'terracotta-cut',
    desc: 'High-paced vertical social reels (9:16), director cuts, and 16:9 commercial broadcast masters. Timeline cuts and multi-format masters.',
    deliverables: ['9:16 Social Ads', 'Director Cuts', 'Sound Rescoring', 'Multi-Format Masters'],
    photos: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 31,
    stickers: {
      stamp: { flag: '🇬🇧', countryCode: 'LDN', bgColor: '#ffffff' },
      sticker: { type: 'film', name: 'Editorial' },
    },
    isComingSoon: false,
  },
  {
    id: 'color-grading',
    code: '06 / GRADE',
    name: 'Colour Grading',
    discipline: 'Colour Grading • Film Stock Emulation',
    year: '2026',
    role: 'Colorist & Finisher',
    x: -250,
    y: 240,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'forest-emerald',
    desc: 'Tungsten warmth, analogue 35mm film stock emulation, and saturated commercial pop. Color grading passes and mastered look LUTs.',
    deliverables: ['Film Emulation', 'Tungsten Grading', 'Commercial Finish', 'Look LUTs'],
    photos: [
      'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 22,
    stickers: {
      stamp: { flag: '🇩🇪', countryCode: 'STR', bgColor: '#ffffff' },
      sticker: { type: 'flame', name: 'Tungsten' },
    },
    isComingSoon: false,
  },
  {
    id: 'photography',
    code: '07 / VISION',
    name: 'Photography',
    discipline: 'Photography • Stills & Editorial Lookbook',
    year: '2026',
    role: 'Lead Photographer',
    x: 250,
    y: 230,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#cbd5e1]',
    variant: 'frosted-photostyle',
    desc: 'Fashion editorial, model staging, analogue grain, and lighting precision. High-resolution lookbook stills and portrait lookbooks.',
    deliverables: ['Editorial Stills', 'Model Staging', 'Analogue Grain', 'Lookbook Spreads'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
    ],
    photoCount: 48,
    stickers: {
      stamp: { flag: '🇮🇹', countryCode: 'MIL', bgColor: '#ffffff' },
      sticker: { type: 'lemon', name: 'Lookbook' },
    },
    isComingSoon: false,
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
  const bentoScrollRef = useRef<HTMLDivElement>(null);

  // Reset internal bento scroll to top whenever a new project is opened or filter tab changes
  useEffect(() => {
    if (selectedFile && bentoScrollRef.current) {
      bentoScrollRef.current.scrollTop = 0;
    }
  }, [selectedFile, activeTab]);

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
          className="group pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] font-mono text-[10.5px] sm:text-xs bg-white/95 text-neutral-900 hover:text-[#1b00ff] backdrop-blur-xl border border-black/10 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold uppercase tracking-wider">BACK</span>
        </Link>

        {/* Top-Right Contextual Action */}
        <div className="pointer-events-auto flex items-center gap-2">
          {activeCanvasMode === 'archive' ? (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-black/10 font-mono text-[11px] text-neutral-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#1b00ff] animate-pulse"></span>
              <span className="font-bold tracking-wider uppercase">ARCHIVE REPERTORY</span>
            </div>
          ) : (
            <div className="w-[84px] sm:w-[94px] pointer-events-none" />
          )}
        </div>
      </header>

      {/* Bottom Center Floating Mode Switcher (Pure Black & White • Clean Text) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center p-1 rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] font-mono text-[11px] font-bold text-neutral-800">
          <button
            type="button"
            onClick={() => setActiveCanvasMode('playground')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
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
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
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
            className="fixed inset-0 z-[10000] bg-white/40 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden select-text pointer-events-auto"
          >
            {/* STATIONARY SHOWCASE CARD (Stays fixed & centered, never scrolls out of viewport, ZERO black stroke) */}
            <div
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[1240px] h-[92vh] max-h-[920px] bg-white rounded-[32px] sm:rounded-[44px] shadow-[0_30px_90px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden select-auto"
            >
              {/* TOP NAVIGATION BAR (Clean, Prominent Tabs, Single Close Button) */}
              <header
                onWheel={(e) => {
                  e.stopPropagation();
                  if (bentoScrollRef.current) {
                    bentoScrollRef.current.scrollTop += e.deltaY;
                  }
                }}
                className="flex items-center justify-between px-6 sm:px-10 py-4 sm:py-5 flex-shrink-0 bg-white z-20"
              >
                <div className="flex items-center gap-6 sm:gap-10">
                  {/* Clean Project Title directly */}
                  <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-tight">
                    {selectedFile.name}
                  </h2>

                  {/* Filter Tabs (Larger, Prominent, Pill Styled, Clearly Legible) */}
                  <nav className="hidden sm:flex items-center gap-2 sm:gap-2.5 text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
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
                      className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
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
                      className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
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
                      className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                        activeTab === 'social'
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      Reels
                    </button>
                  </nav>
                </div>

                {/* Single Clean Close Button */}
                <div className="flex items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-6 py-2 rounded-full bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Close
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
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar p-5 sm:p-8 md:p-10 space-y-[10px] touch-pan-y"
              >

              {/* ======================================================= */}
              {/* 1. DEDICATED PROJECT STATEMENT & OVERVIEW (Deliverables tab only) */}
              {/* Generous space to write: What is project, about project, what I done */}
              {/* ======================================================= */}
              {activeTab === 'all' && (
                <section className="w-full bg-[#f6f5f2] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-9 space-y-4 select-text">
                  {/* Micro Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-wider uppercase text-neutral-500">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-black text-white font-semibold text-[11px]">
                        {selectedFile.code || selectedFile.id} • {selectedFile.year || '2026'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/5 text-neutral-800 font-medium text-[11px]">
                        Role: {selectedFile.role || 'Lead Creative Director'}
                      </span>
                    </div>
                    <span className="text-neutral-500 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      {curatedDeliverables.length} Deliverables Completed
                    </span>
                  </div>

                  {/* Project Headline & Spacious Narrative Space */}
                  <div className="space-y-2.5 max-w-4xl">
                    <h3 className="text-2xl sm:text-3xl md:text-[34px] font-black text-neutral-900 uppercase tracking-tight leading-tight">
                      {selectedFile.name} —&gt; Directorial Execution
                    </h3>
                    <p className="text-neutral-700 text-sm sm:text-base leading-relaxed font-normal">
                      {selectedFile.desc || `High-fidelity directorial cut and multi-format production for ${selectedFile.name}. Executed end-to-end creative direction, sound design, visual pacing, and color grading tailored across broadcast widescreen formats and vertical social ecosystems.`}
                    </p>
                  </div>

                  {/* Deliverables Scope Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(selectedFile.deliverables && selectedFile.deliverables.length > 0
                      ? selectedFile.deliverables
                      : ['Directorial Cut', 'Keyframe Stills', 'Widescreen Masters', '9:16 Social Reels', 'Color Grading']
                    ).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-full bg-white text-neutral-800 font-medium text-xs shadow-2xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* ======================================================= */}
              {/* 2. BENTO DELIVERABLES STREAM (Based on Creative Sizes, ZERO Black Strokes) */}
              {/* 9:16 Reels, 16:10 Widescreen, 21:9 Banners, 4:5 Stills - Strict 10px Gap */}
              {/* ======================================================= */}
              <section id="archival-collection-stream" className="space-y-[10px]">

                {/* FILTERED CATEGORY VIEWS */}
                {activeTab === 'stills' ? (
                  /* STILLS ONLY: Clean 3-Column 4:5 Grid (Exact 10px gap, ZERO black stroke) */
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px]">
                    {displayedDeliverables.map((asset) => {
                      const originalIndex = curatedDeliverables.findIndex((d) => d.url === asset.url);
                      const clickIndex = originalIndex >= 0 ? originalIndex : 0;
                      return (
                        <div
                          key={`${asset.url}-${asset.title}`}
                          onClick={() => setEnlargedIndex(clickIndex)}
                          className="group relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 aspect-[4/5] w-full"
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
                              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                STILL // 4:5
                              </span>
                              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
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
                  /* BANNERS ONLY: Alternating Panoramas and Dual Widescreens (Exact 10px gap, ZERO black stroke) */
                  <div className="space-y-[10px]">
                    {Array.from({ length: Math.ceil(displayedDeliverables.length / 3) }).map((_, bIdx) => {
                      const chunk = displayedDeliverables.slice(bIdx * 3, bIdx * 3 + 3);
                      return (
                        <div key={`banner-group-${bIdx}`} className="space-y-[10px]">
                          {chunk[0] && (() => {
                            const origIdx = curatedDeliverables.findIndex((d) => d.url === chunk[0].url);
                            return (
                              <div
                                onClick={() => setEnlargedIndex(origIdx >= 0 ? origIdx : 0)}
                                className="group relative w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/9] overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
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
                                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                      PANORAMIC BANNER // 21:9
                                    </span>
                                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                              {chunk.slice(1).map((item) => {
                                const origIdx = curatedDeliverables.findIndex((d) => d.url === item.url);
                                return (
                                  <div
                                    key={item.url}
                                    onClick={() => setEnlargedIndex(origIdx >= 0 ? origIdx : 0)}
                                    className="group relative w-full aspect-[16/9] sm:aspect-[16/10] overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
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
                                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                          WIDESCREEN // 16:10
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
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
                  /* REELS ONLY: Clean 4-Column 9:16 Vertical Grid (Exact 10px gap, ZERO black stroke) */
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[10px]">
                    {displayedDeliverables.map((asset) => {
                      const originalIndex = curatedDeliverables.findIndex((d) => d.url === asset.url);
                      const clickIndex = originalIndex >= 0 ? originalIndex : 0;
                      return (
                        <div
                          key={`${asset.url}-${asset.title}`}
                          onClick={() => setEnlargedIndex(clickIndex)}
                          className="group relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 aspect-[9/16] w-full"
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
                              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                9:16 REEL
                              </span>
                              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
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
                  /* ALL DELIVERABLES: DYNAMIC BENTO STREAM (Responsive to Creative Sizes, ZERO Black Strokes) */
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
                          className={`group relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#141517] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 ${extraClasses}`}
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
                              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                {badge}
                              </span>
                              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold shadow-xs">
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
                          <div key={`bento-split-${i}`} className="grid grid-cols-1 md:grid-cols-12 gap-[10px]">
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
                        // FULL-WIDTH PANORAMIC BANNER (21:9) - Creative banner size
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

                        clusters.push(
                          <div key={`bento-stills-${i}`} className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
                            {items.map((it) => (
                              <div key={it.url} className="w-full aspect-[4/5]">
                                {renderCard(it, 'EDITORIAL STILL // 4:5', 'Directorial Stills Cut', 'w-full h-full')}
                              </div>
                            ))}
                          </div>
                        );
                      } else if (pattern === 3) {
                        // 4-COLUMN VERTICAL REELS (9:16) - Social Reel size
                        const items = allItems.slice(i, i + 4);
                        i += items.length;

                        clusters.push(
                          <div key={`bento-reels-${i}`} className="grid grid-cols-2 sm:grid-cols-4 gap-[10px]">
                            {items.map((it) => (
                              <div key={it.url} className="w-full aspect-[9/16]">
                                {renderCard(it, '9:16 REEL // 1080x1920', 'Social Story Master', 'w-full h-full')}
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        // DUAL WIDESCREEN (2 Items, Equal Height 16:10)
                        const items = allItems.slice(i, i + 2);
                        i += items.length;

                        clusters.push(
                          <div key={`bento-widescreen-${i}`} className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                            {items.map((it) => (
                              <div key={it.url} className="w-full aspect-[16/9] sm:aspect-[16/10]">
                                {renderCard(it, 'WIDESCREEN // 16:10', 'Commercial Cut', 'w-full h-full')}
                              </div>
                            ))}
                          </div>
                        );
                      }
                    }

                    return <div className="space-y-[10px]">{clusters}</div>;
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
                setEnlargedIndex((prev) => (prev !== null && prev < photosList.length - 1 ? prev + 1 : 0));
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
                alt={currentTitle}
                className="max-w-full max-h-[84vh] object-contain rounded-[10px] shadow-2xl select-none"
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
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all cursor-pointer font-bold uppercase tracking-wider"
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
