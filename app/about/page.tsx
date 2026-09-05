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
  const watermarkTopRef = useRef<HTMLDivElement>(null);

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
      // Normalized coordinates: -1 (left) to +1 (right)
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
      // DESKTOP SURROUNDING TYPOGRAPHY PARALLAX
      // Opposite shift creates authentic 3D spatial depth
      // Central anchor (character + red script) remains 100% FIXED
      // ================================================================
      if (topLeftRef.current) {
        topLeftRef.current.style.transform = `translate3d(${totalX * -15}px, ${totalY * -7}px, 0)`;
      }
      if (emailRef.current) {
        emailRef.current.style.transform = `translate3d(${totalX * -12}px, ${totalY * -5}px, 0)`;
      }
      if (midLeftRef.current) {
        // Floats forward closer to camera
        midLeftRef.current.style.transform = `translate3d(${totalX * -22}px, calc(-50% + ${totalY * -10}px), 0)`;
      }
      if (midRightRef.current) {
        // Floats forward closer to camera
        midRightRef.current.style.transform = `translate3d(${totalX * -20}px, calc(-50% + ${totalY * -9}px), 0)`;
      }
      if (bottomRef.current) {
        bottomRef.current.style.transform = `translate3d(calc(-50% + ${totalX * -14}px), ${totalY * -6}px, 0)`;
      }
      if (heHimRef.current) {
        heHimRef.current.style.transform = `translate3d(calc(-50% + ${totalX * -8}px), ${totalY * -4}px, 0)`;
      }
      if (watermarkTopRef.current) {
        // Background watermark shifts in opposite direction (recessed depth)
        watermarkTopRef.current.style.transform = `translate3d(${totalX * 8}px, ${totalY * 4}px, 0)`;
      }

      // ================================================================
      // MOBILE TYPOGRAPHY PARALLAX
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
    <main className="w-full min-h-screen bg-[#e4e1da] text-[#111111] selection:bg-[#e60000] selection:text-white flex flex-col justify-between relative overflow-x-hidden select-none">
      
      {/* ============================================================ */}
      {/* MINIMAL FLOATING NAVIGATION: Back Button & Status Tag        */}
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
          <span className="hidden sm:inline">01 — DIRECTORIAL PROFILE // EDITORIAL SCENE</span>
          <span className="sm:hidden">01 // PROFILE</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* FULL-VIEWPORT EDITORIAL SCENE (DESKTOP)                      */}
      {/* NO fixed card, NO inner artboard, NO borders, NO margins     */}
      {/* Entire viewport IS the canvas; background expands naturally  */}
      {/* ============================================================ */}
      <section className="hidden md:flex w-full h-screen min-h-[660px] relative items-center justify-center overflow-hidden bg-[#e4e1da]">
        
        {/* ========================================================== */}
        {/* 1. FIXED VISUAL ANCHOR (Character & Red Lettering)         */}
        {/* Transparent cutout sitting directly on the canvas          */}
        {/* Sits 100% FIXED in the center of the viewport              */}
        {/* ========================================================== */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84vw] max-w-[1240px] xl:max-w-[1360px] 2xl:max-w-[1450px] flex items-center justify-center pointer-events-none z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_center_anchor_1080.png"
            alt="Art Director Scene"
            className="w-full h-auto object-contain block select-none pointer-events-none filter-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* ========================================================== */}
        {/* 2. BACKGROUND GHOST WATERMARK (Top-Right Recessed Depth)   */}
        {/* ========================================================== */}
        <div
          ref={watermarkTopRef}
          className="hidden lg:block absolute right-8 xl:right-16 2xl:right-24 top-20 xl:top-24 z-10 font-mono text-[10px] xl:text-[11.5px] text-black/[0.055] uppercase tracking-tight leading-[1.32] pointer-events-none select-none max-w-sm text-right will-change-transform"
        >
          <p>A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
          <p>THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
          <p>I&apos;VE DECIDED TO KEEP.</p>
          <div className="pt-2">
            <p>THINK WHAT YOU WANT.</p>
            <p>I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
            <p>ON A BUDGET OF ZERO.</p>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 3. SURROUNDING TYPOGRAPHY (Interactive 3D Mouse Parallax)  */}
        {/* ========================================================== */}

        {/* TOP-LEFT POEM */}
        <div
          ref={topLeftRef}
          className="absolute left-8 lg:left-14 xl:left-24 2xl:left-32 top-20 lg:top-24 xl:top-28 z-30 font-mono text-xs lg:text-[12.5px] xl:text-[13.5px] uppercase tracking-tight leading-[1.32] text-primary will-change-transform pointer-events-none max-w-[380px] lg:max-w-[430px] xl:max-w-[480px]"
        >
          <p>I DIDN&apos;T HAVE SHOOT MONEY. I HAD</p>
          <p>A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
          <p>THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
          <p>I&apos;VE DECIDED TO KEEP.</p>
          <div className="pl-[22%] pt-[0.4em] text-primary/95">
            <p>THINK WHAT YOU WANT.</p>
            <p>I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
            <p>ON A BUDGET OF ZERO.</p>
          </div>
        </div>

        {/* RIGHT EMAIL LINK */}
        <div
          ref={emailRef}
          className="absolute right-8 lg:right-16 xl:right-24 2xl:right-32 top-32 lg:top-36 xl:top-44 z-30 font-mono text-xs lg:text-[12.5px] xl:text-[13.5px] uppercase tracking-wider text-primary will-change-transform"
        >
          <a
            href="mailto:hiremoiz.works@gmail.com"
            onClick={handleCopyEmail}
            className="group inline-flex items-center gap-2 hover:text-[#e60000] transition-colors cursor-pointer"
            title="Click to copy email or open mailto"
          >
            <span>{copied ? 'COPIED TO CLIPBOARD ✓' : 'HIREMOIZ.WORKS@GMAIL.COM'}</span>
            <span className="text-[0.8em] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
          </a>
        </div>

        {/* MID-LEFT EDITORIAL QUOTE */}
        <div
          ref={midLeftRef}
          className="absolute left-6 lg:left-14 xl:left-24 2xl:left-36 top-[46%] -translate-y-1/2 z-30 font-mono text-[11px] lg:text-xs xl:text-[13px] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none max-w-[170px] lg:max-w-[195px] xl:max-w-[220px]"
        >
          <p>i don&apos;t get it in the room.</p>
          <p>i get it on the floor. give me</p>
          <p>the brief and i&apos;ll stare at it —</p>
          <p>give me a week and</p>
          <p>you&apos;ll see it.</p>
        </div>

        {/* MID-RIGHT STATEMENT */}
        <div
          ref={midRightRef}
          className="absolute right-6 lg:right-14 xl:right-24 2xl:right-36 top-[50%] -translate-y-1/2 z-30 font-mono text-[11px] lg:text-xs xl:text-[13px] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none max-w-[140px] lg:max-w-[160px] xl:max-w-[185px] text-left"
        >
          <p>i fix things</p>
          <p>that were already</p>
          <p>approved.</p>
        </div>

        {/* BOTTOM BIO MANIFESTO */}
        <div
          ref={bottomRef}
          className="absolute bottom-12 lg:bottom-14 xl:bottom-16 left-1/2 -translate-x-1/2 z-30 font-mono text-[11px] lg:text-[11.5px] xl:text-[12.5px] uppercase tracking-tight text-center leading-[1.35] text-primary will-change-transform pointer-events-none w-[90%] max-w-2xl xl:max-w-3xl"
        >
          <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
          <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
          <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
          <div className="pt-[0.3em] font-semibold">
            <p>THAT WERE ALREADY</p>
            <p>APPROVED.</p>
          </div>
        </div>

        {/* PRONOUN IDENTITY TAG */}
        <div
          ref={heHimRef}
          className="absolute bottom-4 lg:bottom-5 xl:bottom-6 left-1/2 -translate-x-1/2 z-30 font-mono text-[10px] lg:text-[11px] text-secondary/80 tracking-widest lowercase will-change-transform pointer-events-none text-center"
        >
          he/him
        </div>

      </section>

      {/* ============================================================ */}
      {/* MOBILE SCENE: TAILORED VERTICAL EDITORIAL COMPOSITION        */}
      {/* Background expands continuously; character is central focus  */}
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
            src="/about_center_anchor_1080.png"
            alt="Moiz Khan Art Director"
            className="w-full max-w-[480px] h-auto object-contain block select-none pointer-events-none filter-none"
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
        <span className="font-mono text-[9px] text-secondary/40 tracking-widest uppercase">
          © {new Date().getFullYear()} MOIZ KHAN // ALL RIGHTS RESERVED
        </span>
      </footer>

    </main>
  );
}
