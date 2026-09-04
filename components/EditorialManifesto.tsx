'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const shutterPool1 = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
];

const shutterPool2 = [
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600&auto=format&fit=crop',
];

export default function EditorialManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const [img1, setImg1] = useState(shutterPool1[0]);
  const [img2, setImg2] = useState(shutterPool2[0]);

  // Pill live shutter asset cycling
  useEffect(() => {
    let idx1 = 0;
    let idx2 = 2;

    const interval1 = setInterval(() => {
      idx1 = (idx1 + 1) % shutterPool1.length;
      setImg1(shutterPool1[idx1]);
    }, 100);

    const interval2 = setInterval(() => {
      idx2 = (idx2 + 1) % shutterPool2.length;
      setImg2(shutterPool2[idx2]);
    }, 125);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  // Word-by-word scroll animation (reveals down, exits upwards on scroll back up)
  // Fulfills: "jab koi nechai animation or upper jai to animation out like ek ek word krke aai uuper jai to ek ek word krke upper jai sath box bhi esai hi shape is the part of the text"
  useGSAP(
    () => {
      const tokens = gsap.utils.toArray<HTMLElement>('.manifesto-token');
      if (!tokens.length) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 82%',
        end: 'bottom 15%',
        onEnter: () => {
          gsap.killTweensOf(tokens);
          gsap.fromTo(
            tokens,
            { yPercent: 115, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.065,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: true,
            }
          );
        },
        onLeaveBack: () => {
          // Words animate out upwards one by one
          gsap.killTweensOf(tokens);
          gsap.to(tokens, {
            yPercent: -115,
            opacity: 0,
            stagger: 0.045,
            duration: 0.5,
            ease: 'power3.in',
            overwrite: true,
            onComplete: () => {
              gsap.set(tokens, { yPercent: 115 });
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
      id="manifesto"
      className="w-full py-24 md:py-36 bg-gradient-to-b from-white via-[#f7f6f1] to-white border-none overflow-hidden relative"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
        <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.85] tracking-[-0.02em] text-primary uppercase flex flex-col items-center gap-1 sm:gap-1.5">
          {/* Line 1 */}
          <span className="inline-flex items-center justify-center flex-wrap gap-2 sm:gap-3 overflow-hidden py-0.5">
            <span className="manifesto-token inline-flex items-center will-change-transform">
              I
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              FIX
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              THINGS
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              THAT
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              <span
                className="inline-flex items-center justify-center align-middle w-[84px] sm:w-[120px] md:w-[155px] h-[30px] sm:h-[42px] md:h-[54px] rounded-full bg-black overflow-hidden relative shadow-none hover:scale-105 transition-transform duration-300 cursor-pointer shrink-0"
                title="Director Shutter Asset"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img1}
                  alt="Campaign Shutter Clip"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                />
              </span>
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              WERE
            </span>
          </span>

          {/* Line 2 */}
          <span className="inline-flex items-center justify-center flex-wrap gap-2 sm:gap-3 overflow-hidden py-0.5">
            <span className="manifesto-token inline-flex items-center will-change-transform">
              ALREADY
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              <span
                className="inline-flex items-center justify-center align-middle w-[84px] sm:w-[120px] md:w-[155px] h-[30px] sm:h-[42px] md:h-[54px] rounded-full bg-black overflow-hidden relative shadow-none hover:scale-105 transition-transform duration-300 cursor-pointer shrink-0"
                title="Production Shutter Asset"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img2}
                  alt="Production Shutter Clip"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                />
              </span>
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              APPROVED.
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
