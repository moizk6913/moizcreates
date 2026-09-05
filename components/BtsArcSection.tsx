'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface BtsItem {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl: string;
  hudCamera: string;
  hudLens: string;
  hudIso: string;
  hudFps: string;
  hudScene: string;
}

const BTS_ITEMS: BtsItem[] = [
  {
    id: 'bts-01',
    title: 'PORSCHE TELEMETRY & RIG',
    videoUrl: '/assets/bts/bts-01.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'ARRI ALEXA MINI LF',
    hudLens: '35MM T1.3',
    hudIso: '800 ISO',
    hudFps: '24 FPS',
    hudScene: 'RIG // CAR-01',
  },
  {
    id: 'bts-02',
    title: 'RUNWAY MODEL PACING',
    videoUrl: '/assets/bts/bts-02.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'RED V-RAPTOR 8K',
    hudLens: '21MM ULTRA-WIDE',
    hudIso: '1280 ISO',
    hudFps: '48 FPS',
    hudScene: 'RUNWAY // SPEED-02',
  },
  {
    id: 'bts-03',
    title: 'LOOKBOOK STUDIO LIGHTING',
    videoUrl: '/assets/bts/bts-03.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'SONY VENICE 2',
    hudLens: '50MM ANAMORPHIC',
    hudIso: '500 ISO',
    hudFps: '24 FPS',
    hudScene: 'STUDIO // KEY-03',
  },
  {
    id: 'bts-04',
    title: 'KINETIC CHOREOGRAPHY',
    videoUrl: '/assets/bts/bts-04.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'PHANTOM FLEX 4K',
    hudLens: '85MM MASTER PRIME',
    hudIso: '1600 ISO',
    hudFps: '120 FPS',
    hudScene: 'REEL // SPRINT-04',
  },
  {
    id: 'bts-05',
    title: 'CINEMA OPTICS & CALIBRATION',
    videoUrl: '/assets/bts/bts-05.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'DIRECTOR MONITOR',
    hudLens: '100MM MACRO',
    hudIso: '400 ISO',
    hudFps: '60 FPS',
    hudScene: 'OPTICS // MASTER-05',
  },
  {
    id: 'bts-06',
    title: 'STEADICAM CAMERA TRACKING',
    videoUrl: '/assets/bts/bts-06.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'STEADICAM M-2',
    hudLens: '28MM T2.0',
    hudIso: '800 ISO',
    hudFps: '24 FPS',
    hudScene: 'ON-SET // UNIT-06',
  },
  {
    id: 'bts-07',
    title: 'ASTERA LIGHTING GRID',
    videoUrl: '/assets/bts/bts-07.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'CANON C500 MK II',
    hudLens: '50MM COOKE',
    hudIso: '640 ISO',
    hudFps: '24 FPS',
    hudScene: 'GRID // TUNGSTEN-07',
  },
  {
    id: 'bts-08',
    title: 'DIOR EDITORIAL CLOSEUP',
    videoUrl: '/assets/bts/bts-08.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    hudCamera: 'DIRECTOR VIEWFINDER',
    hudLens: '85MM PORTRAIT',
    hudIso: '400 ISO',
    hudFps: '24 FPS',
    hudScene: 'BEAUTY // CLOSEUP-08',
  },
];

