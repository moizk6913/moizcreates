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
    <section id="services" className="w-full pt-16 sm:pt-24 pb-20 sm:pb-28 bg-white overflow-hidden select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14">
        {/* Giant Typographic Running Header (Page 2 Reference) */}
        <div className="overflow-hidden pb-6 sm:pb-12 select-none">
          <h2 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap">
            Services — Services — Services
          </h2>
        </div>

        {/* 5 Expansive Rows — Pure Typographic Spacing, Zero Lines */}
        <div className="space-y-3 sm:space-y-4">
          {SERVICES.map((item) => (
            <div
              key={item.number}
              className="py-6 sm:py-8 md:py-9 px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-8 md:gap-12 items-start transition-all duration-200 group hover:bg-[#faf9f6] rounded-[20px] border-none"
            >
              {/* Col 1: Number */}
              <div className="sm:col-span-2 md:col-span-1 font-mono text-sm sm:text-base font-bold text-black group-hover:text-[#e60000] transition-colors">
                {item.number}
              </div>

              {/* Col 2: Title */}
              <div className="sm:col-span-5 md:col-span-4">
                <h3 className="font-display font-black text-base sm:text-lg md:text-xl tracking-wider uppercase text-black group-hover:text-[#e60000] transition-colors leading-tight">
                  {item.title}
                </h3>
              </div>

              {/* Col 3: Right-aligned Description */}
              <div className="sm:col-span-5 md:col-span-7 flex sm:justify-end">
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans max-w-xl sm:text-right font-normal">
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
