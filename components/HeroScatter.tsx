'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface HeroScatterProps {
  onOpenCase: (id: string) => void;
  onShutterFinish?: () => void;
}

interface CloudItem {
  id: string;
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
  { id: 'easyhaibro', w: 82, h: 104, x: -8, y: -8, rot: -3, z: 12, depth: 1.4, img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 96, h: 56, x: 7, y: -9, rot: 4, z: 14, depth: 1.5, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 78, h: 96, x: 12, y: 5, rot: -4, z: 13, depth: 1.3, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 90, h: 58, x: -11, y: 7, rot: 5, z: 11, depth: 1.4, img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 68, h: 92, x: 0, y: -15, rot: -2, z: 10, depth: 1.3, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 64, h: 64, x: -3, y: 14, rot: 3, z: 11, depth: 1.2, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 88, h: 52, x: 16, y: -15, rot: -5, z: 12, depth: 1.4, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 72, h: 72, x: -17, y: -14, rot: 4, z: 10, depth: 1.3, img: '/assets/logo.png' },

  // Tier 2: Mid Constellation Ring (Medium cards, depth 0.9 - 1.2)
  { id: 'ruchi', w: 56, h: 76, x: -22, y: -6, rot: -4, z: 8, depth: 1.1, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 74, h: 46, x: 23, y: -7, rot: 5, z: 8, depth: 1.1, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 54, h: 70, x: -20, y: 12, rot: 3, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 72, h: 44, x: 22, y: 13, rot: -3, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 52, h: 68, x: -9, y: -23, rot: 5, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 70, h: 42, x: 9, y: -24, rot: -4, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 50, h: 66, x: -10, y: 22, rot: -5, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 68, h: 40, x: 10, y: 23, rot: 4, z: 6, depth: 0.9, img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 48, h: 48, x: 28, y: 3, rot: -6, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 50, h: 65, x: -28, y: 2, rot: 6, z: 7, depth: 1.0, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },

