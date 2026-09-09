'use client';

interface ServiceRow {
  number: string;
  title: string;
  description: string;
}

const SERVICES: ServiceRow[] = [
  {
    number: '01',
    title: 'ART DIRECTION',
    description:
      'Strategic visual thinking guides projects from concept to execution, shaping cohesive narratives built around clarity, emotion, and impact.',
  },
  {
    number: '02',
    title: 'BRAND IDENTITY',
    description:
      'Distinct identities are built from the ground up, with every element working together to create a clear, cohesive, and lasting presence.',
  },
  {
    number: '03',
    title: 'EDITORIAL DESIGN',
    description:
      'Posters, magazines, books, and print systems combine visual impact with clear communication and thoughtfully structured information.',
  },
  {
    number: '04',
    title: 'EXPERIENCE DESIGN',
    description:
      'Intuitive digital experiences bring usability, flow, and interaction together through clear, seamless, and purposeful design.',
  },
  {
    number: '05',
    title: 'PACKAGING DESIGN',
    description:
      'Packaging combines shelf presence with strategic communication, expressing product value through clarity, distinction, and thoughtful detail.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="w-full py-16 sm:py-24 bg-white border-t border-black/[0.08]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14">
        {/* Section Label */}
        <div className="flex items-center justify-between pb-8 sm:pb-12">
          <span className="font-mono text-xs sm:text-sm text-black tracking-widest uppercase font-bold">
            SERVICES — SERVICES —
          </span>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            05 DISCIPLINES
          </span>
        </div>

        {/* 3-Column Wide Table Rows */}
        <div className="border-t border-black/[0.08]">
          {SERVICES.map((item) => (
            <div
              key={item.number}
              className="py-8 sm:py-12 md:py-14 border-b border-black/[0.08] grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 md:gap-10 items-start transition-colors duration-200 hover:bg-neutral-50/50"
            >
              {/* Col 1: Number in Electric Cobalt Blue */}
              <div className="sm:col-span-2 md:col-span-1 font-mono text-sm sm:text-base text-accent-cobalt font-bold tracking-wider">
                {item.number}
              </div>

              {/* Col 2: Title in Electric Cobalt Blue */}
              <div className="sm:col-span-5 md:col-span-4">
                <h3 className="font-sans font-black text-base sm:text-lg md:text-xl tracking-wider uppercase text-accent-cobalt leading-tight">
                  {item.title}
                </h3>
              </div>

              {/* Col 3: Right-aligned/justified descriptive paragraph */}
              <div className="sm:col-span-5 md:col-span-7 flex sm:justify-end">
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans max-w-xl sm:text-right">
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
