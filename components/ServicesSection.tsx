'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServiceRow {
  number: string;
  title: string;
  discipline: string;
  projectId?: string;
  quote: string;
  description: string;
  previewImage: string;
  tag: string;
}

const SERVICES: ServiceRow[] = [
  {
    number: '01',
    title: 'ART DIRECTION',
    discipline: 'Art Direction',
    projectId: 'art-direction',
    quote: 'When the idea needs a visual direction.',
    description:
      'Concepts, references, visual language, shoot direction and creative decisions from idea through execution.',
    previewImage:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80',
    tag: 'VISUAL DIRECTION',
  },
  {
    number: '02',
    title: 'BRAND IDENTITY',
    discipline: 'Brand Identity',
    projectId: 'brand-identity',
    quote: 'When a brand needs more than a logo.',
    description:
      'Identity systems, typography, visual language and the pieces that make a brand feel consistent.',
    previewImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80',
    tag: 'IDENTITY SYSTEMS',
  },
  {
    number: '03',
    title: 'CAMPAIGNS',
    discipline: 'Campaigns',
    projectId: 'cinematography',
    quote: 'When one idea needs to live everywhere.',
    description:
      'Campaign concepts, key visuals, advertising, social and digital executions.',
    previewImage:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&auto=format&fit=crop&q=80',
    tag: 'CAMPAIGN CONCEPTS',
  },
  {
    number: '04',
    title: 'CREATIVE PRODUCTION',
    discipline: 'Creative Production',
    projectId: 'motion-graphics',
    quote: 'When the idea has to leave the screen.',
    description:
      'Photography, video, social content and AI-assisted creative production.',
    previewImage:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&auto=format&fit=crop&q=80',
    tag: 'CREATIVE PRODUCTION',
  },
];

interface ServicesSectionProps {
  userPhotos?: string[];
  onOpenCase?: (id: string) => void;
}

export default function ServicesSection({ userPhotos, onOpenCase }: ServicesSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const followerRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0, rot: 0 });

  // Smooth mouse follower loop with velocity tilt (Zero lag, 120fps hardware acceleration)
  useEffect(() => {
    let animId: number;

    const animate = () => {
      const target = targetPosRef.current;
      const current = currentPosRef.current;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      const dx = target.x - current.x;
      const targetRot = Math.max(-6, Math.min(6, dx * 0.06));
      current.rot += (targetRot - current.rot) * 0.1;

      if (followerRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth || 1200;
        // Float to the right if in left 55% of container, float to left if in right 45%
        const isRightHalf = current.x > containerWidth * 0.55;
        const offsetX = isRightHalf ? -220 : 220;
        const offsetY = -40;

        followerRef.current.style.transform = `translate3d(${current.x + offsetX}px, ${current.y + offsetY}px, 0) translate(-50%, -50%) rotate(${current.rot}deg)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Smooth, non-intrusive scroll reveal
  useGSAP(
    () => {
      if (!containerRef.current) return;
      const rows = rowsRef.current.filter(Boolean) as HTMLDivElement[];
      if (rows.length === 0) return;

      gsap.fromTo(
        rows,
        {
          y: 45,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="services"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoveredIndex(null)}
      className="w-full py-16 sm:py-24 md:py-32 bg-white overflow-hidden select-none border-none relative"
    >
      {/* Floating Curated Visual Follower (Active on desktop, pure zero-color background) */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 z-30 w-[280px] sm:w-[340px] md:w-[390px] aspect-[16/10] apple-widget-md rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.22)] ring-1 ring-black/10 hidden md:block transition-[opacity,scale] duration-300 ease-out will-change-transform ${
          hoveredIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="relative w-full h-full bg-[#111]">
          {SERVICES.map((srv, idx) => (
            <div
              key={srv.number}
              className={`absolute inset-0 transition-opacity duration-400 ease-out ${
                hoveredIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              } transition-transform duration-700 ease-out`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userPhotos?.[idx] || srv.previewImage}
                alt={srv.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
              <div className="absolute top-4 left-4 z-10">
                <span className="font-mono text-[9px] font-bold px-2.5 py-1 apple-pill rounded-full bg-black/55 backdrop-blur-md text-white uppercase tracking-widest">
                  {srv.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. GIANT RUNNING HEADER (WHAT I DO) */}
      <div className="w-full pb-10 sm:pb-14 md:pb-20 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            WHAT I DO — WHAT I DO — WHAT I DO — WHAT I DO —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            WHAT I DO — WHAT I DO — WHAT I DO — WHAT I DO —
          </div>
        </div>
      </div>

      {/* 2. EDGE-ANCHORED RESPONSIVE ROWS (Pure canvas background, kinetic magnetic typography) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] space-y-2 sm:space-y-3 md:space-y-4">
        {SERVICES.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isAnyHovered = hoveredIndex !== null;
          const isDimmed = isAnyHovered && !isHovered;

          return (
            <div
              key={item.number}
              ref={(el) => {
                rowsRef.current[index] = el;
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => {
                if (onOpenCase && item.projectId) {
                  onOpenCase(item.projectId);
                }
              }}
              className={`w-full flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 sm:py-8 md:py-9 px-4 sm:px-6 md:px-8 border-none bg-transparent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group select-none ${
                isDimmed ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {/* Left Frame: Number (01) + Title (ART DIRECTION) + Apple Arrow Badge */}
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 sm:group-hover:translate-x-6">
                <span className="font-mono text-base sm:text-lg md:text-2xl font-bold text-neutral-300 group-hover:text-black transition-colors duration-300">
                  {item.number}
                </span>
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                  <h3 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] tracking-tight uppercase text-black leading-none transition-colors duration-300">
                    {item.title}
                  </h3>
                  {/* Apple Circle Arrow Pill */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 apple-circle rounded-full bg-black text-white flex items-center justify-center scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 -rotate-45 group-hover:rotate-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 shadow-md">
                    <span className="font-mono text-xs sm:text-sm md:text-base font-light">↗</span>
                  </div>
                </div>
              </div>

              {/* Right Frame: Quote & Concise Factual Description */}
              <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-left lg:text-right pt-3 lg:pt-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-2 sm:group-hover:-translate-x-4 space-y-1 sm:space-y-1.5">
                <p className="font-display font-bold text-sm sm:text-base md:text-lg text-black">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="font-sans text-xs sm:text-sm md:text-[15px] text-neutral-500 group-hover:text-neutral-800 transition-colors duration-300 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