  // Tier 3: Expansive Galaxy Arms (Outer cards, depth 0.75 - 0.85)
  { id: 'ruchi', w: 46, h: 60, x: -33, y: -16, rot: -5, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 66, h: 38, x: 33, y: -17, rot: 4, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 45, h: 58, x: -32, y: 18, rot: 5, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 64, h: 36, x: 32, y: 19, rot: -4, z: 5, depth: 0.8, img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 44, h: 56, x: -18, y: -31, rot: 4, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 62, h: 36, x: 19, y: -30, rot: -5, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 45, h: 58, x: -18, y: 29, rot: -3, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 60, h: 38, x: 19, y: 30, rot: 4, z: 4, depth: 0.75, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 42, h: 42, x: 38, y: -6, rot: -4, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 42, h: 54, x: -38, y: -7, rot: 5, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 44, h: 44, x: 37, y: 11, rot: 3, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 44, h: 54, x: -37, y: 10, rot: -4, z: 4, depth: 0.8, img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop' },

  // Tier 4: Micro Satellite Stars (Tiny thumbnails, deep space, depth 0.5 - 0.65)
  { id: 'easyhaibro', w: 32, h: 40, x: -44, y: -22, rot: 6, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 40, h: 26, x: 44, y: -21, rot: -6, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 30, h: 38, x: -43, y: 24, rot: -5, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 38, h: 24, x: 43, y: 25, rot: 5, z: 3, depth: 0.6, img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 28, h: 36, x: -28, y: -36, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 36, h: 24, x: 28, y: -35, rot: 4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 28, h: 36, x: -27, y: 35, rot: 5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 36, h: 24, x: 27, y: 36, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 26, h: 34, x: -5, y: -36, rot: 3, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 34, h: 22, x: 5, y: -37, rot: -3, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 26, h: 34, x: -4, y: 37, rot: -4, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 34, h: 22, x: 4, y: 38, rot: 4, z: 2, depth: 0.5, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 30, h: 30, x: -47, y: 2, rot: 7, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
  { id: 'ruchi', w: 30, h: 30, x: 47, y: 3, rot: -7, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
  { id: 'oxymorons', w: 28, h: 36, x: -46, y: -10, rot: -5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop' },
  { id: 'easyhaibro', w: 34, h: 22, x: 46, y: -11, rot: 5, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 'windchasers', w: 28, h: 34, x: -45, y: 13, rot: 4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop' },
  { id: 'kaladhar', w: 34, h: 24, x: 45, y: 14, rot: -4, z: 2, depth: 0.55, img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop' }
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

interface PopCardItem {
  keyId: number;
  id: string;
  img: string;
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  z: number;
  depth: number;
  isVideo: boolean;
}

const popPresets = [
  { w: 92, h: 58, isVideo: true },
  { w: 68, h: 90, isVideo: false },
  { w: 78, h: 78, isVideo: false },
  { w: 104, h: 62, isVideo: true },
  { w: 58, h: 80, isVideo: false },
  { w: 84, h: 54, isVideo: false },
];

export default function HeroScatter({ onOpenCase, onShutterFinish }: HeroScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const shutterRef = useRef<HTMLDivElement>(null);

  const [cards] = useState<CloudItem[]>(initialCloudData);
  const [popCards, setPopCards] = useState<PopCardItem[]>([]);
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
      onShutterFinish?.();
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

  // 3. Dynamic Pop-Loop (Multi-size picture & video stacked on top, calm 1.8s gap)
  // Fulfills: "randome picture pop horhe kabhi picture ke upper picture ya picture ke upper video... 1 ya 2 secon ka gape hona chye"
  useEffect(() => {
    if (!isInteractive) return;

    const popInterval = setInterval(() => {
      topZRef.current += 1;
      poolIdxRef.current = (poolIdxRef.current + 1) % popAssetPool.length;
      const preset = popPresets[Math.floor(Math.random() * popPresets.length)];
      const asset = popAssetPool[poolIdxRef.current];

      // Spread across the full constellation field (-42vw to +42vw, -32vh to +32vh)
      // NEVER bunch in the middle over "MOIZ KHAN"
      let x = Math.random() * 84 - 42;
      let y = Math.random() * 64 - 32;

      // Keep the center title area clean (safe zone around MOIZ KHAN)
      if (Math.abs(x) < 18 && Math.abs(y) < 14) {
        if (Math.random() > 0.5) {
          x = (x < 0 ? -1 : 1) * (19 + Math.random() * 22);
        } else {
          y = (y < 0 ? -1 : 1) * (15 + Math.random() * 18);
        }
      }

      const newCard: PopCardItem = {
        keyId: Date.now() + Math.random(),
        id: 'easyhaibro',
        img: asset,
        w: preset.w,
        h: preset.h,
        x,
        y,
        rot: Math.random() * 12 - 6,
        z: topZRef.current,
        depth: 1.1 + Math.random() * 0.4,
        isVideo: preset.isVideo,
      };

      setPopCards((prev) => {
        const next = [...prev, newCard];
        if (next.length > 6) {
          return next.slice(next.length - 6);
        }
        return next;
      });
    }, 1800);

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
      className="relative w-full h-screen min-h-screen bg-canvas overflow-hidden flex flex-col justify-between border-none select-none"
    >
      {/* Delicate Dotted Background Grid (Smoothly fades in ONLY after initial shutter completes) */}
      <div
        className={`absolute inset-0 pointer-events-none bg-[radial-gradient(#d5d3cc_1.1px,transparent_1.1px)] [background-size:28px_28px] transition-opacity duration-700 ease-out z-[1] ${
          shutterActive ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* Central Artist Identity (Revealed cleanly after shutter dissolves) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-[2] select-none flex flex-col items-center justify-center gap-0.5 transition-all duration-700 ease-out ${
          shutterActive ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
      >
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.02em] text-primary uppercase leading-[0.7]">
          MOIZ KHAN
        </h1>
        <p className="font-mono text-[11px] sm:text-xs md:text-sm tracking-[-0.02em] text-secondary uppercase font-medium">
          ART DIRECTOR &amp; BRAND VISUAL DESIGNER
        </p>
        <span className="font-mono text-[10px] sm:text-xs tracking-[-0.02em] text-muted">
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

      {/* Constellation Cards & Cluster Pop Layer Stage (ZERO Drop Shadows) */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {/* 48 Constellation Cards */}
        {cards.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            onClick={() => onOpenCase(item.id)}
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

        {/* Dynamic Multi-Size Pop Loop Cards (Layered on top with video badges, zero drop shadow) */}
        {popCards.map((pop) => (
          <div
            key={pop.keyId}
            onClick={() => onOpenCase(pop.id)}
            style={{
              left: `calc(50% + ${pop.x.toFixed(1)}vw)`,
              top: `calc(50% + ${pop.y.toFixed(1)}vh)`,
              width: `${pop.w}px`,
              height: 'auto',
              zIndex: pop.z,
              transform: `translate(-50%, -50%) rotate(${pop.rot.toFixed(1)}deg)`,
            }}
            className="absolute cursor-pointer pointer-events-auto group animate-spring-pop"
          >
            <div
              style={{ height: `${pop.h}px` }}
              className="relative w-full bg-[#111] overflow-hidden shadow-none transition-transform duration-300 group-hover:scale-120 group-hover:z-[250]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pop.img}
                alt="Pop Still"
                className="w-full h-full object-cover block border-0 outline-none"
                loading="lazy"
              />
              {pop.isVideo && (
                <span className="absolute bottom-1 right-1 w-[18px] h-[18px] rounded-full bg-[#ff2a2a] text-white flex items-center justify-center text-[8px] pl-[1px] pointer-events-none">
                  ▶
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* White gradient fading upside down to cover dots seamlessly at the bottom of hero */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none z-20" />
    </section>
  );
}
