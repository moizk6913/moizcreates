'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { WorkItem } from '@/lib/contentStore';

export interface PlaygroundTile {
  id: string;
  code: string;
  title: string;
  category: 'reels' | 'films' | 'stills' | 'kinetic';
  aspect: '9:16' | '16:9' | '4:5' | '1:1';
  colSpan?: string;
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
}

// Curated dense directorial showcase mosaic (24 living media tiles)
export const SEED_PLAYGROUND_TILES: PlaygroundTile[] = [
  {
    id: 'tile-01',
    code: 'LAB // 01.REEL',
    title: 'KINETIC CHROME & SUB-BASS TRANSIENTS',
    category: 'reels',
    aspect: '9:16',
    colSpan: 'col-span-1',
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
  },
  {
    id: 'tile-02',
    code: 'LAB // 02.FILM',
    title: 'ANALOGUE 35MM NOCTURNAL SPEED',
    category: 'films',
    aspect: '16:9',
    colSpan: 'col-span-2',
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
  },
  {
    id: 'tile-03',
    code: 'LAB // 03.STILL',
    title: 'HAUTE COUTURE EDITORIAL SILHOUETTE',
    category: 'stills',
    aspect: '4:5',
    colSpan: 'col-span-1',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'LOOKBOOK LAB',
    role: 'Art Director',
    fps: 'STILL',
    resolution: 'MEDIUM FORMAT',
    tags: ['Fashion Editorial', 'Hasselblad Stills', 'Subtle Grain'],
    desc: 'Sculptural model staging with hard rim lighting and tactile fabric texture. Curated lookbook spread for high-fashion editorial.',
  },
  {
    id: 'tile-04',
    code: 'LAB // 04.KINETIC',
    title: 'DISTORTED BRUTALIST MONOLITH 3D',
    category: 'kinetic',
    aspect: '1:1',
    colSpan: 'col-span-1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-04.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'KINETIC LAB',
    role: '3D Motion Artist',
    fps: '60 FPS',
    resolution: '2160x2160',
    tags: ['Procedural Shaders', 'Brutalist Monolith', 'Raytracing'],
    desc: 'Procedural metal extrusion deformed by auditory pulse signals. Dark monolithic aesthetic exploring heavy brutalist surfaces.',
  },
  {
    id: 'tile-05',
    code: 'LAB // 05.REEL',
    title: 'HYPER-PACE EDITORIAL RHYTHM',
    category: 'reels',
    aspect: '9:16',
    colSpan: 'col-span-1',
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
  },
  {
    id: 'tile-06',
    code: 'LAB // 06.FILM',
    title: 'SWISS ARCHITECTURAL CONCRETE STUDY',
    category: 'films',
    aspect: '16:9',
    colSpan: 'col-span-2',
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
  },
  {
    id: 'tile-07',
    code: 'LAB // 07.STILL',
    title: 'MINIMAL GEOMETRIC CONTRAST',
    category: 'stills',
    aspect: '4:5',
    colSpan: 'col-span-1',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'MONO LAB',
    role: 'Photographer',
    fps: 'STILL',
    resolution: 'HIGH-RES 8K',
    tags: ['Monochrome', 'Geometric Contrast', 'Negative Space'],
    desc: 'High-contrast black-and-white architectural geometry. Pure Swiss neo-modernist framing with extreme vertical tension.',
  },
  {
    id: 'tile-08',
    code: 'LAB // 08.REEL',
    title: 'TOKYO KINETIC STREETSCAPE',
    category: 'reels',
    aspect: '9:16',
    colSpan: 'col-span-1',
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
  },
  {
    id: 'tile-09',
    code: 'LAB // 09.KINETIC',
    title: 'SWISS TYPOGRAPHIC GRID MATRIX',
    category: 'kinetic',
    aspect: '1:1',
    colSpan: 'col-span-1',
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
  },
  {
    id: 'tile-10',
    code: 'LAB // 10.FILM',
    title: 'DESERT MIRAGE 65MM PANORAMA',
    category: 'films',
    aspect: '16:9',
    colSpan: 'col-span-2',
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
  },
  {
    id: 'tile-11',
    code: 'LAB // 11.REEL',
    title: 'STUDIO LIGHTING CHOREOGRAPHY',
    category: 'reels',
    aspect: '9:16',
    colSpan: 'col-span-1',
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
  },
  {
    id: 'tile-12',
    code: 'LAB // 12.STILL',
    title: 'VISCOUS MERCURY LIQUID REFLECTION',
    category: 'stills',
    aspect: '4:5',
    colSpan: 'col-span-1',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'CGI LAB',
    role: 'Look Development',
    fps: 'STILL',
    resolution: '6000x8000',
    tags: ['Liquid Mercury', 'Reflective Surface', 'Studio Strobe'],
    desc: 'Distorted reflection on viscous chrome surface. High-contrast specular highlights rendered with photographic precision.',
  },
  {
    id: 'tile-13',
    code: 'LAB // 13.REEL',
    title: 'VERTICAL LUXURY FASHION CUT',
    category: 'reels',
    aspect: '9:16',
    colSpan: 'col-span-1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-03.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'FASHION LAB',
    role: 'Commercial Director',
    fps: '60 FPS',
    resolution: '9:16 PRORES',
    tags: ['Haute Couture', 'Color Grading', 'Speed Ramps'],
    desc: 'High-energy fashion editorial featuring accelerated speed ramps and saturated warm tones.',
  },
  {
    id: 'tile-14',
    code: 'LAB // 14.FILM',
    title: 'NOCTURNAL TOKYO ARCHITECTURE',
    category: 'films',
    aspect: '16:9',
    colSpan: 'col-span-2',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-02.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'CITY LAB',
    role: 'Director',
    fps: '24 FPS',
    resolution: '4K CINEMA',
    tags: ['Metropolis', 'Ginza Strobe', 'Midnight Anamorphic'],
    desc: 'Dense vertical skyscraper architecture contrasting against nocturnal fog and street reflections.',
  },
  {
    id: 'tile-15',
    code: 'LAB // 15.STILL',
    title: 'WARM ANALOGUE PORTRAIT 35MM',
    category: 'stills',
    aspect: '4:5',
    colSpan: 'col-span-1',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'PORTRAIT LAB',
    role: 'Photographer',
    fps: 'STILL',
    resolution: '35MM GRAIN',
    tags: ['Film Grain', 'Portra 400', 'Natural Window'],
    desc: 'Natural window lighting on Kodak Portra 400 emulation. Organic skin tones and delicate optical softness.',
  },
  {
    id: 'tile-16',
    code: 'LAB // 16.KINETIC',
    title: 'ABSTRACT OPTICAL REFRACTION',
    category: 'kinetic',
    aspect: '1:1',
    colSpan: 'col-span-1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-04.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'OPTICS LAB',
    role: '3D Artist',
    fps: '60 FPS',
    resolution: '2048x2048',
    tags: ['Caustics', 'Prism Refraction', 'Spectral Waves'],
    desc: 'Simulated prismatic caustics and glass refraction reacting to procedural turbulence fields.',
  },
  {
    id: 'tile-17',
    code: 'LAB // 17.REEL',
    title: 'TACTILE PRODUCT MACRO REVEAL',
    category: 'reels',
    aspect: '9:16',
    colSpan: 'col-span-1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-05.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'COMMERCIAL LAB',
    role: 'Macro Director',
    fps: '120 FPS',
    resolution: '9:16 4K',
    tags: ['Probe Lens', 'Macro Textures', 'Product Teaser'],
    desc: 'Ultra-close probe lens tracking through intricate mechanical details and brushed metal finishes.',
  },
  {
    id: 'tile-18',
    code: 'LAB // 18.FILM',
    title: 'COASTAL BRUTALISM & TIDES',
    category: 'films',
    aspect: '16:9',
    colSpan: 'col-span-2',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-06.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'NATURE LAB',
    role: 'Director',
    fps: '24 FPS',
    resolution: '4K DCI',
    tags: ['Coastal Waves', 'Monolithic Seawall', 'Ambient Sound'],
    desc: 'Massive weathered concrete seawalls enduring North Sea tidal surges. Somber monolithic pacing.',
  },
];

