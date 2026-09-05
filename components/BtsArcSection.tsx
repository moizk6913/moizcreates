'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Maximize2, X } from 'lucide-react';

interface BtsItem {
  id: string;
  title: string;
  format: 'portrait' | 'landscape' | 'square';
  videoUrl: string;
  posterUrl: string;
  aspectRatio: string;
  baseWidth: number; // in px
  baseHeight: number; // in px
  hudCamera: string;
  hudLens: string;
  hudIso: string;
  hudFps: string;
  hudScene: string;
  tiltOffset?: number;
  yOffset?: number;
}

const RAW_BTS_ITEMS: BtsItem[] = [
  {
    id: 'bts-01',
    title: 'RUNWAY PACING & CHOREOGRAPHY',
    format: 'portrait',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Chroma_-_Fashion_Video.webm',
    posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '9/16',
    baseWidth: 260,
    baseHeight: 460,
    hudCamera: 'ARRI ALEXA LF',
    hudLens: '50MM T1.3',
    hudIso: '800 ISO',
    hudFps: '24 FPS',
    hudScene: 'SET // A1',
  },
  {
    id: 'bts-02',
    title: 'CRANE TRACKING & MODEL BLOCKING',
    format: 'landscape',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/The_Last_of_Us_-_Gastown_set_3.webm',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '16/9',
    baseWidth: 440,
    baseHeight: 260,
    hudCamera: 'RED V-RAPTOR 8K',
    hudLens: '21MM ANAMORPHIC',
    hudIso: '1280 ISO',
    hudFps: '48 FPS',
    hudScene: 'RIG // TECH-04',
  },
  {
    id: 'bts-03',
    title: 'HIGH-FASHION EDITORIAL DIRECTION',
    format: 'portrait',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Fashion_Magazine.webm',
    posterUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '9/16',
    baseWidth: 250,
    baseHeight: 440,
    hudCamera: 'SONY VENICE 2',
    hudLens: '85MM T1.4',
    hudIso: '400 ISO',
    hudFps: '24 FPS',
    hudScene: 'COVER // 02',
  },
  {
    id: 'bts-04',
    title: 'ASTERA LIGHTING SYNC & SHUTTER TEST',
    format: 'landscape',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Photo_Shoot-A_Video_Demonstration.webm',
    posterUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '16/9',
    baseWidth: 460,
    baseHeight: 270,
    hudCamera: 'DIRECTOR MONITOR',
    hudLens: 'MASTER ZOOM',
    hudIso: '3200K TUNGSTEN',
    hudFps: '60 FPS',
    hudScene: 'LIGHTING // KEY',
  },
  {
    id: 'bts-05',
    title: 'NATURAL LIGHT SUN-CHASING UNIT',
    format: 'landscape',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Melt_Swim_Fashion_Video_Summer_2013.webm',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '16/9',
    baseWidth: 420,
    baseHeight: 250,
    hudCamera: 'ALEXA MINI',
    hudLens: '35MM ZEISS',
    hudIso: 'ND 1.2 • 500 ISO',
    hudFps: '24 FPS',
    hudScene: 'EXTERIOR // B',
  },
  {
    id: 'bts-06',
    title: 'STEADICAM DYNAMIC FOLLOW REEL',
    format: 'portrait',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Ethical_fashion_show_berlin_2012.webm',
    posterUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '9/16',
    baseWidth: 260,
    baseHeight: 460,
    hudCamera: 'GIMBAL PRO',
    hudLens: '28MM ULTRA-WIDE',
    hudIso: '1600 ISO',
    hudFps: '24 FPS',
    hudScene: 'REEL // D1',
  },
  {
    id: 'bts-07',
    title: 'SET REHEARSAL & TIMING CUES',
    format: 'landscape',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/The_Last_of_Us_-_Gastown_set_4.webm',
    posterUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '16/9',
    baseWidth: 450,
    baseHeight: 265,
    hudCamera: 'DIRECTOR CUT',
    hudLens: '50MM COOKE',
    hudIso: '800 ISO',
    hudFps: '24 FPS',
    hudScene: 'TAKE // 07',
  },
  {
    id: 'bts-08',
    title: 'TALENT STAGING & MONOCHROME LUT',
    format: 'portrait',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Doctor_Who_The_Giggle_June_2022_filming_-_David_Tennant_on-set.webm',
    posterUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800&auto=format&fit=crop',
    aspectRatio: '9/16',
    baseWidth: 250,
    baseHeight: 440,
    hudCamera: 'MONOCHROME LUT',
    hudLens: '100MM MACRO',
    hudIso: '640 ISO',
    hudFps: '24 FPS',
    hudScene: 'CLOSEUP // 01',
  },
];

