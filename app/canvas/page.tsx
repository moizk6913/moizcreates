'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';

interface ArchiveFile {
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
}

const ARCHIVE_FILES: ArchiveFile[] = [
  {
    id: 'windchasers',
    code: 'FILE_01.DIR',
    name: 'Windchasers Aviation Academy',
    discipline: 'Art Direction • Lookbook',
    year: '2026',
    role: 'Lead Art Director',
    x: -260,
    y: -190,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#ff3300]',
    desc: 'High-altitude commercial lookbook and flight deck shoot direction capturing the technical precision of modern aviation trainees.',
    deliverables: ['Lookbook Concept', 'Location Scouting', 'Flight Deck Lighting', 'Broadcast Master'],
  },
  {
    id: 'easyhaibro',
    code: 'FILE_02.ID',
    name: 'Easy Hai Bro',
    discipline: 'Brand Identity • Strategy',
    year: '2026',
    role: 'Creative Director',
    x: 230,
    y: -240,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Complete brand worldbuilding, punchy lifestyle shoot direction, and kinetic style system for a Gen-Z retail phenomenon.',
    deliverables: ['Visual Identity', 'Typography System', 'Commercial Campaign', 'Packaging Design'],
  },
  {
    id: 'kaladhar',
    code: 'FILE_03.LUX',
    name: 'Kaladhar Heritage Bridal',
    discipline: 'Lighting Direction • Styling',
    year: '2025',
    role: 'Director of Visuals',
    x: -540,
    y: 80,
    rot: 4,
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Regal bridal campaign capturing museum-grade handloom textiles through warm cinematic tungsten chiaroscuro.',
    deliverables: ['Set Design', 'Chiaroscuro Lighting', 'Model Staging', 'Editorial Lookbook'],
  },
  {
    id: 'ruchi',
    code: 'FILE_04.COM',
    name: 'Ruchi Fried Chicken',
    discipline: 'Commercial Shoot • Food Art',
    year: '2025',
    role: 'Art Director',
    x: 140,
    y: 200,
    rot: -3,
    img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#00e575]',
    desc: 'High-speed culinary shoot direction combining vibrant color contrast with tactile macro slow-motion textures.',
    deliverables: ['Food Styling Direction', 'Tabletop Macro Stills', 'Color Grading', 'Social Motion Assets'],
  },
  {
    id: 'oxymorons',
    code: 'FILE_05.EXP',
    name: 'Oxymorons Collective',
    discipline: 'Visual Identity • Architecture',
    year: '2025',
    role: 'Brand Architect',
    x: 520,
    y: 30,
    rot: -1.5,
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/11]',
    colorTag: 'bg-[#0055ff]',
    desc: 'Brutalist Swiss identity system built on architectural grid structures and monochromatic typographic contrast.',
    deliverables: ['Grid Framework', 'Custom Glyphs', 'Brand Book', 'Digital Architecture'],
  },
  {
    id: 'balenciaga-tokyo',
    code: 'FILE_06.FWD',
    name: 'Neo-Tokyo Runway Concept',
    discipline: 'Cinematography • Stage Direction',
    year: '2026',
    role: 'Art Director',
    x: -720,
    y: -290,
    rot: 2,
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
    colorTag: 'bg-[#141414]',
    desc: 'Experimental cyber-dystopian runway showcase utilizing monolithic neon fixtures and wide-angle anamorphic lenses.',
    deliverables: ['Stage Architecture', 'Anamorphic Framing', 'Runway Master Film', 'Lighting Design'],
  },
  {
    id: 'vogue-arabia',
    code: 'FILE_07.EDT',
    name: 'Vogue Monolith Editorial',
    discipline: 'Fashion Editorial • Stills',
    year: '2025',
    role: 'Creative Director',
    x: -100,
    y: 450,
    rot: 1.5,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#ff3300]',
    desc: 'High-contrast studio shoot exploring sculptural silhouettes, stark light falloff, and contemporary couture drape.',
    deliverables: ['Editorial Curation', 'Model Direction', 'Analog Grain Grade', 'Cover Layout'],
  },
  {
    id: 'porsche-sound',
    code: 'FILE_08.FLM',
    name: 'Porsche 911 Soundscape',
    discipline: 'Video Editing • Sound Design',
    year: '2026',
    role: 'Editor & Colorist',
    x: 640,
    y: -340,
    rot: -2.5,
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Visceral automotive director cut sync-edited to raw exhaust acoustics and precision German asphalt telemetry.',
    deliverables: ['Director Cut 16:9', 'Exhaust Sound Design', 'Film Stock Emulation', 'Social Cutdowns'],
  },
  {
    id: 'prada-wireframe',
    code: 'FILE_09.KNT',
    name: 'Prada Structural Deconstruct',
    discipline: 'Motion Graphics • 3D',
    year: '2025',
    role: 'Motion Director',
    x: -380,
    y: -540,
    rot: -3.5,
    img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[1/1]',
    colorTag: 'bg-[#0055ff]',
    desc: 'Kinetic 3D wireframe exploration decomposing luxury leather goods into floating geometric architectural lines.',
    deliverables: ['3D Wireframes', 'Rhythm Title Sequences', 'Loop Animations', 'Interactive Display'],
  },
  {
    id: 'nike-kinetic',
    code: 'FILE_10.SPO',
    name: 'Nike Hyperspeed Broadcast',
    discipline: 'Motion Graphics • Title Rhythm',
    year: '2026',
    role: 'Art Director',
    x: 360,
    y: 490,
    rot: 3,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/9]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Distorted typography, frame-by-frame rhythm cuts, and high-frequency audio visualizers for athletic performance gear.',
    deliverables: ['Title Sequences', 'Broadcast Motion Kit', 'Sound Sync', '9:16 Vertical Masters'],
  },
  {
    id: 'chanel-macro',
    code: 'FILE_11.WAT',
    name: 'Chanel Haute Horlogerie',
    discipline: 'Photography • Viewfinder',
    year: '2025',
    role: 'Lead Photographer',
    x: -800,
    y: 170,
    rot: -4,
    img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    colorTag: 'bg-[#141414]',
    desc: 'Ultra-macro tourbillon watch photography highlighting polished titanium gears, sapphire crystals, and reflection control.',
    deliverables: ['Macro Studio Lighting', 'Reflection Baffles', 'Focus Stacking Retouch', 'Print Catalog'],
  },
  {
    id: 'acne-analogue',
    code: 'FILE_12.GRN',
    name: 'Acne Studios Stockholm Archive',
    discipline: 'Colour Grading • 35mm',
    year: '2025',
    role: 'Colorist & Stills',
    x: -280,
    y: 660,
    rot: 2,
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
    colorTag: 'bg-[#ede8df]',
    desc: 'Nordic daylight lookbook shot on expired 35mm film stock, scanned at 8K and balanced for rich earthy pastel palettes.',
    deliverables: ['Film Scanning & Dust Clean', 'Kodak 5219 Emulation', 'Lookbook Binding', 'Web Campaign'],
  },
  {
    id: 'apple-emblem',
    code: 'FILE_13.SYS',
    name: 'Studio Monolith Emblem',
    discipline: 'Brand System • Swiss Deck',
    year: '2026',
    role: 'Design Lead',
    x: 770,
    y: 150,
    rot: -2,
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[1/1]',
    colorTag: 'bg-[#00e575]',
    desc: 'Kinetic design deck and identity handbook articulating grid rhythm, variable typography metrics, and brand motion rules.',
    deliverables: ['Brand Guidelines Book', 'Motion Principles', 'Component Library', 'Investor Deck'],
  },
  {
    id: 'dior-tungsten',
    code: 'FILE_14.TNG',
    name: 'Dior Midnight Nocturne',
    discipline: 'Cinematography • Film Grade',
    year: '2025',
    role: 'Director of Photography',
    x: 90,
    y: -600,
    rot: 3.5,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/10]',
    colorTag: 'bg-[#f59e0b]',
    desc: 'Nocturnal perfume campaign directed under high-power tungsten fixtures with anamorphic oval bokeh and atmospheric haze.',
    deliverables: ['Anamorphic Package', 'Haze Atmospheric Control', 'Commercial Film Master', 'Print Billboards'],
  },
  {
    id: 'supreme-underground',
    code: 'FILE_15.TYP',
    name: 'Underground Type Distort',
    discipline: 'Motion Graphics • Experimental',
    year: '2026',
    role: 'Motion Designer',
    x: -580,
    y: -680,
    rot: 1.8,
    img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/11]',
    colorTag: 'bg-[#ff3300]',
    desc: 'Subversive typographic kinetic posters exploring analog CRT screen glitches, photocopier streaks, and raw grain.',
    deliverables: ['Kinetic Posters', 'CRT Distortion Loops', 'Vinyl Record Sleeve', 'Sticker Packs'],
  },
  {
    id: 'saint-laurent-cut',
    code: 'FILE_16.EDT',
    name: 'Saint Laurent Winter Cut',
    discipline: 'Video Editing • Director Cut',
    year: '2025',
    role: 'Lead Video Editor',
    x: 700,
    y: 580,
    rot: -3,
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
    colorTag: 'bg-[#141414]',
    desc: 'Rapid-fire Parisian winter fashion director cut pairing stark black-and-white silhouettes with brutalist industrial beats.',
    deliverables: ['Director Cut 4K', 'Sound Rescoring', 'Multi-Aspect Ratios', 'Color Negative Pass'],
  },
];

