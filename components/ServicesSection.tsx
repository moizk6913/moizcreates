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
      <div className="w-full pb-10 sm:pb-14 md:pb-20 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            OUR SERVICES — OUR SERVICES — OUR SERVICES — OUR SERVICES —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            OUR SERVICES — OUR SERVICES — OUR SERVICES — OUR SERVICES —
          </div>
        </div>
      </div>

      {/* 2. EDGE-ANCHORED RESPONSIVE ROWS (Strictly stuck to 68px/100px left & right edges, no max-w clamp on zoom out) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] space-y-3 sm:space-y-4 md:space-y-6">
        {SERVICES.map((item, index) => (
          <div
            key={item.number}
            ref={(el) => {
              rowsRef.current[index] = el;
            }}
            className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 sm:py-8 md:py-10 px-6 sm:px-10 md:px-12 apple-widget-md rounded-[36px] sm:rounded-[42px] overflow-hidden transition-all duration-300 group hover:bg-[#faf9f6]"
          >
            {/* Left Frame: Number (01) + Title (ART DIRECTION) - Anchored strictly to Left edge */}
            <div className="flex items-baseline gap-4 sm:gap-6 md:gap-10 shrink-0">
              <span className="font-mono text-base sm:text-lg md:text-2xl font-bold text-neutral-400 group-hover:text-black transition-colors">
                {item.number}
              </span>
              <h3 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] tracking-tight uppercase text-black group-hover:text-neutral-500 transition-colors leading-none">
                {item.title}
              </h3>
            </div>

            {/* Right Frame: Strategic Description - Anchored strictly to Right edge */}
            <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-left lg:text-right pt-4 lg:pt-0">
              <p className="font-sans text-sm sm:text-base md:text-lg lg:text-[19px] text-neutral-600 group-hover:text-neutral-900 transition-colors leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
