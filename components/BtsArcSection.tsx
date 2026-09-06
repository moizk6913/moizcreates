'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface BentoItem {
  id: string;
  projectId: string;
  brand: string;
  tag: string;
  aspectClass: string;
  bgAccent: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  posterUrl?: string;
}

const ROW_ONE_BENTO: BentoItem[] = [
  {
    id: 'bento-01',
    projectId: 'porsche',
    brand: 'PORSCHE',
    tag: 'CINEMA 16:9',
    aspectClass: 'aspect-[16/9]',
    bgAccent: 'bg-[#0f1115]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-01.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-02',
    projectId: 'easyhaibro',
    brand: 'EASY HAI BRO',
    tag: 'REEL 9:16',
    aspectClass: 'aspect-[9/16]',
    bgAccent: 'bg-[#ff4e00]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-02.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-03',
    projectId: 'prada',
    brand: 'PRADA',
    tag: 'LOOKBOOK 4:5',
    aspectClass: 'aspect-[4/5]',
    bgAccent: 'bg-[#0b2416]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-03.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-04',
    projectId: 'windchasers',
    brand: 'WINDCHASERS',
    tag: 'POST 1:1',
    aspectClass: 'aspect-square',
    bgAccent: 'bg-[#0047bb]',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-05',
    projectId: 'easyhaibro',
    brand: 'STREET REEL',
    tag: 'REEL 9:16',
    aspectClass: 'aspect-[9/16]',
    mediaType: 'video',
    bgAccent: 'bg-[#141414]',
    mediaUrl: '/assets/bts/bts-04.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop',
  },
];

