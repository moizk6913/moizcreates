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
        onEnterBack: () => {
          gsap.killTweensOf(lines);
          gsap.fromTo(
            lines,
            { yPercent: -125, opacity: 0 },
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
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="manifesto-bridge"
      className="w-full pt-14 sm:pt-18 md:pt-22 pb-12 sm:pb-14 md:pb-16 bg-white relative overflow-hidden flex flex-col items-center justify-center text-center select-none border-none"
    >
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">
        <h2 className="font-display font-black text-xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-[1.18] text-black flex flex-col items-center justify-center gap-2 sm:gap-4">
          
          <span className="overflow-hidden block py-1 sm:py-0.5">
            <span className="statement-line block will-change-transform">
              I WAS GOING TO WRITE SOMETHING IMPRESSIVE HERE. THEN I REMEMBERED YOU&apos;VE ALREADY SCROLLED THIS FAR.
            </span>
          </span>

          <span className="overflow-hidden block py-1 sm:py-0.5">
            <span className="statement-line block will-change-transform">
              SO I GUESS THE WORK DID ITS JOB. GOOD. <Link href="/#contact" className="text-black underline underline-offset-4 hover:text-neutral-500 cursor-pointer transition-colors">LET&apos;S TALK.</Link>
            </span>
          </span>

        </h2>
      </div>
    </section>
  );
}
