'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { WorkItem } from '@/lib/contentStore';

export interface PlaygroundItem {
  id: string;
  code: string;
  title: string;
  category: 'reels' | 'films' | 'stills' | 'kinetic';
  aspect: '9:16' | '16:9' | '4:5' | '1:1';
  mediaType: 'video' | 'image';
  mediaUrl: string;
  thumbnailUrl?: string;
  year: string;
  client?: string;
  role?: string;
  fps?: string;
  resolution?: string;
  tags: string[];
  desc: string;
  x: number;
  y: number;
  rot: number;
}

// Curated high-aesthetic directorial lab items (ensures 100% density even before uploads)
export const DEFAULT_PLAYGROUND_ITEMS: PlaygroundItem[] = [
  {
    id: 'lab-01',
    code: 'LAB // 01.REEL',
    title: 'KINETIC CHROME & SOUND DESIGN',
    category: 'reels',
    aspect: '9:16',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-01.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'DIRECTORIAL LAB',
    role: 'Motion Director',
    fps: '60 FPS',
    resolution: '4K PRORES',
    tags: ['Kinetic Typography', 'Chrome 3D', 'Sound Rescoring'],
    desc: 'Experimental high-frequency kinetic typography synced to sub-bass transients. Built for rapid-fire 9:16 vertical commercial impact.',
    x: -360,
    y: -220,
    rot: -2.5,
  },
  {
    id: 'lab-02',
    code: 'LAB // 02.FILM',
    title: 'ANALOGUE 35MM NIGHT DRIVE',
    category: 'films',
    aspect: '16:9',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-02.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'CINEMA LAB',
    role: 'Director of Photography',
    fps: '24 FPS',
    resolution: '4K DCI',
    tags: ['Tungsten 35mm', 'Automotive Cinema', 'Anamorphic Flare'],
    desc: 'Sodium-vapor streetlighting emulation on vintage anamorphic glass. Handheld director cut studying low-key reflection and speed.',
    x: 260,
    y: -260,
    rot: 1.8,
  },
  {
    id: 'lab-03',
    code: 'LAB // 03.STILL',
    title: 'HAUTE COUTURE EDITORIAL PLATE',
    category: 'stills',
    aspect: '4:5',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'LOOKBOOK LAB',
    role: 'Art Director',
    fps: 'STILL',
    resolution: 'MEDIUM FORMAT',
    tags: ['Fashion Editorial', 'Hasselblad Stills', 'Subtle Grain'],
    desc: 'Sculptural model staging with hard rim lighting and tactile fabric texture. Curated lookbook spread for high-fashion editorial.',
    x: -640,
    y: 40,
    rot: 3.2,
  },
  {
    id: 'lab-04',
    code: 'LAB // 04.REEL',
    title: 'HYPER-PACE EDITORIAL RHYTHM',
    category: 'reels',
    aspect: '9:16',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-03.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'DIRECTORIAL CUT',
    role: 'Lead Video Editor',
    fps: '60 FPS',
    resolution: '9:16 VERTICAL',
    tags: ['Micro-Cuts', 'Split Screen', 'Fashion Reel'],
    desc: 'Multi-frame vertical storytelling with 12fps rhythmic jump cuts and aggressive pacing tailored for luxury social campaigns.',
    x: 0,
    y: 0,
    rot: -1.2,
  },
  {
    id: 'lab-05',
    code: 'LAB // 05.KINETIC',
    title: 'DISTORTED MONOLITH 3D',
    category: 'kinetic',
    aspect: '1:1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-04.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'KINETIC LAB',
    role: '3D Artist',
    fps: '60 FPS',
    resolution: '2160x2160',
    tags: ['Procedural Shaders', 'Brutalist Monolith', 'Raytracing'],
    desc: 'Procedural metal extrusion deformed by auditory pulse signals. Dark monolithic aesthetic exploring heavy brutalist surfaces.',
    x: 520,
    y: -40,
    rot: 2.8,
  },
  {
    id: 'lab-06',
    code: 'LAB // 06.FILM',
    title: 'ARCHITECTURAL CONCRETE STUDY',
    category: 'films',
    aspect: '16:9',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-05.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'SPATIAL LAB',
    role: 'Director',
    fps: '24 FPS',
    resolution: '4K CINEMA',
    tags: ['Swiss Architecture', 'Slow Dolly', 'Tonal Balance'],
    desc: 'Monumental raw concrete facades under overcast European lighting. Precise linear geometric compositions and stillness.',
    x: -280,
    y: 320,
    rot: -2.1,
  },
  {
    id: 'lab-07',
    code: 'LAB // 07.REEL',
    title: 'TOKYO KINETIC STREETSCAPE',
    category: 'reels',
    aspect: '9:16',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-06.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'STREET LAB',
    role: 'Cinematographer',
    fps: '120 FPS',
    resolution: '9:16 4K',
    tags: ['Rain Emulsion', 'Shinjuku Neon', 'Slow Motion'],
    desc: 'Raindrops reflecting neon signage captured at 120 frames per second. An ode to nocturnal Tokyo speed and cinematic texture.',
    x: 320,
    y: 280,
    rot: 3.5,
  },
  {
    id: 'lab-08',
    code: 'LAB // 08.STILL',
    title: 'MINIMAL ARCHITECTURAL SILHOUETTE',
    category: 'stills',
    aspect: '4:5',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'MONO LAB',
    role: 'Photographer',
    fps: 'STILL',
    resolution: 'HIGH-RES 8K',
    tags: ['Monochrome', 'Geometric Contrast', 'Negative Space'],
    desc: 'High-contrast black-and-white architectural geometry. Pure Swiss neo-modernist framing with extreme vertical tension.',
    x: 820,
    y: -280,
    rot: -1.9,
  },
  {
    id: 'lab-09',
    code: 'LAB // 09.REEL',
    title: 'STUDIO LIGHTING CHOREOGRAPHY',
    category: 'reels',
    aspect: '9:16',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-07.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'LIGHTING LAB',
    role: 'Gaffer & Director',
    fps: '60 FPS',
    resolution: '9:16 PRORES',
    tags: ['Motorized Rig', 'Strobe Sequencing', 'Commercial Teaser'],
    desc: 'Synchronized motorized lighting grid testing aggressive shadows and strobe pacing for commercial product reveals.',
    x: -820,
    y: -240,
    rot: 2.1,
  },
  {
    id: 'lab-10',
    code: 'LAB // 10.FILM',
    title: 'DESERT MIRAGE 65MM PANORAMA',
    category: 'films',
    aspect: '16:9',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-08.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'DIRECTOR CUT',
    role: 'Director',
    fps: '24 FPS',
    resolution: '65MM EQUIVALENT',
    tags: ['Dubai Dunes', 'Golden Hour Mirage', 'Drone Tracking'],
    desc: 'Infinite dune ridgelines shimmering in 45-degree desert heat. Ultra-smooth low-altitude camera glide over pristine red sand.',
    x: 680,
    y: 340,
    rot: -3.0,
  },
  {
    id: 'lab-11',
    code: 'LAB // 11.STILL',
    title: 'METALLIC LIQUID REFLECTION',
    category: 'stills',
    aspect: '4:5',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'CGI LAB',
    role: 'Look Development',
    fps: 'STILL',
    resolution: '6000x8000',
    tags: ['Liquid Mercury', 'Reflective Surface', 'Studio Strobe'],
    desc: 'Distorted reflection on viscous chrome surface. High-contrast specular highlights rendered with photographic precision.',
    x: -720,
    y: 380,
    rot: 1.5,
  },
  {
    id: 'lab-12',
    code: 'LAB // 12.KINETIC',
    title: 'SWISS TYPOGRAPHIC GRID PULSE',
    category: 'kinetic',
    aspect: '1:1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-01.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'TYPE LAB',
    role: 'Creative Coder',
    fps: '60 FPS',
    resolution: '1080x1080',
    tags: ['Variable Font Matrix', 'Interactive Canvas', 'Audio FFT'],
    desc: 'Dynamic variable font weight oscillations reacting to frequency waveforms. Strict baseline alignment with chaotic distortions.',
    x: -60,
    y: -440,
    rot: 0,
  },
];

