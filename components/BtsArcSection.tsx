'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface BtsItem {
  id: string;
  title: string;
  format: 'portrait' | 'landscape';
  videoUrl: string;
  posterUrl: string;
  width: number;
  height: number;
  hudCamera: string;
  hudLens: string;
  hudIso: string;
  hudFps: string;
  hudScene: string;
}

const RAW_BTS_ITEMS: BtsItem[] = [
  {
    id: 'bts-01',
    title: 'PRECISION TRACKING & TELEMETRY',
    format: 'landscape',
    videoUrl: '/assets/bts/bts-01.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    width: 390,
    height: 240,
    hudCamera: 'ARRI ALEXA MINI LF',
    hudLens: '35MM T1.3',
    hudIso: '800 ISO',
    hudFps: '24 FPS',
    hudScene: 'RIG // CAR-01',
  },
  {
    id: 'bts-02',
    title: 'DYNAMIC GIMBAL PACING',
    format: 'portrait',
    videoUrl: '/assets/bts/bts-02.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop',
    width: 250,
    height: 420,
    hudCamera: 'RED V-RAPTOR 8K',
    hudLens: '21MM ULTRA-WIDE',
    hudIso: '1280 ISO',
    hudFps: '48 FPS',
    hudScene: 'REEL // SPEED-02',
  },
  {
    id: 'bts-03',
    title: 'ANAMORPHIC OUTDOOR UNIT',
    format: 'landscape',
    videoUrl: '/assets/bts/bts-03.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    width: 400,
    height: 245,
    hudCamera: 'SONY VENICE 2',
    hudLens: '50MM ANAMORPHIC',
    hudIso: '500 ISO',
    hudFps: '24 FPS',
    hudScene: 'EXTERIOR // WINTER',
  },
  {
    id: 'bts-04',
    title: '120 FPS VELOCITY MOTION CUE',
    format: 'portrait',
    videoUrl: '/assets/bts/bts-04.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    width: 250,
    height: 420,
    hudCamera: 'PHANTOM FLEX 4K',
    hudLens: '85MM MASTER PRIME',
    hudIso: '1600 ISO',
    hudFps: '120 FPS',
    hudScene: 'REEL // SPRINT-04',
  },
  {
    id: 'bts-05',
    title: 'MACRO OPTICS & HOUSING TEST',
    format: 'landscape',
    videoUrl: '/assets/bts/bts-05.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    width: 390,
    height: 240,
    hudCamera: 'DIRECTOR MONITOR',
    hudLens: '100MM MACRO',
    hudIso: '400 ISO',
    hudFps: '60 FPS',
    hudScene: 'UNDERWATER // HOUSING',
  },
  {
    id: 'bts-06',
    title: 'STEADICAM RAPID CHOREOGRAPHY',
    format: 'portrait',
    videoUrl: '/assets/bts/bts-06.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    width: 250,
    height: 420,
    hudCamera: 'STEADICAM M-2',
    hudLens: '28MM T2.0',
    hudIso: '800 ISO',
    hudFps: '24 FPS',
    hudScene: 'ACTION // CUE-06',
  },
  {
    id: 'bts-07',
    title: 'TELEPHOTO APERTURE & FOCUS PULL',
    format: 'landscape',
    videoUrl: '/assets/bts/bts-07.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    width: 400,
    height: 245,
    hudCamera: 'CANON C500 MK II',
    hudLens: '200MM T2.8',
    hudIso: '640 ISO',
    hudFps: '24 FPS',
    hudScene: 'LONG RANGE // FOCUS',
  },
  {
    id: 'bts-08',
    title: 'TALENT STAGING & CLOSEUP CUES',
    format: 'portrait',
    videoUrl: '/assets/bts/bts-08.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    width: 250,
    height: 420,
    hudCamera: 'DIRECTOR VIEWFINDER',
    hudLens: '50MM COOKE',
    hudIso: '400 ISO',
    hudFps: '24 FPS',
    hudScene: 'STUDIO // CLOSEUP',
  },
];