export default function InfiniteCanvasPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Gesture tracking references
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1);

  // Mobile viewport detection and initial scale adjustment
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile screens, initialize with comfortable overview scale
      if (mobile) {
        setZoom(0.75);
      } else {
        setZoom(1.0);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- UNIFIED POINTER & TOUCH GESTURE HANDLING ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary button (mouse left or single touch)
    if (e.button !== 0) return;
    
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };

    // Capture pointer so drag persists even if finger moves fast or leaves viewport
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

    // Movement threshold to differentiate between a tap and a drag
    if (Math.hypot(deltaX, deltaY) > 6) {
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

  const resetCenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(isMobile ? 0.75 : 1.0);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.4));

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

      {/* Limitless Dotted Grid Infinite Canvas */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          backgroundImage: 'radial-gradient(#c7c4ba 1.5px, transparent 1.5px)',
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />

      {/* Floating Modern Editorial Top Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 p-4 sm:p-6 md:p-8 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/"
            className="group flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white/95 backdrop-blur-md border border-black/10 rounded-full font-mono text-[11px] sm:text-xs text-primary hover:text-accent-red hover:border-accent-red active:scale-95 transition-all shadow-sm"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span className="font-bold">BACK TO PORTFOLIO</span>
          </Link>
        </div>

        {/* Center Title Pill */}
        <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-white/95 backdrop-blur-md border border-black/10 rounded-full font-mono text-xs text-primary shadow-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
          <span className="font-bold tracking-tight">LIMITLESS ARCHIVE</span>
          <span className="text-muted">/ 16 FILES</span>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={zoomOut}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-md border border-black/10 rounded-full font-mono text-xs text-secondary hover:text-primary active:scale-90 transition-all shadow-sm flex items-center justify-center font-bold"
            title="Zoom Out"
          >
            −
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-md border border-black/10 rounded-full font-mono text-xs text-secondary hover:text-primary active:scale-90 transition-all shadow-sm flex items-center justify-center font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={resetCenter}
            className="px-3 h-8 sm:h-9 bg-white/95 backdrop-blur-md border border-black/10 rounded-full font-mono text-[11px] sm:text-xs text-secondary hover:text-primary active:scale-90 transition-all shadow-sm flex items-center gap-1"
            title="Reset View"
          >
            <span>⊙</span>
            <span className="hidden md:inline font-medium">CENTER</span>
          </button>
        </div>
      </header>

      {/* Limitless World Stage (Pans & Zooms smoothly with gestures) */}
      <div
        className="absolute top-1/2 left-1/2 will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Origin Center Radar Marker */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center opacity-30">
          <div className="w-10 h-px bg-black/40" />
          <div className="h-10 w-px bg-black/40 -mt-5" />
          <span className="font-mono text-[9px] tracking-widest text-black/60 mt-1 uppercase">ARCHIVE CENTER (0, 0)</span>
        </div>

        {/* 16 Archival File Folder Icons with Images Peeking Up */}
        {ARCHIVE_FILES.map((file) => (
          <div
            key={file.id}
            data-cursor="view"
            data-cursor-text="INSPECT ↗"
            onClick={() => handleFileClick(file)}
            style={{
              left: `${file.x}px`,
              top: `${file.y}px`,
              transform: `translate(-50%, -50%) rotate(${file.rot}deg)`,
            }}
            className="absolute group cursor-pointer transition-all duration-300 hover:z-50 select-none touch-manipulation"
          >
            {/* The Archival File Sleeve Container */}
            <div className="relative w-[180px] sm:w-[210px] md:w-[230px] pt-14 pb-4 px-3.5 sm:px-4 bg-[#f2efe9] border border-[#dedad1] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 transition-all duration-300">
              
              {/* Folder Top Tab */}
              <div className="absolute -top-3 left-3 sm:left-4 px-2.5 sm:px-3 py-1 bg-[#dedad1] rounded-t-[6px] border-t border-x border-[#cecac1] flex items-center gap-1.5 shadow-none">
                <span className={`w-1.5 h-1.5 rounded-full ${file.colorTag}`} />
                <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-wider text-black/70">
                  {file.code}
                </span>
              </div>

              {/* THE IMAGE PEEKING UP FROM INSIDE THE FILE JACKET */}
              <div className="absolute -top-10 inset-x-2.5 sm:inset-x-3 h-[96px] sm:h-[110px] rounded-[8px] overflow-hidden bg-black/10 border border-black/15 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-8 group-hover:scale-105 z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.img}
                  alt={file.name}
                  className="w-full h-full object-cover block pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
                {/* Visual Glass Edge / Photo Film Border */}
                <div className="absolute inset-0 border border-white/20 pointer-events-none" />
              </div>

              {/* Front File Sleeve Pocket (Sits in front of the lower half of the image) */}
              <div className="relative z-20 mt-10 pt-2 border-t border-[#dedad1]/60">
                <h3 className="font-bold text-xs sm:text-sm tracking-tight text-primary leading-tight group-hover:text-accent-red transition-colors line-clamp-2">
                  {file.name}
                </h3>
                <p className="font-mono text-[9px] sm:text-[10px] text-secondary mt-1 tracking-tight truncate">
                  {file.discipline}
                </p>
                
                <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-muted border-t border-black/5 pt-1.5 sm:pt-2">
                  <span>{file.year}</span>
                  <span className="text-accent-red font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                    PEEK ↗
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Instructions / Mobile HUD */}
      <footer className="fixed bottom-4 sm:bottom-6 inset-x-0 flex justify-center pointer-events-none z-40 px-4">
        <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-black/90 backdrop-blur-md text-white rounded-full font-mono text-[10px] sm:text-xs flex items-center gap-3 sm:gap-4 shadow-xl pointer-events-auto">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="tracking-tight">
              {isMobile ? 'SWIPE ANYWHERE TO PAN • TAP FILE' : 'DRAG TO PAN • CLICK FILE'}
            </span>
          </span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white/70 hidden sm:inline">
            ZOOM: {Math.round(zoom * 100)}%
          </span>
        </div>
      </footer>

      {/* Project Detail Lightbox Modal (Fully Touch-Friendly & Scrollable) */}
      {selectedFile && (
        <div
          onClick={() => setSelectedFile(null)}
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-black/10 flex flex-col max-h-[90vh]"
          >
            {/* Modal Image Header */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] bg-black overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedFile.img}
                alt={selectedFile.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-black active:scale-90 text-white flex items-center justify-center font-mono text-sm transition-all shadow-lg z-10"
                title="Close"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 sm:left-4 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded font-mono text-[9px] sm:text-[10px] text-white">
                {selectedFile.code} • {selectedFile.year}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 md:p-8 overflow-y-auto">
              <span className="font-mono text-[10px] sm:text-xs text-accent-red font-bold uppercase tracking-wider block mb-1">
                {selectedFile.discipline}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary mb-2.5">
                {selectedFile.name}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-secondary leading-relaxed mb-5">
                {selectedFile.desc}
              </p>

              <div className="border-t border-black/10 pt-4">
                <span className="font-mono text-[10px] sm:text-xs font-bold text-primary uppercase block mb-2.5">
                  Delivered Disciplines &amp; Assets:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedFile.deliverables.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#f5f4f0] border border-[#e5e3dc] rounded-md font-mono text-[10px] sm:text-xs text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#faf9f6] border-t border-black/5 flex justify-between items-center text-xs font-mono text-secondary flex-shrink-0">
              <span className="text-[10px] sm:text-xs">{selectedFile.role}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="font-bold text-accent-red hover:underline p-1"
              >
                CLOSE [✕]
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
