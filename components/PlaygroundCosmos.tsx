'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { WorkItem } from '@/lib/contentStore';

export interface PlaygroundTile {
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
  width: number;
  height: number;
  x: number;
  y: number;
}

// Master grid layout for 1 seamless block (2800px wide x 2100px high)
// Designed like Hamza Tariq / modern editorial portfolios with rhythmically mixed aspect ratios
export const BASE_TILES_LAYOUT: Omit<PlaygroundTile, 'id' | 'code'>[] = [
  // ROW 1
  {
    title: 'KINETIC CHROME & SOUND TRANSIENTS',
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
    tags: ['Kinetic Typography', 'Chrome 3D', 'Sound Design'],
    desc: 'High-frequency kinetic typography synced to sub-bass transients for 9:16 vertical commercial reveal.',
    x: 60,
    y: 60,
    width: 360,
    height: 640,
  },
  {
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
    desc: 'Sodium-vapor streetlighting emulation on vintage anamorphic glass. Low-key handheld reflections.',
    x: 460,
    y: 60,
    width: 680,
    height: 382,
  },
  {
    title: 'HAUTE COUTURE EDITORIAL SILHOUETTE',
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
    desc: 'Sculptural model staging with hard rim lighting and tactile fabric texture.',
    x: 1180,
    y: 60,
    width: 380,
    height: 475,
  },
  {
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
    desc: 'Procedural metal extrusion deformed by auditory pulse signals.',
    x: 1600,
    y: 60,
    width: 420,
    height: 420,
  },
  {
    title: 'SWISS TYPOGRAPHIC GRID MATRIX',
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
    desc: 'Dynamic variable font weight oscillations reacting to frequency waveforms.',
    x: 2060,
    y: 60,
    width: 440,
    height: 440,
  },

  // ROW 2
  {
    title: 'SWISS ARCHITECTURAL CONCRETE STUDY',
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
    desc: 'Monumental raw concrete facades under overcast European lighting. Linear geometric stillness.',
    x: 460,
    y: 470,
    width: 680,
    height: 382,
  },
  {
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
    desc: 'Multi-frame vertical storytelling with 12fps rhythmic jump cuts tailored for luxury campaigns.',
    x: 1180,
    y: 565,
    width: 360,
    height: 640,
  },
  {
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
    desc: 'High-contrast black-and-white architectural geometry with extreme vertical tension.',
    x: 1580,
    y: 510,
    width: 440,
    height: 550,
  },
  {
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
    desc: 'Synchronized motorized lighting grid testing aggressive shadows and strobe reveals.',
    x: 2060,
    y: 530,
    width: 360,
    height: 640,
  },
  {
    title: 'METALLIC LIQUID SPECULAR STUDY',
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
    desc: 'Distorted reflection on viscous chrome surface with high-contrast specular highlights.',
    x: 60,
    y: 730,
    width: 360,
    height: 450,
  },

  // ROW 3
  {
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
    desc: 'Infinite dune ridgelines shimmering in 45-degree desert heat. Ultra-smooth camera glide.',
    x: 460,
    y: 880,
    width: 680,
    height: 382,
  },
  {
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
    desc: 'Raindrops reflecting neon signage captured at 120 frames per second.',
    x: 60,
    y: 1210,
    width: 360,
    height: 640,
  },
  {
    title: 'ABSTRACT OPTICAL REFRACTION',
    category: 'kinetic',
    aspect: '1:1',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-04.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'OPTICS LAB',
    role: '3D Artist',
    fps: '60 FPS',
    resolution: '2048x2048',
    tags: ['Caustics', 'Prism Refraction', 'Spectral Waves'],
    desc: 'Simulated prismatic caustics and glass refraction reacting to procedural turbulence.',
    x: 1580,
    y: 1090,
    width: 440,
    height: 440,
  },
  {
    title: 'NOCTURNAL TOKYO ARCHITECTURE',
    category: 'films',
    aspect: '16:9',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-02.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'CITY LAB',
    role: 'Director',
    fps: '24 FPS',
    resolution: '4K CINEMA',
    tags: ['Metropolis', 'Ginza Strobe', 'Midnight Anamorphic'],
    desc: 'Dense vertical skyscraper architecture contrasting against nocturnal fog and reflections.',
    x: 460,
    y: 1290,
    width: 680,
    height: 382,
  },
  {
    title: 'WARM ANALOGUE PORTRAIT 35MM',
    category: 'stills',
    aspect: '4:5',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'PORTRAIT LAB',
    role: 'Photographer',
    fps: 'STILL',
    resolution: '35MM GRAIN',
    tags: ['Film Grain', 'Portra 400', 'Natural Window'],
    desc: 'Natural window lighting on Kodak Portra 400 emulation with delicate optical softness.',
    x: 1180,
    y: 1235,
    width: 360,
    height: 450,
  },
  {
    title: 'VERTICAL LUXURY FASHION CUT',
    category: 'reels',
    aspect: '9:16',
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
    x: 2060,
    y: 1200,
    width: 360,
    height: 640,
  },

  // ROW 4 (Bottom filler to complete seamless wrapping block)
  {
    title: 'TACTILE PRODUCT MACRO REVEAL',
    category: 'reels',
    aspect: '9:16',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-05.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'COMMERCIAL LAB',
    role: 'Macro Director',
    fps: '120 FPS',
    resolution: '9:16 4K',
    tags: ['Probe Lens', 'Macro Textures', 'Product Teaser'],
    desc: 'Ultra-close probe lens tracking through intricate mechanical details.',
    x: 460,
    y: 1700,
    width: 320,
    height: 568,
  },
  {
    title: 'COASTAL BRUTALISM & TIDES',
    category: 'films',
    aspect: '16:9',
    mediaType: 'video',
    mediaUrl: '/assets/bts/bts-06.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    year: '2026',
    client: 'NATURE LAB',
    role: 'Director',
    fps: '24 FPS',
    resolution: '4K DCI',
    tags: ['Coastal Waves', 'Monolithic Seawall', 'Ambient Sound'],
    desc: 'Massive weathered concrete seawalls enduring North Sea tidal surges.',
    x: 820,
    y: 1700,
    width: 680,
    height: 382,
  },
  {
    title: 'SCULPTURAL MONOCHROME DRAPING',
    category: 'stills',
    aspect: '4:5',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    client: 'DRAPE LAB',
    role: 'Art Director',
    fps: 'STILL',
    resolution: 'STUDIO 8K',
    tags: ['Monochrome', 'Draping', 'Textile Sculpture'],
    desc: 'Fine wool and silk textures draped over cast plaster mannequins.',
    x: 1540,
    y: 1560,
    width: 480,
    height: 600,
  },
];

