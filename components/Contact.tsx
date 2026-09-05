'use client';

import { useState } from 'react';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('moiz@moizcreates.com').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section
      id="contact"
      className="w-full py-24 md:py-36 bg-gradient-to-b from-[#f4f2ee] via-[#faf9f6] to-canvas relative overflow-hidden"
    >
      {/* Ambient luxury accent glow (Zero harsh lines, seamless gradient wrap) */}
      <div
        className="absolute bottom-10 left-10 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(255,42,42,0.03)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e60000]" />
              <span className="font-mono text-xs text-[#e60000] tracking-widest font-semibold uppercase">
                03 // INITIATE
              </span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-primary leading-tight space-y-1">
              <p>I promise I&apos;ll read it.</p>
              <p>I might even reply quickly.</p>
              <p className="text-secondary font-medium text-lg sm:text-xl md:text-2xl pt-2">
                Look at us, already making progress.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Email link with tactile rounded pill copy trigger */}
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="mailto:moiz@moizcreates.com"
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary hover:text-[#e60000] transition-colors duration-300"
              >
                moiz@moizcreates.com
              </a>
              <button
                onClick={handleCopy}
                className={`font-mono text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 select-none ${
                  copied
                    ? 'bg-[#e60000] text-white shadow-[0_4px_16px_rgba(230,0,0,0.35)] scale-105'
                    : 'bg-black/[0.05] hover:bg-primary hover:text-white text-primary'
                }`}
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>

            {/* Clean borderless navigation footer links */}
            <div className="flex gap-8 pt-4 items-center">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-secondary hover:text-[#e60000] transition-colors duration-200"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-secondary hover:text-[#e60000] transition-colors duration-200"
              >
                Instagram ↗
              </a>
              <a
                href="#top"
                className="font-mono text-xs text-secondary hover:text-[#e60000] transition-colors duration-200 ml-auto"
              >
                Back to Top ↑
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
