'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  // Smooth scroll trigger animation in & out
  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>('.statement-line');
      if (!lines.length) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 82%',
        end: 'bottom 15%',
        onEnter: () => {
          gsap.killTweensOf(lines);
          gsap.fromTo(
            lines,
            { yPercent: 125, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.75,
              ease: 'power3.out',
              overwrite: true,
            }
          );
        },
        onLeaveBack: () => {
          gsap.killTweensOf(lines);
          gsap.to(lines, {
            yPercent: -125,
            opacity: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power3.in',
            overwrite: true,
            onComplete: () => {
              gsap.set(lines, { yPercent: 125 });
            },
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full py-20 md:py-32 bg-gradient-to-b from-canvas via-[#faf9f6] to-[#f4f2ee] relative overflow-hidden flex items-center justify-center text-center select-none"
    >
      {/* Ambient luxury accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(230,0,0,0.035)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">
        <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.12] text-primary flex flex-col items-center justify-center gap-1 sm:gap-2">
          
          <span className="overflow-hidden block py-0.5">
            <span className="statement-line block will-change-transform">
              I WAS GOING TO WRITE SOMETHING IMPRESSIVE HERE.
            </span>
          </span>

          <span className="overflow-hidden block py-0.5">
            <span className="statement-line block will-change-transform">
              THEN I REMEMBERED YOU&apos;VE ALREADY SCROLLED THIS FAR.
            </span>
          </span>

          <span className="overflow-hidden block py-0.5">
            <span className="statement-line block will-change-transform">
              SO I GUESS THE WORK DID ITS JOB.
            </span>
          </span>

          <span className="overflow-hidden block py-0.5">
            <span className="statement-line block will-change-transform">
              GOOD. <span className="text-[#e60000]">LET&apos;S TALK.</span>
            </span>
          </span>

        </h2>
      </div>
    </section>
  );
}
