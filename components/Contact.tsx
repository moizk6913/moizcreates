'use client';

import { useState } from 'react';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const email = 'moiz@moizcreates.com';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <section
      id="contact"
      className="w-full py-20 sm:py-28 md:py-32 bg-gradient-to-b from-[#f4f2ee] via-[#faf9f6] to-canvas relative overflow-hidden flex flex-col items-center justify-center text-center border-t border-border-hairline"
    >
      {/* Ambient luxury accent glow */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(255,42,42,0.04)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center gap-6 md:gap-8">
        {/* Section tag */}
        <div className="flex items-center gap-2 font-mono text-xs text-accent-red font-bold tracking-widest uppercase mb-1">
          <span>●</span>
          <span>DIRECT STUDIO INQUIRIES</span>
        </div>

        {/* Reply Promise Text (Pure Centered Typography) */}
        <div className="font-display font-black text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-primary leading-tight space-y-1 uppercase tracking-tight">
          <p>I promise I&apos;ll read it.</p>
          <p>I might even reply quickly.</p>
          <p className="text-secondary font-medium normal-case text-base sm:text-xl md:text-2xl pt-2 font-sans">
            Look at us, already making progress.
          </p>
        </div>

        {/* Direct Centered Email & Copy Interaction */}
        <div className="pt-4 flex flex-col items-center gap-3">
          <a
            href={`mailto:${email}`}
            className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-primary hover:text-accent-red transition-colors duration-300 block break-all font-display uppercase"
          >
            {email}
          </a>

          {/* 1-Click Copy Interaction Badge */}
          <button
            type="button"
            onClick={handleCopyEmail}
            className={`font-mono text-xs px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              copied
                ? 'bg-emerald-500 text-white border-emerald-500 font-bold scale-105'
                : 'bg-canvas text-secondary border-border-medium hover:text-primary hover:border-primary'
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

        {/* Clean Centered Social Links */}
        <div className="flex flex-wrap gap-6 sm:gap-8 items-center justify-center pt-4">
          <a
            href="https://linkedin.com/in/moizkhan"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-secondary hover:text-accent-red transition-colors duration-200 uppercase tracking-wider font-semibold"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://instagram.com/moizcreates"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-secondary hover:text-accent-red transition-colors duration-200 uppercase tracking-wider font-semibold"
          >
            Instagram ↗
          </a>
          <a
            href="/canvas"
            className="font-mono text-xs text-secondary hover:text-accent-red transition-colors duration-200 uppercase tracking-wider font-semibold"
          >
            Archive Canvas ↗
          </a>
          <a
            href="/blog"
            className="font-mono text-xs text-secondary hover:text-accent-red transition-colors duration-200 uppercase tracking-wider font-semibold"
          >
            Journal ↗
          </a>
        </div>
      </div>

      {/* Minimal Footer Signature */}
      <div className="w-full max-w-7xl mx-auto pt-20 md:pt-28 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-muted tracking-wider uppercase border-t border-border-hairline mt-12">
        <span>© 2026 MOIZ KHAN. ALL RIGHTS RESERVED.</span>
        <div className="flex items-center gap-4">
          <span>LOCAL TIME (GMT+4)</span>
          <span>•</span>
          <span>DUBAI / WORLDWIDE</span>
        </div>
      </div>
    </section>
  );
}
