'use client';

export default function ClientsStrip() {
  return (
    <section id="clients" className="w-full py-10 sm:py-12 md:py-14 bg-canvas overflow-hidden border-none relative select-none">
      {/* Marquee Wrapper with soft edge masks (zero lines) */}
      <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex items-center w-max gap-14 sm:gap-20 md:gap-24 animate-marquee-left hover:[animation-play-state:paused]">
          {/* Set 1 of B&W Logos */}
          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Nike">
            <svg viewBox="0 0 96 36" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <path d="M94.6 2.2c-.8.8-19.8 17.5-38.6 24.2-12.8 4.6-21.6 4.9-26.6 3.1-4.2-1.5-6.5-4.3-6.2-7.8.4-4.5 4.8-10 11.2-14.2 2.6-1.7 5.7-3.2 9-4.5.4-.2.4-.7 0-.9-2.6-.9-5.7-.7-8.8.4-7.8 2.8-13.8 8.9-15.6 15.8-1.5 5.8.5 11.8 5.6 15.5 5.2 3.8 12.8 4.1 21.6.8 16.5-6.2 41.5-26.8 48.8-32.2.6-.4.2-1.2-.4-.8z"/>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Prada">
            <svg viewBox="0 0 120 24" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <text x="0" y="20" font-family="'Times New Roman', Times, serif" font-size="24" font-weight="900" letterSpacing="4">PRADA</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Vogue">
            <svg viewBox="0 0 120 26" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <text x="0" y="22" font-family="'Didot', 'Bodoni MT', serif" font-size="26" font-weight="900" letterSpacing="4">VOGUE</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Balenciaga">
            <svg viewBox="0 0 156 22" fill="currentColor" className="h-full w-auto max-w-[150px] text-black block">
              <text x="0" y="18" font-family="'Arial Black', sans-serif" font-size="18" font-weight="900" letterSpacing="4">BALENCIAGA</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Saint Laurent">
            <svg viewBox="0 0 170 20" fill="currentColor" className="h-full w-auto max-w-[160px] text-black block">
              <text x="0" y="16" font-family="'Helvetica Neue', Helvetica, sans-serif" font-size="16" font-weight="700" letterSpacing="3.5">SAINT LAURENT</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Chanel">
            <svg viewBox="0 0 120 22" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <text x="0" y="18" font-family="'Futura', 'Century Gothic', sans-serif" font-size="20" font-weight="800" letterSpacing="5">CHANEL</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Dior">
            <svg viewBox="0 0 90 26" fill="currentColor" className="h-full w-auto max-w-[120px] text-black block">
              <text x="0" y="22" font-family="'Didot', 'Bodoni MT', serif" font-size="26" font-weight="900" letterSpacing="3">DIOR</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Supreme">
            <svg viewBox="0 0 110 24" fill="currentColor" className="h-full w-auto max-w-[130px] text-black block">
              <text x="0" y="20" font-family="'Futura', 'Arial Black', sans-serif" font-size="22" font-weight="900" font-style="italic" letterSpacing="1">Supreme</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Porsche">
            <svg viewBox="0 0 140 20" fill="currentColor" className="h-full w-auto max-w-[150px] text-black block">
              <text x="0" y="16" font-family="'Copperplate', 'Helvetica Neue', sans-serif" font-size="16" font-weight="900" letterSpacing="5">PORSCHE</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Acne Studios">
            <svg viewBox="0 0 150 20" fill="currentColor" className="h-full w-auto max-w-[150px] text-black block">
              <text x="0" y="16" font-family="'Helvetica Neue', sans-serif" font-size="15" font-weight="700" letterSpacing="3">ACNE STUDIOS</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Apple">
            <svg viewBox="0 0 28 34" fill="currentColor" className="h-full w-auto text-black block">
              <path d="M19.3 0c-.2 1.4-.8 2.8-1.7 3.8-.9 1-2.2 1.8-3.6 1.7-.2-1.3.4-2.7 1.3-3.7 1-1 2.4-1.8 4-1.8zm5.2 24.4c-1.2 1.8-2.5 3.5-4.3 3.6-1.8 0-2.3-1.1-4.4-1.1-2 0-2.7 1.1-4.4 1.1-1.8 0-3.2-1.9-4.4-3.6-2.4-3.5-4.2-9.9-1.7-14.2 1.2-2.1 3.4-3.5 5.8-3.5 1.8 0 3.4 1.2 4.5 1.2 1.1 0 3-.1.3-1.3 2.1 0 4 .8 5.2 2.6-4.6 2.5-3.8 8.8.7 10.7-.9 2-2 3.9-3.4 5.7z"/>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Studio Emblem">
            <svg viewBox="0 0 38 28" fill="currentColor" className="h-full w-auto text-black block">
              <path d="M5 2C2.8 2 1 3.8 1 6v10c0 4.4 3.6 8 8 8h1c4.4 0 8-3.6 8-8V6c0-2.2-1.8-4-4-4H5zm20 0c-2.2 0-4 1.8-4 4v10c0 4.4 3.6 8 8 8h1c4.4 0 8-3.6 8-8V6c0-2.2-1.8-4-4-4h-9zM5 5h9c.6 0 1 .4 1 1v10c0 2.2-1.8 4-4 4H9c-2.2 0-4-1.8-4-4V6c0-.6.4-1 1-1zm20 0h9c.6 0 1 .4 1 1v10c0 2.2-1.8 4-4 4h-2c-2.2 0-4-1.8-4-4V6c0-.6.4-1 1-1z"/>
            </svg>
          </div>

          {/* Set 2 (Exact Duplicate for seamless infinite loop) */}
          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Nike" aria-hidden="true">
            <svg viewBox="0 0 96 36" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <path d="M94.6 2.2c-.8.8-19.8 17.5-38.6 24.2-12.8 4.6-21.6 4.9-26.6 3.1-4.2-1.5-6.5-4.3-6.2-7.8.4-4.5 4.8-10 11.2-14.2 2.6-1.7 5.7-3.2 9-4.5.4-.2.4-.7 0-.9-2.6-.9-5.7-.7-8.8.4-7.8 2.8-13.8 8.9-15.6 15.8-1.5 5.8.5 11.8 5.6 15.5 5.2 3.8 12.8 4.1 21.6.8 16.5-6.2 41.5-26.8 48.8-32.2.6-.4.2-1.2-.4-.8z"/>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Prada" aria-hidden="true">
            <svg viewBox="0 0 120 24" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <text x="0" y="20" font-family="'Times New Roman', Times, serif" font-size="24" font-weight="900" letterSpacing="4">PRADA</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Vogue" aria-hidden="true">
            <svg viewBox="0 0 120 26" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <text x="0" y="22" font-family="'Didot', 'Bodoni MT', serif" font-size="26" font-weight="900" letterSpacing="4">VOGUE</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Balenciaga" aria-hidden="true">
            <svg viewBox="0 0 156 22" fill="currentColor" className="h-full w-auto max-w-[150px] text-black block">
              <text x="0" y="18" font-family="'Arial Black', sans-serif" font-size="18" font-weight="900" letterSpacing="4">BALENCIAGA</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Saint Laurent" aria-hidden="true">
            <svg viewBox="0 0 170 20" fill="currentColor" className="h-full w-auto max-w-[160px] text-black block">
              <text x="0" y="16" font-family="'Helvetica Neue', Helvetica, sans-serif" font-size="16" font-weight="700" letterSpacing="3.5">SAINT LAURENT</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Chanel" aria-hidden="true">
            <svg viewBox="0 0 120 22" fill="currentColor" className="h-full w-auto max-w-[140px] text-black block">
              <text x="0" y="18" font-family="'Futura', 'Century Gothic', sans-serif" font-size="20" font-weight="800" letterSpacing="5">CHANEL</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Dior" aria-hidden="true">
            <svg viewBox="0 0 90 26" fill="currentColor" className="h-full w-auto max-w-[120px] text-black block">
              <text x="0" y="22" font-family="'Didot', 'Bodoni MT', serif" font-size="26" font-weight="900" letterSpacing="3">DIOR</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Supreme" aria-hidden="true">
            <svg viewBox="0 0 110 24" fill="currentColor" className="h-full w-auto max-w-[130px] text-black block">
              <text x="0" y="20" font-family="'Futura', 'Arial Black', sans-serif" font-size="22" font-weight="900" font-style="italic" letterSpacing="1">Supreme</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Porsche" aria-hidden="true">
            <svg viewBox="0 0 140 20" fill="currentColor" className="h-full w-auto max-w-[150px] text-black block">
              <text x="0" y="16" font-family="'Copperplate', 'Helvetica Neue', sans-serif" font-size="16" font-weight="900" letterSpacing="5">PORSCHE</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Acne Studios" aria-hidden="true">
            <svg viewBox="0 0 150 20" fill="currentColor" className="h-full w-auto max-w-[150px] text-black block">
              <text x="0" y="16" font-family="'Helvetica Neue', sans-serif" font-size="15" font-weight="700" letterSpacing="3">ACNE STUDIOS</text>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Apple" aria-hidden="true">
            <svg viewBox="0 0 28 34" fill="currentColor" className="h-full w-auto text-black block">
              <path d="M19.3 0c-.2 1.4-.8 2.8-1.7 3.8-.9 1-2.2 1.8-3.6 1.7-.2-1.3.4-2.7 1.3-3.7 1-1 2.4-1.8 4-1.8zm5.2 24.4c-1.2 1.8-2.5 3.5-4.3 3.6-1.8 0-2.3-1.1-4.4-1.1-2 0-2.7 1.1-4.4 1.1-1.8 0-3.2-1.9-4.4-3.6-2.4-3.5-4.2-9.9-1.7-14.2 1.2-2.1 3.4-3.5 5.8-3.5 1.8 0 3.4 1.2 4.5 1.2 1.1 0 3-.1.3-1.3 2.1 0 4 .8 5.2 2.6-4.6 2.5-3.8 8.8.7 10.7-.9 2-2 3.9-3.4 5.7z"/>
            </svg>
          </div>

          <div className="flex items-center justify-center h-8 sm:h-10 opacity-80 hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer hover:scale-110" title="Studio Emblem" aria-hidden="true">
            <svg viewBox="0 0 38 28" fill="currentColor" className="h-full w-auto text-black block">
              <path d="M5 2C2.8 2 1 3.8 1 6v10c0 4.4 3.6 8 8 8h1c4.4 0 8-3.6 8-8V6c0-2.2-1.8-4-4-4H5zm20 0c-2.2 0-4 1.8-4 4v10c0 4.4 3.6 8 8 8h1c4.4 0 8-3.6 8-8V6c0-2.2-1.8-4-4-4h-9zM5 5h9c.6 0 1 .4 1 1v10c0 2.2-1.8 4-4 4H9c-2.2 0-4-1.8-4-4V6c0-.6.4-1 1-1zm20 0h9c.6 0 1 .4 1 1v10c0 2.2-1.8 4-4 4h-2c-2.2 0-4-1.8-4-4V6c0-.6.4-1 1-1z"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
