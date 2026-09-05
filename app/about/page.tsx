'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  // Desktop floating typography refs
  const topLeftRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const midLeftRef = useRef<HTMLDivElement>(null);
  const midRightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const heHimRef = useRef<HTMLDivElement>(null);

  // Mobile typography refs
  const mobileTopRef = useRef<HTMLDivElement>(null);
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
      targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to +1
      targetY = (e.clientY / innerHeight - 0.5) * 2; // -1 to +1
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
        midLeftRef.current.style.transform = `translate3d(${totalX * -22}px, calc(-50% + ${totalY * -9}px), 0)`;
      }
      if (midRightRef.current) {
        midRightRef.current.style.transform = `translate3d(${totalX * -20}px, calc(-50% + ${totalY * -9}px), 0)`;
      }
      if (bottomRef.current) {
        bottomRef.current.style.transform = `translate3d(calc(-50% + ${totalX * -14}px), ${totalY * -6}px, 0)`;
      }
      if (heHimRef.current) {
        heHimRef.current.style.transform = `translate3d(calc(-50% + ${totalX * -8}px), ${totalY * -4}px, 0)`;
      }

      // ================================================================
      // MOBILE TYPOGRAPHY PARALLAX
      // ================================================================
      if (mobileTopRef.current) {
        mobileTopRef.current.style.transform = `translate3d(${totalX * -10}px, 0, 0)`;
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
      {/* CLEAN TOP HEADER: Only Back to Portfolio Button               */}
      {/* Removed "01 editorial whatever text" as requested             */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-5 sm:py-6 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="group pointer-events-auto inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px] bg-black/[0.05] hover:bg-black text-primary hover:text-white transition-all duration-200 border border-black/10 backdrop-blur-md shadow-sm"
        >
          <span className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider">Back to Portfolio</span>
        </Link>
      </header>

      {/* ============================================================ */}
      {/* FULL-VIEWPORT EDITORIAL SCENE (DESKTOP)                      */}
      {/* Background is full-bleed, scalable, with refined smaller     */}
      {/* art direction and complete cursive 'director' with 'd'       */}
      {/* ============================================================ */}
      <section className="hidden md:block w-full h-screen min-h-[660px] relative overflow-hidden bg-[#e4e1da]">
        
        {/* ========================================================== */}
        {/* 1. FIXED VISUAL ANCHOR (Character & Red 'art director')    */}
        {/* Sits 100% FIXED in center with complete letter 'd'         */}
        {/* Made slightly smaller for luxurious editorial balance      */}
        {/* ========================================================== */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72vw] max-w-[1080px] xl:max-w-[1180px] 2xl:max-w-[1260px] flex items-center justify-center pointer-events-none z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_anchor_perfect_v2.png"
            alt="Moiz Khan Art Director"
            className="w-full h-auto object-contain block select-none pointer-events-none filter-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* ========================================================== */}
        {/* 2. SURROUNDING TYPOGRAPHY (Exact Formatting as Written)    */}
        {/* ========================================================== */}

        {/* TOP-LEFT POEM */}
        <div
          ref={topLeftRef}
          className="absolute left-[6vw] top-[11vh] z-30 font-mono text-[clamp(11px,1.1vw,14.5px)] uppercase tracking-tight leading-[1.34] text-primary will-change-transform pointer-events-none"
        >
          <p className="whitespace-nowrap">I DIDN&apos;T HAVE SHOOT MONEY. I HAD</p>
          <p className="whitespace-nowrap">A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
          <p className="whitespace-nowrap">THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
          <p className="whitespace-nowrap">I&apos;VE DECIDED TO KEEP.</p>
          <div className="pl-[22%] pt-[0.4em] text-primary/95">
            <p className="whitespace-nowrap">THINK WHAT YOU WANT.</p>
            <p className="whitespace-nowrap">I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
            <p className="whitespace-nowrap">ON A BUDGET OF ZERO.</p>
          </div>
        </div>

        {/* RIGHT EMAIL LINK */}
        <div
          ref={emailRef}
          className="absolute left-[56.5vw] top-[26.5vh] z-30 font-mono text-[clamp(11px,1.08vw,14px)] uppercase tracking-wider text-primary will-change-transform"
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
          className="absolute left-[24vw] top-[34vh] z-30 font-mono text-[clamp(9.5px,0.92vw,12.5px)] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none"
        >
          <p className="whitespace-nowrap">i don&apos;t get it in the room.</p>
          <p className="whitespace-nowrap">i get it on the floor. give me</p>
          <p className="whitespace-nowrap">the brief and i&apos;ll stare at it —</p>
          <p className="whitespace-nowrap">give me a week and</p>
          <p className="whitespace-nowrap">you&apos;ll see it.</p>
        </div>

        {/* MID-RIGHT STATEMENT */}
        <div
          ref={midRightRef}
          className="absolute left-[61vw] top-[40.5vh] z-30 font-mono text-[clamp(9.5px,0.92vw,12.5px)] leading-[1.3] text-primary lowercase will-change-transform pointer-events-none text-left"
        >
          <p className="whitespace-nowrap">i fix things</p>
          <p className="whitespace-nowrap">that were already</p>
          <p className="whitespace-nowrap">approved.</p>
        </div>

        {/* BOTTOM BIO MANIFESTO */}
        <div
          ref={bottomRef}
          className="absolute top-[78vh] left-1/2 -translate-x-1/2 z-30 font-mono text-[clamp(10px,0.88vw,12.5px)] uppercase tracking-tight text-center leading-[1.36] text-primary will-change-transform pointer-events-none"
        >
          <p className="whitespace-nowrap">YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
          <p className="whitespace-nowrap">ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
          <p className="whitespace-nowrap">THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
          <div className="pt-[0.3em] font-semibold">
            <p className="whitespace-nowrap">THAT WERE ALREADY</p>
            <p className="whitespace-nowrap">APPROVED.</p>
          </div>
        </div>

        {/* PRONOUN IDENTITY TAG */}
        <div
          ref={heHimRef}
          className="absolute top-[93vh] left-1/2 -translate-x-1/2 z-30 font-mono text-[clamp(8px,0.72vw,11px)] text-secondary/80 tracking-widest lowercase will-change-transform pointer-events-none text-center"
        >
          he/him
        </div>

      </section>

      {/* ============================================================ */}
      {/* MOBILE SCENE: TAILORED VERTICAL EDITORIAL COMPOSITION        */}
      {/* ============================================================ */}
      <section className="flex md:hidden flex-col items-center justify-between w-full min-h-screen px-4 pt-20 pb-8 gap-5 bg-[#e4e1da] overflow-x-hidden">
        
        {/* Top Supporting Poem */}
        <div
          ref={mobileTopRef}
          className="w-full max-w-[340px] font-mono text-[11px] uppercase tracking-tight text-primary leading-snug will-change-transform"
        >
          <p>I DIDN&apos;T HAVE SHOOT MONEY. I HAD</p>
          <p>A LAPTOP AND A STUBBORN STREAK. BELIEVE ME IT&apos;S ME —</p>
          <p>THE FACE IS UNTOUCHED, THE MUSCLES ARE A GIFT</p>
          <p>I&apos;VE DECIDED TO KEEP.</p>
          <div className="pl-4 pt-2 text-primary/80">
            <p>THINK WHAT YOU WANT.</p>
            <p>I&apos;M CREATIVE, THIS IS WHAT THAT LOOKS LIKE</p>
            <p>ON A BUDGET OF ZERO.</p>
          </div>
        </div>

        {/* Email Contact Pill */}
        <div className="w-full max-w-[340px] flex justify-center sm:justify-end">
          <a
            href="mailto:hiremoiz.works@gmail.com"
            onClick={handleCopyEmail}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-black/[0.06] hover:bg-[#e60000] hover:text-white font-mono text-[10.5px] uppercase tracking-wider transition-all duration-200 shadow-sm"
          >
            <span>{copied ? 'COPIED ✓' : 'HIREMOIZ.WORKS@GMAIL.COM'}</span>
            <span className="text-xs">↗</span>
          </a>
        </div>

        {/* Mid-Left Quote */}
        <div
          ref={mobileMidLeftRef}
          className="w-full max-w-[340px] font-mono text-[11px] text-primary leading-snug lowercase pl-3 border-l-2 border-black/20 will-change-transform"
        >
          <p>i don&apos;t get it in the room.</p>
          <p>i get it on the floor. give me</p>
          <p>the brief and i&apos;ll stare at it —</p>
          <p>give me a week and</p>
          <p>you&apos;ll see it.</p>
        </div>

        {/* Focal Anchor: Character sitting in center with complete red 'art director' */}
        <div className="relative w-full max-w-[330px] my-auto flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_anchor_perfect_v2.png"
            alt="Moiz Khan Art Director"
            className="w-full h-auto object-contain block select-none pointer-events-none filter-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Mid-Right Statement */}
        <div
          ref={mobileMidRightRef}
          className="w-full max-w-[340px] font-mono text-[11px] text-primary leading-snug lowercase text-right pr-3 border-r-2 border-black/20 will-change-transform"
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
          <div className="font-mono text-[10px] uppercase tracking-tight text-primary leading-relaxed max-w-[320px]">
            <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
            <p className="mt-1">ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
            <div className="pt-2 font-bold">
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
        <span className="font-mono text-[9px] text-secondary/35 tracking-widest uppercase">
          © {new Date().getFullYear()} MOIZ KHAN // ALL RIGHTS RESERVED
        </span>
      </footer>

    </main>
  );
}
