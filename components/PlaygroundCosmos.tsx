'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
// Dense 6-column interlocking mosaic with uniform 14px gaps
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
      "Heat Haze",
      "Dune Geometry",
      "Anamorphic Cinema"
    ],
    "desc": "Extreme heat shimmer deforming distant sand dunes in the Arabian desert.",
    "x": 728,
    "y": 364,
    "width": 350,
    "height": 197
  },
  {
    "title": "MINIMALIST CERAMIC & SHADOW",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "OBJECT LAB",
    "role": "Still Life Director",
    "fps": "STILL",
    "resolution": "MEDIUM FORMAT",
    "tags": [
      "Ceramic Design",
      "Architectural Shadow",
      "Matte Finish"
    ],
    "desc": "Unfinished porcelain vessel photographed in directional morning light.",
    "x": 728,
    "y": 575,
    "width": 350,
    "height": 438
  },
  {
    "title": "HYPERSPACE SOUND VISUALIZER",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-07.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "AUDIO LAB",
    "role": "Visual Artist",
    "fps": "60 FPS",
    "resolution": "9:16 4K",
    "tags": [
      "Tunnel Warp",
      "Bass Reactive",
      "Strobe Geometry"
    ],
    "desc": "Synchronized visual tunnel accelerating past geometric ring arrays on auditory peaks.",
    "x": 728,
    "y": 1027,
    "width": 350,
    "height": 723
  },
  {
    "title": "TOKYO SHINJUKU MIDNIGHT GLITCH",
    "category": "reels",
    "aspect": "9:16",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-05.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "DIRECTOR LAB",
    "role": "Director",
    "fps": "60 FPS",
    "resolution": "9:16 PRORES",
    "tags": [
      "Neon Rain",
      "Tokyo Crossings",
      "Handheld 35mm"
    ],
    "desc": "Handheld anamorphic capture in neon rain reflections across Shinjuku crossings.",
    "x": 1092,
    "y": 0,
    "width": 350,
    "height": 622
  },
  {
    "title": "ORGANIC FLUID CAUSTICS DYNAMICS",
    "category": "kinetic",
    "aspect": "1:1",
    "mediaType": "video",
    "mediaUrl": "/assets/bts/bts-06.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    "year": "2026",
    "client": "FLUID LAB",
    "role": "Simulation Artist",
    "fps": "60 FPS",
    "resolution": "2160x2160",
    "tags": [
      "Caustics",
      "Underwater Refraction",
      "Fluid Sim"
    ],
    "desc": "Sub-surface photon scattering through turbulent pool surface geometry.",
    "x": 1092,
    "y": 636,
    "width": 350,
    "height": 350
  },
  {
    "title": "RAW BRUTALIST CONCRETE FACADE",
    "category": "stills",
    "aspect": "4:5",
    "mediaType": "image",
    "mediaUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    "year": "2026",
    "client": "ARCH LAB",
    "role": "Architectural Photographer",
    "fps": "STILL",
    "resolution": "MEDIUM FORMAT",
    "tags": [
      "Brutalism",
      "Concrete Texture",
      "Shadow Contrast"
    ],
    "desc": "Board-formed concrete cantilever photographed in harsh noon Mediterranean sunlight.",
    "x": 1092,
    "y": 1000,
    "width": 350,
    "height": 438
  },
  {
    "title": "DOLOMITE CLOUD DRIFT TIME-LAPSE",
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
  // Merge uploaded works into base tiles
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

  // Interaction State
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<PlaygroundTile | null>(null);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(true);

  // Balanced 50/50 curated distribution: some blurred, some clear ("some aal bulr some remove")
  // 12 cards clear, 12 cards soft bokeh blur across the 6 columns
  const [discoveredTiles, setDiscoveredTiles] = useState<Set<string>>(
    () => new Set([
      'tile-1', 'tile-3',   // Col 0: 1 reel clear, 1 film clear
      'tile-5', 'tile-8',   // Col 1: 1 still clear, 1 film clear
      'tile-9', 'tile-11',  // Col 2: 1 kinetic clear, 1 reel clear
      'tile-13', 'tile-15', // Col 3: 1 reel clear, 1 still clear
      'tile-17', 'tile-19', // Col 4: 1 film clear, 1 kinetic clear
      'tile-21', 'tile-23', // Col 5: 1 still clear, 1 kinetic clear
    ])
  );
  const [isGloballyUnblurred, setIsGloballyUnblurred] = useState<boolean>(false);

  const markDiscovered = useCallback((id: string) => {
    setDiscoveredTiles((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // 360-Degree Continuous Coordinates (Infinite Torus)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(0.92);

  // Viewport tracking
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
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

  // Human-paced, calm cursor steering (smooth exponential lerp)
  const mouseSteerRef = useRef({ vx: 0, vy: 0, targetVx: 0, targetVy: 0, isHoveringTile: false });

  // 360-Degree Master Drift Loop (Gentle, Human-Paced, Zero-Lag)
  useEffect(() => {
    let lastTick = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTick) / 1000, 0.05);
      lastTick = now;

      if (isDraggingRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      // Smooth exponential lerp toward target steering velocity (calm, luxury, no sudden twitch)
      const steer = mouseSteerRef.current;
      steer.vx += (steer.targetVx - steer.vx) * 0.08;
      steer.vy += (steer.targetVy - steer.vy) * 0.08;

      // Momentum velocity decay
      velocityRef.current.vx *= 0.92;
      velocityRef.current.vy *= 0.92;

      const totalVx = steer.vx + velocityRef.current.vx;
      const totalVy = steer.vy + velocityRef.current.vy;

      if (Math.hypot(totalVx, totalVy) > 0.015) {
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

  // Window Mouse Move for Gentle 360-Degree Steering
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;

      const cX = window.innerWidth / 2;
      const cY = window.innerHeight / 2;

      // Normalized coordinates from center: -1 to +1
      const normX = (e.clientX - cX) / cX;
      const normY = (e.clientY - cY) / cY;
      const dist = Math.hypot(normX, normY);

      // Large 30% dead zone in center: rock solid still when reading or inspecting cards!
      if (dist < 0.30 || mouseSteerRef.current.isHoveringTile) {
        mouseSteerRef.current.targetVx = 0;
        mouseSteerRef.current.targetVy = 0;
        return;
      }

      // Calm, human-paced drift speed (max ~0.95px per frame = ~55px/sec)
      const intensity = Math.min((dist - 0.30) * 1.5, 0.95);
      const angle = Math.atan2(normY, normX);

      mouseSteerRef.current.targetVx = Math.cos(angle) * intensity;
      mouseSteerRef.current.targetVy = Math.sin(angle) * intensity;
    };

    const handleMouseLeave = () => {
      mouseSteerRef.current.targetVx = 0;
      mouseSteerRef.current.targetVy = 0;
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
      x: panStartRef.current.x - deltaX / zoom,
      y: panStartRef.current.y - deltaY / zoom,
    });

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 16) {
      const vx = (e.clientX - lastPosRef.current.x) / dt;
      const vy = (e.clientY - lastPosRef.current.y) / dt;
      velocityRef.current = { vx: -vx * 16 / zoom, vy: -vy * 16 / zoom };
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
      const zoomFactor = e.deltaY < 0 ? 1.04 : 0.96;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.65), 1.3));
    } else {
      setPan((prev) => ({
        x: prev.x + (e.deltaX * 0.8) / zoom,
        y: prev.y + (e.deltaY * 0.8) / zoom,
      }));
    }
  };

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTile(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Compute wrapped camera coordinates within [0, BLOCK_WIDTH) and [0, BLOCK_HEIGHT)
  const wrappedX = ((pan.x % BLOCK_WIDTH) + BLOCK_WIDTH) % BLOCK_WIDTH;
  const wrappedY = ((pan.y % BLOCK_HEIGHT) + BLOCK_HEIGHT) % BLOCK_HEIGHT;

  // Viewport half-dimensions
  const halfW = viewportSize.width / 2;
  const halfH = viewportSize.height / 2;

  // Optimized visible blocks: buffer reduced to 120px to avoid mounting unnecessary offscreen blocks
  const visibleBlocks = useMemo(() => {
    const worldHalfW = halfW / zoom;
    const worldHalfH = halfH / zoom;

    const minX = wrappedX - worldHalfW - 120;
    const maxX = wrappedX + worldHalfW + 120;
    const minY = wrappedY - worldHalfH - 120;
    const maxY = wrappedY + worldHalfH + 120;

    const minBx = Math.floor(minX / BLOCK_WIDTH);
    const maxBx = Math.floor(maxX / BLOCK_WIDTH);
    const minBy = Math.floor(minY / BLOCK_HEIGHT);
    const maxBy = Math.floor(maxY / BLOCK_HEIGHT);

    const blocks: { bx: number; by: number; ox: number; oy: number; key: string }[] = [];
    for (let bx = minBx; bx <= maxBx; bx++) {
      for (let by = minBy; by <= maxBy; by++) {
        blocks.push({
          bx,
          by,
          ox: bx * BLOCK_WIDTH,
          oy: by * BLOCK_HEIGHT,
          key: `${bx}_${by}`,
        });
      }
    }
    return blocks;
  }, [wrappedX, wrappedY, halfW, halfH, zoom]);

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#f3f2ee] select-none touch-none"
      style={{
        perspective: '1650px',
        perspectiveOrigin: '50% 50%',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
      }}
      data-cursor="grab"
    >
      {/* ================================================================= */}
      {/* 360° FISHEYE GLOBE MOSAIC PLANE (FLUID 60FPS • ZERO LAG)          */}
      {/* ================================================================= */}
      <div
        className="absolute will-change-transform pointer-events-auto"
        style={{
          left: `${halfW}px`,
          top: `${halfH}px`,
          transform: `scale(${zoom}) translate3d(${-wrappedX}px, ${-wrappedY}px, 0)`,
          transformOrigin: '0 0',
          transformStyle: 'preserve-3d',
        }}
      >
        {visibleBlocks.map(({ ox, oy, key }) => (
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
              const isHovered = hoveredTileId === tile.id;
              const isDiscovered = discoveredTiles.has(tile.id);
              const isUnblurred = isGloballyUnblurred || isDiscovered || isHovered;

              // Card center on screen for authentic symmetrical fisheye curve
              const cardWorldCenterX = ox + tile.x + tile.width / 2;
              const cardWorldCenterY = oy + tile.y + tile.height / 2;
              const cardScreenX = halfW + (cardWorldCenterX - wrappedX) * zoom;
              const cardScreenY = halfH + (cardWorldCenterY - wrappedY) * zoom;

              const dx = (cardScreenX - halfW) / (halfW * 0.92);
              const dy = (cardScreenY - halfH) / (halfH * 0.92);
              const distSq = dx * dx + dy * dy;

              // Enhanced Barrel Distortion: pronounced optical fisheye globe curvature
              const rotY = Math.max(Math.min(dx * 13.5, 18), -18);
              const rotX = Math.max(Math.min(-dy * 10.5, 14.5), -14.5);
              const zDepth = -Math.min(distSq * 68, 160);
              const globeScale = Math.max(1.03 - distSq * 0.035, 0.93);

              const activeZ = isHovered ? zDepth + 40 : zDepth;
              const activeScale = isHovered ? globeScale * 1.04 : globeScale;

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
                    setSelectedTile(tile);
                  }}
                  data-cursor="view"
                  data-cursor-text={isUnblurred ? 'EXPAND ↗' : 'UNBLUR 👁️'}
                  style={{
                    position: 'absolute',
                    left: `${tile.x}px`,
                    top: `${tile.y}px`,
                    width: `${tile.width}px`,
                    height: `${tile.height}px`,
                    // 3D Fisheye Globe Curvature
                    transform: `translate3d(0, 0, ${activeZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${activeScale})`,
                    transformStyle: 'preserve-3d',
                    zIndex: isHovered ? 60 : 10,
                  }}
                  // Crisp frame with 10-20px gaps (never blurred)
                  className="rounded-[18px] overflow-hidden bg-white border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.18)] cursor-pointer group"
                >
                  {/* Inner Media: Clean Soft Bokeh Blur (9px) - Zero Lag Optimization */}
                  <div
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      filter: isUnblurred
                        ? 'none'
                        : 'blur(8px) brightness(0.98) saturate(1.04)',
                      transform: isUnblurred ? 'scale(1.0)' : 'scale(1.08)',
                      transition: 'filter 0.35s ease, transform 0.35s ease',
                    }}
                  >
                    {/* ZERO-LAG PERFORMANCE FIX: ONLY decode video stream on HOVER or in MODAL! */}
                    {tile.mediaType === 'video' && isHovered ? (
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
                      // High-res static image: lightweight, GPU-cached, 0% CPU decoding load
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tile.thumbnailUrl || tile.mediaUrl}
                        alt={tile.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>

                  {/* Format Aspect Badge (Always Crisp) */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                      {tile.mediaType === 'video' ? '▶ ' : ''}{tile.aspect}
                    </span>
                  </div>

                  {/* Hover Badge: Shows 'EXPAND ↗' when unblurred, or 'UNBLUR 👁️' */}
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markDiscovered(tile.id);
                        setSelectedTile(tile);
                      }}
                      className="px-3 py-1 rounded-full bg-white/95 hover:bg-black hover:text-white text-black font-mono text-[9px] font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{isUnblurred ? 'EXPAND' : 'UNBLUR'}</span>
                      <span>{isUnblurred ? '↗' : '👁️'}</span>
                    </button>
                  </div>

                  {/* Hover Drawer with Project Title & Role */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end space-y-1">
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
                <span className="font-bold text-white uppercase tracking-wider">
                  {selectedTile.aspect}
                </span>
                <span className="text-white/25">•</span>
                <span className="font-bold font-sans text-sm text-white line-clamp-1">{selectedTile.title}</span>
                <span className="text-white/25 hidden sm:inline">•</span>
                <span className="text-white/40 hidden sm:inline">{selectedTile.year}</span>
              </div>
              <div className="flex items-center gap-3">
                {selectedTile.mediaType === 'video' && (
                  <button
                    type="button"
                    onClick={() => setIsModalMuted((m) => !m)}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] tracking-wider transition-colors cursor-pointer"
                  >
                    {isModalMuted ? 'UNMUTE 🔇' : 'SOUND ON 🔊'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTile(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body - Media Display */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8 bg-black/60 relative">
              {selectedTile.mediaType === 'video' ? (
                <video
                  src={selectedTile.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  muted={isModalMuted}
                  controls
                  className="max-h-[62vh] max-w-full rounded-[14px] object-contain shadow-2xl"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedTile.mediaUrl}
                  alt={selectedTile.title}
                  className="max-h-[65vh] max-w-full rounded-[14px] object-contain shadow-2xl"
                />
              )}

              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={() => {
                  const currIdx = masterTiles.findIndex((t) => t.id === selectedTile.id);
                  const nextTile = masterTiles[(currIdx - 1 + masterTiles.length) % masterTiles.length];
                  markDiscovered(nextTile.id);
                  setSelectedTile(nextTile);
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
                  const nextTile = masterTiles[(currIdx + 1) % masterTiles.length];
                  markDiscovered(nextTile.id);
                  setSelectedTile(nextTile);
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
                  className="px-5 py-2 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer text-xs"
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
