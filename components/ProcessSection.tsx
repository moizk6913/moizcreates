'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Doodle Icon 1: Research & Discovery (Hand-drawn Starburst Eye with Orbiting Spark)
function ResearchDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn organic eye contour */}
      <path
        d="M6 32C14 18 34 16 50 24C56 27 59 32 58 33C50 46 30 48 14 40C8 37 5 33 6 32Z"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hand-drawn iris circle */}
      <circle
        cx="32"
        cy="32"
        r="9.5"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center pupil dot */}
      <circle cx="32" cy="32" r="3.5" fill="currentColor" />
      {/* Playful doodle twinkle spark top right */}
      <path
        d="M48 10V18M44 14H52"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Little doodle accent bottom left */}
      <path
        d="M12 48L16 52M16 48L12 52"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Radiating curved glance mark */}
      <path
        d="M32 14C34 11 38 10 40 10"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Doodle Icon 2: Design & Synthesis (Hand-drawn Fluid Scribble Loop + 4-Point Doodle Star)
function DesignDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn fluid continuous loop */}
      <path
        d="M16 42C10 38 8 28 14 20C20 12 30 16 34 24L38 32C42 40 50 44 54 38C58 32 54 20 44 20C38 20 32 26 30 32"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hand-drawn 4-point sparkle star */}
      <path
        d="M46 8C47 13 51 17 56 18C51 19 47 23 46 28C45 23 41 19 36 18C41 17 45 13 46 8Z"
        fill="currentColor"
        strokeWidth="1.5"
      />
      {/* Small playful doodle dots */}
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <circle cx="20" cy="52" r="2.2" fill="currentColor" />
      <path
        d="M50 48L54 52"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Doodle Icon 3: Deliver & Deployment (Hand-drawn Starburst Spark & Orbit Ring)
function DeliverDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn organic 8-point burst star */}
      <path
        d="M32 6C34 18 42 26 54 28C42 30 34 38 32 50C30 38 22 30 10 28C22 26 30 18 32 6Z"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center radiant spark */}
      <circle cx="32" cy="28" r="3.5" fill="currentColor" />
      {/* Diagonal doodle bursts */}
      <path
        d="M16 12L21 17M48 44L43 39M48 12L43 17M16 44L21 39"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Orbiting hand-drawn curved smile arc */}
      <path
        d="M18 54C26 58 38 58 46 54"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ProcessPhase {
  step: string;
  tag: string;
  title: string;
  description: string;
}

const PHASES: ProcessPhase[] = [
  {
    step: '01',
    tag: '01 / DISCOVERY',
    title: 'FIND THE PROBLEM',
    description: "Before touching the pixels, figure out what's actually wrong.",
  },
  {
    step: '02',
    tag: '02 / DIRECTION',
    title: 'FIND THE IDEA',
    description: 'Build the visual direction around something worth saying.',
  },
  {
    step: '03',
    tag: '03 / EXECUTION',
    title: 'MAKE IT REAL & FEEL RIGHT',
    description:
      'Design it. Shoot it. Build it. Break it. Try again. The last 10% is usually where the work becomes the work.',
  },
];

export default function ProcessSection() {
  const containerRef = useRef<HTMLElement>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const cols = columnsRef.current.filter(Boolean) as HTMLDivElement[];
      if (cols.length === 0) return;

      gsap.fromTo(
        cols,
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
      style={{
        paddingTop: 'var(--process-top, 88px)',
        paddingBottom: 'var(--process-bottom, 56px)',
      }}
      className="w-full bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. EDITORIAL CHAPTER HEADER (Static, Monumental, Line-Free) */}
      <div
        style={{ paddingBottom: 'var(--process-header-gap, 86px)' }}
        className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px]"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[92px] tracking-tight uppercase text-black leading-none">
            HOW I GET THERE
          </h2>
        </div>
      </div>

      {/* 2. ARCHITECTURAL EDITORIAL PROCESS PILLARS (Disciplined Left-Aligned Swiss Grid) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px]">
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 'var(--process-grid-gap, 44px)' }}
        >
          {PHASES.map((phase, idx) => (
            <div
              key={phase.step}
              ref={(el) => {
                columnsRef.current[idx] = el;
              }}
              className="flex flex-col items-start text-left group cursor-default border-none bg-transparent transition-all duration-300"
            >
              {/* 1. Top Bar: Left-aligned Doodle Icon & Right-aligned Step Number */}
              <div className="w-full flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 text-black flex items-center justify-start transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                  {idx === 0 && (
                    <ResearchDoodle className="w-full h-full text-black group-hover:rotate-12 transition-transform duration-500" />
                  )}
                  {idx === 1 && (
                    <DesignDoodle className="w-full h-full text-black group-hover:-rotate-12 transition-transform duration-500" />
                  )}
                  {idx === 2 && (
                    <DeliverDoodle className="w-full h-full text-black group-hover:rotate-45 transition-transform duration-600" />
                  )}
                </div>

                <span className="font-mono text-xl sm:text-2xl md:text-3xl font-bold text-neutral-300 group-hover:text-black transition-colors duration-300">
                  {phase.step}
                </span>
              </div>

              {/* 2. Left-Aligned Title */}
              <h3 className="font-display font-black text-xl sm:text-2xl md:text-[24px] lg:text-[26px] xl:text-[28px] uppercase tracking-tight text-black leading-tight group-hover:text-neutral-900 transition-colors duration-300 mb-3 min-h-[2.5rem] sm:min-h-[3rem] flex items-start">
                {phase.title}
              </h3>

              {/* 3. Left-Aligned Narrative */}
              <p className="font-sans text-xs sm:text-sm md:text-[14px] lg:text-[15px] text-neutral-500 group-hover:text-neutral-800 transition-colors duration-300 leading-relaxed font-normal max-w-sm">
                {phase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
