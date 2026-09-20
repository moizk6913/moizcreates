'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServiceRow {
  number: string;
  title: string;
  description: string;
}

const SERVICES: ServiceRow[] = [
  {
    number: '01',
    title: 'ART DIRECTION',
    description:
      'Strategic visual thinking guides projects from concept to execution, shaping cohesive narratives built around clarity, emotion, and impact.',
  },
  {
    number: '02',
    title: 'BRAND IDENTITY',
    description:
      'Distinct identities are built from the ground up, with every element working together to create a clear, cohesive, and lasting presence.',
  },
  {
    number: '03',
    title: 'EDITORIAL DESIGN',
    description:
      'Posters, magazines, books, and print systems combine visual impact with clear communication and thoughtfully structured information.',
  },
  {
    number: '04',
    title: 'EXPERIENCE DESIGN',
    description:
      'Intuitive digital experiences bring usability, flow, and interaction together through clear, seamless, and purposeful design.',
  },
  {
    number: '05',
    title: 'PACKAGING DESIGN',
    description:
      'Packaging combines shelf presence with strategic communication, expressing product value through clarity, distinction, and thoughtful detail.',
  },
];

export default function ServicesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Smooth, non-intrusive scroll reveal (Zero scroll hijacking, zero jittery pinning)
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
          stagger: 0.09,
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
      className="w-full py-16 sm:py-24 md:py-32 bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. GIANT RUNNING HEADER (Zero lines, clean continuous silky marquee) */}
      <div className="w-full pb-8 sm:pb-12 md:pb-16 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            OUR SERVICES — OUR SERVICES — OUR SERVICES — OUR SERVICES —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            OUR SERVICES — OUR SERVICES — OUR SERVICES — OUR SERVICES —
          </div>
        </div>
      </div>

      {/* 2. FIGMA AUTO-LAYOUT RESPONSIVE ROWS (Anchored Left & Right, Zero Lines, 100% Black) */}
      <div className="w-full max-w-[1700px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 space-y-3 sm:space-y-4 md:space-y-5">
        {SERVICES.map((item, index) => (
          <div
            key={item.number}
            ref={(el) => {
              rowsRef.current[index] = el;
            }}
            className="w-full flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-5 sm:py-7 md:py-8 px-4 sm:px-6 rounded-[18px] transition-colors duration-200 group hover:bg-[#faf9f6]"
          >
            {/* Left Frame: Number (01) + Title (ART DIRECTION) - Anchored strictly to Left */}
            <div className="flex items-baseline gap-4 sm:gap-6 md:gap-10 shrink-0">
              <span className="font-mono text-sm sm:text-base md:text-lg font-bold text-neutral-400 group-hover:text-black transition-colors">
                {item.number}
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-[38px] tracking-tight uppercase text-black group-hover:text-[#e60000] transition-colors leading-tight">
                {item.title}
              </h3>
            </div>

            {/* Right Frame: Strategic Description - Anchored strictly to Right Edge */}
            <div className="max-w-md md:max-w-lg lg:max-w-xl text-left sm:text-right pt-3 sm:pt-0">
              <p className="font-sans text-xs sm:text-sm md:text-[15px] text-neutral-600 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. FLUSH COMPACT BASELINE (Zero lines, clean metadata) */}
      <div className="w-full max-w-[1700px] mx-auto pt-10 sm:pt-14 px-6 sm:px-10 md:px-14 lg:px-20 flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <span className="uppercase tracking-widest text-neutral-700 font-semibold">Capabilities</span>
        </div>
        <div className="text-neutral-400 uppercase tracking-wider hidden sm:block">
          01 — 05 Strategic Creative Services
        </div>
      </div>
    </section>
  );
}
