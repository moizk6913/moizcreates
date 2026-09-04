'use client';

import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'link' | 'view' | 'shuffle' | 'drag';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });

  const [variant, setVariant] = useState<CursorVariant>('default');
  const [customText, setCustomText] = useState<string>('');
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        const val = cursorTarget.getAttribute('data-cursor');
        if (val === 'view') {
          setVariant('view');
          setCustomText(cursorTarget.getAttribute('data-cursor-text') || 'VIEW ↗');
          return;
        }
        if (val === 'shuffle') {
          setVariant('shuffle');
          setCustomText(cursorTarget.getAttribute('data-cursor-text') || 'SHUFFLE ⟳');
          return;
        }
        if (val === 'drag') {
          setVariant('drag');
          setCustomText('DRAG');
          return;
        }
      }

      // Check standard interactive elements
      const interactive = target.closest('a, button, [role="button"], input, textarea, select');
      if (interactive) {
        setVariant('link');
        setCustomText('');
        return;
      }

      setVariant('default');
      setCustomText('');
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', handleElementHover, { passive: true });

    // Smooth LERP Animation Loop
    let animId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      // Dot follows very fast
      dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, 0.65);
      dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, 0.65);

      // Ring lags with fluid damping
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.16);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.16);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', handleElementHover);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (isTouchDevice) return null;

  // Determine ring styling and dimensions based on state
  let ringStyle = 'w-9 h-9 -ml-[18px] -mt-[18px] border border-black/40 bg-transparent';
  let dotStyle = 'w-2 h-2 -ml-1 -mt-1 bg-accent-red opacity-100';

  if (variant === 'link') {
    ringStyle = 'w-14 h-14 -ml-7 -mt-7 border-border-medium bg-black/5 scale-110';
    dotStyle = 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-accent-red opacity-60';
  } else if (variant === 'view') {
    ringStyle = 'w-24 h-24 -ml-12 -mt-12 border-transparent bg-accent-red text-white shadow-2xl scale-100';
    dotStyle = 'opacity-0';
  } else if (variant === 'shuffle') {
    ringStyle = 'w-28 h-28 -ml-14 -mt-14 border-transparent bg-primary text-white shadow-2xl scale-100';
    dotStyle = 'opacity-0';
  } else if (variant === 'drag') {
    ringStyle = 'w-20 h-20 -ml-10 -mt-10 border-transparent bg-primary/90 backdrop-blur-sm text-white scale-100';
    dotStyle = 'opacity-0';
  }

  if (isClicking) {
    ringStyle += ' scale-75';
    dotStyle += ' scale-125';
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Outer Follower Ring */}
      <div
        ref={ringRef}
        className={`absolute top-0 left-0 rounded-full flex items-center justify-center will-change-transform transition-[width,height,margin,background-color,border-color,transform] duration-200 ease-out select-none ${ringStyle}`}
      >
        {customText && (
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-center px-1 animate-fadeIn">
            {customText}
          </span>
        )}
      </div>

      {/* Inner Pinpoint Dot */}
      <div
        ref={dotRef}
        className={`absolute top-0 left-0 rounded-full will-change-transform transition-[opacity,transform] duration-150 ease-out select-none ${dotStyle}`}
      />
    </div>
  );
}
