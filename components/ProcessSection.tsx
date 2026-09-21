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
  title: string;
  description: string;
}

const PHASES: ProcessPhase[] = [
  {
    step: '01',
    title: 'FIND THE PROBLEM',
    description: "Before touching the pixels, figure out what's actually wrong.",
  },
  {
    step: '02',
    title: 'FIND THE IDEA',
    description: 'Build the visual direction around something worth saying.',
  },
  {
    step: '03',
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
      className="w-full pt-10 sm:pt-14 md:pt-18 pb-12 sm:pb-16 md:pb-20 bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. GIANT RUNNING MARQUEE HEADER (Monochrome, Edge-to-Edge, Zero Lines) */}
      <div className="w-full pb-8 sm:pb-10 md:pb-14 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            HOW I GET THERE — HOW I GET THERE — HOW I GET THERE — HOW I GET THERE —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            HOW I GET THERE — HOW I GET THERE — HOW I GET THERE — HOW I GET THERE —
          </div>
        </div>
      </div>

      {/* 2. COMPLETELY BOX-FREE & LINE-FREE EDITORIAL PROCESS (Animated Doodles, Zero Borders, Zero Clutter) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-12 xl:gap-16">
          {PHASES.map((phase, idx) => (
            <div
              key={phase.step}
              ref={(el) => {
                columnsRef.current[idx] = el;
              }}
              className="flex flex-col space-y-6 sm:space-y-8 group cursor-default border-none bg-transparent"
            >
              {/* Top Row: Animated Hand-drawn Doodle Icon + Phase Number */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 sm:w-16 sm:h-16 text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-115">
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

                <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-neutral-300 group-hover:text-black transition-colors duration-300">
                  {phase.step}
                </span>
              </div>

              {/* Body: Title & Narrative */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-black leading-tight group-hover:translate-x-1.5 transition-transform duration-300">
                  {phase.title}
                </h3>

                <p className="font-sans text-sm sm:text-base md:text-[17px] text-neutral-600 leading-relaxed font-normal pt-1">
                  {phase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
