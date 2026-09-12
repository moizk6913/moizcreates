'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';
import { DynamicCanvasFile } from '@/lib/contentStore';

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

function buildBentoItemsFromUploads(files: DynamicCanvasFile[]): { rowOne: BentoItem[]; rowTwo: BentoItem[] } {
  if (!files || files.length === 0) {
    return { rowOne: [], rowTwo: [] };
  }

  // Flatten all photos along with campaign metadata
  const flatPhotos: Array<{ photo: string; campaign: DynamicCanvasFile; index: number }> = [];
  files.forEach((file) => {
    if (file.photos && file.photos.length > 0) {
      file.photos.forEach((photo, pIdx) => {
        flatPhotos.push({ photo, campaign: file, index: pIdx });
      });
    } else if (file.img) {
      flatPhotos.push({ photo: file.img, campaign: file, index: 0 });
    }
  });

  if (flatPhotos.length === 0) {
    return { rowOne: [], rowTwo: [] };
  }

  const aspectConfigs = [
    { tag: 'CINEMA 16:9', aspectClass: 'aspect-[16/9]', bgAccent: 'bg-[#0f1115]' },
    { tag: 'REEL 9:16', aspectClass: 'aspect-[9/16]', bgAccent: 'bg-[#181329]' },
    { tag: 'LOOKBOOK 4:5', aspectClass: 'aspect-[4/5]', bgAccent: 'bg-[#0b2416]' },
    { tag: 'POST 1:1', aspectClass: 'aspect-square', bgAccent: 'bg-[#141414]' },
    { tag: 'DIRECTOR 16:10', aspectClass: 'aspect-[16/10]', bgAccent: 'bg-[#111317]' },
    { tag: 'STREET REEL 9:16', aspectClass: 'aspect-[9/16]', bgAccent: 'bg-[#ff4e00]' },
    { tag: 'COMMERCIAL 4:5', aspectClass: 'aspect-[4/5]', bgAccent: 'bg-[#966b2d]' },
  ];

  const targetPerLane = Math.max(5, Math.min(10, Math.ceil(flatPhotos.length / 2)));
  const rowOne: BentoItem[] = [];
  const rowTwo: BentoItem[] = [];

  for (let i = 0; i < targetPerLane; i++) {
    const itemData = flatPhotos[i % flatPhotos.length];
    const cfg = aspectConfigs[i % aspectConfigs.length];
    rowOne.push({
      id: `user-bento-1-${i}`,
      projectId: itemData.campaign.id,
      brand: (itemData.campaign.name || 'CAMPAIGN').toUpperCase(),
      tag: cfg.tag,
      aspectClass: cfg.aspectClass,
      bgAccent: cfg.bgAccent,
      mediaType: 'image',
      mediaUrl: itemData.photo,
      posterUrl: itemData.photo,
    });
  }

  for (let j = 0; j < targetPerLane; j++) {
    const itemData = flatPhotos[(j + targetPerLane) % flatPhotos.length];
    const cfg = aspectConfigs[(j + 2) % aspectConfigs.length];
    rowTwo.push({
      id: `user-bento-2-${j}`,
      projectId: itemData.campaign.id,
      brand: (itemData.campaign.name || 'CAMPAIGN').toUpperCase(),
      tag: cfg.tag,
      aspectClass: cfg.aspectClass,
      bgAccent: cfg.bgAccent,
      mediaType: 'image',
      mediaUrl: itemData.photo,
      posterUrl: itemData.photo,
    });
  }

  return { rowOne, rowTwo };
}

interface BtsArcSectionProps {
  onOpenCase?: (id: string) => void;
  uploadedFiles?: DynamicCanvasFile[];
}

