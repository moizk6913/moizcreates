'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function StatementBridge() {
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
      id="manifesto-bridge"
      className="w-full py-16 sm:py-24 md:py-28 bg-gradient-to-b from-canvas via-[#f8f7f5] to-[#f4f2ee] relative overflow-hidden flex flex-col items-center justify-center text-center select-none border-none"
    >
      {/* Soft atmospheric ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[radial-gradient(circle,rgba(230,0,0,0.035)_0%,transparent_70%)] pointer-events-none"
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
              GOOD. <Link href="/about" className="text-[#e60000] hover:underline cursor-pointer transition-colors">LET&apos;S TALK.</Link>
            </span>
          </span>

        </h2>

        {/* Action Link to the Dedicated Directorial Canvas */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/about"
            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-[10px] bg-primary text-white hover:bg-[#e60000] transition-all duration-300 font-mono text-xs uppercase tracking-widest hover:scale-105 shadow-sm"
          >
            <span>EXPLORE DIRECTORIAL PROFILE</span>
            <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
