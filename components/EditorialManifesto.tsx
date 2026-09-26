'use client';

import { useEffect, useRef, useMemo } from 'react';
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

interface EditorialManifestoProps {
  userPhotos?: string[];
}

export default function EditorialManifesto({ userPhotos }: EditorialManifestoProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);

  const pool1 = useMemo(() => userPhotos && userPhotos.length > 0 ? userPhotos : shutterPool1, [userPhotos]);
  const pool2 = useMemo(() =>
    userPhotos && userPhotos.length > 1
      ? [...userPhotos].reverse()
      : userPhotos && userPhotos.length > 0
      ? userPhotos
      : shutterPool2
  , [userPhotos]);

  // Pill live shutter asset cycling using direct DOM updates (zero React re-renders = silky 60/120fps scroll)
  useEffect(() => {
    if (!pool1.length || !pool2.length) return;
    let idx1 = 0;
    let idx2 = Math.min(2, pool2.length - 1);

    const interval1 = setInterval(() => {
      idx1 = (idx1 + 1) % pool1.length;
      if (img1Ref.current && pool1[idx1]) {
        img1Ref.current.src = pool1[idx1];
      }
    }, 180);

    const interval2 = setInterval(() => {
      idx2 = (idx2 + 1) % pool2.length;
      if (img2Ref.current && pool2[idx2]) {
        img2Ref.current.src = pool2[idx2];
      }
    }, 220);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [pool1, pool2]);

  // Word-by-word scroll animation (reveals down, exits upwards on scroll back up)
  useGSAP(
    () => {
      const tokens = gsap.utils.toArray<HTMLElement>('.manifesto-token');
      if (!tokens.length) return;

      // Ensure tokens are visible if already in viewport on mount/reload
      const isPast = sectionRef.current && sectionRef.current.getBoundingClientRect().top < window.innerHeight * 0.85;
      if (isPast) {
        gsap.set(tokens, { yPercent: 0, opacity: 1 });
      }

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
              stagger: 0.055,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: true,
            }
          );
        },
        onEnterBack: () => {
          gsap.killTweensOf(tokens);
          gsap.fromTo(
            tokens,
            { yPercent: -115, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.055,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: true,
            }
          );
        },
        onLeaveBack: () => {
          gsap.killTweensOf(tokens);
          gsap.to(tokens, {
            yPercent: -115,
            opacity: 0,
            stagger: 0.035,
            duration: 0.45,
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
      style={{
        paddingTop: 'var(--hero-to-manifesto, 24px)',
        paddingBottom: 'var(--manifesto-to-work, 144px)',
      }}
      className="w-full bg-gradient-to-b from-white via-[#faf9f6] to-white border-none overflow-hidden relative"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
        <h2
          style={{ gap: 'var(--manifesto-line-gap, 0px)' }}
          className="font-display font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] sm:leading-[1.15] tracking-tight text-primary uppercase flex flex-col items-center"
        >
          {/* Line 1 */}
          <span className="inline-flex items-center justify-center flex-wrap gap-2 sm:gap-3 overflow-hidden py-1 sm:py-0.5">
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
                className="inline-flex items-center justify-center align-middle w-[84px] sm:w-[120px] md:w-[155px] h-[30px] sm:h-[42px] md:h-[54px] apple-pill rounded-full bg-black overflow-hidden relative shadow-none hover:scale-105 transition-transform duration-300 cursor-pointer shrink-0"
                title="Director Shutter Asset"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={img1Ref}
                  src={pool1[0]}
                  alt="Campaign Shutter Clip"
                  className="w-full h-full object-cover apple-pill rounded-full pointer-events-none"
                />
              </span>
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              WERE
            </span>
          </span>

          {/* Line 2 */}
          <span className="inline-flex items-center justify-center flex-wrap gap-2 sm:gap-3 overflow-hidden py-1 sm:py-0.5">
            <span className="manifesto-token inline-flex items-center will-change-transform">
              ALREADY
            </span>
            <span className="manifesto-token inline-flex items-center will-change-transform">
              <span
                className="inline-flex items-center justify-center align-middle w-[84px] sm:w-[120px] md:w-[155px] h-[30px] sm:h-[42px] md:h-[54px] apple-pill rounded-full bg-black overflow-hidden relative shadow-none hover:scale-105 transition-transform duration-300 cursor-pointer shrink-0"
                title="Production Shutter Asset"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={img2Ref}
                  src={pool2[0]}
                  alt="Production Shutter Clip"
                  className="w-full h-full object-cover apple-pill rounded-full pointer-events-none"
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
