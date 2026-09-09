'use client';

const PHASES = [
  {
    number: '01',
    title: 'RESEARCH',
    description:
      'Deep exploration of the client, audience, and project goals establishes clear direction, context, and strategic foundations.',
  },
  {
    number: '02',
    title: 'DESIGN',
    description:
      'Ideas evolve through a collaborative process, with continuous refinement, feedback, and client updates shaping the final decision.',
  },
  {
    number: '03',
    title: 'DELIVER',
    description:
      'Final assets are prepared for print and digital, with launch-ready files, publishing essentials, and ongoing monthly support after handover.',
  },
];

export default function ProcessSection() {
  return (
    <section className="w-full py-16 sm:py-24 bg-white border-t border-black/[0.08]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-black/[0.08]">
          <span className="font-mono text-xs sm:text-sm text-black tracking-widest uppercase font-bold">
            APPROACH — APPROACH —
          </span>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            03 PHASES
          </span>
        </div>

        {/* 3 Clean Wide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PHASES.map((p) => (
            <div
              key={p.number}
              className="p-8 sm:p-10 rounded-[12px] bg-neutral-50/50 border border-black/[0.08] flex flex-col justify-between space-y-10 hover:border-black/25 transition-colors"
            >
              <div className="font-mono text-sm sm:text-base font-bold text-accent-cobalt">
                {p.number}
              </div>

              <div className="space-y-3">
                <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-wider text-black">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
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
