'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  projectId: string;
  brand: string;
  logoText: string;
  subtitle: string;
  tag: string;
  bgAccent: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  posterUrl?: string;
}

const ROW_ONE_ITEMS: ShowcaseItem[] = [
  {
    id: 'sc-01',
    projectId: 'porsche',
    brand: 'Porsche',
    logoText: 'PORSCHE',
    subtitle: 'Shoot Direction • Commercial Film • Telemetry Rig',
    tag: 'AUTOMOTIVE',
    bgAccent: 'bg-[#0f1115]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-01.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sc-02',
    projectId: 'windchasers',
    brand: 'Windchasers Aviation',
    logoText: 'WINDCHASERS',
    subtitle: 'Brand Identity • Cockpit Lighting • Aerospace Stills',
    tag: 'AVIATION',
    bgAccent: 'bg-[#0047bb]',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sc-03',
    projectId: 'prada',
    brand: 'Prada',
    logoText: 'PRADA',
    subtitle: 'Editorial Lookbook • Milan Campaign • Lighting Architecture',
    tag: 'FASHION',
    bgAccent: 'bg-[#0b2416]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-03.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sc-04',
    projectId: 'easyhaibro',
    brand: 'Easy Hai Bro',
    logoText: 'EASY HAI BRO',
    subtitle: 'Creative Direction • 9:16 Kinetic Reels • Youth Culture',
    tag: 'STREETWEAR',
    bgAccent: 'bg-[#ff4e00]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-02.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
  },
];

