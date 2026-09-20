'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

const DISCIPLINES = [
  'ART DIRECTION',
  'BRAND IDENTITY',
  'CINEMATOGRAPHY',
  'MOTION GRAPHICS',
  'EDITORIAL REELS',
  'VISUAL ARCHITECTURE',
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [disciplineIndex, setDisciplineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const curtainRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check session storage — if user already saw intro this session, dismiss immediately
    if (typeof window !== 'undefined') {
      const alreadySeen = sessionStorage.getItem('moiz_intro_completed');
      if (alreadySeen === 'true') {
        setIsVisible(false);
        onComplete?.();
        return;
      }
    }

    // Lock body scroll during preloader
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cycle disciplines smoothly
    const disciplineInterval = setInterval(() => {
      setDisciplineIndex((prev) => (prev + 1) % DISCIPLINES.length);
    }, 220);

    // Smooth numerical counter progression (00 -> 100%)
    let currentProgress = 0;
    const startTime = performance.now();
    const duration = 1200; // ms

    const counterStep = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease in-out cubic progression for realistic luxury feel
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      currentProgress = Math.floor(ease * 100);
      setProgress(currentProgress);

      if (lineRef.current) {
        lineRef.current.style.width = `${currentProgress}%`;
      }

      if (t < 1) {
        requestAnimationFrame(counterStep);
      } else {
        clearInterval(disciplineInterval);
        setProgress(100);

        // Curtain reveal animation: sleek upward sweep
        setTimeout(() => {
          if (curtainRef.current) {
            gsap.to(curtainRef.current, {
              yPercent: -100,
              duration: 0.85,
              ease: 'power3.inOut',
              onComplete: () => {
                setIsVisible(false);
                document.body.style.overflow = prevBodyOverflow;
                document.documentElement.style.overflow = prevHtmlOverflow;
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('moiz_intro_completed', 'true');
                }
                onComplete?.();
              },
            });
          }
        }, 150);
      }
    };

    const animFrame = requestAnimationFrame(counterStep);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(disciplineInterval);
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
      {/* Top Bar: Artist Branding & Archive Metadata */}
      <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase text-neutral-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#1b00ff] animate-pulse" />
          <span className="font-bold text-white tracking-wider">MOIZ KHAN</span>
        </div>
        <span className="text-neutral-500 hidden sm:inline-block">
          DIRECTORIAL ARCHIVE // 2022–2026
        </span>
      </div>

      {/* Center Stage: High-Fashion Discipline Cycler & Counter */}
      <div className="my-auto flex flex-col items-center justify-center text-center space-y-4">
        {/* Discipline tag ticker */}
        <div className="h-6 overflow-hidden flex items-center justify-center">
          <span className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-neutral-400 transition-all duration-150">
            {DISCIPLINES[disciplineIndex]}
          </span>
        </div>

        {/* Large Elegant Monospace Counter */}
        <div className="font-display font-black text-6xl sm:text-8xl md:text-9xl tracking-tighter text-white tabular-nums leading-none">
          {String(progress).padStart(2, '0')}
          <span className="text-2xl sm:text-4xl text-[#1b00ff] font-sans font-light ml-1">%</span>
        </div>

        <p className="font-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest pt-2">
          INITIALIZING SPATIAL REPERTORY
        </p>
      </div>

      {/* Bottom Bar: Architectural Progress Line & Copyright */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          <span>PORTFOLIO PLATFORM</span>
          <span>DUBAI // WORLDWIDE</span>
        </div>
        {/* 1px Architectural Track Line */}
        <div className="relative w-full h-[1.5px] bg-white/10 rounded-full overflow-hidden">
          <div
            ref={lineRef}
            className="absolute left-0 top-0 bottom-0 bg-[#1b00ff] transition-none w-0"
          />
        </div>
      </div>
    </div>
  );
}
