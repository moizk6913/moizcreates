'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax layer element refs
  const topLeftRef = useRef<HTMLDivElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const midLeftRef = useRef<HTMLDivElement>(null);
  const midRightRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const bottomBioRef = useRef<HTMLDivElement>(null);
  const bottomTagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = ((e.clientX / innerWidth) - 0.5) * 2; // range: -1 to 1
      targetY = ((e.clientY / innerHeight) - 0.5) * 2; // range: -1 to 1
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        targetX = ((touch.clientX / innerWidth) - 0.5) * 2;
        targetY = ((touch.clientY / innerHeight) - 0.5) * 2;
      }
    };

    const handleTouchEnd = () => {
      targetX = 0;
      targetY = 0;
    };

    const renderLoop = (time: number) => {
      // Smooth lerp (0.08) for fluid 60/120fps motion
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Gentle organic ambient breathing drift
      const ambientX = Math.sin(time * 0.0012) * 0.08;
      const ambientY = Math.cos(time * 0.001) * 0.06;

      const totalX = currentX + ambientX;
      const totalY = currentY + ambientY;

      // Direct style updates avoiding React re-render overhead
      if (topLeftRef.current) {
        topLeftRef.current.style.transform = `translate3d(${totalX * 18}px, ${totalY * 12}px, 0)`;
      }
      if (topRightRef.current) {
        topRightRef.current.style.transform = `translate3d(${totalX * 15}px, ${totalY * 10}px, 0)`;
      }
      if (midLeftRef.current) {
        midLeftRef.current.style.transform = `translate3d(${totalX * 42}px, ${totalY * 26}px, 0)`;
      }
      if (midRightRef.current) {
        midRightRef.current.style.transform = `translate3d(${totalX * 36}px, ${totalY * 24}px, 0)`;
      }
      // Red script sits deeper in z-space behind Moiz
      if (scriptRef.current) {
        scriptRef.current.style.transform = `translate3d(${totalX * -22}px, ${totalY * -14}px, 0)`;
      }
      // Subject sits at focal plane with subtle natural depth
      if (subjectRef.current) {
        subjectRef.current.style.transform = `translate3d(${totalX * 8}px, ${totalY * 6}px, 0)`;
      }
      if (bottomBioRef.current) {
        bottomBioRef.current.style.transform = `translate3d(${totalX * 22}px, ${totalY * 16}px, 0)`;
      }
      if (bottomTagRef.current) {
        bottomTagRef.current.style.transform = `translate3d(${totalX * 12}px, ${totalY * 8}px, 0)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#e5e3dc] text-[#111111] selection:bg-[#e60000] selection:text-white flex flex-col justify-between overflow-x-hidden relative select-none"
    >
      {/* ============================================================ */}
      {/* TOP HEADER: Navigation bar & Page indicator                  */}
      {/* ============================================================ */}
      <header className="w-full max-w-7xl mx-auto px-5 sm:px-8 pt-5 sm:pt-6 flex items-center justify-between z-40">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px] bg-black/[0.05] hover:bg-black text-primary hover:text-white transition-all duration-200 border border-black/[0.08] backdrop-blur-sm"
        >
          <span className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider">Back to Portfolio</span>
        </Link>

        <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-widest text-secondary uppercase">
          <span className="w-2 h-2 rounded-full bg-[#e60000] animate-pulse" />
          <span className="hidden sm:inline">01 — ARTBOARD 1 // DIRECTORIAL PROFILE</span>
          <span className="sm:hidden">ARTBOARD 01</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN ARTBOARD POSTER CANVAS                                 */}
      {/* ============================================================ */}
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex-1 flex flex-col justify-between py-6 sm:py-8 relative">
        
        {/* UPPER ROW: Typewriter Note (Left) & Contact Details (Right) */}
        <div className="w-full flex items-start justify-between gap-6 relative z-30 pt-2 sm:pt-4">
          
          {/* Block 1: Typewriter Note */}
          <div
            ref={topLeftRef}
            className="font-mono text-[11px] sm:text-xs md:text-sm uppercase tracking-tight text-primary leading-tight will-change-transform max-w-[240px] sm:max-w-[320px] pointer-events-auto"
          >
            <p>I DIDN&apos;T HAVE SHOOT MONEY,</p>
            <p>SO I STOOD THERE WITH A ROPE</p>
            <p>UNTIL IT LOOKED LIKE ART DIRECTION.</p>
          </div>

          {/* Block 3: Contact Block */}
          <div
            ref={topRightRef}
            className="font-mono text-[11px] sm:text-xs md:text-sm uppercase tracking-tight text-primary leading-tight text-right flex flex-col gap-1 will-change-transform pointer-events-auto"
          >
            <a
              href="tel:+918077759520"
              className="hover:text-[#e60000] transition-colors"
            >
              +91 - 8077759520
            </a>
            <a
              href="mailto:hiremoiz.works@gmail.com"
              className="hover:text-[#e60000] transition-colors"
            >
              HIREMOIZ.WORKS@GMAIL.COM
            </a>
            <span className="text-secondary">LALKUAN, INDIA</span>
          </div>

        </div>

        {/* ============================================================ */}
        {/* CENTER STAGE: Floating Mid Texts, Red Script & Subject Cutout */}
        {/* NO ARTIFICIAL SHADOWS - PURE EDITORIAL REALISM                */}
        {/* ============================================================ */}
        <div className="relative w-full my-auto py-6 sm:py-10 md:py-12 flex items-center justify-center min-h-[380px] sm:min-h-[460px] md:min-h-[520px]">
          
          {/* Block 2: Mid-Left Editorial Serif Quote */}
          <div
            ref={midLeftRef}
            style={{ fontFamily: "'BN Cringe Serif', Georgia, serif" }}
            className="absolute left-0 sm:left-2 md:left-6 lg:left-8 top-[14%] sm:top-[20%] md:top-[24%] z-30 italic text-xs sm:text-sm md:text-base lg:text-lg leading-[1.3] text-primary max-w-[150px] sm:max-w-[200px] md:max-w-[240px] will-change-transform pointer-events-none select-none"
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

          {/* Block 4: Lower Mid-Right Bold Statement */}
          <div
            ref={midRightRef}
            className="absolute right-0 sm:right-2 md:right-6 lg:right-8 top-[36%] sm:top-[42%] md:top-[46%] z-30 font-display font-black text-xs sm:text-sm md:text-lg lg:text-xl uppercase tracking-tight leading-[0.95] text-primary text-left will-change-transform pointer-events-none select-none max-w-[130px] sm:max-w-[170px] md:max-w-[210px]"
          >
            <p>I FIX THINGS</p>
            <p>THAT WERE ALREADY</p>
            <p>APPROVED.</p>
          </div>

          {/* LAYER 1: Red 'art Director' Script (Sits behind Moiz) */}
          <div
            ref={scriptRef}
            className="absolute inset-x-0 bottom-4 sm:bottom-8 md:bottom-12 z-10 flex items-center justify-center pointer-events-none select-none will-change-transform overflow-visible"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/red_art_director.png"
              alt="art Director Script"
              className="w-[110%] sm:w-[105%] md:w-full max-w-[980px] h-auto object-contain pointer-events-none filter-none"
              loading="eager"
              draggable={false}
            />
          </div>

          {/* LAYER 2: Moiz Sitting with Rope (Cutout focal plane) */}
          {/* Pure cutout with its natural photographic silhouette - Zero artificial CSS shadow */}
          <div
            ref={subjectRef}
            className="relative z-20 w-[260px] sm:w-[340px] md:w-[420px] lg:w-[470px] h-auto flex items-center justify-center pointer-events-none will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/moiz_director_cutout.png"
              alt="Moiz Khan Art Director"
              className="w-full h-auto object-contain block select-none pointer-events-none filter-none"
              loading="eager"
              draggable={false}
            />
          </div>

        </div>

        {/* ============================================================ */}
        {/* BOTTOM SECTION: Application Manifesto & Identity Tag        */}
        {/* ============================================================ */}
        <div className="relative z-20 w-full flex flex-col items-center justify-center text-center gap-4 sm:gap-5 pt-4 sm:pt-6 pointer-events-none">
          
          {/* Block 5: Bottom Bio Manifesto */}
          <div
            ref={bottomBioRef}
            className="font-mono text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] text-primary uppercase tracking-tight leading-relaxed max-w-xl sm:max-w-2xl px-2 will-change-transform pointer-events-auto"
          >
            <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
            <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
            <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
            <p className="pt-0.5">THAT WERE ALREADY APPROVED.</p>
          </div>

          {/* Block 6: he/him Identity Tag */}
          <div
            ref={bottomTagRef}
            className="font-mono text-[10px] sm:text-xs text-secondary tracking-widest will-change-transform"
          >
            he/him
          </div>

        </div>

      </div>

      {/* Subtle bottom aesthetic marker */}
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-4 text-center z-20">
        <span className="font-mono text-[9px] text-secondary/60 tracking-widest uppercase">
          © {new Date().getFullYear()} MOIZ KHAN // ALL RIGHTS RESERVED
        </span>
      </div>
    </main>
  );
}
