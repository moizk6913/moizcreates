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
      className="w-full pt-20 sm:pt-28 md:pt-36 pb-12 bg-gradient-to-b from-white via-[#faf9f6] to-[#f4f2ee] relative overflow-hidden select-none border-none"
    >
      {/* Soft Ambient Red Glow */}
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(230,0,0,0.035)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 md:px-14 relative z-10 space-y-16 sm:space-y-24">
        {/* TOP CALL TO ACTION & DIRECT INQUIRY */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Live Availability Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <span className="w-2 h-2 rounded-full bg-[#e60000] animate-ping" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-black uppercase">
              Available for Q1/Q2 Worldwide Commissions
            </span>
          </div>

          {/* Main Display Headline in BN Cringe Sans */}
          <div className="space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-black tracking-tight leading-[0.95]">
              HAVE A PROJECT IN MIND?
            </h2>
            <p className="font-sans text-base sm:text-xl md:text-2xl text-neutral-600 font-normal pt-2">
              Let&apos;s direct something extraordinary.
            </p>
          </div>

          {/* Hero Email Link & Copy Interaction */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <a
              href={`mailto:${email}`}
              className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-black hover:text-[#e60000] transition-colors duration-300 uppercase tracking-tight break-all"
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

        {/* 3-COLUMN LINE-FREE DIRECTORY (Page 4 Inspired) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pt-12 items-start">
          {/* Column 1: Studio Identity & Monogram */}
          <div className="md:col-span-5 space-y-5">
            <Link href="#top" className="inline-block group" aria-label="Home">
              <Image
                src="/assets/logo.png"
                alt="Moiz Khan"
                width={32}
                height={32}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-110"
              />
            </Link>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-display font-black text-lg text-black uppercase tracking-wider">
                Moiz Khan
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Independent Art Director &amp; Brand Visual Designer. Directing commercial campaigns,
                fashion lookbooks, and visceral automotive telemetry across Dubai and globally.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links in BN Cringe Sans */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-widest block">
              Navigation
            </span>
            <div className="flex flex-col gap-2.5 font-display font-bold text-sm uppercase tracking-wider">
              <Link href="/#work" className="text-neutral-800 hover:text-[#e60000] transition-colors">
                Work
              </Link>
              <Link href="/canvas" className="text-neutral-800 hover:text-[#e60000] transition-colors">
                Playground / Canvas ↗
              </Link>
              <Link href="/#services" className="text-neutral-800 hover:text-[#e60000] transition-colors">
                Services
              </Link>
              <Link href="/about" className="text-neutral-800 hover:text-[#e60000] transition-colors">
                About ↗
              </Link>
              <Link href="/#contact" className="text-neutral-800 hover:text-[#e60000] transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Column 3: Direct Socials & Back to Top */}
          <div className="md:col-span-3 space-y-4 flex flex-col justify-between h-full">
            <div>
              <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-widest block mb-4">
                Connect
              </span>
              <div className="flex flex-col gap-2.5 font-mono text-xs uppercase tracking-wider font-semibold">
                <a
                  href="https://linkedin.com/in/moizkhan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-[#e60000] transition-colors"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="https://instagram.com/moizcreates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-[#e60000] transition-colors"
                >
                  Instagram ↗
                </a>
                <a
                  href="https://behance.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-[#e60000] transition-colors"
                >
                  Behance ↗
                </a>
                <a
                  href={`mailto:${email}`}
                  className="text-neutral-700 hover:text-[#e60000] transition-colors"
                >
                  Email Brief ↗
                </a>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-5 py-2 rounded-full bg-white hover:bg-black hover:text-white text-black font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>BACK TO TOP</span>
                <span>↑</span>
              </button>
            </div>
          </div>
        </div>

        {/* MASSIVE TYPOGRAPHIC FLOOR WATERMARK — Zero Lines */}
        <div className="relative w-full pt-12 overflow-hidden flex flex-col items-center justify-center select-none pointer-events-none">
          <div className="font-display font-black text-[18vw] sm:text-[15vw] text-black/[0.035] leading-none tracking-tighter uppercase whitespace-nowrap">
            © MOIZ KHAN
          </div>
        </div>

        {/* BOTTOM LEGAL & TIME STRIP */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-neutral-400 tracking-wider uppercase pt-4">
          <span>© 2026 MOIZ KHAN. ALL RIGHTS RESERVED.</span>
          <div className="flex items-center gap-3">
            <span>LOCAL TIME (GMT+4)</span>
            <span>•</span>
            <span>DUBAI / WORLDWIDE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
