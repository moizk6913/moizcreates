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
      className="w-full pt-20 sm:pt-28 md:pt-36 pb-0 bg-[#efeeea] relative select-none border-none flex flex-col justify-between overflow-x-hidden"
    >
      {/* MAIN ARTBOARD CONTAINER (Exact layout matching Artboard 1) */}
      <div className="w-full max-w-[1700px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex-1 flex flex-col justify-between relative z-10 space-y-12 sm:space-y-16 md:space-y-20">
        
        {/* TOP ROW: ICON / MONOGRAM (Exact position from Artboard 1) */}
        <div className="flex items-center justify-start">
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
              className="h-8 sm:h-9 md:h-10 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
              priority
            />
          </Link>
        </div>

        {/* MID-BODY: THE 3 EDITORIAL BLOCKS (Exact composition from Artboard 1) */}
        <div className="w-full flex flex-col space-y-12 sm:space-y-16">
          
          {/* Row 1: BUSINESS INQUIRIES (Left) & STUDIO DIRECTORY (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-start">
            
            {/* Block 1: BUSINESS INQUIRIES (Britti Sans Medium + Regular) */}
            <div className="md:col-span-5 lg:col-span-5 space-y-2">
              <span className="font-britti font-medium text-xs sm:text-sm tracking-wider text-black uppercase block">
                BUSINESS INQUIRIES
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="font-britti font-medium text-xs sm:text-sm md:text-[15px] text-black hover:text-[#e60000] uppercase tracking-wider transition-colors block text-left group cursor-pointer"
                  title="Click to copy email address"
                >
                  <span className="group-hover:underline underline-offset-4">
                    {email}
                  </span>
                  {copied && (
                    <span className="ml-2 text-[10px] font-britti font-normal text-emerald-600 normal-case bg-emerald-100/90 px-2 py-0.5 rounded-full inline-block">
                      ✓ Copied
                    </span>
                  )}
                </button>
                <p className="font-britti font-normal text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wide">
                  COMMISSIONS &amp; CAMPAIGNS
                </p>
              </div>
            </div>

            {/* Block 2: STUDIO DIRECTORY (Britti Sans Medium + Regular) */}
            <div className="md:col-start-7 md:col-span-6 lg:col-start-8 lg:col-span-5 space-y-2">
              <span className="font-britti font-medium text-xs sm:text-sm tracking-wider text-black uppercase block">
                STUDIO DIRECTORY
              </span>
              <div className="space-y-1">
                <nav className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-1 font-britti font-medium text-xs sm:text-sm uppercase tracking-wider text-black">
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
                <p className="font-britti font-normal text-[11px] sm:text-xs text-neutral-500 uppercase tracking-wide">
                  NAVIGATE PORTFOLIO
                </p>
              </div>
            </div>

          </div>

          {/* Row 2: DIRECT CHANNELS (Centered horizontally as in Artboard 1) */}
          <div className="w-full flex flex-col items-center text-center space-y-2 pt-2 sm:pt-4">
            <span className="font-britti font-medium text-xs sm:text-sm tracking-wider text-black uppercase block">
              DIRECT CHANNELS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 font-britti font-medium text-xs sm:text-sm uppercase tracking-wider text-black">
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

        {/* HORIZON METADATA ROW (Britti Sans Regular, aligned above wordmark) */}
        <div className="w-full flex items-center justify-between pt-12 sm:pt-16 pb-2 border-none text-xs sm:text-sm font-britti font-normal text-neutral-600">
          {/* Left: All right reserved */}
          <div className="text-left font-normal text-neutral-600">
            All right reserved
          </div>

          {/* Center: 2026 */}
          <div className="text-center font-normal text-neutral-600">
            2026
          </div>

          {/* Right: Time (GMT+4) */}
          <div className="text-right text-[#4d5b7c] font-normal flex items-center gap-1.5">
            <span>Time (GMT+4)</span>
            {dubaiTime && (
              <span className="font-britti font-normal text-[11px] sm:text-xs text-neutral-500 hidden sm:inline-block">
                [{dubaiTime}]
              </span>
            )}
          </div>
        </div>

      </div>

      {/* MONUMENTAL WORDMARK — 100% EDGE-TO-EDGE FLUSH TO SCREEN BORDERS */}
      <div className="w-full overflow-hidden select-none leading-none pt-3 sm:pt-6 pb-0">
        <svg
          viewBox="0 0 10607 1410"
          className="w-full h-auto block select-none overflow-visible"
        >
          <text
            x="-96"
            y="1370"
            textLength="10703"
            lengthAdjust="spacing"
            fontFamily="'Britti Sans', sans-serif"
            fontWeight="700"
            fontSize="2048"
            fill="#000"
            className="hover:fill-[#e60000] transition-colors duration-500 cursor-default"
          >
            MOIZ KHAN
          </text>
        </svg>
      </div>
    </footer>
  );
}
