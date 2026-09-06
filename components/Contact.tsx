'use client';


export default function Contact() {
  return (
    <section
      id="contact"
      className="w-full py-20 md:py-32 bg-gradient-to-b from-[#f4f2ee] via-[#faf9f6] to-canvas relative overflow-hidden flex flex-col items-center justify-center text-center select-none"
    >
      {/* Ambient luxury accent glow */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(230,0,0,0.03)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center gap-6 md:gap-8">
        
        {/* Reply Promise Text (Pure Centered Typography) */}
        <div className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary leading-tight space-y-1">
          <p>I promise I&apos;ll read it.</p>
          <p>I might even reply quickly.</p>
          <p className="text-secondary font-medium normal-case text-lg sm:text-xl md:text-2xl pt-2">
            Look at us, already making progress.
          </p>
        </div>

        {/* Direct Centered Email Link (Zero clutter, no copy box) */}
        <div className="pt-2">
          <a
            href="mailto:moiz@moizcreates.com"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-primary hover:text-[#e60000] transition-colors duration-300 block"
          >
            moiz@moizcreates.com
          </a>
        </div>

        {/* Clean Centered Social Links (Zero Back to Top) */}
        <div className="flex gap-8 items-center justify-center pt-2">
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
        </div>

      </div>

      {/* Minimal Footer Signature */}
      <div className="w-full max-w-6xl mx-auto pt-16 md:pt-24 px-6 flex justify-between items-center text-[10px] font-mono text-muted tracking-wider uppercase">
        <span>© 2026. All rights reserved.</span>
        <span>DUBAI / WORLDWIDE</span>
      </div>
    </section>
  );
}
