'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProcessPhase {
  step: string;
  phaseTag: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
}

const PHASES: ProcessPhase[] = [
  {
    step: '01',
    phaseTag: 'PHASE 01 // DISCOVERY',
    title: 'RESEARCH',
    subtitle: 'Strategic Immersion & Audience Architecture',
    description:
      'Deep exploration into brand positioning, market whitespace, and audience psychology establishes an airtight strategic foundation before any visual exploration begins.',
    deliverables: [
      'VISUAL AUDIT',
      'AUDIENCE ARCHITECTURE',
      'CULTURAL FORECAST',
      'CREATIVE BRIEF',
    ],
  },
  {
    step: '02',
    phaseTag: 'PHASE 02 // SYNTHESIS',
    title: 'DESIGN',
    subtitle: 'Visual Architecture & Cross-Media Prototyping',
    description:
      'Concepts take form through rigorous typographic systems, tactile materiality, layout experimentation, and rapid iterative directorial sprints.',
    deliverables: [
      'BRAND IDENTITY',
      'EDITORIAL SYSTEMS',
      'MOTION PROTOTYPING',
      'CREATIVE DIRECTION',
    ],
  },
  {
    step: '03',
    phaseTag: 'PHASE 03 // DEPLOYMENT',
    title: 'DELIVER',
    subtitle: 'Production Mastering & Asset Handover',
    description:
      'Flawless production-grade master files prepared for print and screen, supported by detailed design guidelines, asset libraries, and hands-on rollout support.',
    deliverables: [
      'PRODUCTION ASSETS',
      'STYLE GUIDELINES',
      'PACKAGING SPECS',
      'ROLLOUT SUPPORT',
    ],
  },
];

export default function ProcessSection() {
  const containerRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      gsap.fromTo(
        cards,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
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
      id="approach"
      className="w-full py-16 sm:py-24 md:py-32 bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. GIANT RUNNING MARQUEE HEADER (Monochrome, Edge-to-Edge) */}
      <div className="w-full pb-10 sm:pb-14 md:pb-20 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            OUR APPROACH — OUR APPROACH — OUR APPROACH — OUR APPROACH —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            OUR APPROACH — OUR APPROACH — OUR APPROACH — OUR APPROACH —
          </div>
        </div>
      </div>

      {/* 2. APPLE-GRADE ARCHITECTURAL PROCESS BENTO (Edge-Anchored 68px/100px Grid) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 xl:gap-10 items-stretch">
          {PHASES.map((phase, idx) => (
            <div
              key={phase.step}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="rounded-[38px] sm:rounded-[44px] md:rounded-[48px] bg-[#faf9f6] p-8 sm:p-10 md:p-12 border border-neutral-200/70 flex flex-col justify-between space-y-8 hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 transition-all duration-500 group"
            >
              {/* Card Top Row: Phase Tag & Step Indicator */}
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-5">
                <span className="font-mono text-[11px] sm:text-xs font-bold tracking-widest text-neutral-400 group-hover:text-black transition-colors uppercase">
                  {phase.phaseTag}
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-neutral-200/80 text-black shadow-2xs">
                  {phase.step}
                </span>
              </div>

              {/* Card Body: Title, Subtitle, Narrative */}
              <div className="space-y-3 flex-1">
                <h3 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black group-hover:text-neutral-500 transition-colors leading-none">
                  {phase.title}
                </h3>
                <p className="font-mono text-xs text-neutral-500 uppercase tracking-wide font-medium">
                  {phase.subtitle}
                </p>
                <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed font-normal pt-2">
                  {phase.description}
                </p>
              </div>

              {/* Card Bottom: Deliverables / Milestones Matrix */}
              <div className="pt-6 border-t border-neutral-200/60 space-y-3">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-400 font-bold block">
                  CORE DELIVERABLES
                </span>
                <div className="flex flex-wrap gap-2">
                  {phase.deliverables.map((d) => (
                    <span
                      key={d}
                      className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-neutral-800 bg-white px-3 py-1.5 rounded-full border border-neutral-200/80 uppercase shadow-2xs group-hover:border-neutral-300 transition-colors"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