export default function BtsArcSection() {
  const [items, setItems] = useState<BtsItem[]>(BTS_ITEMS);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<BtsItem | null>(null);
  const [unmutedId, setUnmutedId] = useState<string | null>(null);
  const [timecode, setTimecode] = useState('00:14:28:12');

  const dragStartXRef = useRef(0);
  const dragStartAngleRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const isInteractingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);

  // Sync ref with state
  useEffect(() => {
    currentAngleRef.current = rotationAngle;
  }, [rotationAngle]);

  // Client-side random shuffle on mount so order is fresh
  useEffect(() => {
    setItems([...BTS_ITEMS].sort(() => Math.random() - 0.5));
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

  // Smooth continuous auto-rotation & inertia momentum loop
  useEffect(() => {
    let lastTs = performance.now();

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;

      if (!isInteractingRef.current) {
        if (Math.abs(velocityRef.current) > 0.01) {
          // Apply friction
          velocityRef.current *= Math.pow(0.92, dt * 60);
          currentAngleRef.current += velocityRef.current;
          setRotationAngle(currentAngleRef.current);
        } else if (!isHovered) {
          // Subtle continuous auto-rotation (like a luxury rotating showcase)
          velocityRef.current = 0;
          currentAngleRef.current += 0.038 * (dt * 60);
          setRotationAngle(currentAngleRef.current);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
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
    // 0.14 degrees per px
    const newAngle = dragStartAngleRef.current - deltaX * 0.14;
    currentAngleRef.current = newAngle;
    setRotationAngle(newAngle);

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 8) {
      const dx = e.clientX - lastXRef.current;
      velocityRef.current = -dx * 0.14;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    setIsDragging(false);
  }, []);

  // 1-card manual spin steps (45 degrees per step)
  const rotatePrev = () => {
    velocityRef.current = -1.2;
  };

  const rotateNext = () => {
    velocityRef.current = 1.2;
  };

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnmutedId((prev) => (prev === id ? null : id));
  };

  // Cylinder radius (tuned for desktop & mobile)
  const cylinderRadius = 820;

  return (
    <section
      id="bts-direction"
      className="w-full relative py-14 md:py-24 bg-canvas overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
      }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 3D Cylindrical Stage */}
      <div
        className="w-full relative flex items-center justify-center min-h-[500px] md:min-h-[560px]"
        style={{
          perspective: '1350px',
          perspectiveOrigin: '50% 48%',
        }}
      >
        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={rotatePrev}
          aria-label="Rotate left"
          className="hidden md:flex absolute left-8 z-40 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-primary shadow-lg border border-black/10 backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={rotateNext}
          aria-label="Rotate right"
          className="hidden md:flex absolute right-8 z-40 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-primary shadow-lg border border-black/10 backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 3D Rotating Cylinder Wheel Anchor */}
        <div
          className="relative w-0 h-0 flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0px) rotateX(2.5deg)',
          }}
        >
          {items.map((item, index) => {
            const count = items.length;
            const cardAngle = index * (360 / count) - rotationAngle;
            // Normalize angle to [-180, 180]
            const normalizedAngle = ((((cardAngle + 180) % 360) + 360) % 360) - 180;
            const angleFromFront = Math.abs(normalizedAngle);

            // Only render front hemisphere cards for optimal performance and pure clean circle view
            const isVisible = angleFromFront < 105;
            if (!isVisible) return null;

            // Depth calculation: 1 at front (0 deg), 0 at 90 deg
            const depthFactor = Math.cos((angleFromFront * Math.PI) / 180);
            const scale = Math.max(0.78, 0.78 + 0.26 * depthFactor);
            const opacity = Math.max(0.45, Math.pow(depthFactor, 0.7));
            const zIndex = Math.round(depthFactor * 100);
            const isFrontCard = angleFromFront < 15;

            // Subtle arched elevation (rainbow dome curvature)
            const yOffset = (1 - depthFactor) * 38;

            return (
              <div
                key={item.id}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-shadow duration-300"
                style={{
                  width: '280px',
                  height: '385px',
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${normalizedAngle}deg) translateZ(${cylinderRadius}px) translateY(${yOffset}px) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                  willChange: 'transform, opacity',
                }}
              >
                {/* Cinema Video Frame */}
                <div
                  className={`group relative w-full h-full rounded-[24px] overflow-hidden bg-black shadow-2xl transition-all duration-300 ${
                    isFrontCard
                      ? 'ring-2 ring-black/40 shadow-[0_25px_60px_rgba(0,0,0,0.35)]'
                      : 'ring-1 ring-black/15 hover:ring-black/35'
                  }`}
                  onClick={() => setActiveModalItem(item)}
                >
                  {/* HTML5 Seamless Looping Local Video */}
                  <video
                    src={item.videoUrl}
                    poster={item.posterUrl}
                    autoPlay
                    loop
                    muted={unmutedId !== item.id}
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

                  {/* Top HUD Viewfinder Bar */}
                  <div className="absolute top-0 left-0 right-0 p-3.5 flex justify-between items-center text-[10px] font-mono tracking-wider text-white pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-white">REC</span>
                      <span className="text-white/60">●</span>
                      <span>{timecode}</span>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white/80 font-semibold">
                      {item.hudFps}
                    </div>
                  </div>

                  {/* Center Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-70 transition-opacity duration-300">
                    <div className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />
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
                          className="w-7 h-7 rounded-full bg-black/70 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-colors duration-200"
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
                          className="w-7 h-7 rounded-full bg-black/70 hover:bg-white text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-colors duration-200"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-mono text-white/70 pt-1 border-t border-white/15">
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
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center rounded-2xl overflow-hidden bg-zinc-950 border border-white/10"
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
            <div className="w-full flex items-center justify-center p-6 bg-black">
              <video
                src={activeModalItem.videoUrl}
                poster={activeModalItem.posterUrl}
                autoPlay
                controls
                playsInline
                className="max-h-[68vh] w-auto max-w-full rounded-lg shadow-2xl"
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
