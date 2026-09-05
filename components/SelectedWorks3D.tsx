'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

export interface WorkItem {
  id: string;
  caseId: string;
  idxStr: string;
  category: string;
  title: string;
  scope: string;
  year: string;
  role: string;
  client: string;
  image: string;
  colorTag: string;
}

const WORKS_DATA: WorkItem[] = [
  {
    id: 'windchasers',
    caseId: 'windchasers',
    idxStr: '01 / LOOKBOOK',
    category: 'AVIATION & LUXURY',
    title: 'Windchasers Aviation',
    scope: 'Flight Deck Stills • Hard Contrast Direct Light',
    year: '2026',
    role: 'Lead Art Director',
    client: 'Windchasers Academy',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#ff3300]',
  },
  {
    id: 'easyhaibro',
    caseId: 'easyhaibro',
    idxStr: '02 / IDENTITY',
    category: 'STREETWEAR & RETAIL',
    title: 'Easy Hai Bro',
    scope: 'Kinetic Worldbuilding • Commercial Shoot Direction',
    year: '2026',
    role: 'Creative Director',
    client: 'Easy Hai Bro Retail',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#ff3300]',
  },
  {
    id: 'kaladhar',
    caseId: 'kaladhar',
    idxStr: '03 / COUTURE',
    category: 'HERITAGE LUXURY',
    title: 'Kaladhar Bridal',
    scope: 'Tungsten Chiaroscuro • Handloom Textiles',
    year: '2025',
    role: 'Director of Visuals',
    client: 'Kaladhar Heritage',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#f59e0b]',
  },
  {
    id: 'ruchi',
    caseId: 'ruchi',
    idxStr: '04 / CULINARY',
    category: 'COMMERCIAL FOOD',
    title: 'Ruchi Fried Chicken',
    scope: 'High-Speed Macro Stills • Saturated Neon Rim',
    year: '2025',
    role: 'Art Director',
    client: 'Ruchi Food Group',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#00e575]',
  },
  {
    id: 'porsche',
    caseId: 'porsche',
    idxStr: '05 / CINEMA',
    category: 'AUTOMOTIVE BROADCAST',
    title: 'Porsche Telemetry',
    scope: 'Nocturnal Pursuit Arm • Acoustic Telemetry Edit',
    year: '2026',
    role: 'Director Cut',
    client: 'Porsche Club',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#0055ff]',
  },
  {
    id: 'prada',
    caseId: 'prada',
    idxStr: '06 / KINETIC',
    category: '3D & MOTION ARCHITECTURE',
    title: 'Prada Deconstruct',
    scope: 'Architectural Wireframes • Swiss Rhythms',
    year: '2025',
    role: 'Motion Director',
    client: 'Prada Group',
    image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#ff3300]',
  },
  {
    id: 'dior',
    caseId: 'dior',
    idxStr: '07 / ANAMORPHIC',
    category: 'ATMOSPHERIC FILM',
    title: 'Dior Nocturne',
    scope: 'Anamorphic Oval Bokeh • Practical Haze Control',
    year: '2025',
    role: 'Director of Photography',
    client: 'Parfums Christian Dior',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#f59e0b]',
  },
  {
    id: 'oxymorons',
    caseId: 'oxymorons',
    idxStr: '08 / TYPOGRAPHY',
    category: 'BRAND ARCHITECTURE',
    title: 'Oxymorons Collective',
    scope: 'Typographic Distortion • Analog Chromatic Passes',
    year: '2025',
    role: 'Brand Architect',
    client: 'Oxymorons Labs',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    colorTag: 'bg-[#00e575]',
  },
];

interface SelectedWorks3DProps {
  onOpenCase: (projectId: string) => void;
}

