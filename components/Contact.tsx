'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [dubaiTime, setDubaiTime] = useState('');
  const email = 'hiremoiz.works@gmail.com';

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dubai',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now);
        setDubaiTime(formatted);
      } catch {
        setDubaiTime('');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <footer
      id="contact"
      className="w-full pt-16 sm:pt-24 md:pt-32 pb-0 bg-[#efeeea] relative overflow-hidden select-none border-none flex flex-col justify-between"
    >
      {/* Soft Ambient Pure Red Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(230,0,0,0.025)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* MAIN ARTBOARD CONTAINER (Exact layout matching Image 1: Artboard 1) */}
      <div className="w-full max-w-[1780px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 flex-1 flex flex-col justify-between relative z-10 space-y-16 sm:space-y-24 md:space-y-28">
        
        {/* TOP ROW: ICON / MONOGRAM (Exact position from Artboard 1) */}
        <div className="flex items-center justify-start pt-2">
          <Link
            href="#top"
            className="group block transition-transform duration-300 hover:scale-105"
            aria-label="Moiz Khan Logo"
          >
            <Image
              src="/assets/logo.png"
              alt="Moiz Khan"
              width={48}
              height={48}
              className="h-9 sm:h-10 md:h-11 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
              priority
            />
          </Link>
        </div>

        {/* MID-BODY: THE 3 EDITORIAL BLOCKS (Exact composition from Artboard 1) */}
        <div className="w-full flex flex-col space-y-14 sm:space-y-20">
          
          {/* Row 1: BUSINESS INQUIRIES (Left) & STUDIO DIRECTORY (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14 items-start">
            
            {/* Block 1: BUSINESS INQUIRIES */}
            <div className="md:col-span-5 lg:col-span-4 space-y-2.5">
              <span className="font-britti font-bold text-xs sm:text-sm tracking-widest text-black uppercase block">
                BUSINESS INQUIRIES
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="font-mono text-xs sm:text-sm md:text-[15px] font-medium text-black hover:text-[#e60000] uppercase tracking-wider transition-colors block text-left group cursor-pointer"
                  title="Click to copy email address"
                >
                  <span className="group-hover:underline underline-offset-4">
                    {email}
                  </span>
                  {copied && (
                    <span className="ml-2 text-[10px] font-mono font-bold text-emerald-600 normal-case bg-emerald-100/90 px-2 py-0.5 rounded-full inline-block">
                      ✓ Copied
                    </span>
                  )}
                </button>
                <p className="font-mono text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wide">
                  COMMISSIONS &amp; CAMPAIGNS
                </p>
              </div>
            </div>

            {/* Block 2: STUDIO DIRECTORY */}
            <div className="md:col-start-7 md:col-span-6 lg:col-start-8 lg:col-span-5 space-y-2.5">
              <span className="font-britti font-bold text-xs sm:text-sm tracking-widest text-black uppercase block">
                STUDIO DIRECTORY
              </span>
              <div className="space-y-1.5">
                <nav className="flex flex-wrap items-center gap-x-5 sm:gap-x-7 gap-y-1 font-britti font-bold text-xs sm:text-sm uppercase tracking-wider text-black">
                  <Link href="/#work" className="hover:text-[#e60000] transition-colors">
                    WORK
                  </Link>
                  <Link href="/canvas?view=playground" className="hover:text-[#e60000] transition-colors">
                    PLAYGROUND
                  </Link>
                  <Link href="/canvas?view=archive" className="hover:text-[#e60000] transition-colors">
                    ARCHIVE
                  </Link>
                  <Link href="/about" className="hover:text-[#e60000] transition-colors">
                    ABOUT
                  </Link>
                </nav>
                <p className="font-mono text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wide">
                  NAVIGATE PORTFOLIO
                </p>
              </div>
            </div>

          </div>

          {/* Row 2: DIRECT CHANNELS (Centered horizontally as in Artboard 1) */}
          <div className="w-full flex flex-col items-center text-center space-y-2.5 pt-2 sm:pt-4">
            <span className="font-britti font-bold text-xs sm:text-sm tracking-widest text-black uppercase block">
              DIRECT CHANNELS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-9 gap-y-2 font-mono text-xs sm:text-sm font-medium uppercase tracking-wider text-black">
              <a
                href="https://instagram.com/moizcreates"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#e60000] transition-colors flex items-center gap-1 group"
              >
                <span>INSTAGRAM</span>
                <span className="text-[11px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
              <a
                href="https://linkedin.com/in/moizkhan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#e60000] transition-colors flex items-center gap-1 group"
              >
                <span>LINKEDIN</span>
                <span className="text-[11px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
              <a
                href="https://wa.me/971500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#e60000] transition-colors flex items-center gap-1 group"
              >
                <span>WHATSAPP</span>
                <span className="text-[11px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>
          </div>

        </div>

        {/* HORIZON METADATA ROW (Exact 3-point alignment above the wordmark from Artboard 1) */}
        <div className="w-full flex items-center justify-between pt-10 sm:pt-14 pb-2 border-none">
          {/* Left: All right reserved */}
          <div className="text-left font-sans text-xs sm:text-sm text-black/80 font-normal">
            All right reserved
          </div>

          {/* Center: 2026 */}
          <div className="text-center font-sans text-xs sm:text-sm text-black/80 font-normal">
            2026
          </div>

          {/* Right: Time (GMT+4) with live dynamic Dubai clock */}
          <div className="text-right font-sans text-xs sm:text-sm text-[#4d5b7c] font-medium flex items-center gap-1.5">
            <span>Time (GMT+4)</span>
            {dubaiTime && (
              <span className="font-mono text-[11px] sm:text-xs text-neutral-500 hidden sm:inline-block">
                [{dubaiTime}]
              </span>
            )}
          </div>
        </div>

      </div>

      {/* MONUMENTAL WALL-TO-WALL WORDMARK (Baseborn & Artboard 1 Responsive Precision) */}
      <div className="w-full overflow-hidden select-none leading-none -mb-2 sm:-mb-3 md:-mb-5 lg:-mb-6 pt-1 sm:pt-2">
        <h1 className="w-full text-[19.5vw] sm:text-[20.2vw] md:text-[20.8vw] lg:text-[21.2vw] xl:text-[21.6vw] font-dharma font-bold leading-[0.74] tracking-tight uppercase text-black text-center whitespace-nowrap block hover:text-[#e60000] transition-colors duration-700 cursor-default">
          MOIZ KHAN
        </h1>
      </div>
    </footer>
  );
}
