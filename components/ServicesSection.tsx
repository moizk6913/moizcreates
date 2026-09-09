'use client';

const SERVICES = [
  {
    number: '01',
    title: 'Art Direction',
    description:
      'Strategic visual thinking guides projects from concept to execution, shaping cohesive narratives built around clarity, emotion, and impact.',
  },
  {
    number: '02',
    title: 'Brand Identity',
    description:
      'Distinct identities are built from the ground up, with every element working together to create a clear, cohesive, and lasting presence.',
  },
  {
    number: '03',
    title: 'Editorial Design',
    description:
      'Posters, magazines, books, and print systems combine visual impact with clear communication and thoughtfully structured information.',
  },
  {
    number: '04',
    title: 'Experience Design',
    description:
      'Intuitive digital experiences bring usability, flow, and interaction together through clear, seamless, and purposeful design.',
  },
  {
    number: '05',
    title: 'Packaging & Print',
    description:
      'Packaging combines shelf presence with strategic communication, expressing product value through clarity, distinction, and thoughtful detail.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="w-full py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-canvas border-t border-border-hairline">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex items-baseline justify-between border-b border-border-hairline pb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-primary uppercase tracking-tight">
            Services
          </h2>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            05 Disciplines
          </span>
        </div>

        {/* Clean Line Rows (Like Vaishvik Kalva) */}
        <div className="divide-y divide-border-hairline border-b border-border-hairline">
          {SERVICES.map((item) => (
            <div
              key={item.number}
              className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start group hover:bg-subtle/40 transition-colors px-2 sm:px-4 rounded-[8px]"
            >
              <div className="md:col-span-2 font-mono text-sm text-accent-red font-bold tracking-wider">
                {item.number}
              </div>

              <div className="md:col-span-4">
                <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-primary group-hover:text-accent-red transition-colors">
                  {item.title}
                </h3>
              </div>

              <div className="md:col-span-6">
                <p className="text-sm sm:text-base text-secondary leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