// Block dimensions for mathematical wrapping
const BLOCK_WIDTH = 2500;
const BLOCK_HEIGHT = 2200;

interface PlaygroundCosmosProps {
  uploadedWorks?: WorkItem[];
}

export default function PlaygroundCosmos({ uploadedWorks = [] }: PlaygroundCosmosProps) {
  // Merge uploaded works into the base tiles, dynamically appending any extra uploads
  const masterTiles = useMemo<PlaygroundTile[]>(() => {
    const tiles: PlaygroundTile[] = BASE_TILES_LAYOUT.map((base, idx) => {
      // If user has an uploaded work for this slot, override
      const userWork = uploadedWorks[idx];
      if (userWork) {
        const isVideo = userWork.mediaType === 'video';
        const aspect = (userWork.dimensions?.aspectRatio || base.aspect) as any;
        return {
          ...base,
          id: userWork.id,
          code: `WORK // ${String(idx + 1).padStart(2, '0')}`,
          title: userWork.title,
          category: aspect === '9:16' ? 'reels' : isVideo ? 'films' : 'stills',
          aspect,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: userWork.mediaUrl,
          thumbnailUrl: userWork.thumbnailUrl || userWork.mediaUrl,
          year: userWork.year || '2026',
          role: userWork.workType || 'Directorial Experiment',
          tags: userWork.disciplines?.length ? userWork.disciplines : base.tags,
          desc: userWork.caption || base.desc,
        };
      }

      return {
        ...base,
        id: `tile-${idx + 1}`,
        code: `EXP // ${String(idx + 1).padStart(2, '0')}`,
      };
    });

    // If user has uploaded more than BASE_TILES_LAYOUT.length, append them with sensible positions
    if (uploadedWorks.length > BASE_TILES_LAYOUT.length) {
      const extraWorks = uploadedWorks.slice(BASE_TILES_LAYOUT.length);
      extraWorks.forEach((uw, extraIdx) => {
        const isVideo = uw.mediaType === 'video';
        const aspect = (uw.dimensions?.aspectRatio || (isVideo ? '16:9' : '4:5')) as any;
        const col = extraIdx % 3;
        const row = Math.floor(extraIdx / 3);
        const w = aspect === '9:16' ? 360 : aspect === '16:9' ? 680 : aspect === '1:1' ? 420 : 400;
        const h = aspect === '9:16' ? 640 : aspect === '16:9' ? 382 : aspect === '1:1' ? 420 : 500;
        tiles.push({
          id: uw.id,
          code: `WORK // ${String(BASE_TILES_LAYOUT.length + extraIdx + 1).padStart(2, '0')}`,
          title: uw.title,
          category: aspect === '9:16' ? 'reels' : isVideo ? 'films' : 'stills',
          aspect,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: uw.mediaUrl,
          thumbnailUrl: uw.thumbnailUrl || uw.mediaUrl,
          year: uw.year || '2026',
          role: uw.workType || 'Directorial Experiment',
          tags: uw.disciplines?.length ? uw.disciplines : ['Playground', 'Lab'],
          desc: uw.caption || 'Directorial uncommissioned experiment.',
          x: 60 + col * 760,
          y: 2200 + row * 620,
          width: w,
          height: h,
        });
      });
    }

    return tiles;
  }, [uploadedWorks]);

  // Filters & Selected Modal State
  const [activeFilter, setActiveFilter] = useState<'all' | 'reels' | 'films' | 'stills'>('all');
  const [hoveredTile, setHoveredTile] = useState<PlaygroundTile | null>(null);
  const [selectedTile, setSelectedTile] = useState<PlaygroundTile | null>(null);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(true);

  // 360-Degree Continuous Coordinates (Infinite Torus)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 800, y: 700 });
  const [zoom, setZoom] = useState<number>(0.88);

  // Physics & Gestures
  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Cursor Steering Tracking (Mouse position relative to center of screen)
  const mouseSteerRef = useRef({ vx: 0, vy: 0, isHoveringTile: false });

  // Stop physics loop
  const stopPhysics = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // 360-Degree Cursor Steering & Inertia Master Animation Loop
  useEffect(() => {
    let lastTick = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      // If user is dragging with pointer, drag takes 100% control
      if (isDraggingRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      // 1. Cursor Steering (Only if not directly dragging)
      const steerVx = mouseSteerRef.current.vx;
      const steerVy = mouseSteerRef.current.vy;

      // 2. Momentum velocity decay
      velocityRef.current.vx *= 0.94;
      velocityRef.current.vy *= 0.94;

      const totalVx = steerVx + velocityRef.current.vx;
      const totalVy = steerVy + velocityRef.current.vy;

      if (Math.hypot(totalVx, totalVy) > 0.02) {
        setPan((prev) => ({
          x: prev.x + totalVx * (dt * 60),
          y: prev.y + totalVy * (dt * 60),
        }));
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Window Mouse Move for 360-Degree Steering
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;

      const cX = window.innerWidth / 2;
      const cY = window.innerHeight / 2;

      // Normalized coordinates from center: -1 to +1
      const normX = (e.clientX - cX) / cX;
      const normY = (e.clientY - cY) / cY;
      const dist = Math.hypot(normX, normY);

      // Dead zone near center so it rests comfortably
      if (dist < 0.18 || mouseSteerRef.current.isHoveringTile) {
        mouseSteerRef.current.vx = 0;
        mouseSteerRef.current.vy = 0;
        return;
      }

      // Continuous 360-degree drift vector
      // Moving cursor left moves camera left; moving up moves camera up
      const intensity = Math.min((dist - 0.18) * 3.8, 5.2);
      const angle = Math.atan2(normY, normX);

      mouseSteerRef.current.vx = Math.cos(angle) * intensity;
      mouseSteerRef.current.vy = Math.sin(angle) * intensity;
    };

    const handleMouseLeave = () => {
      mouseSteerRef.current.vx = 0;
      mouseSteerRef.current.vy = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Pointer Down (Drag Pan)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
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

  // Pointer Move (Drag Pan)
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
      vx: velocityRef.current.vx * 0.5 + instVx * 0.5 * 16,
      vy: velocityRef.current.vy * 0.5 + instVy * 0.5 * 16,
    };

    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;

    // Moving pointer left pans camera left
    setPan({
      x: panStartRef.current.x - deltaX,
      y: panStartRef.current.y - deltaY,
    });
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    setTimeout(() => {
      hasMovedRef.current = false;
    }, 120);
  };

  // Wheel Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaY) > 40) {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0012;
      setZoom((z) => {
        const next = Math.min(Math.max(0.45, z + zoomDelta), 1.5);
        return parseFloat(next.toFixed(3));
      });
    } else {
      // Two-finger trackpad drag
      setPan((prev) => ({
        x: prev.x + e.deltaX * 0.9,
        y: prev.y + e.deltaY * 0.9,
      }));
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTile(null);
      } else if (selectedTile && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
        const currIdx = masterTiles.findIndex((t) => t.id === selectedTile.id);
        setSelectedTile(masterTiles[(currIdx + 1) % masterTiles.length]);
      } else if (selectedTile && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
        const currIdx = masterTiles.findIndex((t) => t.id === selectedTile.id);
        setSelectedTile(masterTiles[(currIdx - 1 + masterTiles.length) % masterTiles.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTile, masterTiles]);

  // Mathematical Wrapping Coordinates (Torus Offset)
  const wrappedX = ((pan.x % BLOCK_WIDTH) + BLOCK_WIDTH) % BLOCK_WIDTH;
  const wrappedY = ((pan.y % BLOCK_HEIGHT) + BLOCK_HEIGHT) % BLOCK_HEIGHT;

  // 3x3 Block Grid Offsets to guarantee zero visual seam in all directions
  const blockOffsets = useMemo(() => {
    const offsets: { ox: number; oy: number; key: string }[] = [];
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        offsets.push({
          ox: col * BLOCK_WIDTH,
          oy: row * BLOCK_HEIGHT,
          key: `${col}_${row}`,
        });
      }
    }
    return offsets;
  }, []);

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#f4f3ef] select-none touch-none"
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      data-cursor="grab"
    >
      {/* Subtle Studio Lighting Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.7)_0%,rgba(240,238,232,0.95)_100%)] z-10" />

      {/* ================================================================= */}
      {/* 360-DEGREE SEAMLESS ENDLESS WRAPPING WORLD PLANE                  */}
      {/* ================================================================= */}
      <div
        className="w-full h-full relative flex items-center justify-center pointer-events-none"
        style={{ perspective: '1600px' }}
      >
        <div
          className="absolute will-change-transform pointer-events-auto"
          style={{
            transform: `translate3d(${-wrappedX}px, ${-wrappedY}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* 3x3 Continuous Torus Tiles */}
          {blockOffsets.map(({ ox, oy, key }) => (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: `${ox}px`,
                top: `${oy}px`,
                width: `${BLOCK_WIDTH}px`,
                height: `${BLOCK_HEIGHT}px`,
              }}
            >
              {masterTiles.map((tile) => {
                const isFilteredOut = activeFilter !== 'all' && tile.category !== activeFilter;
                const isHovered = hoveredTile?.id === tile.id;

                return (
                  <div
                    key={`${key}_${tile.id}`}
                    onMouseEnter={() => {
                      setHoveredTile(tile);
                      mouseSteerRef.current.isHoveringTile = true;
                    }}
                    onMouseLeave={() => {
                      setHoveredTile((curr) => (curr?.id === tile.id ? null : curr));
                      mouseSteerRef.current.isHoveringTile = false;
                    }}
                    onClick={() => {
                      if (hasMovedRef.current) return;
                      setSelectedTile(tile);
                    }}
                    data-cursor="view"
                    data-cursor-text="EXPAND ↗"
                    style={{
                      position: 'absolute',
                      left: `${tile.x}px`,
                      top: `${tile.y}px`,
                      width: `${tile.width}px`,
                      height: `${tile.height}px`,
                      transform: isHovered ? 'scale(1.04) translateZ(30px)' : 'scale(1) translateZ(0px)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.3s ease',
                      opacity: isFilteredOut ? 0.15 : 1.0,
                      filter: isFilteredOut ? 'grayscale(80%) blur(1px)' : 'none',
                      zIndex: isHovered ? 40 : 10,
                    }}
                    className="rounded-[22px] overflow-hidden bg-white border border-black/[0.07] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.14)] cursor-pointer group"
                  >
                    {/* Media Display */}
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

                    {/* Clean Aspect Badge on Hover */}
                    <span className="absolute top-3 right-3 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {tile.aspect}
                    </span>

                    {/* Subtle Luxury Hover Footer Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4 text-white">
                      <span className="font-mono text-[9px] font-bold text-[#e60000] uppercase tracking-wider">
                        {tile.role}
                      </span>
                      <h4 className="font-display font-bold text-sm uppercase leading-tight line-clamp-1">
                        {tile.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* ULTRA-CLEAN MINIMAL UI (NO CLUTTER, NO SHUFFLE, NO TELEMETRY)      */}
      {/* ================================================================= */}

      {/* Bottom Center: Minimal Clean Category Filter Pills */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] font-mono text-[11px] font-bold text-black">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('reels')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'reels' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            REELS (9:16)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('films')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'films' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            FILMS (16:9)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('stills')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'stills' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            STILLS (4:5)
          </button>
        </div>
      </div>

      {/* Bottom Right: Clean Minimal Counter Pill (Hamza Tariq Style) */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-none hidden md:block">
        <div className="pointer-events-auto px-4 py-2 rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_25px_rgba(0,0,0,0.08)] font-mono text-[11px] font-bold text-neutral-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{masterTiles.length} PIECES • 360° CANVAS</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CINEMATIC LIGHTBOX INSPECTION MODAL                               */}
      {/* ================================================================= */}
      {selectedTile && (
        <div
          onClick={() => setSelectedTile(null)}
          className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fadeIn overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[94vh] bg-[#111114] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-white font-mono text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#e60000] uppercase tracking-wider">
                  {selectedTile.aspect}
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
                  const currIdx = masterTiles.findIndex((t) => t.id === selectedTile.id);
                  setSelectedTile(masterTiles[(currIdx - 1 + masterTiles.length) % masterTiles.length]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center font-mono text-sm border border-white/15 cursor-pointer"
                title="Previous (Left Arrow)"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  const currIdx = masterTiles.findIndex((t) => t.id === selectedTile.id);
                  setSelectedTile(masterTiles[(currIdx + 1) % masterTiles.length]);
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
