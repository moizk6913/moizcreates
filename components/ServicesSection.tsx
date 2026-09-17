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
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!viewportRef.current || !containerRef.current) return;

      const rows = rowsRef.current.filter(Boolean) as HTMLDivElement[];
      if (rows.length === 0) return;

      // Row 1 starts visible. Rows 2-5 start offset downwards and faded out
      const stackRows = rows.slice(1);
      gsap.set(stackRows, {
        y: 70,
        opacity: 0,
        scale: 0.985,
      });

      // Master scrub timeline
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });

      // Header zoom & horizontal marquee drift across scroll
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            scale: 1.12,
            xPercent: -4,
            duration: 4,
            ease: 'none',
          },
          0
        );
      }

      // Sequentially stack rows 2, 3, 4, 5
      stackRows.forEach((row, idx) => {
        const startTime = 0.5 + idx * 0.85;
        tl.to(
          row,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
          },
          startTime
        );
      });

      // Buffer pause at end so all 5 rows are held in full view before unpinning
      tl.to({}, { duration: 0.5 });

      // Pin the viewport while user scrolls through the 240% scroll distance
      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=240%',
        pin: viewportRef.current,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          tl.progress(self.progress);
        },
      });

      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} id="services" className="relative bg-white">
      <section
        ref={viewportRef}
        className="w-full h-screen bg-white overflow-hidden flex flex-col justify-between select-none relative"
      >
        {/* Giant Typographic Running Header (Expands and Zooms on Scroll) */}
        <div className="w-full pt-14 sm:pt-20 pb-2 sm:pb-4 overflow-hidden border-b border-neutral-100 flex-shrink-0">
          <div
            ref={headerRef}
            className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap will-change-transform text-center select-none"
          >
            OUR SERVICES — OUR SERVICES — OUR SERVICES — OUR SERVICES
          </div>
        </div>

        {/* 5 Expansive Rows — Exact Match to Reference Image */}
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 md:px-14 flex-1 flex flex-col justify-center py-2 sm:py-4">
          {SERVICES.map((item, index) => (
            <div
              key={item.number}
              ref={(el) => {
                rowsRef.current[index] = el;
              }}
              className="py-3 sm:py-4 md:py-6 px-2 sm:px-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 md:gap-10 items-center border-t border-neutral-200/80 bg-white will-change-transform transition-colors duration-200 group hover:bg-[#faf9f6]"
            >
              {/* Col 1: Number */}
              <div className="sm:col-span-2 md:col-span-1 font-mono text-sm sm:text-base font-bold text-black">
                {item.number}
              </div>

              {/* Col 2: Title (Electric Cobalt Blue #1b00ff from reference) */}
              <div className="sm:col-span-5 md:col-span-4">
                <h3 className="font-sans font-black text-base sm:text-lg md:text-2xl tracking-tight uppercase text-[#1b00ff] leading-tight group-hover:text-[#0000cc] transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* Col 3: Right-aligned Description */}
              <div className="sm:col-span-5 md:col-span-7 flex sm:justify-end">
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans max-w-xl sm:text-right font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom subtle baseline padding / border */}
        <div className="w-full pb-3 sm:pb-5 px-6 sm:px-12 flex items-center justify-between text-[11px] font-mono text-neutral-400 border-t border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1b00ff]"></span>
            <span className="uppercase tracking-widest text-neutral-600 font-semibold">Capabilities</span>
          </div>
          <div className="text-neutral-400 uppercase tracking-wider hidden sm:block">
            01 — 05 Strategic Creative Services
          </div>
        </div>
      </section>
    </div>
  );
}
