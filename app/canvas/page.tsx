'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import { getStoredCanvasFiles } from '@/lib/contentStore';

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
  const [allFiles, setAllFiles] = useState<ArchiveFile[]>(ARCHIVE_FILES);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const custom = getStoredCanvasFiles();
    if (custom && custom.length > 0) {
      setAllFiles([...custom, ...ARCHIVE_FILES]);
    }
  }, []);

  // Gesture tracking references
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1);

  // Mobile viewport detection and initial scale adjustment
  useEffect(() => {
    // Lock document scroll so dragging canvas does not trigger page bounce/scroll
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

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

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkMobile);
    };
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

      {/* Floating Minimalist Back Button Only */}
      <header className="fixed top-0 left-0 z-50 p-4 sm:p-6 md:p-8 pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-full font-mono text-[11px] sm:text-xs text-primary hover:text-accent-red active:scale-95 transition-all shadow-none border-0"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="font-bold">BACK TO PORTFOLIO</span>
        </Link>
      </header>

      {/* Limitless World Stage (Pans & Zooms smoothly with gestures) */}
      <div
        className="absolute top-1/2 left-1/2 will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Archival File Folder Icons with Images Peeking Up (ZERO SHADOWS, ZERO STROKES) */}
        {allFiles.map((file) => (
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
            className="absolute group cursor-pointer transition-transform duration-300 hover:z-50 select-none touch-manipulation"
          >
            {/* The Archival File Sleeve Container (Solid paper contrast, 0 shadow, 0 stroke) */}
            <div className="relative w-[180px] sm:w-[210px] md:w-[230px] pt-14 pb-4 px-3.5 sm:px-4 bg-[#ede8df] rounded-[12px] shadow-none border-0 group-hover:-translate-y-2 transition-transform duration-300">
              
              {/* Folder Top Tab */}
              <div className="absolute -top-3 left-3 sm:left-4 px-2.5 sm:px-3 py-1 bg-[#ded8cc] rounded-t-[6px] flex items-center gap-1.5 shadow-none border-0">
                <span className={`w-1.5 h-1.5 rounded-full ${file.colorTag}`} />
                <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-wider text-black/70">
                  {file.code}
                </span>
              </div>

              {/* THE IMAGE PEEKING UP FROM INSIDE THE FILE JACKET */}
              <div className="absolute -top-10 inset-x-2.5 sm:inset-x-3 h-[96px] sm:h-[110px] rounded-[8px] overflow-hidden bg-black/10 shadow-none border-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-8 group-hover:scale-105 z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.img}
                  alt={file.name}
                  className="w-full h-full object-cover block pointer-events-none border-0"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Front File Sleeve Pocket (Sits in front of the lower half of the image) */}
              <div className="relative z-20 mt-10 pt-2.5">
                <h3 className="font-bold text-xs sm:text-sm tracking-tight text-primary leading-tight group-hover:text-accent-red transition-colors line-clamp-2">
                  {file.name}
                </h3>
                <p className="font-mono text-[9px] sm:text-[10px] text-secondary mt-1 tracking-tight truncate">
                  {file.discipline}
                </p>
                
                <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-muted pt-1.5 sm:pt-2">
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
