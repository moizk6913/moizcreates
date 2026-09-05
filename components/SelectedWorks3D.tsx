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
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const dragRotationStart = useRef(0);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalWorks = WORKS_DATA.length;

  // Responsive radius & angular spacing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotation when idle
  useEffect(() => {
    if (!isAutoPlaying || isDragging) {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      return;
    }
    autoPlayTimer.current = setInterval(() => {
      setRotationIndex((prev) => prev + 1);
    }, 4500);

    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isAutoPlaying, isDragging]);

  // Normalized active index (0 to totalWorks - 1)
  const activeNormalizedIdx = ((Math.round(rotationIndex) % totalWorks) + totalWorks) % totalWorks;
  const currentActiveItem = WORKS_DATA[activeNormalizedIdx];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setRotationIndex((prev) => prev - 1);
  }, []);

  const handleNext = useCallback(() => {
    setRotationIndex((prev) => prev + 1);
  }, []);

  // Direct card click
  const handleCardClick = (idx: number, work: WorkItem) => {
    // If it's already the active center card, open the case study directly!
    if (idx === activeNormalizedIdx) {
      onOpenCase(work.caseId);
    } else {
      // Otherwise, rotate the cylinder smoothly to bring this card to center
      const diff = ((idx - activeNormalizedIdx + totalWorks + totalWorks / 2) % totalWorks) - totalWorks / 2;
      setRotationIndex((prev) => prev + diff);
    }
  };

  // Mouse & Touch drag handlers
  const onPointerDown = (clientX: number) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
    dragStartX.current = clientX;
    dragCurrentX.current = clientX;
    dragRotationStart.current = rotationIndex;
  };

  const onPointerMove = (clientX: number) => {
    if (!isDragging) return;
    dragCurrentX.current = clientX;
    const deltaX = clientX - dragStartX.current;
    // 1 card per ~160px drag distance
    const rotationDelta = -deltaX / (isMobile ? 120 : 180);
    setRotationIndex(dragRotationStart.current + rotationDelta);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest integer index
    setRotationIndex((prev) => Math.round(prev));
  };

  // Wheel navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (Math.abs(e.deltaX) > 20) {
        if (e.deltaX > 0) handleNext();
        else handlePrev();
      }
    }
  };

  // 3D Geometry parameters
  const cylinderRadius = isMobile ? 320 : 600;
  const angleStepDeg = isMobile ? 28 : 22;

  return (
    <section
      id="works"
      ref={containerRef}
      onWheel={handleWheel}
      className="w-full py-16 sm:py-24 bg-[#faf9f6] text-[#0d0d0e] relative overflow-hidden select-none"
    >
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#ff2a2a]" />
              <span className="font-mono text-[10px] sm:text-xs text-black/60 uppercase tracking-widest font-bold">
                02 / SELECTED WORKS
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black leading-none">
              CURATED WORKS &amp; DIRECTION
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-mono text-[11px] sm:text-xs text-black/50 max-w-xs text-left md:text-right hidden sm:block leading-relaxed">
              Tactile 3D cylindrical reel. Drag to rotate cylinder or click any frame to inspect full on-set technicals.
            </p>
            <Link
              href="/canvas"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-[#ff2a2a] rounded-full font-mono text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
            >
              <span>CANVAS ARCHIVE</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Cylindrical Arc Stage Viewport */}
      <div
        className={`relative w-full h-[460px] sm:h-[530px] md:h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{
          perspective: isMobile ? '950px' : '1500px',
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
        {/* Ambient Spatial Depth Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[300px] bg-black/5 rounded-full blur-3xl opacity-60" />
        </div>

        {/* 3D Arc Cards Center Origin */}
        <div
          className="relative w-0 h-0 flex items-center justify-center pointer-events-none will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {WORKS_DATA.map((work, idx) => {
            // Distance from active center index in circular space
            const rawDiff = ((idx - (rotationIndex % totalWorks) + totalWorks + totalWorks / 2) % totalWorks) - totalWorks / 2;
            const dist = rawDiff;
            const isCenter = Math.abs(dist) < 0.35;

            // Parametric 3D Cylinder formula (Image 2 style arc)
            const angleRad = (dist * angleStepDeg * Math.PI) / 180;
            const transX = Math.sin(angleRad) * cylinderRadius;
            const transZ = Math.cos(angleRad) * cylinderRadius - cylinderRadius;
            const rotY = dist * angleStepDeg;
            const scale = Math.max(0.75, 1 - Math.abs(dist) * 0.06);
            const opacity = Math.max(0.15, 1 - Math.abs(dist) * 0.22);
            const zIndex = Math.round(100 - Math.abs(dist) * 10);

            // Hide cards that are far behind the cylinder horizon
            if (Math.abs(dist) > 3.8) return null;

            return (
              <div
                key={work.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(idx, work);
                }}
                className="absolute pointer-events-auto cursor-pointer select-none transition-shadow duration-300 group"
                style={{
                  width: isMobile ? '230px' : '310px',
                  height: isMobile ? '350px' : '470px',
                  transform: `translate(-50%, -50%) translate3d(${transX}px, 0px, ${transZ}px) rotateY(${rotY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
                }}
              >
                {/* Visual Card Sleeve (Images 3 & 4 inspiration) */}
                <div
                  className={`relative w-full h-full rounded-[22px] overflow-hidden bg-black shadow-2xl transition-all duration-300 border ${
                    isCenter
                      ? 'border-black/20 ring-2 ring-black/10'
                      : 'border-black/10 group-hover:border-black/30'
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
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

                  {/* Top Card Capsule Bar */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                    <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 font-mono text-[9px] text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${work.colorTag}`} />
                      <span>{work.idxStr}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCase(work.caseId);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center font-bold text-xs shadow-lg transition-transform hover:scale-110 active:scale-95"
                      title="Inspect Case Study"
                    >
                      ↗
                    </button>
                  </div>

                  {/* Bottom Editorial Content */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 flex flex-col">
                    <span className="font-mono text-[9px] sm:text-[10px] text-[#ff2a2a] uppercase font-bold tracking-wider mb-1 block">
                      {work.category}
                    </span>

                    <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl text-white uppercase tracking-tight leading-tight line-clamp-2 drop-shadow-md">
                      {work.title}
                    </h3>

                    <p className="font-mono text-[10px] sm:text-[11px] text-white/70 line-clamp-1 mt-1 leading-snug">
                      {work.scope}
                    </p>

                    {/* Interactive Opening Pill Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCase(work.caseId);
                      }}
                      className="mt-3.5 w-full py-2 sm:py-2.5 bg-white/15 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/25 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
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

      {/* Modernist Arc Controls Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-black/60">
        {/* Active Frame Callout */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-black/10 rounded font-bold text-black text-[11px]">
            {activeNormalizedIdx + 1 < 10 ? `0${activeNormalizedIdx + 1}` : activeNormalizedIdx + 1} / 0{totalWorks}
          </span>
          <span className="font-bold text-black uppercase tracking-wider text-xs">
            {currentActiveItem.title}
          </span>
          <span className="text-black/40 hidden md:inline">• {currentActiveItem.role}</span>
        </div>

        {/* Interactive Arc Nav Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrev}
            className="px-3.5 py-1.5 bg-black/5 hover:bg-black hover:text-white rounded-full font-mono text-xs font-bold uppercase transition-all active:scale-95 flex items-center gap-1"
            title="Previous project"
          >
            <span>←</span>
            <span className="hidden sm:inline">PREV</span>
          </button>

          {/* Indicator Pills */}
          <div className="flex items-center gap-1 px-2">
            {WORKS_DATA.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const diff = ((i - activeNormalizedIdx + totalWorks + totalWorks / 2) % totalWorks) - totalWorks / 2;
                  setRotationIndex((prev) => prev + diff);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeNormalizedIdx ? 'w-6 bg-black' : 'w-1.5 bg-black/20 hover:bg-black/40'
                }`}
                title={`Jump to project ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-3.5 py-1.5 bg-black/5 hover:bg-black hover:text-white rounded-full font-mono text-xs font-bold uppercase transition-all active:scale-95 flex items-center gap-1"
            title="Next project"
          >
            <span className="hidden sm:inline">NEXT</span>
            <span>→</span>
          </button>

          {/* Autoplay Pause/Play Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="ml-2 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 text-black flex items-center justify-center text-[10px] transition-colors"
            title={isAutoPlaying ? 'Pause Orbit' : 'Resume Auto-Orbit'}
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </div>
    </section>
  );
}

