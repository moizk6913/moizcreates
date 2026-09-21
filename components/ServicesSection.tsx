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

export default function ServicesSection({ onOpenCase }: ServicesSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      onMouseLeave={() => setHoveredIndex(null)}
      style={{
        paddingTop: 'var(--section-top, 96px)',
        paddingBottom: 'var(--section-bottom, 96px)',
      }}
      className="w-full bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. EDITORIAL CHAPTER HEADER (Static, Monumental, Line-Free) */}
      <div
        style={{ paddingBottom: 'var(--header-to-content, 64px)' }}
        className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px]"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[92px] tracking-tight uppercase text-black leading-none">
            WHAT I DO
          </h2>
          <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-400 uppercase tracking-[0.2em]">
            01 / CAPABILITIES
          </span>
        </div>
      </div>

      {/* 2. EDGE-ANCHORED RESPONSIVE ROWS (Pure canvas background, kinetic magnetic typography) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] space-y-2 sm:space-y-3">
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
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                if (onOpenCase && item.projectId) {
                  onOpenCase(item.projectId);
                }
              }}
              className={`w-full flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 sm:py-4 px-4 sm:px-6 md:px-8 border-none bg-transparent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group select-none ${
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
