'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DynamicCanvasFile, deleteCanvasFile } from '@/lib/contentStore';

interface CaseModalProps {
  projectId: string | null;
  onClose: () => void;
  uploadedFiles?: DynamicCanvasFile[];
  userPhotos?: string[];
}

export interface CaseMediaItem {
  format: '16-9' | '4-5' | '9-16' | 'grid-2';
  caption: string;
  image?: string;
  items?: Array<{ image: string }>;
}

export interface CaseProjectData {
  tag: string;
  title: string;
  role: string;
  team: string;
  scope: string;
  market: string;
  narrative: string;
  media: CaseMediaItem[];
}

const projectsData: Record<string, CaseProjectData> = {
  easyhaibro: {
    tag: 'FEATURED DIRECTION CREDIT',
    title: 'Easy Hai Bro',
    role: 'Art Director & Brand Visual Designer',
    team: 'Led 4 Creatives Direct with Founders',
    scope: 'Brand Identity, Shoot Direction, Commercial Content',
    market: 'Streetwear & Youth Culture',
    narrative:
      'Directed the full visual identity and commercial production for Easy Hai Bro. Managed a crew of four spanning cinematography, lighting, wardrobe, and editorial. Built an energetic visual language combining street-culture spontaneity with commercial camera discipline. Produced 35+ assets across broadcast, print, and vertical mobile channels.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Widescreen Broadcast Video • Director Cut',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Editorial Key Art • Hard Key Lighting',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: '1080 × 1920 Mobile Story Reel • Fast-Paced Dynamic Cut',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
      },
      {
        format: 'grid-2',
        caption: 'On-Set Production & Brand Architecture (1:1 Side-by-Side)',
        items: [
          { image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop' },
          { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
        ],
      },
    ],
  },
  windchasers: {
    tag: 'STRONGEST AD-LEVEL PIECE',
    title: 'Windchasers Aviation Academy',
    role: 'Art Director',
    team: 'Direct with Academy Leadership',
    scope: 'Brand Shoot Direction, Editorial Lookbook Deck',
    market: 'Aviation & Luxury Training',
    narrative:
      'Directed a two-day location shoot on airport aprons and active runways. Oversaw flight deck lighting, flight suit wardrobe grading, and comprehensive pitch deck art direction. Positioned the academy as a premier aviation institution in the GCC.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Hero Brand Still • Hard Contrast Direct Light',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Cockpit Instrumentation Key Art',
        image: 'https://images.unsplash.com/photo-1520690214124-2405c5217036?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  kaladhar: {
    tag: 'HIGH-FASHION CAMPAIGN',
    title: 'Kaladhar Bridal Campaign',
    role: 'Art Director & Shoot Director',
    team: 'Lighting Crew, HMUA, Stylist',
    scope: 'Campaign Concept, On-Set Lighting, Editorial Color Timing',
    market: 'Heritage Luxury Bridal',
    narrative:
      'Directed an opulent heritage bridal narrative. Avoided sterile commercial lighting in favor of warm tungsten practicals, cinematic shadows, and natural skin texture. Supervised color timing to preserve rich gold bullion and velvet fabric tones.',
    media: [
      {
        format: '4-5',
        caption: '1080 × 1350 Key Visual • Warm Directional Key',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '16-9',
        caption: '1920 × 1080 Wide Cinematic Master Frame',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
      },
    ],
  },
  ruchi: {
    tag: 'COMMERCIAL FOOD DIRECTION',
    title: 'Ruchi Fried Chicken',
    role: 'Commercial Art Director',
    team: 'Food Stylist, Macro Camera Operator',
    scope: 'Food Art Direction, Commercial Color Grade, High-Speed Capture',
    market: 'Commercial QSR',
    narrative:
      'High-octane commercial food styling and art direction. Directed high-speed probe lenses and saturated RGB rim lighting to make crispy textures pop off screens. Delivers punchy, appetite-driven imagery designed for quick consumer conversion.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Slow-Motion Capture Frame',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: '1080 × 1920 Social Story Frame',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=900&auto=format&fit=crop',
      },
    ],
  },
  oxymorons: {
    tag: 'CONCEPTUAL IDENTITY',
    title: 'Oxymorons',
    role: 'Art Director & Brand Visual Designer',
    team: 'Independent Creative Direction',
    scope: 'Brand Strategy, Typographic Distortion, Kinetic Packaging',
    market: 'Experimental Contemporary',
    narrative:
      'An exercise in conflicting concepts: delicate luxury paired with industrial grit. Explores heavy condensed typography overlaid across analog textures and distorted chromatic aberration keyframes.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Typographic Architecture',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Editorial Print Poster',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  porsche: {
    tag: 'VISCERAL AUTOMOTIVE BROADCAST',
    title: 'Porsche Carrera Telemetry',
    role: 'Commercial Film Director & Editor',
    team: 'Pursuit Vehicle Crew & Sound Designer',
    scope: 'Broadcast Master, High-Speed Tracking, Engine Sound Design',
    market: 'Automotive & Luxury Performance',
    narrative:
      'A visceral automotive director cut sync-edited to raw exhaust acoustics and precision German asphalt telemetry. Captured with heavy pursuit tracking arms across coastal switchbacks and nighttime industrial docks.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Pursuit Arm Dynamic Tracking Frame',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Cockpit Gauge Telemetry Stills',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  prada: {
    tag: 'KINETIC 3D WORLD',
    title: 'Prada Structural Deconstruct',
    role: 'Motion Director & 3D Artist',
    team: 'CGI Lighting & Motion Designers',
    scope: '3D Wireframes, Kinetic Typography, Architectural Deconstruction',
    market: 'Haute Couture & Digital Art',
    narrative:
      'A kinetic 3D wireframe exploration decomposing luxury leather goods into floating geometric architectural lines. Built around precise Swiss typographic rhythms and delicate physical gravity.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Deconstructed Leather Geometry',
        image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: '1080 × 1920 Vertical Kinetic Loop',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
      },
    ],
  },
  dior: {
    tag: 'ANAMORPHIC LUXURY CINEMA',
    title: 'Dior Midnight Nocturne',
    role: 'Director of Photography',
    team: 'Lighting Package & Colorist',
    scope: 'Anamorphic Capture, Atmospheric Practical Haze, Master Film Grade',
    market: 'Luxury Fragrance & Film',
    narrative:
      'Nocturnal perfume commercial directed under high-power tungsten fixtures with anamorphic oval bokeh and dense atmospheric haze. Emphasizes tactile skin warmth, shadow contrast, and deep nocturnal blues.',
    media: [
      {
        format: '16-9',
        caption: '1920 × 1080 Anamorphic Master Cinema Frame',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: '1080 × 1350 Atmospheric Bottle Key Visual',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
};

export default function CaseModal({ projectId, onClose, uploadedFiles, userPhotos }: CaseModalProps) {
  const [viewMode, setViewMode] = useState<'bento' | 'book' | 'feed'>('bento');
  const [bookSpreadIdx, setBookSpreadIdx] = useState(0);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  useEffect(() => {
    setBookSpreadIdx(0);
  }, [projectId]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest('.modal-scroll-content')) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest('.modal-scroll-content')) {
        e.preventDefault();
      }
    };

    if (projectId) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [projectId, onClose]);

  if (!projectId) return null;

  // 1. Try to match custom uploaded campaign by ID, name, or discipline
  const userProject = uploadedFiles?.find((f) => {
    if (f.id === projectId) return true;
    const pidLower = projectId.toLowerCase();
    const nameLower = (f.name || '').toLowerCase();
    const discLower = (f.discipline || '').toLowerCase();
    if (nameLower === pidLower || discLower.includes(pidLower) || pidLower.includes(nameLower)) return true;
    if (pidLower === 'video-editing' && (discLower.includes('video') || discLower.includes('reel') || discLower.includes('edit'))) return true;
    if (pidLower === 'art-direction' && (discLower.includes('art') || discLower.includes('direction'))) return true;
    if (pidLower === 'brand-identity' && (discLower.includes('brand') || discLower.includes('identity'))) return true;
    if (pidLower === 'cinematography' && (discLower.includes('cinema') || discLower.includes('camera'))) return true;
    if (pidLower === 'motion-graphics' && (discLower.includes('motion') || discLower.includes('3d'))) return true;
    if (pidLower === 'color-grading' && (discLower.includes('color') || discLower.includes('grade'))) return true;
    if (pidLower === 'photography' && (discLower.includes('photo') || discLower.includes('stills'))) return true;
    return false;
  });

  let data: CaseProjectData | null = null;

  if (userProject) {
    const allPhotos =
      userProject.photos && userProject.photos.length > 0
        ? userProject.photos
        : userProject.img
        ? [userProject.img]
        : [];

    const mediaList: CaseMediaItem[] = [];

    if (allPhotos.length > 0) {
      // 1. Hero 16:9 Master
      mediaList.push({
        format: '16-9',
        caption: `${userProject.name} • 16:9 Director Cut Master Frame`,
        image: allPhotos[0],
      });

      // 2. Editorial 4:5 Art
      if (allPhotos.length > 1) {
        mediaList.push({
          format: '4-5',
          caption: `${userProject.name} • 4:5 Editorial Lookbook Art`,
          image: allPhotos[1],
        });
      }

      // 3. Social 9:16 Reel Frame
      if (allPhotos.length > 2) {
        mediaList.push({
          format: '9-16',
          caption: `${userProject.name} • 9:16 Social Reel Story Spec`,
          image: allPhotos[2],
        });
      }

      // 4. Side-by-side production stills for remaining pictures (handles all 38+ pictures)
      for (let i = 3; i < allPhotos.length; i += 2) {
        if (i + 1 < allPhotos.length) {
          mediaList.push({
            format: 'grid-2',
            caption: `${userProject.name} • Campaign Stills ${i + 1} & ${i + 2}`,
            items: [{ image: allPhotos[i] }, { image: allPhotos[i + 1] }],
          });
        } else {
          mediaList.push({
            format: '4-5',
            caption: `${userProject.name} • Deliverable Still ${i + 1}`,
            image: allPhotos[i],
          });
        }
      }
    }

    data = {
      tag: (userProject.discipline || 'CLIENT CAMPAIGN').toUpperCase(),
      title: userProject.name,
      role: userProject.role || 'Art Director & Visual Designer',
      team: 'Direct with Production Crew & Founders',
      scope:
        userProject.deliverables && userProject.deliverables.length > 0
          ? userProject.deliverables.join(' • ')
          : 'Brand Architecture, Commercial Direction, Social Media Ads',
      market: userProject.discipline || 'Commercial Campaign',
      narrative:
        userProject.desc ||
        'Comprehensive multi-asset campaign production and visual direction across broadcast and digital channels.',
      media: mediaList,
    };
  } else if (projectsData[projectId]) {
    const raw = projectsData[projectId];
    // If user has uploaded photos, replace mock Unsplash photos in fallback projects so no fake photos appear
    if (userPhotos && userPhotos.length > 0) {
      let photoCounter = 0;
      data = {
        ...raw,
        media: raw.media.map((m) => {
          if (m.items) {
            return {
              ...m,
              items: m.items.map(() => {
                const img = userPhotos[photoCounter % userPhotos.length];
                photoCounter++;
                return { image: img };
              }),
            };
          }
          const img = userPhotos[photoCounter % userPhotos.length];
          photoCounter++;
          return {
            ...m,
            image: img,
          };
        }),
      };
    } else {
      data = raw;
    }
  } else if (uploadedFiles && uploadedFiles.length > 0) {
    // Graceful fallback to first uploaded project if an unmapped ID was clicked
    const first = uploadedFiles[0];
    const allPhotos = first.photos && first.photos.length > 0 ? first.photos : first.img ? [first.img] : [];
    data = {
      tag: (first.discipline || 'FEATURED WORK').toUpperCase(),
      title: first.name,
      role: first.role || 'Art Director',
      team: 'Direct with Production Crew',
      scope: first.deliverables?.join(' • ') || 'Creative Direction',
      market: first.discipline || 'Commercial',
      narrative: first.desc || 'Comprehensive visual direction.',
      media: allPhotos.map((p, idx) => ({
        format: (idx % 3 === 0 ? '16-9' : idx % 3 === 1 ? '4-5' : '9-16') as any,
        caption: `${first.name} • Frame ${idx + 1}`,
        image: p,
      })),
    };
  }

  if (!data) return null;

  const allPhotos: string[] =
    userProject?.photos && userProject.photos.length > 0
      ? userProject.photos
      : userProject?.img
      ? [userProject.img]
      : data.media
          .map((m: CaseMediaItem) => m.image || m.items?.[0]?.image)
          .filter((img): img is string => Boolean(img));

  const totalSpreads = Math.max(1, Math.ceil(allPhotos.length / 2));
  const safeSpreadIdx = Math.min(bookSpreadIdx, totalSpreads - 1);
  const leftPagePhoto = allPhotos[safeSpreadIdx * 2];
  const rightPagePhoto = allPhotos[safeSpreadIdx * 2 + 1];

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-8 overscroll-contain"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[92dvh] sm:h-auto sm:max-h-[90vh] bg-canvas border border-border-hairline shadow-[0_30px_90px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col rounded-[12px]"
      >
        {/* Top Bar with Layout Selector & Delete Option */}
        <div className="sticky top-0 z-20 flex flex-wrap justify-between items-center px-4 sm:px-6 py-3 bg-canvas/95 backdrop-blur-md border-b border-border-hairline gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] sm:text-xs text-muted tracking-wider">PROJECT</span>
            {userProject && (
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-bold uppercase">
                Custom Upload
              </span>
            )}
          </div>

          {/* Presentation Switcher: Bento Grid vs Magazine Book vs Stream */}
          {allPhotos.length > 1 && (
            <div className="flex items-center bg-subtle p-0.5 rounded-[8px] border border-border-hairline text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setViewMode('bento')}
                className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer font-bold ${
                  viewMode === 'bento'
                    ? 'bg-primary text-canvas shadow-xs'
                    : 'text-muted hover:text-primary'
                }`}
              >
                🍱 Bento Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('book')}
                className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer font-bold ${
                  viewMode === 'book'
                    ? 'bg-primary text-canvas shadow-xs'
                    : 'text-muted hover:text-primary'
                }`}
              >
                📖 Lookbook Book
              </button>
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer font-bold ${
                  viewMode === 'feed'
                    ? 'bg-primary text-canvas shadow-xs'
                    : 'text-muted hover:text-primary'
                }`}
              >
                ☷ Stream
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {userProject && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to completely delete "${data.title}"? This cannot be undone.`)) {
                    deleteCanvasFile(userProject.id);
                    onClose();
                  }
                }}
                className="font-mono text-xs px-3 py-1.5 rounded-[6px] border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 font-bold"
                title="Completely delete this campaign"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs text-primary border border-border-medium px-4 py-1.5 hover:bg-primary hover:text-white transition-colors cursor-pointer rounded-[6px]"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Scroll Content */}
        <div data-lenis-prevent className="modal-scroll-content p-4 sm:p-6 md:p-10 overflow-y-auto overscroll-contain">
          {/* Header */}
          <div className="mb-8">
            <span className="font-mono text-xs text-accent-red tracking-wider block mb-2">{data.tag}</span>
            <h2 className="text-2xl md:text-4xl font-bold text-primary tracking-tight mb-3 font-display uppercase">{data.title}</h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed max-w-3xl mb-6">{data.narrative}</p>

            {/* Credit Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border-hairline">
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">ROLE</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.role}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">CREW / LEADERSHIP</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.team}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">SCOPE</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.scope}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted tracking-wider block mb-1">MARKET</span>
                <span className="text-xs md:text-sm font-semibold text-primary">{data.market}</span>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: BENTO GRID PRESENTATION */}
          {viewMode === 'bento' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Bento Row 1: Hero Plate (8 cols) + Paired Feature (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div
                  onClick={() => allPhotos[0] && setEnlargedPhoto(allPhotos[0])}
                  className="lg:col-span-8 relative aspect-[16/10] bg-subtle border border-border-hairline rounded-[10px] overflow-hidden group cursor-pointer shadow-sm"
                >
                  <img
                    src={allPhotos[0] || data.media[0]?.image}
                    alt="Hero Key Visual"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white font-mono text-[9px] uppercase tracking-wider">
                    HERO KEY VISUAL
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white font-mono text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                    CLICK TO EXPAND ↗
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
                  {allPhotos[1] && (
                    <div
                      onClick={() => setEnlargedPhoto(allPhotos[1])}
                      className="flex-1 relative aspect-[4/5] sm:aspect-auto sm:h-full bg-subtle border border-border-hairline rounded-[10px] overflow-hidden group cursor-pointer shadow-sm"
                    >
                      <img
                        src={allPhotos[1]}
                        alt="Editorial Frame"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white font-mono text-[9px] uppercase tracking-wider">
                        EDITORIAL LOOKBOOK
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bento Row 2: 9:16 Mobile Social Story Grid */}
              {allPhotos.length > 2 && (
                <div className="space-y-3 pt-4 border-t border-border-hairline">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-muted tracking-wider uppercase">
                      9:16 SOCIAL ADS &amp; MOBILE STORY ARCHITECTURE
                    </span>
                    <span className="font-mono text-[10px] text-accent-red font-bold uppercase">
                      VERTICAL SPEC
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allPhotos.slice(2, 6).map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setEnlargedPhoto(photo)}
                        className="relative aspect-[9/16] bg-subtle border border-border-hairline rounded-[10px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={photo}
                          alt={`Story 0${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-white font-mono text-[8px] flex justify-between">
                          <span>STORY 0{i + 1}</span>
                          <span className="text-neutral-400">1080×1920</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bento Row 3: Remaining Campaign Portfolio Stills */}
              {allPhotos.length > 6 && (
                <div className="space-y-3 pt-4 border-t border-border-hairline">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-muted tracking-wider uppercase">
                      CAMPAIGN STILLS ARCHIVE ({allPhotos.length - 6} FRAMES)
                    </span>
                    <span className="font-mono text-[10px] text-muted uppercase">CLICK TO ENLARGE</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allPhotos.slice(6).map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setEnlargedPhoto(photo)}
                        className="relative aspect-[4/5] bg-subtle border border-border-hairline rounded-[8px] overflow-hidden cursor-pointer group hover:border-primary transition-all"
                      >
                        <img
                          src={photo}
                          alt={`Frame ${i + 7}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-1.5 left-1.5 font-mono text-[8px] px-1.5 py-0.5 rounded bg-black/75 text-white/90">
                          FRAME {i + 7}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: EDITORIAL MAGAZINE / LOOKBOOK DOUBLE-PAGE SPREAD */}
          {viewMode === 'book' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Book Spread Header Controls */}
              <div className="flex flex-wrap justify-between items-center gap-3 bg-subtle p-3 rounded-[8px] border border-border-hairline">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-primary">📖 LOOKBOOK SPREAD</span>
                  <span className="text-muted">• SPREAD {safeSpreadIdx + 1} OF {totalSpreads}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    type="button"
                    disabled={safeSpreadIdx === 0}
                    onClick={() => setBookSpreadIdx((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1 rounded bg-canvas border border-border-medium hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-canvas disabled:hover:text-primary transition-colors cursor-pointer"
                  >
                    ← PREV SPREAD
                  </button>
                  <button
                    type="button"
                    disabled={safeSpreadIdx >= totalSpreads - 1}
                    onClick={() => setBookSpreadIdx((prev) => Math.min(totalSpreads - 1, prev + 1))}
                    className="px-3 py-1 rounded bg-canvas border border-border-medium hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-canvas disabled:hover:text-primary transition-colors cursor-pointer"
                  >
                    NEXT SPREAD →
                  </button>
                </div>
              </div>

              {/* The Open Magazine Double-Page Spread */}
              <div className="relative w-full bg-[#fcfaf5] text-neutral-900 border border-neutral-300 rounded-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden p-4 sm:p-8">
                {/* Center Book Spine Crease Shadow */}
                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[24px] -ml-[12px] bg-gradient-to-r from-black/5 via-black/20 to-black/5 pointer-events-none z-10" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch">
                  {/* Left Page (Verso) */}
                  <div className="flex flex-col justify-between space-y-4 md:border-r md:border-neutral-200 md:pr-6">
                    <div className="flex justify-between items-center font-mono text-[10px] text-neutral-500 uppercase tracking-widest border-b border-neutral-200 pb-2">
                      <span>MOIZ KHAN STUDIO</span>
                      <span>LOOKBOOK VOL. 2026</span>
                    </div>

                    <div
                      onClick={() => leftPagePhoto && setEnlargedPhoto(leftPagePhoto)}
                      className="relative aspect-[1/1.35] sm:aspect-[1/1.4] bg-neutral-100 rounded-[4px] overflow-hidden shadow-xs border border-neutral-200 cursor-pointer group"
                    >
                      {leftPagePhoto ? (
                        <img
                          src={leftPagePhoto}
                          alt="Left Page Plate"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-400">
                          END OF LOOKBOOK
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center font-mono text-[10px] text-neutral-500 pt-1 border-t border-neutral-200">
                      <span>PLATE 0{safeSpreadIdx * 2 + 1}</span>
                      <span>TACTILE A4 PRINT</span>
                    </div>
                  </div>

                  {/* Right Page (Recto) */}
                  <div className="flex flex-col justify-between space-y-4 md:pl-6">
                    <div className="flex justify-between items-center font-mono text-[10px] text-neutral-500 uppercase tracking-widest border-b border-neutral-200 pb-2">
                      <span>{data.title}</span>
                      <span>EDITORIAL ARCHIVE</span>
                    </div>

                    <div
                      onClick={() => rightPagePhoto && setEnlargedPhoto(rightPagePhoto)}
                      className="relative aspect-[1/1.35] sm:aspect-[1/1.4] bg-neutral-100 rounded-[4px] overflow-hidden shadow-xs border border-neutral-200 cursor-pointer group"
                    >
                      {rightPagePhoto ? (
                        <img
                          src={rightPagePhoto}
                          alt="Right Page Plate"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full p-6 flex flex-col justify-center space-y-3 bg-neutral-50 font-serif">
                          <h4 className="text-xl font-bold tracking-tight text-neutral-900">{data.title}</h4>
                          <p className="text-xs text-neutral-600 leading-relaxed font-sans">{data.narrative}</p>
                          <div className="pt-4 border-t border-neutral-200 font-mono text-[10px] text-neutral-500">
                            DIRECTED BY MOIZ KHAN • DUBAI / WORLDWIDE
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center font-mono text-[10px] text-neutral-500 pt-1 border-t border-neutral-200">
                      <span>PLATE 0{safeSpreadIdx * 2 + 2}</span>
                      <span>PAGE {safeSpreadIdx * 2 + 2}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spread Navigator Pills */}
              <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                {Array.from({ length: totalSpreads }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBookSpreadIdx(idx)}
                    className={`px-3 py-1.5 rounded-[6px] font-mono text-xs font-bold transition-all cursor-pointer ${
                      safeSpreadIdx === idx
                        ? 'bg-primary text-canvas shadow-xs'
                        : 'bg-subtle text-muted hover:text-primary'
                    }`}
                  >
                    Spread {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: CLASSIC LINEAR STREAM */}
          {viewMode === 'feed' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              {data.media.map((m: CaseMediaItem, idx: number) => {
                const isActualVideo = !userProject && (m.caption.toLowerCase().includes('video') || m.caption.toLowerCase().includes('broadcast'));
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    {m.format === '16-9' && m.image && (
                      <div
                        onClick={() => m.image && setEnlargedPhoto(m.image)}
                        className="relative w-full aspect-[16/9] bg-subtle border border-border-hairline overflow-hidden rounded-[8px] cursor-pointer"
                      >
                        <img
                          src={m.image}
                          alt={m.caption}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            if (userPhotos && userPhotos.length > 0) {
                              e.currentTarget.src = userPhotos[0];
                            } else {
                              e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                        />
                        {isActualVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="w-11 h-11 rounded-full bg-accent-red text-white flex items-center justify-center text-sm pl-0.5 shadow-lg">
                              ▶
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {m.format === '4-5' && m.image && (
                      <div
                        onClick={() => m.image && setEnlargedPhoto(m.image)}
                        className="relative w-full max-w-lg mx-auto aspect-[4/5] bg-subtle border border-border-hairline overflow-hidden rounded-[8px] cursor-pointer"
                      >
                        <img
                          src={m.image}
                          alt={m.caption}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            if (userPhotos && userPhotos.length > 0) {
                              e.currentTarget.src = userPhotos[0];
                            } else {
                              e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                        />
                      </div>
                    )}

                    {m.format === '9-16' && m.image && (
                      <div
                        onClick={() => m.image && setEnlargedPhoto(m.image)}
                        className="relative w-full max-w-[280px] mx-auto aspect-[9/16] max-h-[500px] bg-subtle border border-border-hairline overflow-hidden rounded-[8px] cursor-pointer"
                      >
                        <img
                          src={m.image}
                          alt={m.caption}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            if (userPhotos && userPhotos.length > 0) {
                              e.currentTarget.src = userPhotos[0];
                            } else {
                              e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                        />
                      </div>
                    )}

                    {m.format === 'grid-2' && m.items && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {m.items.map((it: { image: string }, i: number) => (
                          <div
                            key={i}
                            onClick={() => setEnlargedPhoto(it.image)}
                            className="aspect-square bg-subtle border border-border-hairline overflow-hidden rounded-[8px] cursor-pointer"
                          >
                            <img
                              src={it.image}
                              alt="Setup"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                if (userPhotos && userPhotos.length > 0) {
                                  e.currentTarget.src = userPhotos[0];
                                } else {
                                  e.currentTarget.style.opacity = '0.5';
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center font-mono text-[11px] text-muted pt-1">
                      <span>{m.caption}</span>
                      <span className="text-accent-red uppercase tracking-wider">{m.format} SPEC</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Actions with Complete Delete Option */}
          <div className="mt-12 pt-6 border-t border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-muted tracking-wider uppercase">
              {allPhotos.length} {allPhotos.length === 1 ? 'FRAME' : 'FRAMES'} ARCHIVED • {data.title}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {userProject && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to completely delete "${data.title}" from your portfolio and archive? This cannot be undone.`)) {
                      deleteCanvasFile(userProject.id);
                      onClose();
                    }
                  }}
                  className="font-mono text-xs px-4 py-2 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold rounded-[4px] flex items-center gap-1.5"
                >
                  <span>🗑️</span>
                  <span>Delete Entire Campaign</span>
                </button>
              )}
              <Link
                href="/canvas"
                onClick={onClose}
                className="font-mono text-xs px-4 py-2 bg-primary text-canvas font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity rounded-[4px]"
              >
                Explore Archive Canvas ↗
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-xs px-4 py-2 border border-border-medium text-primary hover:bg-subtle transition-colors rounded-[4px]"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Pop-up for Clicking Any Image */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="relative max-w-5xl max-h-[92vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setEnlargedPhoto(null)}
              className="absolute -top-10 right-0 text-white font-mono text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded"
            >
              ✕ Close Preview
            </button>
            <img
              src={enlargedPhoto}
              alt="Enlarged Plate"
              className="max-w-full max-h-[85vh] object-contain rounded-[8px] shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
