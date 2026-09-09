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
    // Detect touch-only device (pointer: coarse without fine pointer)
    const isCoarseOnly = window.matchMedia('(pointer: coarse) and (hover: none)').matches;
    if (isCoarseOnly) {
      setIsTouchDevice(true);
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible((prev) => (prev ? prev : true));
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
          setCustomText(cursorTarget.getAttribute('data-cursor-text') || 'VIEW');
          return;
        }
        if (val === 'shuffle') {
          setVariant('shuffle');
          setCustomText(cursorTarget.getAttribute('data-cursor-text') || 'POP');
          return;
        }
        if (val === 'drag') {
          setVariant('drag');
          setCustomText('DRAG');
          return;
        }
      }

      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
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

    let animId: number;
    const animate = () => {
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.45;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.45;

      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.16;

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
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', handleElementHover);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (isTouchDevice) return null;

  // Determine ring styling and dimensions based on state
  // Default: Ring is hidden/scaled to dot so no hollow circle floats awkwardly over text
  let ringStyle = 'w-2 h-2 -ml-1 -mt-1 border-transparent bg-transparent opacity-0 scale-50';
  let dotStyle = 'w-2.5 h-2.5 -ml-[5px] -mt-[5px] bg-accent-red opacity-100 shadow-[0_0_8px_rgba(255,42,42,0.4)]';

  if (variant === 'link') {
    ringStyle = 'w-12 h-12 -ml-6 -mt-6 border border-black/15 bg-black/[0.04] opacity-100 scale-100';
    dotStyle = 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-accent-red opacity-60';
  } else if (variant === 'view') {
    ringStyle = 'w-24 h-24 -ml-12 -mt-12 border-transparent bg-accent-red text-white shadow-2xl opacity-100 scale-100';
    dotStyle = 'opacity-0';
  } else if (variant === 'shuffle') {
    ringStyle = 'w-28 h-28 -ml-14 -mt-14 border-transparent bg-primary text-white shadow-2xl opacity-100 scale-100';
    dotStyle = 'opacity-0';
  } else if (variant === 'drag') {
    ringStyle = 'w-20 h-20 -ml-10 -mt-10 border-transparent bg-primary/90 backdrop-blur-sm text-white opacity-100 scale-100';
    dotStyle = 'opacity-0';
  }

  if (isClicking) {
    ringStyle += ' scale-90';
    dotStyle += ' scale-125';
  }

  if (isTouchDevice) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Outer Follower Ring (CSS transition strictly on dimensions/color/opacity - NEVER transform) */}
      <div
        ref={ringRef}
        className={`absolute top-0 left-0 rounded-full flex items-center justify-center will-change-transform transition-[width,height,margin,background-color,border-color,opacity] duration-200 ease-out select-none ${ringStyle}`}
      >
        {customText && (
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-center px-1 animate-fadeIn">
            {customText}
          </span>
        )}
      </div>

      {/* Inner Pinpoint Dot (CSS transition strictly on opacity/color - NEVER transform) */}
      <div
        ref={dotRef}
        className={`absolute top-0 left-0 rounded-full will-change-transform transition-[opacity,background-color] duration-150 ease-out select-none ${dotStyle}`}
      />
    </div>
  );
}
