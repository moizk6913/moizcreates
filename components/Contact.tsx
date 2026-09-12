'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const email = 'hiremoiz.works@gmail.com';

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
      className="w-full pt-20 sm:pt-28 md:pt-36 pb-4 sm:pb-6 bg-[#f4f2ee] relative overflow-hidden select-none border-none"
    >
      {/* Soft Ambient Pure Red Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(230,0,0,0.04)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1700px] mx-auto px-6 sm:px-10 md:px-14 relative z-10 space-y-16 sm:space-y-20">
        {/* TOP CALL TO ACTION & DIRECT INQUIRY */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Live Availability Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <span className="w-2 h-2 rounded-full bg-[#e60000] animate-ping" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-black uppercase">
              Available for Q1/Q2 Worldwide Commissions
            </span>
          </div>

          {/* Headline in Britti Sans Bold */}
          <div className="space-y-2">
            <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-black tracking-tight leading-tight">
              HAVE A PROJECT IN MIND?
            </h2>
            <p className="font-sans text-base sm:text-xl text-neutral-600 font-normal">
              Relax. We got you. Directing high-impact commercial campaigns &amp; visual worlds.
            </p>
          </div>

          {/* Hero Email Link & Copy Interaction */}
          <div className="flex flex-col items-center gap-4 pt-1">
            <a
              href={`mailto:${email}`}
              className="font-display font-bold text-2xl sm:text-4xl md:text-5xl text-black hover:text-[#e60000] transition-colors duration-300 uppercase tracking-tight break-all"
            >
              {email}
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className={`font-mono text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-xs font-bold ${
                copied
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-black text-white hover:bg-[#e60000]'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Click to Copy Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4-COLUMN ARCHITECTURAL METADATA ROW (Exact Baseborn & Rejouice Standard) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pt-12 pb-6 border-t border-black/[0.08] font-mono text-xs">
          {/* Column 1: Rights & Location */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">
              ALL RIGHTS RESERVED
            </span>
            <p className="font-bold text-black uppercase tracking-wider text-[11px] sm:text-xs">
              © 2026 MOIZ KHAN
            </p>
            <p className="text-[11px] text-neutral-500 uppercase">
              DUBAI — UAE / WORLDWIDE
            </p>
          </div>

          {/* Column 2: Business Inquiries */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">
              BUSINESS INQUIRIES
            </span>
            <a
              href={`mailto:${email}`}
              className="font-bold text-black hover:text-[#e60000] transition-colors uppercase tracking-wider text-[11px] sm:text-xs block"
            >
              {email}
            </a>
            <span className="text-[11px] text-neutral-500 uppercase block">
              COMMISSIONS &amp; CAMPAIGNS
            </span>
          </div>

          {/* Column 3: Studio Directory */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">
              STUDIO DIRECTORY
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-bold text-black uppercase text-[11px] sm:text-xs">
              <Link href="/#work" className="hover:text-[#e60000] transition-colors">WORK</Link>
              <Link href="/canvas?view=playground" className="hover:text-[#e60000] transition-colors">PLAYGROUND</Link>
              <Link href="/canvas?view=archive" className="hover:text-[#e60000] transition-colors">ARCHIVE</Link>
              <Link href="/about" className="hover:text-[#e60000] transition-colors">ABOUT</Link>
            </div>
            <span className="text-[11px] text-neutral-500 uppercase block">
              NAVIGATE PORTFOLIO
            </span>
          </div>

          {/* Column 4: Direct Channels */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">
              DIRECT CHANNELS
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 font-bold text-black uppercase text-[11px] sm:text-xs">
              <a href="https://instagram.com/moizcreates" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60000] transition-colors">
                INSTAGRAM ↗
              </a>
              <a href="https://linkedin.com/in/moizkhan" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60000] transition-colors">
                LINKEDIN ↗
              </a>
              <a href="https://wa.me/971500000000" target="_blank" rel="noopener noreferrer" className="hover:text-[#e60000] transition-colors">
                WHATSAPP ↗
              </a>
            </div>
            <span className="text-[11px] text-neutral-500 uppercase block">
              LOCAL TIME (GMT+4)
            </span>
          </div>
        </div>
      </div>

      {/* MONUMENTAL WALL-TO-WALL WORDMARK (Baseborn & Rejouice Signature) */}
      <div className="w-full overflow-hidden select-none pt-4 sm:pt-6">
        <h1 className="font-dharma font-bold text-[19vw] sm:text-[20vw] leading-[0.76] tracking-tight uppercase text-black text-center whitespace-nowrap block w-full hover:text-[#e60000] transition-colors duration-700 cursor-default">
          MOIZ KHAN
        </h1>
      </div>
    </footer>
  );
}