const ROW_TWO_ITEMS: ShowcaseItem[] = [
  {
    id: 'sc-05',
    projectId: 'dior',
    brand: 'Dior',
    logoText: 'DIOR',
    subtitle: 'Anamorphic Capture • Nocturnal Lighting • Master Grade',
    tag: 'BEAUTY & COUTURE',
    bgAccent: 'bg-[#181329]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-08.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sc-06',
    projectId: 'kaladhar',
    brand: 'Kaladhar Bridal',
    logoText: 'KALADHAR',
    subtitle: 'Tungsten Chiaroscuro • Handloom Textiles • Heritage Grade',
    tag: 'HERITAGE LUXURY',
    bgAccent: 'bg-[#966b2d]',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sc-07',
    projectId: 'ruchi',
    brand: 'Ruchi',
    logoText: 'RUCHI',
    subtitle: 'High-Speed Macro Stills • Saturated Color Timing • Packaging',
    tag: 'COMMERCIAL RETAIL',
    bgAccent: 'bg-[#c41230]',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sc-08',
    projectId: 'oxymorons',
    brand: 'Oxymorons Collective',
    logoText: 'OXYMORONS',
    subtitle: 'Steadicam Tracking • Publication Layout • Swiss Systems',
    tag: 'DESIGN SYSTEM',
    bgAccent: 'bg-[#1a1c23]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-06.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  },
];

interface BtsArcSectionProps {
  onOpenCase?: (id: string) => void;
}

export default function BtsArcSection({ onOpenCase }: BtsArcSectionProps) {
  const [unmutedId, setUnmutedId] = useState<string | null>(null);
  const [isRowOneHovered, setIsRowOneHovered] = useState(false);
  const [isRowTwoHovered, setIsRowTwoHovered] = useState(false);

  const rowOneRef = useRef<HTMLDivElement>(null);
  const rowTwoRef = useRef<HTMLDivElement>(null);

  const rowOnePosRef = useRef(0);
  const rowTwoPosRef = useRef(0);

  // Smooth infinite continuous sliding animation loop
  useEffect(() => {
    let lastTs = performance.now();
    let animId: number;

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;

      // Row 1 slides left
      if (!isRowOneHovered && rowOneRef.current) {
        rowOnePosRef.current += 38 * dt; // 38px/sec
        const trackWidth = rowOneRef.current.scrollWidth / 2;
        if (trackWidth > 0 && rowOnePosRef.current >= trackWidth) {
          rowOnePosRef.current -= trackWidth;
        }
        rowOneRef.current.style.transform = `translate3d(-${rowOnePosRef.current}px, 0, 0)`;
      }

      // Row 2 slides right
      if (!isRowTwoHovered && rowTwoRef.current) {
        rowTwoPosRef.current += 34 * dt; // 34px/sec
        const trackWidth = rowTwoRef.current.scrollWidth / 2;
        if (trackWidth > 0 && rowTwoPosRef.current >= trackWidth) {
          rowTwoPosRef.current -= trackWidth;
        }
        rowTwoRef.current.style.transform = `translate3d(-${trackWidth - rowTwoPosRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRowOneHovered, isRowTwoHovered]);

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnmutedId((prev) => (prev === id ? null : id));
  };

  const handleCardClick = (projectId: string) => {
    if (onOpenCase) {
      onOpenCase(projectId);
    }
  };

  // Helper to render a card
  const renderCard = (item: ShowcaseItem, uniqueKey: string) => {
    return (
      <div
        key={uniqueKey}
        onClick={() => handleCardClick(item.projectId)}
        className="w-[340px] sm:w-[400px] md:w-[460px] flex-shrink-0 cursor-pointer group select-none flex flex-col gap-3"
      >
        {/* Visual Landscape Container */}
        <div
          className={`relative w-full aspect-[16/10] rounded-[22px] overflow-hidden ${item.bgAccent} shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition-all duration-500 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)] group-hover:-translate-y-1`}
        >
          {/* Media: Looping Video or Photography */}
          {item.mediaType === 'video' ? (
            <video
              src={item.mediaUrl}
              poster={item.posterUrl}
              autoPlay
              loop
              muted={unmutedId !== item.id}
              playsInline
              preload="auto"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <img
              src={item.mediaUrl}
              alt={item.brand}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 transition-opacity duration-300" />

          {/* Top Header: Brand Logo & Format Badge */}
          <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-10">
            {/* Bold Brand Logo */}
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg md:text-xl tracking-wider text-white uppercase drop-shadow-md">
                {item.logoText}
              </span>
            </div>

            {/* Tag / Mute Controls */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 uppercase tracking-widest border border-white/10">
                {item.tag}
              </span>

              {item.mediaType === 'video' && (
                <button
                  type="button"
                  onClick={(e) => toggleMute(item.id, e)}
                  title={unmutedId === item.id ? 'Mute' : 'Unmute'}
                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-colors duration-200"
                >
                  {unmutedId === item.id ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 opacity-75" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Center Magnetic "Expand +" Circular Badge (Superside Image 2 Reference) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-20 h-20 rounded-full bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-2xl flex flex-col items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
              <span className="font-sans text-xs font-semibold tracking-wide">Expand</span>
              <span className="text-base font-light leading-none mt-0.5 text-accent-red">+</span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata (Superside Image 3 Reference) */}
        <div className="flex flex-col px-1">
          <h4 className="font-display text-base md:text-lg font-bold text-primary tracking-tight transition-colors group-hover:text-accent-red">
            {item.brand}
          </h4>
          <p className="font-sans text-xs md:text-sm text-secondary font-normal tracking-normal mt-0.5">
            {item.subtitle}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section id="work-showcase" className="w-full py-16 md:py-28 bg-canvas overflow-hidden">
      {/* Top Editorial Header (Superside Image 3 Style) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs text-accent-red tracking-widest uppercase block mb-3 font-semibold">
            ● OUR WORK
          </span>
          <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-primary leading-tight font-sans">
            See how top brands <span className="font-serif italic text-primary">direct</span> with Moiz.
          </h2>
        </div>

        <Link
          href="/canvas"
          className="inline-flex items-center gap-2 self-start md:self-end px-5 py-2.5 rounded-full border border-border-medium hover:border-primary text-xs font-mono font-medium text-primary hover:bg-primary hover:text-white transition-all duration-200"
        >
          <span>Explore all work</span>
          <span>↗</span>
        </Link>
      </div>

      {/* Sliding Horizontal Tracks in Landscape */}
      <div className="w-full flex flex-col gap-8 md:gap-10 overflow-hidden">
        {/* Lane 1: Slides Left */}
        <div
          className="w-full overflow-hidden"
          onMouseEnter={() => setIsRowOneHovered(true)}
          onMouseLeave={() => setIsRowOneHovered(false)}
        >
          <div ref={rowOneRef} className="flex gap-6 md:gap-8 w-max will-change-transform">
            {/* Duplicated twice for seamless infinite marquee */}
            {[...ROW_ONE_ITEMS, ...ROW_ONE_ITEMS].map((item, idx) =>
              renderCard(item, `row1-${item.id}-${idx}`)
            )}
          </div>
        </div>

        {/* Lane 2: Slides Right */}
        <div
          className="w-full overflow-hidden"
          onMouseEnter={() => setIsRowTwoHovered(true)}
          onMouseLeave={() => setIsRowTwoHovered(false)}
        >
          <div ref={rowTwoRef} className="flex gap-6 md:gap-8 w-max will-change-transform">
            {/* Duplicated twice for seamless infinite marquee */}
            {[...ROW_TWO_ITEMS, ...ROW_TWO_ITEMS].map((item, idx) =>
              renderCard(item, `row2-${item.id}-${idx}`)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