export default function SelectedWorks3D({ onOpenCase }: SelectedWorks3DProps) {
  const [scrollPos, setScrollPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const totalMovedDistance = useRef(0);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const total = WORKS_DATA.length;

  // Responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  const cardWidth = isMobile ? 260 : isTablet ? 290 : 330;
  const cardHeight = isMobile ? 400 : isTablet ? 450 : 510;
  const cardGap = isMobile ? 20 : isTablet ? 28 : 36;
  const step = cardWidth + cardGap;

  // Auto-pan when idle
  useEffect(() => {
    if (!isAutoPlaying || isDragging) {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      return;
    }
    autoPlayTimer.current = setInterval(() => {
      setScrollPos((prev) => prev + 1);
    }, 4500);

    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isAutoPlaying, isDragging]);

  // Normalized active index
  const activeNormalizedIdx = ((Math.round(scrollPos) % total) + total) % total;
  const currentActiveItem = WORKS_DATA[activeNormalizedIdx];

  const handlePrev = useCallback(() => {
    setScrollPos((prev) => Math.round(prev) - 1);
  }, []);

  const handleNext = useCallback(() => {
    setScrollPos((prev) => Math.round(prev) + 1);
  }, []);

  // Pointer drag events
  const onPointerDown = (clientX: number) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
    dragStartX.current = clientX;
    dragStartScroll.current = scrollPos;
    totalMovedDistance.current = 0;
  };

  const onPointerMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX.current;
    totalMovedDistance.current = Math.abs(deltaX);
    // Convert dragged pixels to fractional card units
    const deltaUnit = -deltaX / step;
    setScrollPos(dragStartScroll.current + deltaUnit);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Smoothly snap to nearest integer index
    setScrollPos((prev) => Math.round(prev));
  };

  const handleCardClick = (work: WorkItem, diff: number) => {
    // If user dragged more than 6px, treat as drag gesture not click
    if (totalMovedDistance.current > 6) return;

    if (Math.abs(diff) < 0.3) {
      // Direct center card click opens the project
      onOpenCase(work.caseId);
    } else {
      // Clicking a side card brings it to center
      setScrollPos((prev) => Math.round(prev) + Math.round(diff));
    }
  };

  // Wheel horizontal/vertical rotation
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 25) {
      if (e.deltaX > 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <section
      id="works"
      onWheel={handleWheel}
      className="w-full py-16 sm:py-24 bg-[#f8f7f4] text-[#0d0d0e] relative overflow-hidden select-none border-t border-b border-black/5"
    >
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ff2a2a] animate-pulse" />
              <span className="font-mono text-[11px] sm:text-xs text-black/60 uppercase tracking-widest font-bold">
                02 / SELECTED WORKS
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black leading-none">
              CURATED WORKS &amp; DIRECTION
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-mono text-[11px] sm:text-xs text-black/50 max-w-xs text-left md:text-right hidden sm:block leading-relaxed">
              3D Panoramic Arc. Drag horizontally or click any project frame to inspect full on-set technicals.
            </p>
            <Link
              href="/canvas"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-[#ff2a2a] rounded-full font-mono text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
            >
              <span>CANVAS ARCHIVE</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Panoramic Cylinder Arc Stage */}
      <div
        className={`relative w-full h-[470px] sm:h-[530px] md:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{
          perspective: isMobile ? '1000px' : '1600px',
          perspectiveOrigin: '50% 50%',
        }}
        onMouseDown={(e) => onPointerDown(e.clientX)}
        onMouseMove={(e) => onPointerMove(e.clientX)}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
        onTouchEnd={onPointerUp}
      >
        {/* Soft Ambient Horizon Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[350px] bg-black/5 rounded-full blur-3xl opacity-70" />
        </div>

        {/* 3D Arc Card Cluster */}
        <div
          className="relative w-0 h-0 flex items-center justify-center pointer-events-none will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {WORKS_DATA.map((work, idx) => {
            // Circular distance from scroll position
            const rawDiff = ((idx - (scrollPos % total) + total + total / 2) % total) - total / 2;
            const dist = rawDiff;

            // Hide cards far off to the sides
            if (Math.abs(dist) > 3.4) return null;

            // Compute wide panoramic curved arc position
            const pixelX = dist * step;
            const normX = pixelX / (viewportWidth * 0.55); // -1.2 to +1.2 across screen

            // 3D Arc Curvature parameters (Image 2 style)
            const rotY = -normX * (isMobile ? 22 : 26); // Curving towards viewer
            const transZ = -Math.abs(normX) * (isMobile ? 70 : 120); // Receding into depth
            const scale = Math.max(0.82, 1 - Math.abs(normX) * 0.08);
            const opacity = Math.max(0.2, 1 - Math.abs(normX) * 0.35);
            const zIndex = Math.round(100 - Math.abs(dist) * 10);

            const isCenter = Math.abs(dist) < 0.45;

            return (
              <div
                key={work.id}
                onClick={() => handleCardClick(work, dist)}
                className="absolute pointer-events-auto cursor-pointer select-none transition-shadow duration-300 group"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `translate(-50%, -50%) translate3d(${pixelX}px, 0px, ${transZ}px) rotateY(${rotY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease',
                }}
              >
                {/* Visual Card Sleeve (Images 3 & 4 layout) */}
                <div
                  className={`relative w-full h-full rounded-[24px] overflow-hidden bg-[#121214] shadow-2xl transition-all duration-300 border ${
                    isCenter
                      ? 'border-black/30 ring-2 ring-black/15 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* High-Resolution Project Visual Background */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />

                  {/* Top & Bottom Cinematic Vignette Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/95 pointer-events-none" />

                  {/* Top Header Capsule Bar */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                    <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 font-mono text-[9px] sm:text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${work.colorTag}`} />
                      <span>{work.idxStr}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCase(work.caseId);
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center font-bold text-xs shadow-lg transition-transform hover:scale-110 active:scale-95"
                      title="Inspect Case Study"
                    >
                      ↗
                    </button>
                  </div>

                  {/* Bottom Editorial Content */}
                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 flex flex-col">
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#ff2a2a] uppercase font-bold tracking-wider mb-1 block">
                      {work.category}
                    </span>

                    <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight leading-tight line-clamp-2 drop-shadow-md">
                      {work.title}
                    </h3>

                    <p className="font-mono text-[10px] sm:text-[11px] text-white/75 line-clamp-1 mt-1 leading-snug">
                      {work.scope}
                    </p>

                    {/* Interactive Opening Pill Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCase(work.caseId);
                      }}
                      className="mt-4 w-full py-2.5 bg-white/15 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/25 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                    >
                      <span>EXPLORE WORK</span>
                      <span className="font-bold">↗</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modernist Navigation Controls Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-black/60">
        {/* Active Frame Callout */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-black/10 rounded-full font-bold text-black text-[11px]">
            {activeNormalizedIdx + 1 < 10 ? `0${activeNormalizedIdx + 1}` : activeNormalizedIdx + 1} / 0{total}
          </span>
          <span className="font-bold text-black uppercase tracking-wider text-xs">
            {currentActiveItem.title}
          </span>
          <span className="text-black/40 hidden md:inline">• {currentActiveItem.role}</span>
        </div>

        {/* Interactive Arc Nav Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            className="px-4 py-2 bg-black/5 hover:bg-black hover:text-white rounded-full font-mono text-xs font-bold uppercase transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            title="Previous project"
          >
            <span>←</span>
            <span>PREV</span>
          </button>

          {/* Indicator Pills */}
          <div className="flex items-center gap-1.5 px-2">
            {WORKS_DATA.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const diff = ((i - activeNormalizedIdx + total + total / 2) % total) - total / 2;
                  setScrollPos((prev) => Math.round(prev) + diff);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeNormalizedIdx ? 'w-7 bg-black' : 'w-2 bg-black/20 hover:bg-black/40'
                }`}
                title={`Jump to project ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-black/5 hover:bg-black hover:text-white rounded-full font-mono text-xs font-bold uppercase transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            title="Next project"
          >
            <span>NEXT</span>
            <span>→</span>
          </button>

          {/* Autoplay Pause/Play Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-black flex items-center justify-center text-xs transition-colors shadow-sm"
            title={isAutoPlaying ? 'Pause Orbit' : 'Resume Auto-Orbit'}
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </div>
    </section>
  );
}


