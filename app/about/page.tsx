'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mobileStageRef = useRef<HTMLDivElement>(null);

  const copyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('hiremoiz.works@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    // 3D Tilt perspective for desktop
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
    };

    // Touch parallax on mobile
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
      // Smooth lerp (0.08) for fluid 60/120fps motion
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Gentle ambient breathing drift (gyro-like effect)
      const ambientX = Math.sin(time * 0.0012) * 0.08;
      const ambientY = Math.cos(time * 0.001) * 0.06;

      const totalX = currentX + ambientX;
      const totalY = currentY + ambientY;

      // Desktop 3D perspective tilt
      if (cardRef.current) {
        const rotY = totalX * 4; // degrees tilt left/right
        const rotX = -totalY * 3; // degrees tilt up/down
        const transX = totalX * 8;
        const transY = totalY * 6;
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${transX}px, ${transY}px, 0)`;
      }

      // Mobile stage subtle float
      if (mobileStageRef.current) {
        mobileStageRef.current.style.transform = `translate3d(${totalX * 10}px, ${totalY * 8}px, 0)`;
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
    <main className="min-h-screen bg-[#e4e1da] text-[#111111] selection:bg-[#e60000] selection:text-white flex flex-col justify-between overflow-x-hidden relative select-none">
      
      {/* ============================================================ */}
      {/* TOP HEADER: Clean Navigation bar & Status Indicator          */}
      {/* ============================================================ */}
      <header className="w-full max-w-7xl mx-auto px-5 sm:px-8 pt-5 sm:pt-6 flex items-center justify-between z-40">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px] bg-black/[0.05] hover:bg-black text-primary hover:text-white transition-all duration-200 border border-black/[0.08] backdrop-blur-sm shadow-sm"
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
      {/* DESKTOP / WIDESCREEN VIEW: 16:9 Iconic Artboard with 3D Tilt */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-1 items-center justify-center px-6 lg:px-12 py-6">
        <div
          ref={cardRef}
          className="relative w-full max-w-[1380px] aspect-[16/9] rounded-[10px] overflow-hidden will-change-transform transition-transform ease-out duration-100 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_artboard_2x.png"
            alt="Moiz Khan Directorial Profile Artboard"
            className="w-full h-full object-contain pointer-events-none select-none filter-none"
            loading="eager"
            draggable={false}
          />

          {/* Interactive Hotspot for HIREMOIZ.WORKS@GMAIL.COM */}
          <div className="absolute top-[26.2%] left-[54.2%] w-[20%] h-[5.5%] z-30 flex items-center">
            <a
              href="mailto:hiremoiz.works@gmail.com"
              onClick={copyEmail}
              className="group relative w-full h-full flex items-center cursor-pointer rounded-[6px] transition-colors hover:bg-black/[0.04]"
              title="Click to copy email or open mailto"
            >
              <span className="sr-only">Contact: hiremoiz.works@gmail.com</span>
              
              {/* Tooltip feedback badge */}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-[6px] bg-black text-white text-[10px] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
                {copied ? 'COPIED TO CLIPBOARD ✓' : 'CLICK TO COPY EMAIL ↗'}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE / PORTRAIT VIEW: Fully Tailored Responsive Layout     */}
      {/* ============================================================ */}
      <div className="flex md:hidden flex-col items-center w-full px-5 py-6 gap-6 flex-1 justify-between">
        
        {/* Block 1: Top-Left Monospace Poem */}
        <div className="w-full font-mono text-xs uppercase tracking-tight text-primary leading-snug pt-2">
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

        {/* Block 2: Email Direct Link Pill */}
        <div className="w-full flex justify-end">
          <a
            href="mailto:hiremoiz.works@gmail.com"
            onClick={copyEmail}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-black/[0.06] hover:bg-[#e60000] hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
          >
            <span>{copied ? 'COPIED ✓' : 'HIREMOIZ.WORKS@GMAIL.COM'}</span>
            <span className="text-sm">↗</span>
          </a>
        </div>

        {/* Block 3: Mid-Left Lowercase Quote */}
        <div className="w-full font-mono text-xs text-primary leading-snug lowercase pl-3 border-l-2 border-black/20">
          <p>i don&apos;t get it in the room.</p>
          <p>i get it on the floor. give me</p>
          <p>the brief and i&apos;ll stare at it —</p>
          <p>give me a week and</p>
          <p>you&apos;ll see it.</p>
        </div>

        {/* Block 4: Stage Centerpiece (Moiz + Red Script) with Touch Parallax */}
        <div
          ref={mobileStageRef}
          className="relative w-full my-2 flex items-center justify-center will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about_stage_mobile.png"
            alt="Moiz Khan Art Director"
            className="w-full h-auto object-contain block select-none pointer-events-none filter-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Block 5: Mid-Right Lowercase Statement */}
        <div className="w-full font-mono text-xs text-primary leading-snug lowercase text-right pr-3 border-r-2 border-black/20">
          <p>i fix things</p>
          <p>that were already</p>
          <p>approved.</p>
        </div>

        {/* Block 6: Bottom Bio Manifesto & Identity */}
        <div className="w-full flex flex-col items-center text-center gap-3 pt-2 pb-4">
          <div className="font-mono text-[11px] sm:text-xs uppercase tracking-tight text-primary leading-relaxed max-w-md">
            <p>YOU&apos;RE READING THIS BECAUSE I APPLIED FOR SOMETHING.</p>
            <p>ART DIRECTOR. BRAND DESIGNER. SENIOR GRAPHIC DESIGNER. I&apos;VE DONE ALL</p>
            <p>THREE AND ENJOYED TWO. THE REST I&apos;LL FIGURE OUT BY MONDAY.</p>
            <div className="pt-1.5 font-bold">
              <p>THAT WERE ALREADY</p>
              <p>APPROVED.</p>
            </div>
          </div>

          <div className="font-mono text-xs text-secondary tracking-widest pt-1">
            he/him
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* BOTTOM FOOTER: Subtle copyright note                         */}
      {/* ============================================================ */}
      <footer className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-4 text-center z-20">
        <span className="font-mono text-[9px] text-secondary/60 tracking-widest uppercase">
          © {new Date().getFullYear()} MOIZ KHAN // ALL RIGHTS RESERVED
        </span>
      </footer>

    </main>
  );
}
