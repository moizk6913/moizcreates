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

    let animId: number | null = null;

    const animate = () => {
      const diffDotX = mousePos.current.x - dotPos.current.x;
      const diffDotY = mousePos.current.y - dotPos.current.y;
      const diffRingX = mousePos.current.x - ringPos.current.x;
      const diffRingY = mousePos.current.y - ringPos.current.y;

      dotPos.current.x += diffDotX * 0.45;
      dotPos.current.y += diffDotY * 0.45;

      ringPos.current.x += diffRingX * 0.16;
      ringPos.current.y += diffRingY * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      // Put RAF to sleep if cursor has caught up and settled (zero idle CPU waste)
      if (Math.abs(diffRingX) > 0.1 || Math.abs(diffRingY) > 0.1) {
        animId = requestAnimationFrame(animate);
      } else {
        animId = null;
      }
    };

    const wakeCursor = () => {
      if (!animId) {
        animId = requestAnimationFrame(animate);
      }
    };

    const onMouseMoveWithWake = (e: MouseEvent) => {
      onMouseMove(e);
      wakeCursor();
    };

    window.removeEventListener('mousemove', onMouseMove);
    window.addEventListener('mousemove', onMouseMoveWithWake, { passive: true });

    animId = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMouseMoveWithWake);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', handleElementHover);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  if (isTouchDevice) return null;

  // Determine ring styling and dimensions based on state
  let ringStyle = 'w-2 h-2 -ml-1 -mt-1 border-transparent bg-transparent opacity-0 scale-50';
  let dotStyle = 'w-2.5 h-2.5 -ml-[5px] -mt-[5px] bg-[#1b00ff] opacity-100 shadow-[0_0_8px_rgba(27,0,255,0.4)]';

  if (variant === 'link') {
    ringStyle = 'w-12 h-12 -ml-6 -mt-6 border border-black/15 bg-black/[0.04] opacity-100 scale-100';
    dotStyle = 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-[#1b00ff] opacity-60';
  } else if (variant === 'view') {
    ringStyle = 'w-24 h-24 -ml-12 -mt-12 border-transparent bg-[#1b00ff] text-white shadow-2xl opacity-100 scale-100';
    dotStyle = 'opacity-0';
  } else if (variant === 'shuffle') {
    ringStyle = 'w-28 h-28 -ml-14 -mt-14 border-transparent bg-black text-white shadow-2xl opacity-100 scale-100';
    dotStyle = 'opacity-0';
  } else if (variant === 'drag') {
    ringStyle = 'w-20 h-20 -ml-10 -mt-10 border-transparent bg-[#1b00ff]/90 backdrop-blur-sm text-white opacity-100 scale-100';
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
