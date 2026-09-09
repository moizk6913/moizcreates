'use client';

const PHASES = [
  {
    number: '01',
    title: 'Research',
    description:
      'Deep exploration of the client, audience, and project goals establishes clear direction, context, and strategic foundations.',
  },
  {
    number: '02',
    title: 'Design',
    description:
      'Ideas evolve through a collaborative process, with continuous refinement, feedback, and client updates shaping the final decision.',
  },
  {
    number: '03',
    title: 'Deliver',
    description:
      'Final assets are prepared for print and digital, with launch-ready files, publishing essentials, and ongoing monthly support after handover.',
  },
];

export default function ProcessSection() {
  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-canvas border-t border-border-hairline">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-border-hairline pb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-primary uppercase tracking-tight">
            Approach
          </h2>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            3 Phases
          </span>
        </div>

        {/* 3 Clean Cards (Like Vaishvik Kalva) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PHASES.map((p) => (
            <div
              key={p.number}
              className="p-6 sm:p-8 rounded-[12px] bg-subtle/50 border border-border-hairline flex flex-col justify-between space-y-8 hover:border-primary/40 transition-colors"
            >
              <div className="font-mono text-sm font-bold text-accent-red">
                {p.number}
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-primary">
                  {p.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed font-sans">
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