export default function BtsArcSection({ onOpenCase, uploadedFiles }: BtsArcSectionProps) {
  const { rowOne, rowTwo } = useMemo(() => {
    return buildBentoItemsFromUploads(uploadedFiles || []);
  }, [uploadedFiles]);

  const [unmutedId, setUnmutedId] = useState<string | null>(null);
  const [isRowOneHovered, setIsRowOneHovered] = useState(false);
  const [isRowTwoHovered, setIsRowTwoHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [failedVideos, setFailedVideos] = useState<Record<string, boolean>>({});

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
      setIsMobile(typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse) and (hover: none)').matches));
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
  }, [rowOne, rowTwo]);

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
        if (trackWidth > 0) {
          rowTwoRef.current.style.transform = `translate3d(${rowTwoPosRef.current - trackWidth}px, 0, 0)`;
        }
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
    const isVideoAllowed = item.mediaType === 'video' && !isMobile && !failedVideos[item.id];

    return (
      <div
        key={uniqueKey}
        onClick={() => handleCardClick(item.projectId)}
        className={`h-full flex-shrink-0 cursor-pointer group select-none relative ${item.aspectClass}`}
      >
        {/* Visual Bento Container - Apple continuous squircle radius */}
        <div
          className={`relative w-full h-full rounded-[24px] overflow-hidden ${item.bgAccent} shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)] group-hover:-translate-y-1`}
        >
          {/* Media: Looping Video on Desktop or High-Speed Photography on Mobile */}
          {isVideoAllowed ? (
            <video
              src={item.mediaUrl}
              poster={item.posterUrl}
              autoPlay
              loop
              muted={unmutedId !== item.id}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={() => {
                setFailedVideos((prev) => ({ ...prev, [item.id]: true }));
              }}
            />
          ) : (
            <img
              src={item.posterUrl || item.mediaUrl}
              alt={item.brand}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                if (item.posterUrl && e.currentTarget.src !== item.posterUrl) {
                  e.currentTarget.src = item.posterUrl;
                }
              }}
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
              <span className="font-mono text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-[10px] bg-black/45 backdrop-blur-md text-white/90 uppercase tracking-widest">
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
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[10px] bg-black/85 backdrop-blur-md text-white shadow-2xl flex flex-col items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
              <span className="font-sans text-[11px] md:text-xs font-semibold tracking-wide">Expand</span>
              <span className="text-sm md:text-base font-light leading-none mt-0.5 text-accent-red">+</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (rowOne.length === 0 && rowTwo.length === 0) {
    return (
      <section id="work" className="w-full py-20 sm:py-28 md:py-32 bg-canvas overflow-hidden select-none">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 md:px-14">
          <div className="rounded-[32px] bg-[#faf9f6] p-10 sm:p-16 md:p-20 text-center flex flex-col items-center justify-center space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 font-mono text-[10px] font-bold tracking-widest uppercase text-neutral-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e60000]" />
              <span>ARCHIVE (2024–2026)</span>
            </div>
            <h3 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-black leading-tight">
              Directorial Works In Curation
            </h3>
            <p className="font-sans text-sm sm:text-base text-neutral-500 max-w-lg leading-relaxed">
              New commercial campaigns, brand systems, and editorial lookbooks are currently being uploaded to the private archive.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/admin"
                className="px-6 py-3 rounded-full bg-[#e60000] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#ff1a1a] transition-all shadow-md"
              >
                + Add Work in Studio Desk →
              </Link>
              <Link
                href="/canvas"
                className="px-6 py-3 rounded-full bg-black/5 hover:bg-black/10 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all"
              >
                Explore Discipline Canvas
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="w-full py-12 sm:py-16 md:py-20 bg-canvas overflow-hidden">
      {/* Sliding Horizontal Bento Tracks (Zero External Text) */}
      <div className="w-full flex flex-col gap-6 md:gap-8 overflow-hidden">
        {/* Lane 1: Slides Left - Fixed uniform height with mixed bento widths */}
        <div
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden"
          onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setIsRowOneHovered(true); }}
          onMouseLeave={() => setIsRowOneHovered(false)}
        >
          <div ref={rowOneRef} className="flex gap-3 sm:gap-5 md:gap-7 h-full w-max will-change-transform">
            {/* Duplicated for seamless infinite marquee */}
            {Array.from({ length: REPETITIONS }).flatMap(() => rowOne).map((item, idx) =>
              renderBentoCard(item, `lane1-${item.id}-${idx}`)
            )}
          </div>
        </div>

        {/* Lane 2: Slides Right - Fixed uniform height with mixed bento widths */}
        <div
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden"
          onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setIsRowTwoHovered(true); }}
          onMouseLeave={() => setIsRowTwoHovered(false)}
        >
          <div ref={rowTwoRef} className="flex gap-3 sm:gap-5 md:gap-7 h-full w-max will-change-transform">
            {/* Duplicated for seamless infinite marquee */}
            {Array.from({ length: REPETITIONS }).flatMap(() => rowTwo).map((item, idx) =>
              renderBentoCard(item, `lane2-${item.id}-${idx}`)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
