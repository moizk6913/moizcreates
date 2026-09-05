'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // Parallax Layer Refs for zero-rerender 60/120fps direct transform updates
  const scriptRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const topLeftRef = useRef<HTMLDivElement>(null);
  const midLeftRef = useRef<HTMLDivElement>(null);
  const midRightContactRef = useRef<HTMLDivElement>(null);
  const midRightStatementRef = useRef<HTMLDivElement>(null);
  const bottomBioRef = useRef<HTMLDivElement>(null);
  const bottomTagRef = useRef<HTMLDivElement>(null);

  // Target and Current coordinates for silky spring-lerp easing
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const animFrameId = useRef<number | null>(null);

  // Update loop for 3D spatial parallax and card tilt
  const updateParallax = useCallback(() => {
    const diffX = targetX.current - currentX.current;
    const diffY = targetY.current - currentY.current;

    currentX.current += diffX * 0.075;
    currentY.current += diffY * 0.075;

    const nx = currentX.current; // -1 to +1
    const ny = currentY.current; // -1 to +1

    // 1. Overall Artboard 3D Perspective Card Tilt
    if (posterRef.current) {
      posterRef.current.style.transform = `perspective(1400px) rotateY(${nx * 4.5}deg) rotateX(${-ny * 3.5}deg)`;
    }

    // 2. Red "art Director" Signature Script (Deep layer behind subject)
    if (scriptRef.current) {
      scriptRef.current.style.transform = `translate3d(${nx * -12}px, ${ny * -6}px, -15px)`;
    }

    // 3. Central Subject (Moiz with rope on focal plane)
    if (subjectRef.current) {
      subjectRef.current.style.transform = `translate3d(${nx * 14}px, ${ny * 8}px, 0px)`;
    }

    // Dynamic ground contact shadow
    if (shadowRef.current) {
      shadowRef.current.style.transform = `translate3d(${nx * 10}px, ${ny * 4}px, 0px) scale(${1 + Math.abs(nx) * 0.05})`;
    }

    // 4. Top-Left Typewriter Text ("I DIDN'T HAVE SHOOT MONEY...")
    if (topLeftRef.current) {
      topLeftRef.current.style.transform = `translate3d(${nx * -28}px, ${ny * -14}px, 32px)`;
    }

    // 5. Mid-Left Serif Quote ("I don't get it in the room...") - High Foreground Depth
    if (midLeftRef.current) {
      midLeftRef.current.style.transform = `translate3d(${nx * -42}px, ${ny * -20}px, 48px)`;
    }

    // 6. Mid-Right Contact Info (+91, email, location)
    if (midRightContactRef.current) {
      midRightContactRef.current.style.transform = `translate3d(${nx * -24}px, ${ny * -12}px, 28px)`;
    }

    // 7. Lower Mid-Right ("I FIX THINGS THAT WERE ALREADY APPROVED.")
    if (midRightStatementRef.current) {
      midRightStatementRef.current.style.transform = `translate3d(${nx * -38}px, ${ny * -18}px, 44px)`;
    }

    // 8. Bottom Center Bio Manifesto
    if (bottomBioRef.current) {
      bottomBioRef.current.style.transform = `translate3d(${nx * -20}px, ${ny * -8}px, 22px)`;
    }

    // 9. Bottom he/him Tag
    if (bottomTagRef.current) {
      bottomTagRef.current.style.transform = `translate3d(${nx * -10}px, ${ny * -4}px, 14px)`;
    }

    // Keep loop active until motion settles to zero
    if (Math.abs(diffX) > 0.0005 || Math.abs(diffY) > 0.0005) {
      animFrameId.current = requestAnimationFrame(updateParallax);
    } else {
      animFrameId.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updateParallax);
    }
  }, [updateParallax]);

  // Desktop Mouse Movement Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    targetX.current = Math.max(-1, Math.min(1, x));
    targetY.current = Math.max(-1, Math.min(1, y));
    startLoop();
  };

  const handleMouseLeave = () => {
    targetX.current = 0;
    targetY.current = 0;
    startLoop();
  };

  // Mobile Touch Drag Support
  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!sectionRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;

    targetX.current = Math.max(-1, Math.min(1, x));
    targetY.current = Math.max(-1, Math.min(1, y));
    startLoop();
  };

  const handleTouchEnd = () => {
    targetX.current = 0;
    targetY.current = 0;
    startLoop();
  };

  // Ambient subtle breathing 3D float for mobile devices
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches);

    if (isTouch) {
      let t = 0;
      const interval = setInterval(() => {
        t += 0.04;
        targetX.current = Math.sin(t) * 0.35;
        targetY.current = Math.cos(t * 0.8) * 0.2;
        startLoop();
      }, 50);

      return () => clearInterval(interval);
    }
  }, [startLoop]);

  return (
    <section
      ref={sectionRef}
      id="about"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full py-20 sm:py-28 md:py-36 bg-canvas relative overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* Editorial Poster Artboard Stage (Image 1 Reference "01 - Artboard 1") */}
      <div className="w-full max-w-[540px] sm:max-w-[700px] md:max-w-[880px] lg:max-w-[980px] px-4 sm:px-6">
        
        {/* Archival Artboard Label Header (Matches "01 - Artboard 1" reference) */}
        <div className="w-full mb-3 px-1 flex justify-between items-center font-mono text-[10px] sm:text-xs text-secondary/70 uppercase tracking-widest">
          <span className="font-semibold">01 — ARTBOARD 1</span>
          <span className="opacity-60 hidden sm:inline-block">DIRECTORIAL PROFILE &amp; MONOLOGUE</span>
        </div>

        {/* 3D Artboard Canvas Container (Warm Ivory Parchment #dedcd5, 10px Apple Radius) */}
        <div
          ref={posterRef}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full bg-[#dedcd5] rounded-[10px] shadow-[0_24px_70px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)] border border-black/[0.06] overflow-hidden transition-shadow duration-500 hover:shadow-[0_36px_90px_rgba(0,0,0,0.12)] p-6 sm:p-10 md:p-14 lg:p-16 min-h-[720px] sm:min-h-[820px] md:min-h-[920px] lg:min-h-[1020px] flex flex-col justify-between"
        >
          {/* Subtle Canvas Grain / Texture Highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/[0.03] pointer-events-none" />

          {/* ============================================================ */}
          {/* TOP SECTION: Typewriter Monologue & Top-Right Meta */}
          {/* ============================================================ */}
          <div className="relative z-20 w-full flex flex-col sm:flex-row justify-between items-start gap-6 pointer-events-none">
            
            {/* Block 1: Top-Left Typewriter Confession (Foreground Depth 32px) */}
            <div
              ref={topLeftRef}
              className="font-mono text-[11px] sm:text-xs md:text-[13px] text-primary/90 uppercase tracking-[-0.01em] leading-relaxed max-w-[340px] sm:max-w-[390px] md:max-w-[430px] will-change-transform space-y-3 pointer-events-auto"
            >
              <p>
                I DIDN&apos;T HAVE SHOOT MONEY. I HAD
                <br />
                A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —
                <br />
                THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT
                <br />
                I&apos;VE DECIDED TO KEEP.
              </p>
              <p className="pt-1">
                THINK WHAT YOU WANT.
                <br />
                I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE
                <br />
                ON A BUDGET OF ZERO.
              </p>
            </div>

            {/* Block 3: Mid-Right Contact Info (Foreground Depth 28px) */}
            <div
              ref={midRightContactRef}
              className="font-mono text-[11px] sm:text-xs md:text-[13px] text-primary uppercase tracking-wide leading-relaxed text-left sm:text-right will-change-transform pointer-events-auto space-y-0.5 shrink-0"
            >
              <div>
                <a
                  href="tel:+918077759520"
                  className="hover:text-accent-red transition-colors inline-block font-semibold"
                >
                  +91 - 8077759520
                </a>
              </div>
              <div>
                <a
                  href="mailto:hiremoiz.works@gmail.com"
                  className="hover:text-accent-red transition-colors inline-block font-semibold"
                >
                  HIREMOIZ.WORKS@GMAIL.COM
                </a>
              </div>
              <div className="text-secondary font-medium">
                LALKUAN, INDIA
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* CENTER STAGE: Floating Mid Texts, Red Script & Subject Cutout */}
          {/* ============================================================ */}
          <div className="relative w-full my-auto py-8 sm:py-12 md:py-16 flex items-center justify-center">
            
            {/* Block 2: Mid-Left Editorial Serif Quote (Depth 48px - Floats closest to camera on left) */}
            <div
              ref={midLeftRef}
              className="absolute left-0 sm:left-2 md:left-6 top-[18%] sm:top-[24%] md:top-[28%] z-30 font-serif italic text-xs sm:text-sm md:text-base leading-snug text-primary max-w-[160px] sm:max-w-[200px] md:max-w-[230px] will-change-transform pointer-events-none select-none drop-shadow-sm"
            >
              <p>
                I don&apos;t get it in the room.
                <br />
                I get it on the floor. give me
                <br />
                the brief and I&apos;ll stare at it —
                <br />
                give me a week and
                <br />
                you&apos;ll see it.
              </p>
            </div>

            {/* Block 4: Lower Mid-Right Statement (Depth 44px - Floats close on right beside arm) */}
            <div
              ref={midRightStatementRef}
              className="absolute right-0 sm:right-2 md:right-8 top-[36%] sm:top-[42%] md:top-[46%] z-30 font-display font-black text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-tight leading-[0.95] text-primary text-left will-change-transform pointer-events-none select-none max-w-[140px] sm:max-w-[170px]"
            >
              <p>I FIX THINGS</p>
              <p>THAT WERE ALREADY</p>
              <p>APPROVED.</p>
            </div>

            {/* LAYER 1: Red "art Director" Script Layer (Depth -15px - Sits behind Moiz) */}
            <div
              ref={scriptRef}
              className="absolute inset-x-0 bottom-4 sm:bottom-8 md:bottom-12 z-10 flex items-center justify-center pointer-events-none select-none will-change-transform overflow-visible"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/red_art_director.png"
                alt="art Director Script"
                className="w-[110%] sm:w-[105%] md:w-full max-w-[1000px] h-auto object-contain pointer-events-none filter drop-shadow-[0_8px_16px_rgba(230,0,0,0.18)]"
                loading="eager"
                draggable={false}
              />
            </div>

            {/* LAYER 2: Contact Ground Ellipse Shadow */}
            <div
              ref={shadowRef}
              className="absolute bottom-2 sm:bottom-4 md:bottom-6 w-[260px] sm:w-[340px] md:w-[420px] lg:w-[480px] h-[24px] sm:h-[32px] bg-black/25 blur-lg rounded-full pointer-events-none z-15 will-change-transform"
            />

            {/* LAYER 3: Moiz Sitting with Rope (Focal Plane Depth 0px) */}
            <div
              ref={subjectRef}
              className="relative z-20 w-[270px] sm:w-[350px] md:w-[440px] lg:w-[500px] h-auto flex items-center justify-center pointer-events-none will-change-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/moiz_director_cutout.png"
                alt="Moiz Khan Art Director"
                className="w-full h-auto object-contain block select-none pointer-events-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                loading="eager"
                draggable={false}
              />
            </div>

          </div>

          {/* ============================================================ */}
          {/* BOTTOM SECTION: Application Manifesto & Gender Identity Tag */}
          {/* ============================================================ */}
          <div className="relative z-20 w-full flex flex-col items-center justify-center text-center gap-5 sm:gap-6 pt-6 sm:pt-10 pointer-events-none">
            
            {/* Block 5: Bottom Bio Manifesto (Depth 22px) */}
            <div
              ref={bottomBioRef}
              className="font-mono text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] text-primary uppercase tracking-[-0.01em] leading-relaxed max-w-xl sm:max-w-2xl px-2 will-change-transform pointer-events-auto"
            >
              <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
              <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
              <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
              <p className="pt-0.5">THAT WERE ALREADY APPROVED.</p>
            </div>

            {/* Block 6: he/him Identity Tag (Depth 14px) */}
            <div
              ref={bottomTagRef}
              className="font-mono text-[10px] sm:text-xs text-secondary/80 tracking-widest will-change-transform"
            >
              he/him
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
