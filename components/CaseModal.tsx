'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DynamicCanvasFile, deleteCanvasFile } from '@/lib/contentStore';

interface CaseModalProps {
  projectId: string | null;
  onClose: () => void;
  uploadedFiles?: DynamicCanvasFile[];
  userPhotos?: string[];
}

export interface CaseMediaItem {
  format?: '16-9' | '4-5' | '9-16' | 'grid-2' | 'auto';
  caption?: string;
  image?: string;
  videoUrl?: string;
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
  videoUrl?: string;
  scopePills?: string[];
}

const BUILTIN_PROJECTS: Record<string, CaseProjectData> = {
  kaldhar: {
    tag: 'HERITAGE LUXURY CAMPAIGN',
    title: 'Kaldhar',
    role: 'Director of Visuals',
    team: 'Direct with Production Crew & Founders',
    scope: 'Editorial Lookbook (4:5) • Social Stories & Motion (9:16) • Retail Displays • Hero Banners',
    market: 'Art Direction • Bridal Campaign',
    narrative:
      'Kaldhar — Complete multi-channel campaign with 88 deliverables including lookbook editorial spreads, vertical social media motion, and retail standee assets.',
    videoUrl: '/assets/bts/bts-04.mp4',
    scopePills: [
      'Editorial Lookbook (4:5)',
      'Social Stories & Motion (9:16)',
      'Retail Displays',
      'Hero Banners',
      'Campaign Architecture',
    ],
    media: [
      {
        format: '16-9',
        caption: 'Hero Campaign Visual • Master Widescreen Display',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Editorial Lookbook Key Art',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Bridal Heritage Frame 81',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Bridal Heritage Frame 82',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Red Takes The Stage Frame 83',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Every Wedding Brighter Frame 84',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Made For Every Occasion Frame 85',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Sarees For Every Occasion Frame 86',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Celebration Begins Frame 87',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Editorial Lookbook Spreads Frame 88',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  kaladhar: {
    tag: 'HERITAGE LUXURY CAMPAIGN',
    title: 'Kaldhar',
    role: 'Director of Visuals',
    team: 'Direct with Production Crew & Founders',
    scope: 'Editorial Lookbook (4:5) • Social Stories & Motion (9:16) • Retail Displays • Hero Banners',
    market: 'Art Direction • Bridal Campaign',
    narrative:
      'Kaldhar — Complete multi-channel campaign with 88 deliverables including lookbook editorial spreads, vertical social media motion, and retail standee assets.',
    videoUrl: '/assets/bts/bts-04.mp4',
    scopePills: [
      'Editorial Lookbook (4:5)',
      'Social Stories & Motion (9:16)',
      'Retail Displays',
      'Hero Banners',
      'Campaign Architecture',
    ],
    media: [
      {
        format: '16-9',
        caption: 'Hero Campaign Visual • Master Widescreen Display',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Editorial Lookbook Key Art',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Bridal Heritage Frame 81',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Bridal Heritage Frame 82',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Red Takes The Stage Frame 83',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Every Wedding Brighter Frame 84',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  easyhaibro: {
    tag: 'FEATURED DIRECTION CREDIT',
    title: 'Easy Hai Bro',
    role: 'Art Director & Brand Visual Designer',
    team: 'Led 4 Creatives Direct with Founders',
    scope: 'Brand Identity, Shoot Direction, Commercial Content',
    market: 'Streetwear & Youth Culture',
    narrative:
      'Directed the full visual identity and commercial production for Easy Hai Bro. Managed a crew of four spanning cinematography, lighting, wardrobe, and editorial. Built an energetic visual language combining street-culture spontaneity with commercial camera discipline.',
    videoUrl: '/assets/bts/bts-02.mp4',
    scopePills: [
      'Brand Identity',
      'Commercial Content (16:9)',
      'Social Reels (9:16)',
      'Editorial Lookbook',
    ],
    media: [
      {
        format: '16-9',
        caption: 'Widescreen Broadcast Master • Director Cut',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Editorial Key Art • Hard Key Lighting',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: 'Mobile Story Reel • Fast-Paced Cut',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
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
    videoUrl: '/assets/bts/bts-01.mp4',
    scopePills: [
      'Broadcast Master (16:9)',
      'Pursuit Telemetry Track',
      'Cockpit Stills',
      'Sound Architecture',
    ],
    media: [
      {
        format: '16-9',
        caption: 'Pursuit Arm Dynamic Tracking Frame',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Cockpit Instrumentation Key Art',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
      },
    ],
  },
  windchasers: {
    tag: 'LOOKBOOK & BRAND SHOOT',
    title: 'Windchasers Aviation Academy',
    role: 'Brand Shoot Director & Cinematographer',
    team: 'Cockpit Crew & 2nd Unit Camera',
    scope: 'Lookbook & Brand Shoot, Aerial Cinematography, Digital Identity',
    market: 'Commercial Aviation & Training',
    narrative:
      'Comprehensive brand identity and high-contrast lookbook shoot for Windchasers Aviation. Captured dual-pilot flight deck operations, tarmac motion sequences, and high-altitude cockpit light studies.',
    videoUrl: '/assets/bts/bts-03.mp4',
    scopePills: ['Flight Deck Lookbook', 'Aerial Cinematography', 'Digital Identity', 'Brand Shoot Direction'],
    media: [
      {
        format: '16-9',
        caption: 'Hero Brand Still • Hard Contrast Direct Light',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '4-5',
        caption: 'Cockpit Instrumentation Key Art',
        image: 'https://images.unsplash.com/photo-1520690214124-2405c5217036?q=80&w=1200&auto=format&fit=crop',
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
      'High-octane commercial food styling and art direction. Directed high-speed probe lenses and saturated RGB rim lighting to make crispy textures pop off screens.',
    scopePills: ['High-Speed Probe Camera', 'Food Art Direction', 'RGB Rim Grade', 'Social Reels'],
    media: [
      {
        format: '16-9',
        caption: 'Slow-Motion Capture Frame',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1600&auto=format&fit=crop',
      },
      {
        format: '9-16',
        caption: 'Social Story Frame',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=900&auto=format&fit=crop',
      },
    ],
  },
};

export default function CaseModal({ projectId, onClose, uploadedFiles, userPhotos }: CaseModalProps) {
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (enlargedPhoto) {
          setEnlargedPhoto(null);
        } else {
          onClose();
        }
      }
    };

    if (projectId) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projectId, enlargedPhoto, onClose]);

  // Match active project
  const { projectData, userProject } = useMemo(() => {
    if (!projectId) return { projectData: null, userProject: null };

    const lowerId = projectId.toLowerCase().trim();

    // Check user uploaded files first
    const matchedUser = uploadedFiles?.find(
      (f) =>
        f.id.toLowerCase() === lowerId ||
        f.name.toLowerCase() === lowerId ||
        f.code?.toLowerCase() === lowerId ||
        f.name.toLowerCase().includes(lowerId)
    );

    if (matchedUser) {
      const photos =
        matchedUser.photos && matchedUser.photos.length > 0
          ? matchedUser.photos
          : matchedUser.img
          ? [matchedUser.img]
          : [];

      const pData: CaseProjectData = {
        tag: (matchedUser.discipline || 'ART DIRECTION').toUpperCase(),
        title: matchedUser.name,
        role: matchedUser.role || 'Director of Visuals',
        team: 'Direct with Production Crew & Founders',
        scope:
          matchedUser.deliverables?.join(' • ') ||
          'Editorial Lookbook (4:5) • Social Stories & Motion (9:16) • Retail Displays • Hero Banners',
        market: matchedUser.discipline || 'Art Direction • Bridal Campaign',
        narrative:
          matchedUser.desc ||
          `${matchedUser.name} — Complete multi-channel campaign with ${photos.length} deliverables including lookbook editorial spreads, vertical social media motion, and retail standee assets.`,
        videoUrl: matchedUser.videoUrl,
        scopePills:
          matchedUser.deliverables && matchedUser.deliverables.length > 0
            ? matchedUser.deliverables
            : [
                'Editorial Lookbook (4:5)',
                'Social Stories & Motion (9:16)',
                'Retail Displays',
                'Hero Banners',
              ],
        media: photos.map((p) => ({
          image: p,
          format: 'auto',
        })),
      };

      return { projectData: pData, userProject: matchedUser };
    }

    // Match builtin projects
    const builtin = BUILTIN_PROJECTS[lowerId] || BUILTIN_PROJECTS['kaldhar'] || BUILTIN_PROJECTS['easyhaibro'];
    return { projectData: builtin, userProject: null };
  }, [projectId, uploadedFiles]);

  useEffect(() => {
    if (!projectId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [projectId, onClose]);

  if (!projectData) return null;

  // Extract all images
  const allImages: string[] =
    userProject?.photos && userProject.photos.length > 0
      ? userProject.photos
      : userProject?.img
      ? [userProject.img]
      : projectData.media
          .map((m) => m.image || m.items?.[0]?.image)
          .filter((img): img is string => Boolean(img));

  // Bento Key Visuals:
  // Card 1: Wide primary key visual (Left ~65% width)
  const bentoWide = allImages[0];
  // Card 2: Vertical lookbook / secondary visual (Right ~35% width)
  const bentoVertical = allImages[1] || allImages[0];

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-8 overscroll-contain transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Apple-Style Continuous Rounded Modal Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] bg-white text-black shadow-[0_30px_90px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col rounded-[32px] sm:rounded-[36px] border-none"
      >
        {/* Top Minimal Bar (Matching User Image 2 Header) */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 sm:px-10 py-5 bg-white/95 backdrop-blur-md gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-wider">
              PROJECT
            </span>
            <span className="font-mono text-[11px] text-[#e60000] bg-red-50 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {projectData.tag}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {userProject && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${projectData.title}" from portfolio?`)) {
                    deleteCanvasFile(userProject.id);
                    onClose();
                  }
                }}
                className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-red-50 text-[#e60000] hover:bg-[#e60000] hover:text-white transition-all font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs px-4 py-2 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-black transition-all flex items-center gap-1.5 cursor-pointer font-bold"
              aria-label="Close Case Study"
            >
              <span>✕</span>
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div
          data-lenis-prevent
          className="modal-scroll-content overflow-y-auto px-6 sm:px-10 md:px-14 pb-14 pt-2 overscroll-contain space-y-12"
        >
          {/* Project Title & Metadata Header (Matching media_1789049860810.png) */}
          <div className="space-y-6 max-w-5xl">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest block">
                {projectData.market.toUpperCase()}
              </span>
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-black uppercase tracking-tight leading-[0.92]">
                {projectData.title}
              </h1>
            </div>

            <p className="font-sans text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed font-normal max-w-4xl">
              {projectData.narrative}
            </p>

            {/* 4 Metadata Columns with Red Dot Indicator */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">
                  ROLE
                </span>
                <span className="font-bold text-black block">{projectData.role}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                    CREW / LEADERSHIP
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e60000]" />
                </div>
                <span className="font-bold text-black block">{projectData.team}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">
                  SCOPE
                </span>
                <span className="font-bold text-black block">{projectData.scope}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">
                  MARKET
                </span>
                <span className="font-bold text-black block">{projectData.market}</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: CAMPAIGN MOTION VIDEO (IF PRESENT) */}
          {projectData.videoUrl && (
            <div className="w-full rounded-[28px] sm:rounded-[34px] overflow-hidden bg-black shadow-xl p-2">
              <video
                src={projectData.videoUrl}
                controls
                playsInline
                autoPlay
                muted
                loop
                className="w-full h-auto max-h-[75vh] object-contain mx-auto block rounded-[22px]"
              />
            </div>
          )}

          {/* SECTION 2: THE 4-COLUMN DELIVERABLES GALLERY (Matching User Image 2 media_1789053470192.png) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-500 tracking-wider uppercase font-semibold">
                Archived Campaign Frames ({allImages.length} Plates)
              </span>
              <span className="font-mono text-xs text-neutral-400 tracking-wider">
                Click any frame to inspect
              </span>
            </div>

            {/* Apple-Style Rounded 4-Column Grid with FRAME XX Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {allImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setEnlargedPhoto(imgUrl)}
                  className="group relative rounded-[20px] sm:rounded-[24px] overflow-hidden bg-neutral-900 aspect-[4/5] cursor-zoom-in shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] transition-all duration-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${projectData.title} Frame ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Bottom-left pill badge (Matching Image 2: FRAME XX) */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-[6px] tracking-wider uppercase pointer-events-none">
                    FRAME {80 + idx}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: THE END PART - SIGNATURE APPLE-STYLE ASYMMETRIC BENTO SPREAD (Image 1 media_1789053458855.png) */}
          <div className="space-y-6 pt-6">
            {/* Bento Row with Strictly Locked Equal Height and Apple-Style Continuous Curvature */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              {/* Left Bento: Wide Key Visual (~65% width, lg:col-span-8) */}
              {bentoWide && (
                <div
                  onClick={() => setEnlargedPhoto(bentoWide)}
                  className="lg:col-span-8 rounded-[28px] sm:rounded-[34px] lg:rounded-[38px] overflow-hidden bg-[#111111] cursor-zoom-in group shadow-[0_10px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all h-[360px] sm:h-[460px] lg:h-[520px] relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bentoWide}
                    alt={`${projectData.title} Master Visual`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-5 left-5 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full uppercase tracking-wider">
                    PRIMARY KEY VISUAL (16:9)
                  </div>
                </div>
              )}

              {/* Right Bento: Lookbook Visual (~35% width, lg:col-span-4) - FLUSH EQUAL HEIGHT */}
              {bentoVertical && (
                <div
                  onClick={() => setEnlargedPhoto(bentoVertical)}
                  className="lg:col-span-4 rounded-[28px] sm:rounded-[34px] lg:rounded-[38px] overflow-hidden bg-[#111111] cursor-zoom-in group shadow-[0_10px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all h-[360px] sm:h-[460px] lg:h-[520px] relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bentoVertical}
                    alt={`${projectData.title} Editorial Lookbook`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-5 left-5 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full uppercase tracking-wider">
                    EDITORIAL LOOKBOOK
                  </div>
                </div>
              )}
            </div>

            {/* Subtitle Under Bento Row (Matching Image 1: Left Narrative + Right ALL RIGHTS RESERVED + Logo) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-xs font-mono text-neutral-500 uppercase tracking-wider">
              <span className="max-w-2xl font-medium leading-relaxed">
                {projectData.title} — {projectData.narrative.toUpperCase()}
              </span>

              <div className="flex items-center gap-2 text-neutral-400 font-bold flex-shrink-0">
                <span>ALL RIGHTS RESERVED</span>
                <Image
                  src="/assets/logo.png"
                  alt="Moiz Khan"
                  width={18}
                  height={18}
                  className="h-3.5 w-auto object-contain inline-block opacity-75"
                />
              </div>
            </div>

            {/* Directorial Vision & Strategy Summary Card */}
            <div className="bg-[#faf9f6] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest block">
                  DIRECTORIAL VISION &amp; STRATEGY
                </span>
                <p className="font-sans text-sm sm:text-base text-neutral-800 leading-relaxed font-normal max-w-4xl">
                  {projectData.narrative}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <span className="font-mono text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
                  CAMPAIGN SCOPE:
                </span>
                <div className="flex flex-wrap gap-2">
                  {projectData.scopePills?.map((pill, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-100 font-mono text-[11px] text-neutral-700 font-semibold"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: THE EXACT BOTTOM ACTION BAR (Matching Image 2 media_1789053470192.png) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                {allImages.length} FRAMES ARCHIVED • {projectData.title.toUpperCase()}
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {userProject && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Completely delete "${projectData.title}" from your portfolio? This cannot be undone.`)) {
                        deleteCanvasFile(userProject.id);
                        onClose();
                      }
                    }}
                    className="font-mono text-xs px-4 py-2.5 rounded-full border border-red-200 text-[#e60000] hover:bg-[#e60000] hover:text-white transition-all cursor-pointer font-bold flex items-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>Delete Entire Campaign</span>
                  </button>
                )}

                <Link
                  href="/canvas"
                  onClick={onClose}
                  className="font-mono text-xs px-5 py-2.5 rounded-full bg-black text-white hover:bg-[#e60000] transition-colors cursor-pointer font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>EXPLORE ARCHIVE CANVAS</span>
                  <span>↗</span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="font-mono text-xs px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-700 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer font-bold"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Resolution Lightbox Zoom */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setEnlargedPhoto(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enlargedPhoto}
            alt="Enlarged Visual"
            className="max-w-[95vw] max-h-[92vh] object-contain rounded-[20px] shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
