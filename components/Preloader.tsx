'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const curtainRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll during preloader
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Smooth numerical counter progression (00 -> 100%)
    let currentProgress = 0;
    const startTime = performance.now();
    const duration = 1400; // ms for satisfying animation playback

    const counterStep = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Luxury ease-out progression
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      currentProgress = Math.floor(ease * 100);
      setProgress(currentProgress);

      if (lineRef.current) {
        lineRef.current.style.width = `${currentProgress}%`;
      }

      if (t < 1) {
        requestAnimationFrame(counterStep);
      } else {
        setProgress(100);

        // Curtain reveal animation: sleek upward sweep
        setTimeout(() => {
          if (curtainRef.current) {
            gsap.to(curtainRef.current, {
              yPercent: -100,
              duration: 0.8,
              ease: 'power3.inOut',
              onComplete: () => {
                setIsVisible(false);
                document.body.style.overflow = prevBodyOverflow;
                document.documentElement.style.overflow = prevHtmlOverflow;
                onComplete?.();
              },
            });
          }
        }, 200);
      }
    };

    const animFrame = requestAnimationFrame(counterStep);

    return () => {
      cancelAnimationFrame(animFrame);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[999999] bg-[#0c0c0e] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 select-none pointer-events-auto will-change-transform"
      aria-label="Loading screen"
    >
      {/* Top Bar: Artist Branding */}
      <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase text-neutral-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-bold text-white tracking-wider">MOIZ KHAN</span>
        </div>
        <span className="text-neutral-500 font-mono text-[11px] tracking-widest">
          PORTFOLIO ARCHIVE
        </span>
      </div>

      {/* Center Stage: The Hero Animated GIF Loading Showcase */}
      <div className="my-auto flex flex-col items-center justify-center text-center space-y-6">
        {/* Animated GIF Card */}
        <div className="relative w-[85vw] max-w-[420px] aspect-[16/9] bg-white rounded-3xl p-3 sm:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden border border-white/20">
          <img
            src="/frame-13.gif"
            alt="Loading animation"
            className="w-full h-full object-contain select-none pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://eztcznarhdmpfurrtbgx.supabase.co/storage/v1/object/public/portfolio-media/images/Frame_13.gif';
            }}
          />
        </div>

        {/* Minimal Progress Bar & Counter */}
        <div className="w-[85vw] max-w-[280px] flex flex-col items-center space-y-3">
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div
              ref={lineRef}
              className="absolute left-0 top-0 bottom-0 bg-white transition-none w-0 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between w-full text-neutral-400 font-mono text-xs tracking-wider">
            <span className="text-neutral-500 text-[10px] uppercase tracking-widest">LOADING</span>
            <span className="tabular-nums font-bold text-white">{String(progress).padStart(2, '0')}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
        <span>DIRECTORIAL ARCHIVE</span>
        <span>HYDERABAD // WORLDWIDE</span>
      </div>
    </div>
  );
}