interface PlaygroundCosmosProps {
  uploadedWorks?: WorkItem[];
}

export default function PlaygroundCosmos({ uploadedWorks = [] }: PlaygroundCosmosProps) {
  // 1. Merge uploaded standalone works seamlessly with the curated dense mosaic
  const allTiles = useMemo<PlaygroundTile[]>(() => {
    const userTiles: PlaygroundTile[] = uploadedWorks.map((work, idx) => {
      const isVideo = work.mediaType === 'video';
      const aspect = (work.dimensions?.aspectRatio || '16:9') as any;
      let cat: 'reels' | 'films' | 'stills' | 'kinetic' = 'stills';
      if (aspect === '9:16' || work.workType?.toLowerCase().includes('reel')) cat = 'reels';
      else if (isVideo) cat = 'films';
      else if (work.workType?.toLowerCase().includes('motion') || work.workType?.toLowerCase().includes('3d')) cat = 'kinetic';
      else cat = 'stills';

      return {
        id: work.id,
        code: `WORK // ${String(idx + 1).padStart(2, '0')}.${cat.toUpperCase().slice(0, 4)}`,
        title: work.title,
        category: cat,
        aspect: aspect === '9:16' || aspect === '4:5' || aspect === '1:1' ? aspect : '16:9',
        colSpan: aspect === '16:9' ? 'col-span-2' : 'col-span-1',
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
      };
    });

    if (userTiles.length === 0) {
      return SEED_PLAYGROUND_TILES;
    }

    return [...userTiles, ...SEED_PLAYGROUND_TILES];
  }, [uploadedWorks]);

  // Filters & State
  const [activeFilter, setActiveFilter] = useState<'all' | 'reels' | 'films' | 'stills' | 'kinetic'>('all');
  const [hoveredTile, setHoveredTile] = useState<PlaygroundTile | null>(null);
  const [selectedTile, setSelectedTile] = useState<PlaygroundTile | null>(null);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(true);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // 2.5D Infinite Stage Pan & Zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(0.92);

  // Gesture Tracking References
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Physics loop cancellation
  const stopInertia = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Momentum Inertia Decay
  const startInertia = useCallback(() => {
    stopInertia();
    const friction = 0.93;
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
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 8) {
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

  // Mouse Wheel Zoom & Pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    stopInertia();

    if (e.ctrlKey || Math.abs(e.deltaY) > 40) {
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.0012;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(0.4, prevZoom + zoomFactor), 1.6);
        return parseFloat(nextZoom.toFixed(3));
      });
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.9,
        y: prev.y - e.deltaY * 0.9,
      }));
    }
  }, [stopInertia]);

  // Recenter Camera
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
      setZoom(parseFloat((startZoom + (0.92 - startZoom) * progress).toFixed(3)));

      if (frame < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // Shuffle / Wander Auto-Glide (Directly like Omri Malka shuffle button!)
  const handleShuffle = () => {
    if (allTiles.length === 0) return;
    stopInertia();
    setIsShuffling(true);

    const randomIndex = Math.floor(Math.random() * allTiles.length);
    const targetTile = allTiles[randomIndex];

    // Compute coordinate target to pan near target
    const cols = 5;
    const colIdx = randomIndex % cols;
    const rowIdx = Math.floor(randomIndex / cols);
    const targetX = Math.round((2 - colIdx) * 380 * zoom);
    const targetY = Math.round((2 - rowIdx) * 340 * zoom);

    const startX = pan.x;
    const startY = pan.y;
    let frame = 0;
    const duration = 45;
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
        setHoveredTile(targetTile);
        setIsShuffling(false);
      }
    };
    requestAnimationFrame(step);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTile(null);
      } else if (selectedTile && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
        const currIdx = allTiles.findIndex((i) => i.id === selectedTile.id);
        setSelectedTile(allTiles[(currIdx + 1) % allTiles.length]);
      } else if (selectedTile && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
        const currIdx = allTiles.findIndex((i) => i.id === selectedTile.id);
        setSelectedTile(allTiles[(currIdx - 1 + allTiles.length) % allTiles.length]);
      } else if (!selectedTile && e.key.toLowerCase() === 's') {
        handleShuffle();
      } else if (!selectedTile && e.key.toLowerCase() === 'c') {
        handleRecenter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTile, allTiles]);

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a0c] select-none touch-none"
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      data-cursor="grab"
    >
      {/* Dynamic Dark Ambient Lighting Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(30,30,35,0.3)_0%,rgba(10,10,12,0.95)_100%)] z-10" />

      {/* ================================================================= */}
      {/* 2.5D DENSE VISUAL WALL (OMRI MALKA STYLE)                         */}
      {/* ================================================================= */}
      <div
        className="w-full h-full relative flex items-center justify-center pointer-events-none"
        style={{ perspective: '1400px' }}
      >
        <div
          ref={worldRef}
          className="absolute will-change-transform transition-transform duration-75 ease-out flex items-center justify-center pointer-events-auto"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Dense Packed Mosaic Grid Wall (Tile-to-Tile Visual Density) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 w-[2200px] sm:w-[2600px] md:w-[3000px] lg:w-[3400px] p-8">
            {allTiles.map((tile, idx) => {
              const isFilteredOut = activeFilter !== 'all' && tile.category !== activeFilter;
              const isHovered = hoveredTile?.id === tile.id;
              const hasHoveredSibling = hoveredTile !== null && !isHovered;

              return (
                <div
                  key={tile.id}
                  onMouseEnter={() => setHoveredTile(tile)}
                  onMouseLeave={() => setHoveredTile((curr) => (curr?.id === tile.id ? null : curr))}
                  onClick={() => {
                    if (hasMovedRef.current) return;
                    setSelectedTile(tile);
                  }}
                  data-cursor="view"
                  data-cursor-text="INSPECT ↗"
                  style={{
                    transform: isHovered ? 'scale(1.08) translateZ(40px)' : 'scale(1) translateZ(0px)',
                    transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.3s ease',
                    opacity: isFilteredOut ? 0.12 : hasHoveredSibling ? 0.42 : 1.0,
                    filter: isFilteredOut ? 'grayscale(90%) blur(2px)' : hasHoveredSibling ? 'brightness(0.75)' : 'none',
                    zIndex: isHovered ? 50 : 10,
                  }}
                  className={`relative rounded-[16px] overflow-hidden bg-[#16161a] border border-white/[0.08] hover:border-white/40 cursor-pointer select-none group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.9)] ${
                    tile.aspect === '9:16'
                      ? 'aspect-[9/16]'
                      : tile.aspect === '16:9'
                      ? 'col-span-2 aspect-[16/9]'
                      : tile.aspect === '4:5'
                      ? 'aspect-[4/5]'
                      : 'aspect-square'
                  }`}
                >
                  {/* Media (Pure Visual, No White Card Border) */}
                  {tile.mediaType === 'video' ? (
                    <video
                      src={tile.mediaUrl}
                      poster={tile.thumbnailUrl}
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
                      src={tile.thumbnailUrl || tile.mediaUrl}
                      alt={tile.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  {/* Corner Aspect Badge (Subtle Dark Pill) */}
                  <span className="absolute top-2.5 right-2.5 font-mono text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 border border-white/10 tracking-widest uppercase pointer-events-none">
                    {tile.aspect}
                  </span>

                  {/* Video Play Marker */}
                  {tile.mediaType === 'video' && (
                    <span className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white/90 flex items-center justify-center text-[8px] font-bold border border-white/10 pointer-events-none">
                      ▶
                    </span>
                  )}

                  {/* Hover Spotlight Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-3.5">
                    <span className="font-mono text-[9px] text-[#e60000] font-bold uppercase tracking-wider">
                      {tile.code}
                    </span>
                    <h5 className="font-display font-bold text-xs sm:text-sm text-white uppercase line-clamp-1 leading-tight">
                      {tile.title}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TOP FLOATING MINIMALIST FILTER BAR (OMRI MALKA STYLE)             */}
      {/* ================================================================= */}
      <div className="fixed top-20 sm:top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-black/75 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)] font-mono text-[11px] font-bold text-white">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('reels')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'reels'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            REELS (9:16)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('films')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'films'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            FILMS (16:9)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('stills')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'stills'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            STILLS (4:5)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('kinetic')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'kinetic'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            3D / KINETIC
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* RIGHT FLOATING SHUFFLE BUTTON (EXACT OMRI MALKA REVENUE FEATURE)  */}
      {/* ================================================================= */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <button
          type="button"
          onClick={handleShuffle}
          disabled={isShuffling}
          className="pointer-events-auto group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-black/75 hover:bg-[#e60000] text-white backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)] font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50"
          title="Glide camera to a random piece across the visual wall (Hotkey: S)"
        >
          <span className={`text-base transition-transform duration-500 ${isShuffling ? 'rotate-180 scale-125' : 'group-hover:rotate-45'}`}>
            🔀
          </span>
          <span className="writing-vertical text-[9px] tracking-widest">SHUFFLE</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* BOTTOM-LEFT EDITORIAL HUD READOUT (OMRI MALKA STYLE)              */}
      {/* ================================================================= */}
      <div className="fixed bottom-6 left-6 z-40 pointer-events-none max-w-sm">
        <div className="pointer-events-auto p-4 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-white space-y-1.5">
          {hoveredTile ? (
            <div className="space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                <span className="font-bold text-[#e60000] tracking-wider">{hoveredTile.code}</span>
                <span>{hoveredTile.aspect} • {hoveredTile.fps}</span>
              </div>
              <h4 className="font-display font-black text-base text-white uppercase leading-tight line-clamp-1">
                {hoveredTile.title}
              </h4>
              <p className="font-mono text-[10.5px] text-neutral-400 line-clamp-1">
                {hoveredTile.role} • {hoveredTile.tags.join(' • ')}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-500">{hoveredTile.year}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTile(hoveredTile)}
                  className="font-bold text-[#e60000] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>INSPECT ↗</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-[10px] text-neutral-400">
              <div className="flex items-center gap-2 text-white font-bold tracking-widest text-[10.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e60000] animate-pulse" />
                <span>VISUAL COSMOS // PLAYGROUND</span>
              </div>
              <p className="text-neutral-500 text-[10px] leading-relaxed">
                Drag to explore panoramic wall • Scroll to zoom • Hover or click to inspect.
              </p>
              <div className="pt-1 flex items-center justify-between text-neutral-500 border-t border-white/10 text-[9.5px]">
                <span>{allTiles.length} ASSETS</span>
                <span>PAN [X:{pan.x} Y:{pan.y}]</span>
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="text-white hover:text-[#e60000] underline cursor-pointer"
                >
                  CENTER (0,0)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* CINEMATIC LIGHTBOX INSPECTION MODAL                               */}
      {/* ================================================================= */}
      {selectedTile && (
        <div
          onClick={() => setSelectedTile(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[94vh] bg-[#111114] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Top Bar */}
            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-white font-mono text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#e60000] uppercase tracking-wider">
                  {selectedTile.code}
                </span>
                <span className="text-white/25">•</span>
                <span className="font-bold font-sans text-sm text-white line-clamp-1">{selectedTile.title}</span>
                <span className="text-white/25 hidden sm:inline">•</span>
                <span className="text-white/40 hidden sm:inline">{selectedTile.year}</span>
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
                  onClick={() => setSelectedTile(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  title="Close [ESC]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Media Player */}
            <div className="relative flex-1 min-h-[50vh] max-h-[68vh] bg-black flex items-center justify-center overflow-hidden p-4">
              {selectedTile.mediaType === 'video' ? (
                <video
                  src={selectedTile.mediaUrl}
                  poster={selectedTile.thumbnailUrl}
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
                  src={selectedTile.mediaUrl}
                  alt={selectedTile.title}
                  className="max-h-[62vh] w-auto max-w-full rounded-xl object-contain shadow-2xl select-none"
                />
              )}

              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={() => {
                  const currIdx = allTiles.findIndex((i) => i.id === selectedTile.id);
                  setSelectedTile(allTiles[(currIdx - 1 + allTiles.length) % allTiles.length]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center font-mono text-sm border border-white/15 cursor-pointer"
                title="Previous (Left Arrow)"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  const currIdx = allTiles.findIndex((i) => i.id === selectedTile.id);
                  setSelectedTile(allTiles[(currIdx + 1) % allTiles.length]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center font-mono text-sm border border-white/15 cursor-pointer"
                title="Next (Right Arrow)"
              >
                →
              </button>
            </div>

            {/* Bottom Drawer */}
            <div className="px-6 py-4 bg-white/[0.03] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white font-mono text-xs shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white uppercase">{selectedTile.role}</span>
                  <span className="text-white/25">•</span>
                  <span className="text-white/60">{selectedTile.desc}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedTile.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-neutral-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right font-mono text-[10px] text-white/50 hidden md:block">
                  <div>FORMAT: {selectedTile.aspect} ({selectedTile.resolution})</div>
                  <div>CADENCE: {selectedTile.fps}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTile(null)}
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
