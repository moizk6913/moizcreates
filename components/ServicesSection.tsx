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
  description: string;
}

const SERVICES: ServiceRow[] = [
  {
    number: '01',
    title: 'ART DIRECTION',
    discipline: 'Art Direction',
    projectId: 'art-direction',
    description:
      'Strategic visual thinking guides projects from concept to execution, shaping cohesive narratives built around clarity, emotion, and impact.',
  },
  {
    number: '02',
    title: 'BRAND IDENTITY',
    discipline: 'Brand Identity',
    projectId: 'brand-identity',
    description:
      'Distinct identities are built from the ground up, with every element working together to create a clear, cohesive, and lasting presence.',
  },
  {
    number: '03',
    title: 'EDITORIAL DESIGN',
    discipline: 'Editorial Design',
    projectId: 'cinematography',
    description:
      'Posters, magazines, books, and print systems combine visual impact with clear communication and thoughtfully structured information.',
  },
  {
    number: '04',
    title: 'EXPERIENCE DESIGN',
    discipline: 'Experience Design',
    projectId: 'motion-graphics',
    description:
      'Intuitive digital experiences bring usability, flow, and interaction together through clear, seamless, and purposeful design.',
  },
  {
    number: '05',
    title: 'PACKAGING DESIGN',
    discipline: 'Packaging Design',
    projectId: 'photography',
    description:
      'Packaging combines shelf presence with strategic communication, expressing product value through clarity, distinction, and thoughtful detail.',
  },
];

interface ServicesSectionProps {
  userPhotos?: string[];
  onOpenCase?: (id: string) => void;
}

export default function ServicesSection({ onOpenCase }: ServicesSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Smooth, non-intrusive scroll reveal
  useGSAP(
    () => {
      if (!containerRef.current) return;
      const rows = rowsRef.current.filter(Boolean) as HTMLDivElement[];
      if (rows.length === 0) return;

      gsap.fromTo(
        rows,
        {
          y: 35,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.7,
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
      style={{
        paddingTop: 'var(--services-top, 64px)',
        paddingBottom: 'var(--services-bottom, 52px)',
      }}
      className="w-full bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. EDITORIAL CHAPTER HEADER (Pure, Line-Free, Capabilities Tag Removed) */}
      <div
        style={{ paddingBottom: 'var(--services-header-gap, 124px)' }}
        className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px]"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[92px] tracking-tight uppercase text-black leading-none">
            WHAT I DO
          </h2>
        </div>
      </div>

      {/* 2. ARCHITECTURAL 3-COLUMN TABLE (Exact Composition from Image 1 Reference) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] border-t border-b border-black/[0.08]">
        {SERVICES.map((item, index) => (
          <div
            key={item.number}
            ref={(el) => {
              rowsRef.current[index] = el;
            }}
            onClick={() => {
              if (onOpenCase && item.projectId) {
                onOpenCase(item.projectId);
              }
            }}
            style={{
              paddingTop: 'var(--service-row-padding, 24px)',
              paddingBottom: 'var(--service-row-padding, 24px)',
            }}
            className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start border-b border-black/[0.08] last:border-b-0 bg-transparent transition-colors duration-300 cursor-pointer group select-none"
          >
            {/* Col 1: Step Number (01, 02...) */}
            <div className="col-span-1 md:col-span-1 pt-[2px]">
              <span className="font-mono text-xs sm:text-sm md:text-[14px] font-bold text-black block tracking-tight">
                {item.number}
              </span>
            </div>

            {/* Col 2: Title in Electric Blue (ART DIRECTION, BRAND IDENTITY...) */}
            <div className="col-span-1 md:col-span-4 lg:col-span-4 pt-[1px]">
              <h3 className="font-sans font-bold text-xs sm:text-sm md:text-[15px] tracking-wider uppercase text-[#0011ff] leading-[1.3] group-hover:text-black transition-colors duration-300 max-w-[170px]">
                {item.number === '04' ? (
                  <>
                    EXPERIENCE<br />DESIGN
                  </>
                ) : item.number === '05' ? (
                  <>
                    PACKAGING<br />DESIGN
                  </>
                ) : (
                  item.title
                )}
              </h3>
            </div>

            {/* Col 3: Narrative Description (Clean 3 lines on the right side) */}
            <div className="col-span-1 md:col-span-7 lg:col-span-7 flex justify-end">
              <p className="font-sans text-xs sm:text-[13px] md:text-[13.5px] text-neutral-800 leading-[1.65] font-normal max-w-[360px] text-left">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