interface PlaygroundCosmosProps {
  uploadedWorks?: WorkItem[];
}

export default function PlaygroundCosmos({ uploadedWorks = [] }: PlaygroundCosmosProps) {
  // 1. Merge uploaded standalone works with curated lab items
  const allItems = useMemo<PlaygroundItem[]>(() => {
    const customItems: PlaygroundItem[] = uploadedWorks.map((work, idx) => {
      const isVideo = work.mediaType === 'video';
      const aspect = (work.dimensions?.aspectRatio || '16:9') as any;
      let cat: 'reels' | 'films' | 'stills' | 'kinetic' = 'stills';
      if (aspect === '9:16' || work.workType?.toLowerCase().includes('reel')) cat = 'reels';
      else if (isVideo) cat = 'films';
      else if (work.workType?.toLowerCase().includes('motion') || work.workType?.toLowerCase().includes('3d')) cat = 'kinetic';
      else cat = 'stills';

      const angle = (idx / Math.max(1, uploadedWorks.length)) * Math.PI * 2;
      const radius = 350 + (idx % 3) * 220;

      return {
        id: work.id,
        code: `WORK // ${String(idx + 1).padStart(2, '0')}.${cat.toUpperCase().slice(0, 4)}`,
        title: work.title,
        category: cat,
        aspect: aspect === '9:16' || aspect === '4:5' || aspect === '1:1' ? aspect : '16:9',
        mediaType: isVideo ? 'video' : 'image',
        mediaUrl: work.mediaUrl,
        thumbnailUrl: work.thumbnailUrl || work.mediaUrl,
        year: work.year || '2026',
        client: work.client || 'STUDIO DESK',
        role: work.workType || 'Directorial Work',
        fps: isVideo ? '60 FPS' : 'STILL',
        resolution: work.dimensions?.resolution || (isVideo ? '4K MASTER' : 'HIGH-RES'),
        tags: work.disciplines && work.disciplines.length > 0 ? work.disciplines : [cat.toUpperCase()],
        desc: work.caption || 'Created and published from Studio Desk.',
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
        rot: ((idx % 7) - 3) * 1.2,
      };
    });

    if (customItems.length === 0) {
      return DEFAULT_PLAYGROUND_ITEMS;
    }

    // Blend custom uploads in the center, surround with curated items
    return [...customItems, ...DEFAULT_PLAYGROUND_ITEMS.map((item, i) => ({
      ...item,
      x: item.x + (i % 2 === 0 ? 300 : -300),
      y: item.y + (i % 2 === 0 ? 200 : -200),
    }))];
  }, [uploadedWorks]);

  // View mode: 'cosmos' (2.5D spatial stage) vs 'grid' (Swiss editorial feed)
  const [viewMode, setViewMode] = useState<'cosmos' | 'grid'>('cosmos');
  const [activeFilter, setActiveFilter] = useState<'all' | 'reels' | 'films' | 'stills' | 'kinetic'>('all');
  
  // Camera Pan, Zoom & Momentum
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [hoveredItem, setHoveredItem] = useState<PlaygroundItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlaygroundItem | null>(null);
  const [isWandering, setIsWandering] = useState<boolean>(false);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(true);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return allItems;
    return allItems.filter((i) => i.category === activeFilter);
  }, [allItems, activeFilter]);

  // Statistics
  const reelsCount = useMemo(() => allItems.filter((i) => i.category === 'reels').length, [allItems]);
  const filmsCount = useMemo(() => allItems.filter((i) => i.category === 'films').length, [allItems]);
  const stillsCount = useMemo(() => allItems.filter((i) => i.category === 'stills').length, [allItems]);
  const kineticCount = useMemo(() => allItems.filter((i) => i.category === 'kinetic').length, [allItems]);

  // Gesture Tracking References
  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Stop physics loop
  const stopInertia = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Smooth Inertia Decay
  const startInertia = useCallback(() => {
    stopInertia();
    const friction = 0.92;
    const step = () => {
      velocityRef.current.vx *= friction;
      velocityRef.current.vy *= friction;

      if (Math.hypot(velocityRef.current.vx, velocityRef.current.vy) > 0.05) {
        setPan((prev) => ({
          x: Math.round(prev.x + velocityRef.current.vx * 16),
          y: Math.round(prev.y + velocityRef.current.vy * 16),
        }));
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        stopInertia();
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [stopInertia]);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode !== 'cosmos') return;
    if (e.button !== 0) return;
    stopInertia();

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = performance.now();
    velocityRef.current = { vx: 0, vy: 0 };

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || viewMode !== 'cosmos') return;

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 6) {
      hasMovedRef.current = true;
    }

    const instVx = (e.clientX - lastPosRef.current.x) / dt;
    const instVy = (e.clientY - lastPosRef.current.y) / dt;

    velocityRef.current = {
      vx: velocityRef.current.vx * 0.6 + instVx * 0.4,
      vy: velocityRef.current.vy * 0.6 + instVy * 0.4,
    };

    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;

    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    if (Math.hypot(velocityRef.current.vx, velocityRef.current.vy) > 0.08) {
      startInertia();
    }

    setTimeout(() => {
      hasMovedRef.current = false;
    }, 120);
  };

  // Wheel Zoom (clamped 0.45x - 1.8x)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (viewMode !== 'cosmos') return;
    stopInertia();

    // If trackpad pan or wheel
    if (e.ctrlKey || Math.abs(e.deltaY) > 30) {
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.0012;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(0.45, prevZoom + zoomFactor), 1.8);
        return parseFloat(nextZoom.toFixed(3));
      });
    } else {
      // Normal two-finger trackpad drag pan
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  }, [viewMode, stopInertia]);

  // Recenter Camera smoothly to (0, 0)
  const handleRecenter = () => {
    stopInertia();
    let frame = 0;
    const startX = pan.x;
    const startY = pan.y;
    const startZoom = zoom;
    const duration = 36;

    const easeOutCubic = (t: number) => --t * t * t + 1;

    const animate = () => {
      frame++;
      const progress = easeOutCubic(frame / duration);
      setPan({
        x: Math.round(startX * (1 - progress)),
        y: Math.round(startY * (1 - progress)),
      });
      setZoom(parseFloat((startZoom + (1.0 - startZoom) * progress).toFixed(3)));

      if (frame < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // Signature "⚡ WANDER" Auto-Pan Camera Drift
  const handleWander = () => {
    if (filteredItems.length === 0) return;
    stopInertia();
    setIsWandering(true);

    // Pick random item different from currently hovered
    const candidateList = filteredItems.filter((i) => i.id !== hoveredItem?.id);
    const target = candidateList.length > 0
      ? candidateList[Math.floor(Math.random() * candidateList.length)]
      : filteredItems[0];

    const startX = pan.x;
    const startY = pan.y;
    const targetX = -target.x * zoom;
    const targetY = -target.y * zoom;
    let frame = 0;
    const duration = 50;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const step = () => {
      frame++;
      const p = easeInOutCubic(frame / duration);
      setPan({
        x: Math.round(startX + (targetX - startX) * p),
        y: Math.round(startY + (targetY - startY) * p),
      });

      if (frame < duration) {
        requestAnimationFrame(step);
      } else {
        setHoveredItem(target);
        setIsWandering(false);
      }
    };

    requestAnimationFrame(step);
  };

  // Keyboard navigation for cinematic lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      } else if (selectedItem && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
        const currIdx = filteredItems.findIndex((i) => i.id === selectedItem.id);
        const nextIdx = (currIdx + 1) % filteredItems.length;
        setSelectedItem(filteredItems[nextIdx]);
      } else if (selectedItem && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
        const currIdx = filteredItems.findIndex((i) => i.id === selectedItem.id);
        const prevIdx = (currIdx - 1 + filteredItems.length) % filteredItems.length;
        setSelectedItem(filteredItems[prevIdx]);
      } else if (!selectedItem && e.key.toLowerCase() === 'w') {
        handleWander();
      } else if (!selectedItem && e.key.toLowerCase() === 'c') {
        handleRecenter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, filteredItems]);

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#faf9f6] select-none touch-none"
      style={{ cursor: viewMode === 'cosmos' ? (isDraggingRef.current ? 'grabbing' : 'grab') : 'default' }}
      data-cursor={viewMode === 'cosmos' ? 'grab' : undefined}
    >
      {/* Dynamic Synchronous Dotted Grid (Pans & Zooms in Real-time) */}
      <div
        className="fixed inset-0 pointer-events-none will-change-transform opacity-70"
        style={{
          backgroundImage: 'radial-gradient(#c8c5bc 1.1px, transparent 1.1px)',
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
        }}
      />

      {/* Subtle Spatial Coordinate Crosshairs at Center (0, 0) */}
      <div
        className="absolute pointer-events-none transition-transform duration-100 ease-out"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
        }}
      >
        <div className="relative -top-3 -left-3 w-6 h-6 flex items-center justify-center opacity-30 text-neutral-500 font-mono text-[10px]">
          <span className="absolute w-full h-[1px] bg-black/40" />
          <span className="absolute h-full w-[1px] bg-black/40" />
          <span className="absolute -top-4 font-bold text-[8px] tracking-widest uppercase">ORIGIN (0,0)</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODE 1: 2.5D SPATIAL COSMOS STAGE (OMRI MALKA STYLE)               */}
      {/* ================================================================= */}
      {viewMode === 'cosmos' && (
        <div
          className="w-full h-full relative flex items-center justify-center pointer-events-none"
          style={{ perspective: '1600px' }}
        >
          {/* Spatial World Plane */}
          <div
            className="absolute top-1/2 left-1/2 will-change-transform transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transformOrigin: '50% 50%',
              transformStyle: 'preserve-3d',
            }}
          >
            {allItems.map((item, idx) => {
              const isFilteredOut = activeFilter !== 'all' && item.category !== activeFilter;
              const isHovered = hoveredItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem((curr) => (curr?.id === item.id ? null : curr))}
                  onClick={() => {
                    if (hasMovedRef.current) return;
                    setSelectedItem(item);
                  }}
                  data-cursor="view"
                  data-cursor-text="INSPECT ↗"
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    transform: `translate(-50%, -50%) rotate(${item.rot}deg) ${isHovered ? 'scale(1.05) translateZ(30px)' : 'translateZ(0px)'}`,
                    transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, filter 0.4s ease',
                    opacity: isFilteredOut ? 0.12 : 1.0,
                    filter: isFilteredOut ? 'grayscale(80%) blur(1.5px)' : 'none',
                    zIndex: isHovered ? 60 : 10 + (idx % 10),
                  }}
                  className="absolute pointer-events-auto cursor-pointer select-none group touch-manipulation"
                >
                  {/* Card Shell */}
                  <div
                    className={`relative rounded-[20px] overflow-hidden bg-white/95 backdrop-blur-md border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.08)] group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition-shadow duration-500 ${
                      item.aspect === '9:16'
                        ? 'w-[230px] sm:w-[260px]'
                        : item.aspect === '4:5'
                        ? 'w-[250px] sm:w-[280px]'
                        : item.aspect === '1:1'
                        ? 'w-[260px] sm:w-[290px]'
                        : 'w-[320px] sm:w-[380px]'
                    }`}
                  >
                    {/* Media Container */}
                    <div
                      className={`relative bg-neutral-950 overflow-hidden ${
                        item.aspect === '9:16'
                          ? 'aspect-[9/16]'
                          : item.aspect === '4:5'
                          ? 'aspect-[4/5]'
                          : item.aspect === '1:1'
                          ? 'aspect-square'
                          : 'aspect-[16/9]'
                      }`}
                    >
                      {item.mediaType === 'video' ? (
                        <video
                          src={item.mediaUrl}
                          poster={item.thumbnailUrl}
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl || item.mediaUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}

                      {/* Aspect & Technical Pill Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/10 tracking-widest uppercase">
                          {item.code}
                        </span>
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/10 tracking-wider">
                          {item.aspect}
                        </span>
                      </div>

                      {/* Video Play Overlay Indicator */}
                      {item.mediaType === 'video' && (
                        <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="w-7 h-7 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center text-[10px] font-bold border border-white/10">
                            ▶
                          </span>
                        </div>
                      )}

                      {/* Gradient Vignette on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    {/* Bottom Metadata Bar */}
                    <div className="p-3.5 space-y-1 bg-white">
                      <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                        <span className="text-[#e60000] font-bold uppercase tracking-wider">
                          {item.role || item.category}
                        </span>
                        <span>{item.year}</span>
                      </div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-black uppercase tracking-tight line-clamp-1 group-hover:text-[#e60000] transition-colors">
                        {item.title}
                      </h4>
                      <p className="font-mono text-[10px] text-neutral-500 line-clamp-1">
                        {item.tags.join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 2: SWISS EDITORIAL GRID (HAMZA TARIQ / NICOLA ROMEI STYLE)     */}
      {/* ================================================================= */}
      {viewMode === 'grid' && (
        <div className="w-full h-full overflow-y-auto px-4 sm:px-8 md:px-14 pt-28 pb-36 max-w-7xl mx-auto animate-fadeIn select-text touch-auto">
          {/* Header Banner */}
          <div className="pb-8 mb-8 border-b border-black/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#e60000] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#e60000] animate-ping shrink-0" />
                <span>INDEXED CATALOGUE // EDITORIAL SPECIFICATION</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-black uppercase tracking-tight">
                LABORATORY ARCHIVE
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {filteredItems.length} OF {allItems.length} EXPERIMENTAL ASSETS
            </span>
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                onMouseEnter={() => setHoveredItem(item)}
                className="group relative rounded-[20px] bg-white border border-black/[0.08] hover:border-black/25 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                <div
                  className={`relative bg-neutral-950 overflow-hidden ${
                    item.aspect === '9:16'
                      ? 'aspect-[9/16]'
                      : item.aspect === '4:5'
                      ? 'aspect-[4/5]'
                      : item.aspect === '1:1'
                      ? 'aspect-square'
                      : 'aspect-[16/9]'
                  }`}
                >
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.mediaUrl}
                      poster={item.thumbnailUrl}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-3 right-3 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-black/75 text-white backdrop-blur-md">
                    {item.aspect}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                    <span className="text-[#e60000] font-bold uppercase">{item.category}</span>
                    <span>{item.year}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-black uppercase tracking-tight line-clamp-1 group-hover:text-[#e60000] transition-colors">
                    {item.title}
                  </h4>
                  <p className="font-mono text-[11px] text-neutral-500 line-clamp-1">
                    {item.tags.join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* FLOATING TACTICAL HUD READOUT BOX (OMRI MALKA #readout)            */}
      {/* ================================================================= */}
      <div className="fixed bottom-6 left-6 z-40 pointer-events-none hidden md:block">
        <div className="pointer-events-auto w-[330px] rounded-[18px] bg-white/92 backdrop-blur-xl border border-black/10 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] space-y-2.5 transition-all duration-300">
          {/* Header Status Beacon */}
          <div className="flex items-center justify-between font-mono text-[10px] border-b border-black/[0.08] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-black uppercase tracking-widest">
                {hoveredItem ? 'INSPECTING ASSET' : 'SYSTEM // ACTIVE'}
              </span>
            </div>
            <span className="text-neutral-500 tracking-wider">
              {viewMode === 'cosmos' ? `X:${pan.x} Y:${pan.y} Z:${zoom}x` : 'GRID VIEW'}
            </span>
          </div>

          {/* Dynamic Content */}
          {hoveredItem ? (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                <span className="font-bold text-[#e60000] uppercase tracking-wider">{hoveredItem.code}</span>
                <span>{hoveredItem.fps} • {hoveredItem.aspect}</span>
              </div>
              <h5 className="font-display font-black text-sm text-black uppercase leading-tight line-clamp-1">
                {hoveredItem.title}
              </h5>
              <p className="font-mono text-[10.5px] text-neutral-600 line-clamp-2 leading-relaxed">
                {hoveredItem.desc}
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wide">
                  {hoveredItem.tags.slice(0, 2).join(' • ')}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItem(hoveredItem)}
                  className="font-mono text-[10px] font-bold text-[#e60000] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>EXPAND ↗</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-neutral-500 font-mono text-[10px]">
              <p className="leading-relaxed">
                {viewMode === 'cosmos'
                  ? 'Drag stage to pan • Wheel to zoom • Hover or click asset to preview.'
                  : 'Select an asset below to launch cinematic laboratory inspection.'}
              </p>
              <div className="pt-1 flex items-center justify-between text-neutral-400 border-t border-black/[0.05]">
                <span>TOTAL: {allItems.length}</span>
                <span>REELS: {reelsCount}</span>
                <span>FILMS: {filmsCount}</span>
                <span>STILLS: {stillsCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* FLOATING FILTER DIAL DOCK & CONTROLS (#filter-dial)                */}
      {/* ================================================================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-[94vw]">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-2xl border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] font-mono text-[11px] font-bold overflow-x-auto no-scrollbar">
          {/* Filter Pills */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-black/5'
            }`}
          >
            ALL ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('reels')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'reels'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-black/5'
            }`}
          >
            <span>📱</span>
            <span>REELS ({reelsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('films')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'films'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-black/5'
            }`}
          >
            <span>🎬</span>
            <span>FILMS ({filmsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('stills')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'stills'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-black/5'
            }`}
          >
            <span>📷</span>
            <span>STILLS ({stillsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('kinetic')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'kinetic'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-black/5'
            }`}
          >
            <span>⚡</span>
            <span>3D ({kineticCount})</span>
          </button>

          <span className="w-[1px] h-4 bg-black/15 mx-1 shrink-0" />

          {/* Signature Omri Malka "⚡ WANDER" Button */}
          {viewMode === 'cosmos' && (
            <button
              type="button"
              onClick={handleWander}
              disabled={isWandering}
              className="px-3.5 py-1.5 rounded-full bg-[#e60000] text-white hover:bg-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
              title="Smooth auto-camera glide to a random visual work (Hotkey: W)"
            >
              <span className={isWandering ? 'animate-spin' : ''}>⚡</span>
              <span>WANDER</span>
            </button>
          )}

          {/* Recenter Button */}
          {viewMode === 'cosmos' && (
            <button
              type="button"
              onClick={handleRecenter}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black hover:text-white text-neutral-700 transition-colors flex items-center justify-center text-xs cursor-pointer shrink-0"
              title="Recenter camera to Origin (Hotkey: C)"
            >
              ⌖
            </button>
          )}

          {/* View Mode Switcher (Cosmos ⇄ Grid) */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'cosmos' ? 'grid' : 'cosmos'))}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
            title="Toggle between 2.5D Cosmos and Swiss Editorial Grid"
          >
            <span>{viewMode === 'cosmos' ? '⊞' : '✦'}</span>
            <span className="hidden sm:inline">{viewMode === 'cosmos' ? 'GRID' : 'COSMOS'}</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CINEMATIC LIGHTBOX INSPECTION MODAL                               */}
      {/* ================================================================= */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[94vh] bg-[#111112] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col"
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between text-white font-mono text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#e60000] uppercase tracking-wider">
                  {selectedItem.code}
                </span>
                <span className="text-white/30">•</span>
                <span className="font-bold font-sans text-sm text-white line-clamp-1">{selectedItem.title}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-white/50 hidden sm:inline">{selectedItem.year}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalMuted((m) => !m)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] tracking-wider transition-colors cursor-pointer"
                >
                  {isModalMuted ? 'UNMUTE 🔇' : 'SOUND ON 🔊'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  title="Close [ESC]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Media Display */}
            <div className="relative flex-1 min-h-[50vh] max-h-[68vh] bg-black flex items-center justify-center overflow-hidden p-4">
              {selectedItem.mediaType === 'video' ? (
                <video
                  src={selectedItem.mediaUrl}
                  poster={selectedItem.thumbnailUrl}
                  controls
                  autoPlay
                  loop
                  muted={isModalMuted}
                  playsInline
                  className="max-h-[62vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="max-h-[62vh] w-auto max-w-full rounded-xl object-contain shadow-2xl select-none"
                />
              )}

              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={() => {
                  const currIdx = filteredItems.findIndex((i) => i.id === selectedItem.id);
                  const prevIdx = (currIdx - 1 + filteredItems.length) % filteredItems.length;
                  setSelectedItem(filteredItems[prevIdx]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center font-mono text-sm border border-white/15 cursor-pointer"
                title="Previous (Left Arrow)"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  const currIdx = filteredItems.findIndex((i) => i.id === selectedItem.id);
                  const nextIdx = (currIdx + 1) % filteredItems.length;
                  setSelectedItem(filteredItems[nextIdx]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center font-mono text-sm border border-white/15 cursor-pointer"
                title="Next (Right Arrow)"
              >
                →
              </button>
            </div>

            {/* Modal Bottom Technical Specs Drawer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white font-mono text-xs shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white uppercase">{selectedItem.role}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/60">{selectedItem.desc}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedItem.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-neutral-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right font-mono text-[10px] text-white/50 hidden md:block">
                  <div>FORMAT: {selectedItem.aspect} ({selectedItem.resolution})</div>
                  <div>CADENCE: {selectedItem.fps}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:bg-[#e60000] hover:text-white transition-colors cursor-pointer text-xs"
                >
                  CLOSE [ESC]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
