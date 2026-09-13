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

// Master grid layout for 1 seamless block (2184px wide x 1764px high)
// Dense 6-column interlocking mosaic with ZERO gaps (Omri Malka style)
export const BLOCK_WIDTH = 2184;
export const BLOCK_HEIGHT = 1764;

export const BASE_TILES_LAYOUT: Omit<PlaygroundTile, 'id' | 'code'>[] = [
  {
    "title": "KINETIC CHROME & SOUND TRANSIENTS",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-01.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "DIRECTORIAL LAB",
    "role": "Motion Director",
    "fps": "60 FPS",
    "resolution": "4K PRORES",
    "tags": [
      "Kinetic Typography",
      "Chrome 3D",
      "Sound Design"
    ],
    "desc": "High-frequency kinetic typography synced to sub-bass transients for 9:16 vertical commercial reveal.",
    "x": 0,
    "y": 0,
    "width": 350,
    "height": 622
  },
  {
    "title": "HAUTE COUTURE EDITORIAL SILHOUETTE",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "LOOKBOOK LAB",
    "role": "Art Director",
    "fps": "STILL",
    "resolution": "MEDIUM FORMAT",
    "tags": [
      "Fashion Editorial",
      "Hasselblad Stills",
      "Subtle Grain"
    ],
    "desc": "Sculptural model staging with hard rim lighting and tactile fabric texture.",
    "x": 0,
    "y": 636,
    "width": 350,
    "height": 438
  },
  {
    "title": "ANALOGUE 35MM NIGHT DRIVE",
    "category": "films",
    "aspect": "16:9",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-02.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "CINEMA LAB",
    "role": "Director of Photography",
    "fps": "24 FPS",
    "resolution": "4K DCI",
    "tags": [
      "Tungsten 35mm",
      "Automotive Cinema",
      "Anamorphic Flare"
    ],
    "desc": "Sodium-vapor streetlighting emulation on vintage anamorphic glass. Low-key handheld reflections.",
    "x": 0,
    "y": 1088,
    "width": 350,
    "height": 197
  },
  {
    "title": "DISTORTED MONOLITH 3D",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-04.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "KINETIC LAB",
    "role": "3D Artist",
    "fps": "60 FPS",
    "resolution": "2160x2160",
    "tags": [
      "Procedural Shaders",
      "Brutalist Monolith",
      "Raytracing"
    ],
    "desc": "Procedural metal extrusion deformed by auditory pulse signals.",
    "x": 0,
    "y": 1299,
    "width": 350,
    "height": 451
  },
  {
    "title": "WARM ANALOGUE PORTRAIT 35MM",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "PORTRAIT LAB",
    "role": "Photographer",
    "fps": "STILL",
    "resolution": "35MM GRAIN",
    "tags": [
      "Film Grain",
      "Portra 400",
      "Natural Window"
    ],
    "desc": "Natural window lighting on Kodak Portra 400 emulation with delicate optical softness.",
    "x": 364,
    "y": 0,
    "width": 350,
    "height": 438
  },
  {
    "title": "VERTICAL LUXURY FASHION CUT",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-03.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "FASHION LAB",
    "role": "Commercial Director",
    "fps": "60 FPS",
    "resolution": "9:16 PRORES",
    "tags": [
      "Haute Couture",
      "Color Grading",
      "Speed Ramps"
    ],
    "desc": "High-energy fashion editorial featuring accelerated speed ramps and saturated warm tones.",
    "x": 364,
    "y": 452,
    "width": 350,
    "height": 622
  },
  {
    "title": "SWISS TYPOGRAPHIC GRID MATRIX",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-01.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "TYPE LAB",
    "role": "Creative Coder",
    "fps": "60 FPS",
    "resolution": "1080x1080",
    "tags": [
      "Variable Font Matrix",
      "Interactive Canvas",
      "Audio FFT"
    ],
    "desc": "Responsive typography reacting in real-time to synthetic frequency oscillations.",
    "x": 364,
    "y": 1088,
    "width": 350,
    "height": 350
  },
  {
    "title": "COASTAL BRUTALISM & TIDES",
    "category": "films",
    "aspect": "16:9",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-06.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "NATURE LAB",
    "role": "Director",
    "fps": "24 FPS",
    "resolution": "4K DCI",
    "tags": [
      "Coastal Waves",
      "Monolithic Seawall",
      "Ambient Sound"
    ],
    "desc": "Massive weathered concrete seawalls enduring North Sea tidal surges.",
    "x": 364,
    "y": 1452,
    "width": 350,
    "height": 298
  },
  {
    "title": "METALLIC LIQUID SPECULAR STUDY",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "CGI LAB",
    "role": "Look Development",
    "fps": "STILL",
    "resolution": "6000x8000",
    "tags": [
      "Liquid Mercury",
      "Reflective Surface",
      "Studio Strobe"
    ],
    "desc": "Distorted reflection on viscous chrome surface with high-contrast specular highlights.",
    "x": 728,
    "y": 0,
    "width": 350,
    "height": 350
  },
  {
    "title": "DESERT MIRAGE 65MM PANORAMA",
    "category": "films",
    "aspect": "16:9",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-08.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "DIRECTOR CUT",
    "role": "Director",
    "fps": "24 FPS",
    "resolution": "65MM EQUIVALENT",
    "tags": [
      "Dubai Dunes",
      "Golden Hour Mirage",
      "Drone Tracking"
    ],
    "desc": "Infinite dune ridgelines shimmering in 45-degree desert heat. Ultra-smooth camera glide.",
    "x": 728,
    "y": 364,
    "width": 350,
    "height": 197
  },
  {
    "title": "STUDIO LIGHTING CHOREOGRAPHY",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-07.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "LIGHTING LAB",
    "role": "Gaffer & Director",
    "fps": "60 FPS",
    "resolution": "9:16 PRORES",
    "tags": [
      "Motorized Rig",
      "Strobe Sequencing",
      "Commercial Teaser"
    ],
    "desc": "Synchronized motorized lighting grid testing aggressive shadows and strobe reveals.",
    "x": 728,
    "y": 575,
    "width": 350,
    "height": 622
  },
  {
    "title": "MINIMAL ARCHITECTURAL SILHOUETTE",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "MONO LAB",
    "role": "Photographer",
    "fps": "STILL",
    "resolution": "HIGH-RES 8K",
    "tags": [
      "Monochrome",
      "Geometric Contrast",
      "Negative Space"
    ],
    "desc": "High-contrast black-and-white architectural geometry with extreme vertical tension.",
    "x": 728,
    "y": 1211,
    "width": 350,
    "height": 539
  },
  {
    "title": "TOKYO KINETIC STREETSCAPE",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-06.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "URBAN LAB",
    "role": "Visual Director",
    "fps": "60 FPS",
    "resolution": "9:16 4K",
    "tags": [
      "Tokyo Shibuya",
      "Rain Reflections",
      "Anamorphic Flares"
    ],
    "desc": "Handheld 9:16 sprint through Shibuya crossing after a torrential monsoon downpour.",
    "x": 1092,
    "y": 0,
    "width": 350,
    "height": 622
  },
  {
    "title": "SUB-ZERO GLACIAL OPTICS",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-05.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "GLACIER LAB",
    "role": "Visual Effects",
    "fps": "60 FPS",
    "resolution": "2048x2048",
    "tags": [
      "Refraction",
      "Ice Crystals",
      "Raymarching"
    ],
    "desc": "Internal light scattering within sub-zero crystalline glacial formations.",
    "x": 1092,
    "y": 636,
    "width": 350,
    "height": 350
  },
  {
    "title": "BRUTALIST MONOCHROME COUTURE",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "FASHION HOUSE",
    "role": "Lead Director",
    "fps": "STILL",
    "resolution": "STUDIO 8K",
    "tags": [
      "High Fashion",
      "Studio Lighting",
      "Brutalism"
    ],
    "desc": "Stripped-back wardrobe staging against unpolished cast-concrete architecture.",
    "x": 1092,
    "y": 1000,
    "width": 350,
    "height": 438
  },
  {
    "title": "HIGH-ALTITUDE PEAK SHADOWS",
    "category": "films",
    "aspect": "16:9",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-02.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "SUMMIT LAB",
    "role": "Cinematographer",
    "fps": "24 FPS",
    "resolution": "4K DCI",
    "tags": [
      "Alpine Ridges",
      "Shadow Movement",
      "Time Lapse"
    ],
    "desc": "Rapid cloud shadows sweeping across jagged limestone needles in the Dolomites.",
    "x": 1092,
    "y": 1452,
    "width": 350,
    "height": 298
  },
  {
    "title": "CIRCUITRY & MICROPROCESSOR MACRO",
    "category": "films",
    "aspect": "16:9",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-04.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "TECH LAB",
    "role": "Macro Cinematographer",
    "fps": "120 FPS",
    "resolution": "4K PRORES",
    "tags": [
      "Probe Lens",
      "Silicon Wafers",
      "Industrial Macro"
    ],
    "desc": "Ultra-close probe lens glide through complex layered microchip architectures.",
    "x": 1456,
    "y": 0,
    "width": 350,
    "height": 197
  },
  {
    "title": "SCULPTURAL MONOCHROME DRAPING",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "DRAPE LAB",
    "role": "Art Director",
    "fps": "STILL",
    "resolution": "STUDIO 8K",
    "tags": [
      "Monochrome",
      "Draping",
      "Textile Sculpture"
    ],
    "desc": "Fine wool and silk textures draped over cast plaster mannequins.",
    "x": 1456,
    "y": 211,
    "width": 350,
    "height": 438
  },
  {
    "title": "TACTILE PRODUCT MACRO REVEAL",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-05.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "COMMERCIAL LAB",
    "role": "Macro Director",
    "fps": "120 FPS",
    "resolution": "9:16 4K",
    "tags": [
      "Probe Lens",
      "Macro Textures",
      "Product Teaser"
    ],
    "desc": "Ultra-close probe lens tracking through intricate mechanical watch movements.",
    "x": 1456,
    "y": 663,
    "width": 350,
    "height": 622
  },
  {
    "title": "PRISM OPTICAL REFRACTION",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "OPTIC LAB",
    "role": "Lighting Designer",
    "fps": "STILL",
    "resolution": "MEDIUM FORMAT",
    "tags": [
      "Prism Glass",
      "Spectral Rainbow",
      "Dark Studio"
    ],
    "desc": "Clean white light split into pure spectrum colors through a dense borosilicate prism.",
    "x": 1456,
    "y": 1299,
    "width": 350,
    "height": 451
  },
  {
    "title": "EDITORIAL GAZE & RIM LIGHT",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "LOOKBOOK LAB",
    "role": "Photographer",
    "fps": "STILL",
    "resolution": "8K PRORES",
    "tags": [
      "Editorial Lookbook",
      "Soft Lighting",
      "Rim Light"
    ],
    "desc": "Warm cinematic rim lighting with deep, intimate shadow gradients across facial features.",
    "x": 1820,
    "y": 0,
    "width": 350,
    "height": 438
  },
  {
    "title": "NEON VELOCITY SPEED RUN",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-07.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "MOTOR LAB",
    "role": "Action Director",
    "fps": "60 FPS",
    "resolution": "9:16 PRORES",
    "tags": [
      "Night Racing",
      "Neon Trails",
      "High Speed"
    ],
    "desc": "Vertical high-octane tracking shot through underground highway tunnels under fluorescent lights.",
    "x": 1820,
    "y": 452,
    "width": 350,
    "height": 622
  },
  {
    "title": "OCEAN TRENCH AMBIENT TONES",
    "category": "films",
    "aspect": "16:9",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-08.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "DEEP LAB",
    "role": "Director",
    "fps": "24 FPS",
    "resolution": "4K DCI",
    "tags": [
      "Submersible",
      "Ambient Deep",
      "Bioluminescence"
    ],
    "desc": "Dark ambient underwater currents with soft bioluminescent particle drift.",
    "x": 1820,
    "y": 1088,
    "width": 350,
    "height": 197
  },
  {
    "title": "CHROME SPHERE SOUND WAVE",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-03.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "SOUND LAB",
    "role": "Sound Artist",
    "fps": "60 FPS",
    "resolution": "1080x1080",
    "tags": [
      "3D Waveform",
      "Chrome Sphere",
      "Bass Transient"
    ],
    "desc": "Auditory frequency ripple traveling through a liquid mercury spherical body.",
    "x": 1820,
    "y": 1299,
    "width": 350,
    "height": 451
  }
];

