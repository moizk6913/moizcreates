'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll during preloader
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Timer for smooth animation playback before elegant fade-out
    const timer = setTimeout(() => {
      if (curtainRef.current) {
        gsap.to(curtainRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => {
            setIsVisible(false);
            document.body.style.overflow = prevBodyOverflow;
            document.documentElement.style.overflow = prevHtmlOverflow;
            onComplete?.();
          },
        });
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[999999] bg-[#f7f7f7] flex items-center justify-center p-4 sm:p-8 select-none pointer-events-auto will-change-[opacity]"
      aria-label="Loading"
    >
      {/* Pure Animated Truck on matching #f7f7f7 background — scaled 60% smaller */}
      <div className="relative w-[230px] sm:w-[270px] md:w-[300px] max-w-[85vw] aspect-[1023/575] flex items-center justify-center">
        <img
          src="/frame-13.gif"
          alt="Loading"
          className="w-full h-full object-contain select-none pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://eztcznarhdmpfurrtbgx.supabase.co/storage/v1/object/public/portfolio-media/images/Frame_13.gif';
          }}
        />
      </div>
    </div>
  );
}