export default function BtsArcSection() {
  const [items, setItems] = useState<BtsItem[]>(RAW_BTS_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<BtsItem | null>(null);
  const [unmutedId, setUnmutedId] = useState<string | null>(null);
  const [timecode, setTimecode] = useState('00:14:28:12');

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragCurrentXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const isInteractingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);

  // Client-side random shuffle on every load
  useEffect(() => {
    const shuffled = [...RAW_BTS_ITEMS].sort(() => Math.random() - 0.5);
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

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isInteractingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragCurrentXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isInteractingRef.current) return;
    dragCurrentXRef.current = e.clientX;
    const deltaX = e.clientX - dragStartXRef.current;
    dragOffsetRef.current = deltaX;

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 8) {
      velocityRef.current = (e.clientX - lastXRef.current) / dt;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    setIsDragging(false);

    const deltaX = dragOffsetRef.current;
    const v = velocityRef.current;
    dragOffsetRef.current = 0;

    // Threshold to shift card
    if (deltaX < -60 || v < -0.4) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    } else if (deltaX > 60 || v > 0.4) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  }, [items.length]);

  const slidePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const slideNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnmutedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="bts-direction"
      className="w-full relative py-12 md:py-20 bg-canvas overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 3D Curved Arc Stage - Height tuned for tallest card */}
      <div
        ref={containerRef}
        className="w-full relative flex items-center justify-center min-h-[480px] md:min-h-[540px] px-4"
        style={{
          perspective: '1300px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Navigation Arrows (Subtle floating pills on desktop) */}
        <button
          type="button"
          onClick={slidePrev}
          aria-label="Previous reel"
          className="hidden md:flex absolute left-6 z-40 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-primary shadow-lg border border-black/10 backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={slideNext}
          aria-label="Next reel"
          className="hidden md:flex absolute right-6 z-40 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-primary shadow-lg border border-black/10 backdrop-blur-md items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 3D Arc Elements Array */}
        <div
          className="relative w-full max-w-7xl h-[460px] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {items.map((item, index) => {
            const count = items.length;
            // Calculate signed distance d from currentIndex (-count/2 to +count/2)
            let d = (index - currentIndex) % count;
            if (d > count / 2) d -= count;
            if (d < -count / 2) d += count;

            // Only render cards within visual arc field (|d| <= 3)
            const isVisible = Math.abs(d) <= 3;
            if (!isVisible) return null;

            // 3D Rainbow Arch Math (from reference media_1788612612711.png)
            // Center is peak (Y=0, Z=0). Sides curve downwards and backwards in depth.
            const isCenter = d === 0;
            const xSpacing = 290; // px spacing horizontally
            const posX = d * xSpacing;
            
            // Rainbow convex arch: center is highest, flanks drop down smoothly
            const posY = Math.pow(Math.abs(d), 1.9) * 22; // 0, 22px, 80px, 175px
            
            // Z depth pushes into background on edges
            const posZ = -Math.pow(Math.abs(d), 1.4) * 85; // 0, -85px, -220px...

            // Rotate Y: turn inward toward center cylinder
            const rotY = -d * 14; // -14deg, 0deg, +14deg

            // Rotate Z: slight roll along the rainbow dome curve
            const rotZ = d * 2.8;

            // Scale & Opacity
            const scale = Math.max(0.72, 1.04 - Math.abs(d) * 0.09);
            const opacity = Math.max(0.55, 1 - Math.abs(d) * 0.14);
            const zIndex = 50 - Math.round(Math.abs(d) * 10);

            return (
              <div
                key={item.id}
                className="absolute top-1/2 left-1/2 transition-all duration-500 ease-out"
                style={{
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  transform: `translate(-50%, -50%) translate3d(${posX}px, ${posY}px, ${posZ}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                }}
              >
                {/* Cinema Video Frame */}
                <div
                  className={`group relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl transition-all duration-300 ${
                    isCenter
                      ? 'ring-2 ring-black/40 shadow-[0_25px_60px_rgba(0,0,0,0.35)]'
                      : 'ring-1 ring-black/10 hover:ring-black/30'
                  }`}
                  onClick={() => {
                    if (isCenter) {
                      setActiveModalItem(item);
                    } else {
                      setCurrentIndex(index);
                    }
                  }}
                >
                  {/* HTML5 Video with Local MP4 Stream */}
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

                  {/* High-End Dark Cinematic Vignette */}
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

                  {/* Center Director Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 group-hover:opacity-75 transition-opacity duration-300">
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