interface PlaygroundCosmosProps {
  uploadedWorks?: WorkItem[];
}

export default function PlaygroundCosmos({ uploadedWorks = [] }: PlaygroundCosmosProps) {
  // Merge uploaded works into the base tiles, dynamically appending any extra uploads
  const masterTiles = useMemo<PlaygroundTile[]>(() => {
    const tiles: PlaygroundTile[] = BASE_TILES_LAYOUT.map((base, idx) => {
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

    if (uploadedWorks.length > BASE_TILES_LAYOUT.length) {
      const extraWorks = uploadedWorks.slice(BASE_TILES_LAYOUT.length);
      extraWorks.forEach((uw, extraIdx) => {
        const isVideo = uw.mediaType === 'video';
        const aspect = (uw.dimensions?.aspectRatio || (isVideo ? '16:9' : '4:5')) as any;
        const col = extraIdx % 6;
        const row = Math.floor(extraIdx / 6);
        const w = 350;
        const h = aspect === '9:16' ? 622 : aspect === '16:9' ? 197 : aspect === '1:1' ? 350 : 438;
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
          x: col * (350 + 14),
          y: BLOCK_HEIGHT + row * 450,
          width: w,
          height: h,
        });
      });
    }

    return tiles;
  }, [uploadedWorks]);

  // Filters & Interaction State
  const [activeFilter, setActiveFilter] = useState<'all' | 'reels' | 'films' | 'stills'>('all');
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);
  const [focusedTileId, setFocusedTileId] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<PlaygroundTile | null>(null);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(true);

  // Hamza Tariq Feature: Discovered Tiles tracking & Ambient Blur Toggle
  const [discoveredTiles, setDiscoveredTiles] = useState<Set<string>>(new Set());
  const [isGloballyUnblurred, setIsGloballyUnblurred] = useState<boolean>(false);

  // 360-Degree Continuous Coordinates (Infinite Torus)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 900, y: 700 });
  const [zoom, setZoom] = useState<number>(0.86);

  // Viewport tracking for 3D fisheye calculation
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const intensity = Math.min((dist - 0.18) * 3.6, 5.0);
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

  // Pointer Move (Smooth Panning & Velocity calculation)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.hypot(deltaX, deltaY) > 6) {
      hasMovedRef.current = true;
    }

    setPan({
      x: panStartRef.current.x - deltaX,
      y: panStartRef.current.y - deltaY,
    });

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 16) {
      const vx = (e.clientX - lastPosRef.current.x) / dt;
      const vy = (e.clientY - lastPosRef.current.y) / dt;
      velocityRef.current = { vx: -vx * 16, vy: -vy * 16 };
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      lastTimeRef.current = now;
    }
  };

  // Pointer Up (Release with Momentum)
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

  // Trackpad / Wheel Scroll & Pinch Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.65), 1.3));
    } else {
      // Pan
      setPan((prev) => ({
        x: prev.x + e.deltaX * 0.9,
        y: prev.y + e.deltaY * 0.9,
      }));
    }
  };

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTile) {
          setSelectedTile(null);
        } else if (focusedTileId) {
          setFocusedTileId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedTile, focusedTileId]);

  // Mark discovered tiles
  const markDiscovered = useCallback((id: string) => {
    setDiscoveredTiles((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Compute wrapped camera coordinates
  const wrappedX = ((pan.x % BLOCK_WIDTH) + BLOCK_WIDTH) % BLOCK_WIDTH;
  const wrappedY = ((pan.y % BLOCK_HEIGHT) + BLOCK_HEIGHT) % BLOCK_HEIGHT;

  // 3x3 Continuous Torus Offsets
  const blockOffsets = useMemo(() => {
    return [
      { ox: -BLOCK_WIDTH, oy: -BLOCK_HEIGHT, key: 'nw' },
      { ox: 0, oy: -BLOCK_HEIGHT, key: 'n' },
      { ox: BLOCK_WIDTH, oy: -BLOCK_HEIGHT, key: 'ne' },
      { ox: -BLOCK_WIDTH, oy: 0, key: 'w' },
      { ox: 0, oy: 0, key: 'c' },
      { ox: BLOCK_WIDTH, oy: 0, key: 'e' },
      { ox: -BLOCK_WIDTH, oy: BLOCK_HEIGHT, key: 'sw' },
      { ox: 0, oy: BLOCK_HEIGHT, key: 's' },
      { ox: BLOCK_WIDTH, oy: BLOCK_HEIGHT, key: 'se' },
    ];
  }, []);

  // Center of viewport for 3D Fisheye Globe Curvature
  const halfW = viewportSize.width / 2;
  const halfH = viewportSize.height / 2;

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClick={(e) => {
        // Clicking the background canvas clears the focused card
        if (e.target === stageRef.current || (e.target as HTMLElement).id === 'world-plane') {
          setFocusedTileId(null);
        }
      }}
      className="relative w-screen h-screen overflow-hidden bg-[#f3f2ee] select-none touch-none"
      style={{
        perspective: '1050px',
        perspectiveOrigin: '50% 50%',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
      }}
      data-cursor="grab"
    >
      {/* ================================================================= */}
      {/* 360-DEGREE SEAMLESS TORUS GLOBE PLANE                             */}
      {/* ================================================================= */}
      <div
        id="world-plane"
        className="w-full h-full relative flex items-center justify-center pointer-events-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute will-change-transform pointer-events-auto"
          style={{
            transform: `translate3d(${-wrappedX}px, ${-wrappedY}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 3x3 Continuous Torus Tiles with 360° Fisheye Globe Curvature */}
          {blockOffsets.map(({ ox, oy, key }) => (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: `${ox}px`,
                top: `${oy}px`,
                width: `${BLOCK_WIDTH}px`,
                height: `${BLOCK_HEIGHT}px`,
                transformStyle: 'preserve-3d',
              }}
            >
              {masterTiles.map((tile) => {
                const isFilteredOut = activeFilter !== 'all' && tile.category !== activeFilter;
                const isHovered = hoveredTileId === tile.id;
                const isFocused = focusedTileId === tile.id;
                const isUnblurred = isGloballyUnblurred || isHovered || isFocused;

                // Mathematical Screen Coordinates for 3D Globe Curvature
                const cardScreenX = ox + tile.x + tile.width / 2 - wrappedX;
                const cardScreenY = oy + tile.y + tile.height / 2 - wrappedY;

                // Normalized displacement from viewport center (-1 to +1)
                const dx = (cardScreenX - halfW) / (halfW * 0.88);
                const dy = (cardScreenY - halfH) / (halfH * 0.88);
                const distSq = dx * dx + dy * dy;

                // Fisheye 360 Camera Spherical Angles
                const rotY = Math.max(Math.min(dx * 20, 32), -32);
                const rotX = Math.max(Math.min(-dy * 15, 26), -26);
                const zDepth = -Math.min(distSq * 85, 220);
                const globeScale = Math.max(1 - distSq * 0.02, 0.92);

                return (
                  <div
                    key={`${key}_${tile.id}`}
                    onMouseEnter={() => {
                      setHoveredTileId(tile.id);
                      mouseSteerRef.current.isHoveringTile = true;
                      markDiscovered(tile.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredTileId((curr) => (curr === tile.id ? null : curr));
                      mouseSteerRef.current.isHoveringTile = false;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasMovedRef.current) return;
                      markDiscovered(tile.id);

                      if (focusedTileId === tile.id) {
                        // Second click opens the cinema lightbox viewer
                        setSelectedTile(tile);
                      } else {
                        // First click locks focus and unblurs this card!
                        setFocusedTileId(tile.id);
                      }
                    }}
                    data-cursor="view"
                    data-cursor-text={isFocused ? 'EXPAND ↗' : 'FOCUS ⊙'}
                    style={{
                      position: 'absolute',
                      left: `${tile.x}px`,
                      top: `${tile.y}px`,
                      width: `${tile.width}px`,
                      height: `${tile.height}px`,
                      // 360 Globe Fisheye 3D Curvature
                      transform: `translate3d(0, 0, ${isUnblurred ? zDepth + 45 : zDepth}px) rotateX(${isUnblurred ? rotX * 0.35 : rotX}deg) rotateY(${isUnblurred ? rotY * 0.35 : rotY}deg) scale(${isUnblurred ? globeScale * 1.04 : globeScale})`,
                      // Hamza Tariq Ambient Dream Blur vs Crisp Unblur
                      filter: isFilteredOut
                        ? 'grayscale(90%) blur(12px) opacity(0.2)'
                        : isUnblurred
                        ? 'blur(0px) brightness(1.0) saturate(1.0) contrast(1.0)'
                        : 'blur(20px) brightness(0.93) saturate(1.15) contrast(1.04)',
                      opacity: isFilteredOut ? 0.18 : isUnblurred ? 1.0 : 0.88,
                      transition: isDraggingRef.current
                        ? 'filter 0.3s ease, opacity 0.3s ease'
                        : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
                      zIndex: isUnblurred ? 45 : 10,
                    }}
                    className="rounded-[20px] overflow-hidden bg-white border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.18)] cursor-pointer group will-change-transform"
                  >
                    {/* Media Display (Video loop or High-res Still) */}
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

                    {/* Format Badge (Hamza Tariq Style) */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                        {tile.mediaType === 'video' ? '▶ ' : ''}{tile.aspect}
                      </span>
                    </div>

                    {/* Unblurred Active Badge: Shows when card is focused or hovered */}
                    {isUnblurred && (
                      <div className="absolute top-3 right-3 z-20 animate-fadeIn">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTile(tile);
                          }}
                          className="px-3 py-1 rounded-full bg-white/95 hover:bg-[#e60000] hover:text-white text-black font-mono text-[9px] font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>EXPAND</span>
                          <span>↗</span>
                        </button>
                      </div>
                    )}

                    {/* Hover & Focus Bottom Drawer */}
                    <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none flex flex-col justify-end space-y-1 ${
                      isUnblurred ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="flex items-center justify-between text-white font-mono text-[9px] font-bold text-neutral-300 uppercase">
                        <span>{tile.code}</span>
                        <span>{tile.year}</span>
                      </div>
                      <h3 className="font-sans font-black text-xs text-white uppercase tracking-tight line-clamp-1">
                        {tile.title}
                      </h3>
                      <p className="font-mono text-[10px] text-neutral-300 line-clamp-1">
                        {tile.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MINIMAL BOTTOM CONTROLS DOCK (HAMZA TARIQ STYLE)                  */}
      {/* ================================================================= */}

      {/* Bottom Center: Clean Category Filter Pills */}
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

      {/* Bottom Right: Hamza Tariq Style Discovered Counter & Blur Mode Toggle */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-none hidden sm:block">
        <div className="pointer-events-auto flex items-center gap-2 p-1 pl-3 pr-1 rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_8px_25px_rgba(0,0,0,0.08)] font-mono text-[11px] font-bold text-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{discoveredTiles.size}/{masterTiles.length} DISCOVERED</span>

          {/* Toggle All Unblur / Ambient Blur */}
          <button
            type="button"
            onClick={() => setIsGloballyUnblurred((prev) => !prev)}
            className={`ml-1 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
              isGloballyUnblurred
                ? 'bg-black text-white shadow-xs'
                : 'bg-black/5 text-neutral-600 hover:bg-black/10 hover:text-black'
            }`}
            title={isGloballyUnblurred ? 'Enable Ambient Dream Blur' : 'Unblur All Tiles'}
          >
            {isGloballyUnblurred ? '✨ AMBIENT BLUR' : '👁️ UNBLUR ALL'}
          </button>
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