export default function BtsArcSection() {
  const [items, setItems] = useState<BtsItem[]>(RAW_BTS_ITEMS);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<BtsItem | null>(null);
  const [unmutedId, setUnmutedId] = useState<string | null>(null);
  const [timecode, setTimecode] = useState('00:14:28:12');

  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);

  // Sync ref with state
  useEffect(() => {
    currentAngleRef.current = rotationAngle;
  }, [rotationAngle]);

  // Dynamic shuffle on every mount + random slight tilts/offsets
  useEffect(() => {
    const shuffled = [...RAW_BTS_ITEMS]
      .sort(() => Math.random() - 0.5)
      .map((item) => ({
        ...item,
        tiltOffset: Number(((Math.random() - 0.5) * 3).toFixed(1)), // -1.5deg to +1.5deg
        yOffset: Math.floor((Math.random() - 0.5) * 20), // -10px to +10px
      }));
    setItems(shuffled);
  }, []);

  // Running cinema timecode simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getMilliseconds() / 40)).padStart(2, '0');
      setTimecode(`01:${m}:${s}:${ms}`);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Smooth Inertia + Gentle Idle Orbit
  useEffect(() => {
    let lastTs = performance.now();

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;

      if (!isInteractingRef.current) {
        if (Math.abs(velocityRef.current) > 0.005) {
          // Apply friction to momentum
          velocityRef.current *= Math.pow(0.92, dt * 60);
          currentAngleRef.current += velocityRef.current;
          setRotationAngle(currentAngleRef.current);
        } else {
          // Subtle idle orbit (drift)
          velocityRef.current = 0;
          currentAngleRef.current += 0.025 * (dt * 60);
          setRotationAngle(currentAngleRef.current);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only trigger if not clicking directly on buttons
    if ((e.target as HTMLElement).closest('button')) return;

    isInteractingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartAngleRef.current = currentAngleRef.current;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isInteractingRef.current) return;

    const deltaX = e.clientX - dragStartXRef.current;
    // 0.12 degrees per pixel
    const newAngle = dragStartAngleRef.current - deltaX * 0.12;
    currentAngleRef.current = newAngle;
    setRotationAngle(newAngle);

    // Calculate instantaneous velocity for momentum release
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 8) {
      const dx = e.clientX - lastXRef.current;
      velocityRef.current = -dx * 0.12;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    setIsDragging(false);
  }, []);

  // Mouse wheel horizontal scroll support
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 4) {
      currentAngleRef.current += delta * 0.04;
      setRotationAngle(currentAngleRef.current);
    }
  }, []);

  // Compute angles along the 3D cylinder
  // Radius of cylinder
  const cylinderRadius = 1150;
  
  // Compute individual angular step for each card based on its actual width
  // This guarantees ZERO overlap whether landscape or portrait!
  let totalCalculatedAngle = 0;
  const cardAngles: number[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const card = items[i];
    const prevCard = items[(i - 1 + items.length) % items.length];
    // Gap between card borders is 75px
    const halfPrev = (prevCard.baseWidth / 2);
    const halfCurr = (card.baseWidth / 2);
    const centerDist = halfPrev + halfCurr + 75;
    
    // Angular span = (arc length / radius) in degrees
    const stepDeg = (centerDist / cylinderRadius) * (180 / Math.PI);
    totalCalculatedAngle += stepDeg;
    cardAngles.push(totalCalculatedAngle);
  }

  // Toggle video mute
  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnmutedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="bts-direction"
      className="w-full relative py-16 md:py-28 bg-canvas overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Viewport 3D Stage */}
      <div
        ref={containerRef}
        className="w-full relative flex items-center justify-center min-h-[560px] md:min-h-[640px]"
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* 3D Orbit Cylinder Anchor */}
        <div
          className="relative w-0 h-0 flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0px)',
          }}
        >
          {items.map((item, index) => {
            const rawAngle = cardAngles[index] + rotationAngle;
            // Modulo into 360 degree circle
            const normalizedAngle = ((rawAngle % 360) + 360) % 360;
            
            // Only render cards in the front hemisphere (within ~115 degrees of front) to optimize performance
            const angleFromFront = Math.min(normalizedAngle, 360 - normalizedAngle);
            const isVisible = angleFromFront < 115;
            
            if (!isVisible) return null;

            // Compute depth opacity & scale for natural atmospheric fade towards edges
            const depthFactor = Math.cos((angleFromFront * Math.PI) / 180);
            const opacity = Math.max(0.35, Math.pow(depthFactor, 0.7));
            const isFrontCard = angleFromFront < 18;

            return (
              <div
                key={item.id}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-shadow duration-300"
                style={{
                  width: `${item.baseWidth}px`,
                  height: `${item.baseHeight}px`,
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${normalizedAngle}deg) translateZ(${cylinderRadius}px) rotateY(${-normalizedAngle}deg) translateY(${item.yOffset || 0}px) rotateZ(${item.tiltOffset || 0}deg)`,
                  zIndex: Math.round(depthFactor * 100),
                  opacity: opacity,
                  willChange: 'transform, opacity',
                }}
              >
                {/* Visual Glass / Cinema Frame */}
                <div
                  className={`group relative w-full h-full rounded-2xl overflow-hidden bg-black/90 transition-all duration-300 ${
                    isFrontCard
                      ? 'ring-1 ring-white/30 shadow-2xl scale-[1.03]'
                      : 'ring-1 ring-white/10 hover:ring-white/30'
                  }`}
                  onClick={() => setActiveModalItem(item)}
                >
                  {/* HTML5 Seamless Looping Video */}
                  <video
                    src={item.videoUrl}
                    poster={item.posterUrl}
                    autoPlay
                    loop
                    muted={unmutedId !== item.id}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

                  {/* Top HUD Viewfinder Bar */}
                  <div className="absolute top-0 left-0 right-0 p-3.5 flex justify-between items-center text-[10px] font-mono tracking-wider text-white/80 pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-white">REC</span>
                      <span className="text-white/60">●</span>
                      <span>{timecode}</span>
                    </div>

                    <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-white/70">
                      {item.hudFps}
                    </div>
                  </div>

                  {/* Center Director Crosshair (Fades on hover) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity duration-300">
                    <div className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white/60 rounded-full" />
                    </div>
                  </div>

                  {/* Bottom Camera Metadata Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 flex flex-col gap-1 z-10">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="font-mono text-[9px] text-accent-red uppercase tracking-widest font-semibold">
                          {item.hudScene}
                        </span>
                        <h4 className="font-display text-xs md:text-sm font-bold text-white uppercase tracking-tight line-clamp-1">
                          {item.title}
                        </h4>
                      </div>

                      {/* Controls: Audio Unmute & Expand */}
                      <div className="flex items-center gap-1.5 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => toggleMute(item.id, e)}
                          title={unmutedId === item.id ? 'Mute audio' : 'Unmute audio'}
                          className="w-7 h-7 rounded-full bg-black/60 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-colors duration-200"
                        >
                          {unmutedId === item.id ? (
                            <Volume2 className="w-3.5 h-3.5" />
                          ) : (
                            <VolumeX className="w-3.5 h-3.5 opacity-75" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalItem(item);
                          }}
                          title="Fullscreen View"
                          className="w-7 h-7 rounded-full bg-black/60 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-colors duration-200"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-mono text-white/60 pt-1 border-t border-white/10">
                      <span>{item.hudCamera}</span>
                      <span>•</span>
                      <span>{item.hudLens}</span>
                      <span>•</span>
                      <span>{item.hudIso}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Video Inspector Lightbox */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 transition-all duration-300"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center rounded-2xl overflow-hidden bg-zinc-950 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center bg-zinc-900/80 border-b border-white/10 text-white">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-xs text-white/60 uppercase">
                  {activeModalItem.hudScene} // {activeModalItem.hudCamera}
                </span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-xs text-accent-red font-semibold">
                  {activeModalItem.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Video View */}
            <div className="w-full flex items-center justify-center p-4 bg-black/60">
              <video
                src={activeModalItem.videoUrl}
                poster={activeModalItem.posterUrl}
                autoPlay
                controls
                playsInline
                className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer Technical Specs */}
            <div className="w-full px-6 py-3.5 bg-zinc-900/60 flex justify-between items-center text-xs font-mono text-white/60 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span>{activeModalItem.hudLens}</span>
                <span>ISO {activeModalItem.hudIso}</span>
                <span>{activeModalItem.hudFps}</span>
              </div>
              <div className="text-[10px] text-white/40">
                DIRECTOR FOOTAGE ARCHIVE
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
