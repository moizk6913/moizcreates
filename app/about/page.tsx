'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  // Floating text layer refs for subtle horizontal parallax
  const topLeftRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const midLeftRef = useRef<HTMLDivElement>(null);
  const midRightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const heHimRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('hiremoiz.works@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let targetX = 0;
    let currentX = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth } = window;
        targetX = (touch.clientX / innerWidth - 0.5) * 2;
      }
    };

    const handleTouchEnd = () => {
      targetX = 0;
    };

    const renderLoop = (time: number) => {
      // Damped smooth lerp for silky 60/120fps motion
      currentX += (targetX - currentX) * 0.08;

      // Gentle ambient drift (subtle organic breathing)
      const ambientX = Math.sin(time * 0.0012) * 0.1;
      const totalX = currentX + ambientX;

      // Only text shifts horizontally left/right while subject & background remain static
      if (topLeftRef.current) {
        topLeftRef.current.style.transform = `translate3d(${totalX * 18}px, 0, 0)`;
      }
      if (emailRef.current) {
        emailRef.current.style.transform = `translate3d(${totalX * 14}px, 0, 0)`;
      }
      if (midLeftRef.current) {
        midLeftRef.current.style.transform = `translate3d(${totalX * 22}px, 0, 0)`;
      }
      if (midRightRef.current) {
        midRightRef.current.style.transform = `translate3d(${totalX * 20}px, 0, 0)`;
      }
      if (bottomRef.current) {
        bottomRef.current.style.transform = `translate3d(calc(-50% + ${totalX * 16}px), 0, 0)`;
      }
      if (heHimRef.current) {
        heHimRef.current.style.transform = `translate3d(calc(-50% + ${totalX * 10}px), 0, 0)`;
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
    <main className="min-h-screen w-full bg-[#e4e1da] text-[#111111] selection:bg-[#e60000] selection:text-white flex flex-col justify-between overflow-x-hidden relative select-none">
      
      {/* ============================================================ */}
      {/* FLOATING HEADER: Minimal Back button & Directorial label     */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-black/[0.06] hover:bg-black text-primary hover:text-white transition-all duration-200 border border-black/10 backdrop-blur-md shadow-sm"
        >
          <span className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider">Back</span>
        </Link>

        <div className="font-mono text-[11px] tracking-widest text-secondary/80 uppercase flex items-center gap-2 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e60000] animate-pulse" />
          <span className="hidden sm:inline">01 — ARTBOARD 1 // DIRECTORIAL PROFILE</span>
          <span className="sm:hidden">01 // PROFILE</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN VIEWPORT: Full-bleed Seamless Artboard Canvas          */}
      {/* Background & Moiz remain 100% static, text moves left/right */}
      {/* ============================================================ */}
      <div className="w-full flex-1 flex items-center justify-center relative min-h-screen py-12 md:py-0">
        <div className="relative w-full max-w-[1920px] aspect-[16/9] flex items-center justify-center overflow-hidden">
          
          {/* STATIC BASE IMAGE: Moiz sitting with rope + red script + watermarks */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_stage_clean_2x.png"
            alt="Moiz Khan Directorial Profile"
            className="w-full h-full object-contain pointer-events-none select-none filter-none"
            loading="eager"
            draggable={false}
          />

          {/* ========================================================== */}
          {/* FLOATING TEXT LAYER 1: Top-Left Monospace Poem             */}
          {/* ========================================================== */}
          <div
            ref={topLeftRef}
            className="absolute top-[11.8%] left-[6.8%] z-30 font-mono text-[clamp(7.5px,1.05vw,14px)] uppercase tracking-tight leading-[1.32] text-primary will-change-transform pointer-events-none max-w-[42%]"
          >
            <p>I DIDN&apos;T HAVE SHOOT MONEY. I HAD</p>
            <p>A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
            <p>THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
            <p>I&apos;VE DECIDED TO KEEP.</p>
            <div className="pl-[23%] pt-[0.4em] text-primary/95">
              <p>THINK WHAT YOU WANT.</p>
              <p>I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
              <p>ON A BUDGET OF ZERO.</p>
            </div>
          </div>

          {/* ========================================================== */}
          {/* FLOATING TEXT LAYER 2: Email on the Right                   */}
          {/* ========================================================== */}
          <div
            ref={emailRef}
            className="absolute top-[28.3%] left-[56.25%] z-30 font-mono text-[clamp(7.5px,1.05vw,14px)] uppercase tracking-wider text-primary will-change-transform"
          >
            <a
              href="mailto:hiremoiz.works@gmail.com"
              onClick={handleCopyEmail}
              className="group inline-flex items-center gap-1.5 hover:text-[#e60000] transition-colors cursor-pointer"
              title="Click to copy email or open mailto"
            >
              <span>{copied ? 'COPIED TO CLIPBOARD ✓' : 'HIREMOIZ.WORKS@GMAIL.COM'}</span>
              <span className="text-[0.8em] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
            </a>
          </div>

          {/* ========================================================== */}
          {/* FLOATING TEXT LAYER 3: Mid-Left Lowercase Quote             */}
          {/* ========================================================== */}
          <div
            ref={midLeftRef}
            className="absolute top-[34.4%] left-[25.2%] z-30 font-mono text-[clamp(6.5px,0.92vw,12.5px)] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none max-w-[17%]"
          >
            <p>i don&apos;t get it in the room.</p>
            <p>i get it on the floor. give me</p>
            <p>the brief and i&apos;ll stare at it —</p>
            <p>give me a week and</p>
            <p>you&apos;ll see it.</p>
          </div>

          {/* ========================================================== */}
          {/* FLOATING TEXT LAYER 4: Mid-Right Lowercase Statement        */}
          {/* ========================================================== */}
          <div
            ref={midRightRef}
            className="absolute top-[39.0%] left-[56.6%] z-30 font-mono text-[clamp(6.5px,0.92vw,12.5px)] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none max-w-[14%]"
          >
            <p>i fix things</p>
            <p>that were already</p>
            <p>approved.</p>
          </div>

          {/* ========================================================== */}
          {/* FLOATING TEXT LAYER 5: Bottom Manifesto                    */}
          {/* ========================================================== */}
          <div
            ref={bottomRef}
            className="absolute top-[76.4%] left-1/2 -translate-x-1/2 z-30 font-mono text-[clamp(6.5px,0.88vw,12px)] uppercase tracking-tight text-center leading-[1.35] text-primary will-change-transform pointer-events-none w-[90%] max-w-[820px]"
          >
            <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
            <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
            <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
            <div className="pt-[0.3em] font-semibold">
              <p>THAT WERE ALREADY</p>
              <p>APPROVED.</p>
            </div>
          </div>

          {/* ========================================================== */}
          {/* FLOATING TEXT LAYER 6: Pronoun Tag                         */}
          {/* ========================================================== */}
          <div
            ref={heHimRef}
            className="absolute top-[92.9%] left-1/2 -translate-x-1/2 z-30 font-mono text-[clamp(6px,0.72vw,10.5px)] text-secondary/80 tracking-widest lowercase will-change-transform pointer-events-none text-center"
          >
            he/him
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER: Minimal copyright bar                                */}
      {/* ============================================================ */}
      <footer className="w-full px-5 sm:px-8 pb-3 sm:pb-4 text-center z-20 pointer-events-none">
        <span className="font-mono text-[9px] text-secondary/50 tracking-widest uppercase">
          © {new Date().getFullYear()} MOIZ KHAN // ALL RIGHTS RESERVED
        </span>
      </footer>

    </main>
  );
}