const ROW_TWO_BENTO: BentoItem[] = [
  {
    id: 'bento-06',
    projectId: 'dior',
    brand: 'DIOR',
    tag: 'REEL 9:16',
    aspectClass: 'aspect-[9/16]',
    bgAccent: 'bg-[#181329]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-08.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-07',
    projectId: 'kaladhar',
    brand: 'KALADHAR',
    tag: 'POST 1:1',
    aspectClass: 'aspect-square',
    bgAccent: 'bg-[#966b2d]',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-08',
    projectId: 'oxymorons',
    brand: 'OXYMORONS',
    tag: 'CINEMA 16:9',
    aspectClass: 'aspect-[16/9]',
    bgAccent: 'bg-[#1a1c23]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-06.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-09',
    projectId: 'ruchi',
    brand: 'RUCHI',
    tag: 'POST 1:1',
    aspectClass: 'aspect-square',
    bgAccent: 'bg-[#c41230]',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bento-10',
    projectId: 'porsche',
    brand: 'STUDIO KEY',
    tag: 'MONITOR 16:10',
    aspectClass: 'aspect-[16/10]',
    bgAccent: 'bg-[#111317]',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-07.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop',
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

  const rowOneSpeedRef = useRef(36);
  const rowTwoSpeedRef = useRef(32);

  const rowOneWidthRef = useRef(0);
  const rowTwoWidthRef = useRef(0);

  const REPETITIONS = 3;

  // Measure track single-set unit widths once and update on resize
  useEffect(() => {
    const updateWidths = () => {
      if (rowOneRef.current) {
        rowOneWidthRef.current = rowOneRef.current.scrollWidth / REPETITIONS;
      }
      if (rowTwoRef.current) {
        rowTwoWidthRef.current = rowTwoRef.current.scrollWidth / REPETITIONS;
      }
    };

    updateWidths();
    const timer = setTimeout(updateWidths, 400);
    window.addEventListener('resize', updateWidths, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidths);
    };
  }, []);

  // Smooth infinite continuous sliding animation loop with velocity damping
  useEffect(() => {
    let lastTs = performance.now();
    let animId: number;

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      // Smooth velocity easing for Row 1 (gentle glide to halt when hovered, smooth ramp up)
      const targetSpeedOne = isRowOneHovered ? 0 : 36;
      rowOneSpeedRef.current += (targetSpeedOne - rowOneSpeedRef.current) * (isRowOneHovered ? 0.09 : 0.05);

      if (rowOneRef.current && Math.abs(rowOneSpeedRef.current) > 0.01) {
        rowOnePosRef.current += rowOneSpeedRef.current * dt;
        const trackWidth = rowOneWidthRef.current || (rowOneRef.current.scrollWidth / REPETITIONS);
        if (trackWidth > 0 && rowOnePosRef.current >= trackWidth) {
          rowOnePosRef.current -= trackWidth;
        }
        rowOneRef.current.style.transform = `translate3d(-${rowOnePosRef.current}px, 0, 0)`;
      }

      // Smooth velocity easing for Row 2 (gentle glide to halt when hovered, smooth ramp up)
      const targetSpeedTwo = isRowTwoHovered ? 0 : 32;
      rowTwoSpeedRef.current += (targetSpeedTwo - rowTwoSpeedRef.current) * (isRowTwoHovered ? 0.09 : 0.05);

      if (rowTwoRef.current && Math.abs(rowTwoSpeedRef.current) > 0.01) {
        rowTwoPosRef.current += rowTwoSpeedRef.current * dt;
        const trackWidth = rowTwoWidthRef.current || (rowTwoRef.current.scrollWidth / REPETITIONS);
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

  // Helper to render a Bento card
  const renderBentoCard = (item: BentoItem, uniqueKey: string) => {
    return (
      <div
        key={uniqueKey}
        onClick={() => handleCardClick(item.projectId)}
        className={`h-full flex-shrink-0 cursor-pointer group select-none relative ${item.aspectClass}`}
      >
        {/* Visual Bento Container - 10px Apple corner radius */}
        <div
          className={`relative w-full h-full rounded-[10px] overflow-hidden ${item.bgAccent} shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition-all duration-500 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)] group-hover:-translate-y-1`}
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
              preload="metadata"
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

          {/* High-End Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/60 transition-opacity duration-300" />

          {/* Top Brand Logo & Format Badge */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-5 flex justify-between items-start z-10 pointer-events-none">
            {/* Bold Brand Watermark */}
            <span className="font-display font-black text-base md:text-xl tracking-wider text-white uppercase drop-shadow-md">
              {item.brand}
            </span>

            {/* Controls / Tag - 10px Apple radius */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="font-mono text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-[10px] bg-black/45 backdrop-blur-md text-white/90 uppercase tracking-widest border border-white/10">
                {item.tag}
              </span>

              {item.mediaType === 'video' && (
                <button
                  type="button"
                  onClick={(e) => toggleMute(item.id, e)}
                  title={unmutedId === item.id ? 'Mute' : 'Unmute'}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-[10px] bg-black/60 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-colors duration-200"
                >
                  {unmutedId === item.id ? (
                    <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  ) : (
                    <VolumeX className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-75" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Center Magnetic "Expand +" Badge - 10px Apple radius */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[10px] bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-2xl flex flex-col items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
              <span className="font-sans text-[11px] md:text-xs font-semibold tracking-wide">Expand</span>
              <span className="text-sm md:text-base font-light leading-none mt-0.5 text-accent-red">+</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="work-showcase" className="w-full py-12 sm:py-16 md:py-20 bg-canvas overflow-hidden">
      {/* Sliding Horizontal Bento Tracks (Zero External Text) */}
      <div className="w-full flex flex-col gap-6 md:gap-8 overflow-hidden">
        {/* Lane 1: Slides Left - Fixed uniform height with mixed bento widths */}
        <div
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden"
          onMouseEnter={() => setIsRowOneHovered(true)}
          onMouseLeave={() => setIsRowOneHovered(false)}
        >
          <div ref={rowOneRef} className="flex gap-5 md:gap-7 h-full w-max will-change-transform">
            {/* Duplicated for seamless infinite marquee */}
            {Array.from({ length: REPETITIONS }).flatMap(() => ROW_ONE_BENTO).map((item, idx) =>
              renderBentoCard(item, `lane1-${item.id}-${idx}`)
            )}
          </div>
        </div>

        {/* Lane 2: Slides Right - Fixed uniform height with mixed bento widths */}
        <div
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden"
          onMouseEnter={() => setIsRowTwoHovered(true)}
          onMouseLeave={() => setIsRowTwoHovered(false)}
        >
          <div ref={rowTwoRef} className="flex gap-5 md:gap-7 h-full w-max will-change-transform">
            {/* Duplicated for seamless infinite marquee */}
            {Array.from({ length: REPETITIONS }).flatMap(() => ROW_TWO_BENTO).map((item, idx) =>
              renderBentoCard(item, `lane2-${item.id}-${idx}`)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
