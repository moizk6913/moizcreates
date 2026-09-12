'use client';

// 4-Point Stellate Glyph component
function StarGlyph({ size = 20, fill = '#000000', className = '' }: { size?: number; fill?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z"
        fill={fill}
      />
    </svg>
  );
}

// Cluster 1: Research (8 outer black stars orbiting 1 center red star)
function ResearchCluster() {
  const radius = 54;
  const count = 8;
  return (
    <div className="relative w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
      {/* Center Red #e60000 Star */}
      <div className="z-10 animate-pulse">
        <StarGlyph size={28} fill="#e60000" />
      </div>

      {/* Orbiting Black Stars */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i * (360 / count) * Math.PI) / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={i}
            className="absolute transition-transform duration-700 ease-out group-hover:rotate-12"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <StarGlyph size={20} fill="#000000" />
          </div>
        );
      })}
    </div>
  );
}

// Cluster 2: Design (Concentric Ring of 10 black stars around center red star)
function DesignCluster() {
  const radius = 58;
  const count = 10;
  return (
    <div className="relative w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
      {/* Center Red #e60000 Star */}
      <div className="z-10 animate-pulse">
        <StarGlyph size={28} fill="#e60000" />
      </div>

      {/* Orbiting Stars */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i * (360 / count) * Math.PI) / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={i}
            className="absolute transition-transform duration-700 ease-out group-hover:-rotate-12"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <StarGlyph size={18} fill="#000000" />
          </div>
        );
      })}
    </div>
  );
}

// Cluster 3: Deliver (Dense Ring of 14 black stars around center red star)
function DeliverCluster() {
  const radius = 64;
  const count = 14;
  return (
    <div className="relative w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
      {/* Center Red #e60000 Star */}
      <div className="z-10 animate-pulse">
        <StarGlyph size={28} fill="#e60000" />
      </div>

      {/* Orbiting Stars */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i * (360 / count) * Math.PI) / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={i}
            className="absolute transition-transform duration-700 ease-out group-hover:rotate-45"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <StarGlyph size={16} fill="#000000" />
          </div>
        );
      })}
    </div>
  );
}

const PHASES = [
  {
    number: '01',
    title: 'RESEARCH',
    description:
      'Deep exploration of the client, audience, and project goals establishes clear direction, context, and strategic foundations.',
    renderGlyph: () => <ResearchCluster />,
  },
  {
    number: '02',
    title: 'DESIGN',
    description:
      'Ideas evolve through a collaborative process, with continuous refinement, feedback, and client updates.',
    renderGlyph: () => <DesignCluster />,
  },
  {
    number: '03',
    title: 'DELIVER',
    description:
      'Final assets are prepared for print and digital, with launch-ready files, publishing essentials, and ongoing monthly support after handover.',
    renderGlyph: () => <DeliverCluster />,
  },
];

export default function ProcessSection() {
  return (
    <section id="approach" className="w-full pt-16 sm:pt-24 pb-24 sm:pb-36 bg-white overflow-hidden select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14">
        {/* Giant Typographic Running Header (Page 2 Reference) */}
        <div className="overflow-hidden pb-12 sm:pb-20 select-none">
          <h2 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap">
            Approach — Approach — Approach
          </h2>
        </div>

        {/* 3 Geometric Star Glyph Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-14 md:gap-16 items-start">
          {PHASES.map((p) => (
            <div
              key={p.number}
              className="flex flex-col items-center text-center space-y-6 sm:space-y-8 group"
            >
              {/* Geometric Starburst Visual */}
              <div className="h-48 flex items-center justify-center">
                {p.renderGlyph()}
              </div>

              {/* Number, Title & Concise Description */}
              <div className="space-y-2 max-w-sm">
                <span className="font-mono text-xs text-neutral-400 font-bold tracking-widest block">
                  {p.number}
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider text-black group-hover:text-[#e60000] transition-colors">
                  {p.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal pt-1">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
