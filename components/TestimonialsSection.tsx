'use client';

interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '01',
    quote:
      'Working with Moiz was a great experience. His ability to come up with concepts is amazing. You can completely rely on him when it comes to art direction. His adaptability and discipline are something every creative lead wants to see.',
    name: 'AKANSHA SINGH',
    role: 'Design & Marketing',
    company: 'Vryse',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '02',
    quote:
      'I had the pleasure of working with Moiz during his directorial campaigns, where he contributed to a wide range of brand projects. He consistently pushed beyond his comfort zone, showing great openness and expanding his visual language without hesitation, remaining attentive and detail-oriented throughout.',
    name: 'YAGYA GULATI',
    role: 'Founder & Directorial Lead',
    company: 'Chitram Design Studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '03',
    quote:
      'I had the pleasure of working with Moiz on the branding and visual architecture, and his creativity and design sense truly elevated the identity. He translated complex ideas into a clear, impactful visual language with professionalism and attention to detail.',
    name: 'SUROOR FATIMA',
    role: 'Founder & Head of Visuals',
    company: 'Shadow Drafts',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '04',
    quote:
      'Moiz was a fantastic addition to our directorial team. He had consistently demonstrated a keen eye for detail, a strong understanding of visual direction, and a solid grasp of campaign media strategy.',
    name: 'BONTI DAS',
    role: 'Senior Graphic Designer',
    company: 'Coolfit Design Studio',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '05',
    quote:
      'Moiz is one of those creatives who always strives to refine ideas and create meaningful works. He is diligent and sincere in his approach. He will be an asset to the team or organization who chooses him.',
    name: 'NAMRITA SHARMA',
    role: 'Associate Director',
    company: 'Creative Strategy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-1 text-black">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5 fill-black"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  // Duplicate array for seamless infinite looping
  const track = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="testimonials"
      className="relative w-full pt-[96px] pb-0 bg-white overflow-hidden select-none border-none"
    >
      {/* 1. EDITORIAL CHAPTER HEADER (Static, Monumental, Line-Free) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] pb-[64px]">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[92px] tracking-tight uppercase text-black leading-none">
            PEOPLE I&apos;VE WORKED WITH
          </h2>
          <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-400 uppercase tracking-[0.2em]">
            03 / ENDORSEMENTS
          </span>
        </div>
      </div>

      {/* 2. SINGLE KINETIC FLOATING MARQUEE TRACK (Calm, Pure, Auto-pause on hover) */}
      <div className="w-full relative overflow-hidden">
        {/* Soft edge blur masks for Apple-grade aesthetic */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-44 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-44 z-10 bg-gradient-to-l from-white to-transparent" />

        {/* Track: Gliding Left */}
        <div className="flex items-center w-max animate-marquee-left pause-on-hover py-1">
          {track.map((t, idx) => (
            <div
              key={`track-${t.id}-${idx}`}
              className="w-[300px] sm:w-[380px] md:w-[440px] lg:w-[480px] shrink-0 mx-2.5 sm:mx-3 bg-white apple-widget-md rounded-[32px] sm:rounded-[36px] overflow-hidden p-[28px] flex flex-col justify-between space-y-4 border border-neutral-200/80 hover:border-black/25 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-400 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
            >
              <div className="space-y-2">
                <StarRating />
                <p className="font-sans text-xs sm:text-sm md:text-[14px] text-neutral-800 leading-snug font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 apple-circle rounded-full object-cover bg-neutral-200 shrink-0 grayscale contrast-125 ring-1 ring-black/10"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-display font-black text-xs sm:text-sm text-black uppercase tracking-wider truncate">
                      {t.name}
                    </h5>
                    <span className="w-3.5 h-3.5 apple-circle rounded-full bg-black text-white text-[8px] flex items-center justify-center font-bold shrink-0">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-neutral-500 truncate">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
