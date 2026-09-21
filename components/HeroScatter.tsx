'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DynamicCanvasFile } from '@/lib/contentStore';

interface HeroScatterProps {
  onOpenCase: (id: string) => void;
  uploadedFiles?: DynamicCanvasFile[];
  userPhotos?: string[];
}

interface CloudItem {
  id: string;
  projectId?: string;
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  z: number;
  depth: number;
  img: string;
}

// 40 Curated Constellation Galaxy Cards
// CALIBRATED SACRED TYPOGRAPHIC CORE: All cards are placed outside |x| >= 18vw or |y| >= 16vh
// Central zone is 100% UNTOUCHED so "MOIZ KHAN" commands the screen without overlap!
const initialCloudData: CloudItem[] = [
  // Ring 1: Mid Orbit (Framing the central title gracefully)
  { id: 'card-1', w: 82, h: 104, x: -24, y: -15, rot: -3, z: 12, depth: 1.3, img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-2', w: 96, h: 56, x: 24, y: -15, rot: 4, z: 14, depth: 1.4, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-3', w: 78, h: 96, x: 26, y: 14, rot: -4, z: 13, depth: 1.3, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-4', w: 90, h: 58, x: -25, y: 15, rot: 5, z: 11, depth: 1.3, img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-5', w: 68, h: 92, x: -8, y: -26, rot: -2, z: 10, depth: 1.2, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-6', w: 64, h: 64, x: 8, y: 25, rot: 3, z: 11, depth: 1.2, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-7', w: 88, h: 52, x: 18, y: -24, rot: -5, z: 12, depth: 1.3, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-8', w: 72, h: 72, x: -18, y: 25, rot: 4, z: 10, depth: 1.2, img: '/assets/logo.png' },

  // Ring 2: Mid Constellation Ring (Medium cards, depth 0.9 - 1.1)
  { id: 'card-9', w: 56, h: 76, x: -32, y: -8, rot: -4, z: 8, depth: 1.1, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-10', w: 74, h: 46, x: 33, y: -8, rot: 5, z: 8, depth: 1.1, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-11', w: 54, h: 70, x: -30, y: 16, rot: 3, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-12', w: 72, h: 44, x: 31, y: 16, rot: -3, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-13', w: 52, h: 68, x: -12, y: -32, rot: 5, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-14', w: 70, h: 42, x: 12, y: -32, rot: -4, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-15', w: 50, h: 66, x: -10, y: 31, rot: -5, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-16', w: 68, h: 40, x: 10, y: 32, rot: 4, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-17', w: 48, h: 48, x: 36, y: 4, rot: -6, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-18', w: 50, h: 65, x: -36, y: 3, rot: 6, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },

  // Ring 3: Expansive Galaxy Arms (Outer cards, depth 0.75 - 0.85)
  { id: 'card-19', w: 46, h: 60, x: -40, y: -18, rot: -5, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-20', w: 66, h: 38, x: 40, y: -18, rot: 4, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-21', w: 45, h: 58, x: -38, y: 22, rot: 5, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-22', w: 64, h: 36, x: 38, y: 22, rot: -4, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-23', w: 44, h: 56, x: -24, y: -34, rot: 4, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-24', w: 62, h: 36, x: 24, y: -34, rot: -5, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-25', w: 45, h: 58, x: -24, y: 34, rot: -3, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-26', w: 60, h: 38, x: 24, y: 34, rot: 4, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-27', w: 42, h: 42, x: 44, y: -6, rot: -4, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-28', w: 42, h: 54, x: -44, y: -6, rot: 5, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-29', w: 44, h: 44, x: 43, y: 13, rot: 3, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-30', w: 44, h: 54, x: -43, y: 12, rot: -4, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop' },

  // Ring 4: Micro Satellite Stars (Deep space, depth 0.5 - 0.65)
  { id: 'card-31', w: 32, h: 40, x: -47, y: -26, rot: 6, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-32', w: 40, h: 26, x: 47, y: -25, rot: -6, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-33', w: 30, h: 38, x: -46, y: 28, rot: -5, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-34', w: 38, h: 24, x: 46, y: 28, rot: 5, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-35', w: 28, h: 36, x: -33, y: -38, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-36', w: 36, h: 24, x: 33, y: -38, rot: 4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-37', w: 28, h: 36, x: -32, y: 38, rot: 5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-38', w: 36, h: 24, x: 32, y: 38, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-39', w: 26, h: 34, x: -2, y: -38, rot: 3, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-40', w: 34, h: 22, x: 2, y: 38, rot: -3, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
];

export default function HeroScatter({ onOpenCase }: HeroScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [cards] = useState<CloudItem[]>(initialCloudData);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Display subset on mobile to prevent dense clutter
  const displayedCards = isMobile ? cards.slice(0, 12) : cards;

  // Staggered pop-in burst for cards on mount
  useGSAP(
    () => {
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const item = displayedCards[idx];
        if (!item) return;
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            rotation: item.rot,
            duration: 0.65,
            delay: 0.1 + idx * 0.02,
            ease: 'back.out(1.25)',
          }
        );
      });
    },
    { dependencies: [displayedCards.length], scope: containerRef }
  );

  // Multi-Plane 3D Parallax on Mouse Move (Zero Idle Jiggle)
  useEffect(() => {
    let animId: number | null = null;
    let targetNormX = 0;
    let targetNormY = 0;
    let curNormX = 0;
    let curNormY = 0;

    const updateParallax = () => {
      const diffX = targetNormX - curNormX;
      const diffY = targetNormY - curNormY;
      curNormX += diffX * 0.08;
      curNormY += diffY * 0.08;

      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const item = displayedCards[idx];
        if (!item) return;
        const offsetX = curNormX * 22 * item.depth;
        const offsetY = curNormY * 16 * item.depth;

        el.style.transform = `translate(calc(-50% + ${offsetX.toFixed(2)}px), calc(-50% + ${offsetY.toFixed(2)}px)) rotate(${item.rot}deg) scale(1)`;
      });

      if (Math.abs(diffX) > 0.0005 || Math.abs(diffY) > 0.0005) {
        animId = requestAnimationFrame(updateParallax);
      } else {
        animId = null;
      }
    };

    const startParallax = () => {
      if (!animId) {
        animId = requestAnimationFrame(updateParallax);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetNormX = (e.clientX / innerWidth - 0.5) * 2;
      targetNormY = (e.clientY / innerHeight - 0.5) * 2;
      startParallax();
    };

    const handleMouseLeave = () => {
      targetNormX = 0;
      targetNormY = 0;
      startParallax();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [displayedCards]);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative w-full h-screen min-h-screen bg-canvas bg-[radial-gradient(#d5d3cc_1.1px,transparent_1.1px)] [background-size:28px_28px] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Central Artist Identity (SACRED TYPOGRAPHIC CORE — Always Uncluttered & Clear) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-40 select-none flex flex-col items-center justify-center gap-2 sm:gap-2.5 px-4 max-w-xl">
        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-primary uppercase leading-none drop-shadow-xs">
          MOIZ KHAN
        </h1>
        <div className="flex flex-col items-center gap-0.5">
          <p className="font-mono text-[11px] sm:text-xs md:text-sm tracking-[0.16em] text-secondary uppercase font-bold">
            BRAND VISUAL DESIGNER
          </p>
          <p className="font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.16em] text-secondary uppercase font-semibold">
            ART DIRECTION
          </p>
        </div>
        <span className="font-mono text-[10px] sm:text-xs tracking-[0.18em] text-neutral-400 font-medium pt-1">
          BRANDING · CAMPAIGNS · VISUAL PRODUCTION
        </span>
      </div>

      {/* Constellation Cards Stage (Orbital Framing with Zero Typography Collisions) */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {displayedCards.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            onClick={() => { if (item.projectId) onOpenCase(item.projectId); }}
            style={{
              left: `calc(50% + ${item.x}vw)`,
              top: `calc(50% + ${item.y}vh)`,
              width: `${item.w}px`,
              height: 'auto',
              zIndex: item.z,
              transform: `translate(-50%, -50%) rotate(${item.rot}deg) scale(0)`,
              opacity: 0,
              willChange: 'transform',
            }}
            className="absolute cursor-pointer pointer-events-auto group"
            data-cursor="view"
            data-cursor-text="INSPECT ↗"
          >
            <div
              style={{ height: `${item.h}px` }}
              className="relative w-full bg-[#111] apple-widget-sm rounded-[30px] overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-120 group-hover:z-[100]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                src={item.img}
                alt="Director Still"
                className="w-full h-full object-cover block border-0 outline-none select-none"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
