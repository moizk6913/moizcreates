'use client';

interface WorkGridProps {
  onOpenCase: (id: string) => void;
}

export default function WorkGrid({ onOpenCase }: WorkGridProps) {
  return (
    <section id="work" className="w-full py-24 md:py-32 bg-canvas border-b border-border-hairline">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex justify-between items-baseline pb-4 mb-12 border-b border-border-hairline">
          <h2 className="text-sm font-extrabold tracking-widest text-primary">SELECTED WORK</h2>
          <span className="font-mono text-xs text-muted">(05 DIRECTED PIECES)</span>
        </div>

        {/* Asymmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">

          {/* 01. Windchasers Aviation Academy (Wide Tile) */}
          <article
            onClick={() => onOpenCase('windchasers')}
            className="md:col-span-12 group flex flex-col bg-canvas border border-border-hairline hover:border-border-medium transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full aspect-[21/9] overflow-hidden bg-subtle">
              <img
                src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop"
                alt="Windchasers Aviation Academy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none text-white">
                <span className="font-mono text-[10px] tracking-wider bg-black/60 backdrop-blur-sm px-2 py-1">
                  LOOKBOOK & BRAND SHOOT
                </span>
                <span className="font-mono text-[10px] text-white/80">2026</span>
              </div>
            </div>
            <div className="p-5 md:p-6 flex justify-between items-center bg-canvas border-t border-border-hairline">
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Windchasers Aviation Academy</h3>
                <span className="text-xs text-secondary">Brand Shoot Direction • Flight Deck Lookbook</span>
              </div>
              <span className="font-mono text-xs text-secondary group-hover:text-primary transition-colors">
                Inspect Work ↗
              </span>
            </div>
          </article>

          {/* 02. Easy Hai Bro (Featured Case Study) */}
          <article
            onClick={() => onOpenCase('easyhaibro')}
            className="md:col-span-7 group flex flex-col bg-canvas border border-border-hairline hover:border-border-medium transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full aspect-[16/11] overflow-hidden bg-subtle">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop"
                alt="Easy Hai Bro"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none text-white">
                <span className="font-mono text-[10px] tracking-wider bg-accent-red px-2 py-1 font-bold">
                  FEATURED CASE STUDY
                </span>
                <span className="font-mono text-[10px] text-white/80">LED TEAM OF 4</span>
              </div>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                <span className="w-10 h-10 rounded-full bg-accent-red text-white flex items-center justify-center text-sm pl-0.5">
                  ▶
                </span>
                <span className="font-mono text-xs font-bold tracking-wider text-white">
                  Deep Dive Case Study
                </span>
              </div>
            </div>
            <div className="p-5 md:p-6 flex justify-between items-center bg-canvas border-t border-border-hairline">
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Easy Hai Bro</h3>
                <span className="text-xs text-secondary">Full Brand Identity • Shoot Direction • Commercial Strategy</span>
              </div>
              <span className="font-mono text-xs text-accent-red font-bold">
                Read Case Study ↗
              </span>
            </div>
          </article>

          {/* 03. Kaladhar Bridal Campaign (Portrait) */}
          <article
            onClick={() => onOpenCase('kaladhar')}
            className="md:col-span-5 group flex flex-col bg-canvas border border-border-hairline hover:border-border-medium transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-subtle">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop"
                alt="Kaladhar Bridal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none text-white">
                <span className="font-mono text-[10px] tracking-wider bg-black/60 backdrop-blur-sm px-2 py-1">
                  HERITAGE LUXURY
                </span>
                <span className="font-mono text-[10px] text-white/80">EDITORIAL</span>
              </div>
            </div>
            <div className="p-5 md:p-6 flex justify-between items-center bg-canvas border-t border-border-hairline">
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Kaladhar</h3>
                <span className="text-xs text-secondary">Bridal Campaign Direction • Lighting & Styling</span>
              </div>
              <span className="font-mono text-xs text-secondary group-hover:text-primary transition-colors">
                Inspect ↗
              </span>
            </div>
          </article>

          {/* 04. Ruchi Fried Chicken */}
          <article
            onClick={() => onOpenCase('ruchi')}
            className="md:col-span-6 group flex flex-col bg-canvas border border-border-hairline hover:border-border-medium transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-subtle">
              <img
                src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop"
                alt="Ruchi Fried Chicken"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none text-white">
                <span className="font-mono text-[10px] tracking-wider bg-black/60 backdrop-blur-sm px-2 py-1">
                  COMMERCIAL FOOD
                </span>
                <span className="font-mono text-[10px] text-white/80">SHOOT & COLOR</span>
              </div>
            </div>
            <div className="p-5 md:p-6 flex justify-between items-center bg-canvas border-t border-border-hairline">
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Ruchi Fried Chicken</h3>
                <span className="text-xs text-secondary">Commercial Shoot • Food Art Direction</span>
              </div>
              <span className="font-mono text-xs text-secondary group-hover:text-primary transition-colors">
                Inspect ↗
              </span>
            </div>
          </article>

          {/* 05. Oxymorons */}
          <article
            onClick={() => onOpenCase('oxymorons')}
            className="md:col-span-6 group flex flex-col bg-canvas border border-border-hairline hover:border-border-medium transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-subtle">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                alt="Oxymorons"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none text-white">
                <span className="font-mono text-[10px] tracking-wider bg-black/60 backdrop-blur-sm px-2 py-1">
                  EXPERIMENTAL
                </span>
                <span className="font-mono text-[10px] text-white/80">IDENTITY</span>
              </div>
            </div>
            <div className="p-5 md:p-6 flex justify-between items-center bg-canvas border-t border-border-hairline">
              <div>
                <h3 className="text-lg font-bold text-primary tracking-tight">Oxymorons</h3>
                <span className="text-xs text-secondary">Brand Architecture • Visual Identity System</span>
              </div>
              <span className="font-mono text-xs text-secondary group-hover:text-primary transition-colors">
                Inspect ↗
              </span>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
