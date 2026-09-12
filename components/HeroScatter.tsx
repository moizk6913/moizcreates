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

// 48 Curated Constellation Galaxy Cards (Images 1, 2, 3, 4 reference — expansive multi-depth array)
const initialCloudData: CloudItem[] = [
  // Tier 1: Core Inner Ring (Hero focal pieces, depth 1.3 - 1.5)
  { id: 'card-1', w: 82, h: 104, x: -8, y: -8, rot: -3, z: 12, depth: 1.4, img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-2', w: 96, h: 56, x: 7, y: -9, rot: 4, z: 14, depth: 1.5, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-3', w: 78, h: 96, x: 12, y: 5, rot: -4, z: 13, depth: 1.3, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-4', w: 90, h: 58, x: -11, y: 7, rot: 5, z: 11, depth: 1.4, img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-5', w: 68, h: 92, x: 0, y: -15, rot: -2, z: 10, depth: 1.3, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-6', w: 64, h: 64, x: -3, y: 14, rot: 3, z: 11, depth: 1.2, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-7', w: 88, h: 52, x: 16, y: -15, rot: -5, z: 12, depth: 1.4, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-8', w: 72, h: 72, x: -17, y: -14, rot: 4, z: 10, depth: 1.3, img: '/assets/logo.png' },

  // Tier 2: Mid Constellation Ring (Medium cards, depth 0.9 - 1.2)
  { id: 'card-9', w: 56, h: 76, x: -22, y: -6, rot: -4, z: 8, depth: 1.1, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-10', w: 74, h: 46, x: 23, y: -7, rot: 5, z: 8, depth: 1.1, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-11', w: 54, h: 70, x: -20, y: 12, rot: 3, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-12', w: 72, h: 44, x: 22, y: 13, rot: -3, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-13', w: 52, h: 68, x: -9, y: -23, rot: 5, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-14', w: 70, h: 42, x: 9, y: -24, rot: -4, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-15', w: 50, h: 66, x: -10, y: 22, rot: -5, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-16', w: 68, h: 40, x: 10, y: 23, rot: 4, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-17', w: 48, h: 48, x: 28, y: 3, rot: -6, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-18', w: 50, h: 65, x: -28, y: 2, rot: 6, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },

  // Tier 3: Expansive Galaxy Arms (Outer cards, depth 0.75 - 0.85)
  { id: 'card-19', w: 46, h: 60, x: -33, y: -16, rot: -5, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-20', w: 66, h: 38, x: 33, y: -17, rot: 4, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-21', w: 45, h: 58, x: -32, y: 18, rot: 5, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-22', w: 64, h: 36, x: 32, y: 19, rot: -4, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-23', w: 44, h: 56, x: -18, y: -31, rot: 4, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-24', w: 62, h: 36, x: 19, y: -30, rot: -5, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-25', w: 45, h: 58, x: -18, y: 29, rot: -3, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-26', w: 60, h: 38, x: 19, y: 30, rot: 4, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-27', w: 42, h: 42, x: 38, y: -6, rot: -4, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-28', w: 42, h: 54, x: -38, y: -7, rot: 5, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-29', w: 44, h: 44, x: 37, y: 11, rot: 3, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-30', w: 44, h: 54, x: -37, y: 10, rot: -4, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop' },

  // Tier 4: Micro Satellite Stars (Tiny thumbnails, deep space, depth 0.5 - 0.65)
  { id: 'card-31', w: 32, h: 40, x: -44, y: -22, rot: 6, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-32', w: 40, h: 26, x: 44, y: -21, rot: -6, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-33', w: 30, h: 38, x: -43, y: 24, rot: -5, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-34', w: 38, h: 24, x: 43, y: 25, rot: 5, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-35', w: 28, h: 36, x: -28, y: -36, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-36', w: 36, h: 24, x: 28, y: -35, rot: 4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-37', w: 28, h: 36, x: -27, y: 35, rot: 5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-38', w: 36, h: 24, x: 27, y: 36, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-39', w: 26, h: 34, x: -5, y: -36, rot: 3, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-40', w: 34, h: 22, x: 5, y: -37, rot: -3, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-41', w: 26, h: 34, x: -4, y: 37, rot: -4, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-42', w: 34, h: 22, x: 4, y: 38, rot: 4, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-43', w: 30, h: 30, x: -47, y: 2, rot: 7, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-44', w: 30, h: 30, x: 47, y: 3, rot: -7, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-45', w: 28, h: 36, x: -46, y: -10, rot: -5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-46', w: 34, h: 22, x: 46, y: -11, rot: 5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-47', w: 28, h: 34, x: -45, y: 13, rot: 4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop' },
  { id: 'card-48', w: 34, h: 24, x: 45, y: 14, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop' }
];

const popAssetPool = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600&auto=format&fit=crop',
  '/assets/logo.png',
];

export default function HeroScatter({ onOpenCase, uploadedFiles, userPhotos }: HeroScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const shutterRef = useRef<HTMLDivElement>(null);

  const [cards] = useState<CloudItem[]>(initialCloudData);
  const [shutterIndex, setShutterIndex] = useState(0);
  const [shutterActive, setShutterActive] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);

  const topZRef = useRef(35);
  const poolIdxRef = useRef(0);

  // 1. Shutter rapid cycling during the first 1s
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setShutterIndex((prev) => (prev + 1) % cards.length);
    }, 70);

    const timer = setTimeout(() => {
      clearInterval(cycleInterval);
      setShutterActive(false);
    }, 1000);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timer);
    };
  }, [cards.length]);

  // 2. Shatter Explosion Entrance (bursts from center scale 0 into full constellation)
  useGSAP(
    () => {
      if (!shutterActive) {
        // Shutter shrink out with zero drop shadow
        if (shutterRef.current) {
          gsap.to(shutterRef.current, {
            scale: 0.1,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.inOut',
            onComplete: () => {
              if (shutterRef.current) shutterRef.current.style.display = 'none';
            },
          });
        }

        // Staggered pop-in burst for all 48 cards
        cardRefs.current.forEach((el, idx) => {
          if (!el) return;
          const item = cards[idx];
          gsap.fromTo(
            el,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              rotation: item.rot,
              duration: 0.6,
              delay: idx * 0.016,
              ease: 'back.out(1.25)',
              onComplete: () => {
                if (idx === cards.length - 1) {
                  setIsInteractive(true);
                }
              },
            }
          );
        });
      }
    },
    { dependencies: [shutterActive], scope: containerRef }
  );

  // 3. Dynamic Pop-Loop (Picture on top of picture with spring pop, zero drop shadow)
  useEffect(() => {
    if (!isInteractive) return;

    const popInterval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * cardRefs.current.length);
      const el = cardRefs.current[randIdx];
      const img = imgRefs.current[randIdx];
      if (!el || !img) return;

      topZRef.current += 1;
      el.style.zIndex = topZRef.current.toString();

      poolIdxRef.current = (poolIdxRef.current + 1) % popAssetPool.length;
      img.src = popAssetPool[poolIdxRef.current];

      // Spring pop bounce
      gsap.to(el, {
        scale: 1.16,
        duration: 0.25,
        ease: 'back.out(1.4)',
        onComplete: () => {
          gsap.to(el, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        },
      });
    }, 2400);

    return () => clearInterval(popInterval);
  }, [isInteractive]);

  // 4. Multi-Plane 3D Parallax on Mouse Move (ACTIVITY STRICTLY ON MOUSE MOVE — ZERO IDLE JIGGLE)
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
        if (!el || shutterActive) return;
        const item = cards[idx];
        const offsetX = curNormX * 22 * item.depth;
        const offsetY = curNormY * 16 * item.depth;

        el.style.transform = `translate(calc(-50% + ${offsetX.toFixed(2)}px), calc(-50% + ${offsetY.toFixed(2)}px)) rotate(${item.rot}deg) scale(1)`;
      });

      // Stop RAF when movement settles to zero (zero idle jiggle)
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shutterActive, cards]);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative w-full h-screen min-h-screen bg-canvas bg-[radial-gradient(#d5d3cc_1.1px,transparent_1.1px)] [background-size:28px_28px] overflow-hidden flex flex-col justify-between  select-none"
    >
      {/* Central Artist Identity (Simon Wheatley Reference / Image 4) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-[2] select-none opacity-90 flex flex-col items-center justify-center gap-1">
        <h1 className="font-dharma font-bold text-6xl sm:text-8xl md:text-9xl tracking-tight text-primary uppercase leading-[0.82]">
          MOIZ KHAN
        </h1>
        <p className="font-mono text-[11px] sm:text-xs md:text-sm tracking-[0.14em] text-secondary uppercase">
          ART DIRECTOR &amp; BRAND VISUAL DESIGNER
        </p>
        <span className="font-mono text-[10px] sm:text-xs tracking-wider text-muted">
          (SELECTED ARCHIVE 2022–2026)
        </span>
      </div>

      {/* 88x88 Center Loading Shutter (Active First 1s, ZERO drop shadow) */}
      <div
        ref={shutterRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88px] h-[88px] z-50 bg-black overflow-hidden shadow-none pointer-events-none border-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cards[shutterIndex]?.img}
          alt="Shutter Preview"
          className="w-full h-full object-cover block border-0"
        />
      </div>

      {/* 48 Constellation Cards Stage (ZERO Drop Shadows) */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {cards.map((item, idx) => (
          <div
            key={idx}
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
          >
            <div
              style={{ height: `${item.h}px` }}
              className="relative w-full bg-[#111] overflow-hidden shadow-none transition-transform duration-300 group-hover:scale-125 group-hover:z-[100]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                src={item.img}
                alt="Director Still"
                className="w-full h-full object-cover block border-0 outline-none"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
