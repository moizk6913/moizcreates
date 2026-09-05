'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  // Parallax refs for surrounding typography (Desktop)
  const topLeftRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const midLeftRef = useRef<HTMLDivElement>(null);
  const midRightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const heHimRef = useRef<HTMLDivElement>(null);

  // Parallax refs for Mobile
  const mobileTopTextRef = useRef<HTMLDivElement>(null);
  const mobileMidLeftRef = useRef<HTMLDivElement>(null);
  const mobileMidRightRef = useRef<HTMLDivElement>(null);
  const mobileBottomRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('hiremoiz.works@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalized coordinates from -1 (left) to 1 (right), and -1 (top) to 1 (bottom)
      targetX = (e.clientX / innerWidth - 0.5) * 2;
      targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        targetX = (touch.clientX / innerWidth - 0.5) * 2;
        targetY = (touch.clientY / innerHeight - 0.5) * 2;
      }
    };

    const handleTouchEnd = () => {
      targetX = 0;
      targetY = 0;
    };

    const renderLoop = (time: number) => {
      // Damped smooth lerp (0.05) for silky, minimal, premium physical floating feel
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      // Subtle organic breathing drift (very gentle)
      const ambientX = Math.sin(time * 0.001) * 0.08;
      const ambientY = Math.cos(time * 0.0008) * 0.05;

      const totalX = currentX + ambientX;
      const totalY = currentY + ambientY;

      // ================================================================
      // DESKTOP TYPOGRAPHY PARALLAX
      // Subtly shifts in opposite direction creating natural 3D depth
      // Center character & red "art director" lettering remain 100% FIXED
      // ================================================================
      if (topLeftRef.current) {
        topLeftRef.current.style.transform = `translate3d(${totalX * -15}px, ${totalY * -7}px, 0)`;
      }
      if (emailRef.current) {
        emailRef.current.style.transform = `translate3d(${totalX * -12}px, ${totalY * -5}px, 0)`;
      }
      if (midLeftRef.current) {
        // Floats slightly closer to viewer
        midLeftRef.current.style.transform = `translate3d(${totalX * -22}px, ${totalY * -10}px, 0)`;
      }
      if (midRightRef.current) {
        // Floats slightly closer to viewer
        midRightRef.current.style.transform = `translate3d(${totalX * -20}px, ${totalY * -9}px, 0)`;
      }
      if (bottomRef.current) {
        bottomRef.current.style.transform = `translate3d(calc(-50% + ${totalX * -14}px), ${totalY * -6}px, 0)`;
      }
      if (heHimRef.current) {
        heHimRef.current.style.transform = `translate3d(calc(-50% + ${totalX * -8}px), ${totalY * -4}px, 0)`;
      }

      // ================================================================
      // MOBILE TYPOGRAPHY PARALLAX
      // Gentle touch / gyroscope response on mobile supporting text
      // ================================================================
      if (mobileTopTextRef.current) {
        mobileTopTextRef.current.style.transform = `translate3d(${totalX * -10}px, 0, 0)`;
      }
      if (mobileMidLeftRef.current) {
        mobileMidLeftRef.current.style.transform = `translate3d(${totalX * -14}px, 0, 0)`;
      }
      if (mobileMidRightRef.current) {
        mobileMidRightRef.current.style.transform = `translate3d(${totalX * -14}px, 0, 0)`;
      }
      if (mobileBottomRef.current) {
        mobileBottomRef.current.style.transform = `translate3d(${totalX * -10}px, 0, 0)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#e4e1da] text-[#111111] selection:bg-[#e60000] selection:text-white flex flex-col justify-between overflow-x-hidden relative select-none">
      
      {/* ============================================================ */}
      {/* MINIMAL FLOATING TOP HEADER: Back Button & Status Indicator  */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-5 sm:py-6 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px] bg-black/[0.05] hover:bg-black text-primary hover:text-white transition-all duration-200 border border-black/10 backdrop-blur-md shadow-sm"
        >
          <span className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider">Back to Portfolio</span>
        </Link>

        <div className="font-mono text-[11px] tracking-widest text-secondary/80 uppercase flex items-center gap-2.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#e60000] animate-pulse" />
          <span className="hidden sm:inline">01 — ARTBOARD 1 // DIRECTORIAL PROFILE</span>
          <span className="sm:hidden">01 // PROFILE</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (DESKTOP): 1920×1080 FULL-SCREEN VIEWPORT CANVAS*/}
      {/* Occupies entire viewport; expands background naturally        */}
      {/* Anchor (Character + Red Lettering) is completely FIXED       */}
      {/* Surrounding typography has subtle smooth 3D mouse parallax   */}
      {/* ============================================================ */}
      <section className="hidden md:flex w-screen h-screen min-h-[640px] items-center justify-center relative overflow-hidden bg-[#e4e1da]">
        
        <div
          className="relative flex items-center justify-center select-none"
          style={{
            width: 'min(100vw, calc(100vh * 1.77778))',
            height: 'min(100vh, calc(100vw * 0.5625))',
            maxHeight: '1080px',
            maxWidth: '1920px',
          }}
        >
          
          {/* ======================================================== */}
          {/* FIXED ANCHOR: Character in Center & Red "art director"   */}
          {/* Sits 100% fixed at all times - zero mouse movement       */}
          {/* ======================================================== */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_stage_clean_2x.png"
            alt="Art Director Scene"
            className="w-full h-full object-contain pointer-events-none select-none filter-none"
            loading="eager"
            draggable={false}
          />

          {/* ======================================================== */}
          {/* SURROUNDING TYPOGRAPHY: 3D Mouse Parallax Floating Layers */}
          {/* ======================================================== */}

          {/* 1. TOP-LEFT POEM (Indent on second stanza matching reference) */}
          <div
            ref={topLeftRef}
            className="absolute top-[11.8%] left-[6.8%] z-30 font-mono text-[clamp(8px,1.06vw,14px)] uppercase tracking-tight leading-[1.32] text-primary will-change-transform pointer-events-none max-w-[42%]"
          >
            <p>I DIDN&apos;T HAVE SHOOT MONEY. I HAD</p>
            <p>A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
            <p>THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
            <p>I&apos;VE DECIDED TO KEEP.</p>
            <div className="pl-[23%] pt-[0.42em] text-primary/95">
              <p>THINK WHAT YOU WANT.</p>
              <p>I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
              <p>ON A BUDGET OF ZERO.</p>
            </div>
          </div>

          {/* 2. RIGHT EMAIL LINK */}
          <div
            ref={emailRef}
            className="absolute top-[28.3%] left-[56.25%] z-30 font-mono text-[clamp(8px,1.06vw,14px)] uppercase tracking-wider text-primary will-change-transform"
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

          {/* 3. MID-LEFT EDITORIAL QUOTE */}
          <div
            ref={midLeftRef}
            className="absolute top-[34.4%] left-[25.2%] z-30 font-mono text-[clamp(7px,0.92vw,12.5px)] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none max-w-[17%]"
          >
            <p>i don&apos;t get it in the room.</p>
            <p>i get it on the floor. give me</p>
            <p>the brief and i&apos;ll stare at it —</p>
            <p>give me a week and</p>
            <p>you&apos;ll see it.</p>
          </div>

          {/* 4. MID-RIGHT STATEMENT */}
          <div
            ref={midRightRef}
            className="absolute top-[39.0%] left-[56.6%] z-30 font-mono text-[clamp(7px,0.92vw,12.5px)] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none max-w-[14%]"
          >
            <p>i fix things</p>
            <p>that were already</p>
            <p>approved.</p>
          </div>

          {/* 5. BOTTOM BIO MANIFESTO */}
          <div
            ref={bottomRef}
            className="absolute top-[76.4%] left-1/2 -translate-x-1/2 z-30 font-mono text-[clamp(7px,0.88vw,12px)] uppercase tracking-tight text-center leading-[1.35] text-primary will-change-transform pointer-events-none w-[90%] max-w-[820px]"
          >
            <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
            <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
            <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
            <div className="pt-[0.32em] font-semibold">
              <p>THAT WERE ALREADY</p>
              <p>APPROVED.</p>
            </div>
          </div>

          {/* 6. PRONOUN IDENTITY TAG */}
          <div
            ref={heHimRef}
            className="absolute top-[92.9%] left-1/2 -translate-x-1/2 z-30 font-mono text-[clamp(6px,0.72vw,10.5px)] text-secondary/80 tracking-widest lowercase will-change-transform pointer-events-none text-center"
          >
            he/him
          </div>

        </div>

      </section>

      {/* ============================================================ */}
      {/* HERO SECTION (MOBILE): TAILORED RESPONSIVE SCENE             */}
      {/* Character & "art director" remain the focal center           */}
      {/* Supporting typography is clean, readable, and responsive     */}
      {/* ============================================================ */}
      <section className="flex md:hidden flex-col items-center justify-between w-full min-h-screen px-5 pt-20 pb-6 gap-6 bg-[#e4e1da]">
        
        {/* Top Supporting Poem */}
        <div
          ref={mobileTopTextRef}
          className="w-full font-mono text-[11px] sm:text-xs uppercase tracking-tight text-primary leading-snug will-change-transform"
        >
          <p>I DIDN&apos;T HAVE SHOOT MONEY. I HAD</p>
          <p>A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
          <p>THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
          <p>I&apos;VE DECIDED TO KEEP.</p>
          <div className="pl-6 pt-2 text-primary/80">
            <p>THINK WHAT YOU WANT.</p>
            <p>I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
            <p>ON A BUDGET OF ZERO.</p>
          </div>
        </div>

        {/* Email Contact Pill */}
        <div className="w-full flex justify-end">
          <a
            href="mailto:hiremoiz.works@gmail.com"
            onClick={handleCopyEmail}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-black/[0.06] hover:bg-[#e60000] hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
          >
            <span>{copied ? 'COPIED ✓' : 'HIREMOIZ.WORKS@GMAIL.COM'}</span>
            <span className="text-sm">↗</span>
          </a>
        </div>

        {/* Mid-Left Quote */}
        <div
          ref={mobileMidLeftRef}
          className="w-full font-mono text-[11px] text-primary leading-snug lowercase pl-3 border-l-2 border-black/20 will-change-transform"
        >
          <p>i don&apos;t get it in the room.</p>
          <p>i get it on the floor. give me</p>
          <p>the brief and i&apos;ll stare at it —</p>
          <p>give me a week and</p>
          <p>you&apos;ll see it.</p>
        </div>

        {/* Focal Anchor: Character sitting in center with red "art director" */}
        <div className="relative w-full my-auto flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_stage_clean_mobile.png"
            alt="Moiz Khan Art Director"
            className="w-full max-w-[460px] h-auto object-contain block select-none pointer-events-none filter-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Mid-Right Statement */}
        <div
          ref={mobileMidRightRef}
          className="w-full font-mono text-[11px] text-primary leading-snug lowercase text-right pr-3 border-r-2 border-black/20 will-change-transform"
        >
          <p>i fix things</p>
          <p>that were already</p>
          <p>approved.</p>
        </div>

        {/* Bottom Bio Manifesto & Pronoun */}
        <div
          ref={mobileBottomRef}
          className="w-full flex flex-col items-center text-center gap-3 pt-2 pb-2 will-change-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-tight text-primary leading-relaxed max-w-sm">
            <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
            <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
            <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
            <div className="pt-1 font-bold">
              <p>THAT WERE ALREADY</p>
              <p>APPROVED.</p>
            </div>
          </div>

          <div className="font-mono text-[11px] text-secondary tracking-widest pt-0.5">
            he/him
          </div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* MINIMAL FOOTER: Subtle copyright note                         */}
      {/* ============================================================ */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 px-6 sm:px-10 pb-3 text-center pointer-events-none">
        <span className="font-mono text-[9px] text-secondary/45 tracking-widest uppercase">
          © {new Date().getFullYear()} MOIZ KHAN // ALL RIGHTS RESERVED
        </span>
      </footer>

    </main>
  );
}
