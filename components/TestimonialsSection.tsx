'use client';

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'Working with Moiz was a great experience. His ability to come up with concepts is amazing. You can completely rely on him when it comes to art direction. His adaptability and discipline are something every creative lead wants to see.',
    name: 'AKANSHA SINGH',
    role: 'Design and Marketing, Vryse',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote:
      'I had the pleasure of working with Moiz during his directorial campaigns, where he contributed to a wide range of brand projects. He consistently pushed beyond his comfort zone, showing great openness and expanding his visual language without hesitation, remaining attentive and detail-oriented throughout.',
    name: 'YAGYA GULATI',
    role: 'Founder, Chitram Design Studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote:
      'I had the pleasure of working with Moiz on the branding and visual architecture, and his creativity and design sense truly elevated the identity. He translated complex ideas into a clear, impactful visual language with professionalism and attention to detail.',
    name: 'SUROOR FATIMA',
    role: 'Founder, Shadow Drafts',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative w-full py-24 sm:py-36 bg-white overflow-hidden border-t border-black/[0.08]">
      {/* Giant Background Typographic Watermark (Screenshot 2) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span className="font-display font-black text-[22vw] sm:text-[18vw] text-black/[0.04] leading-none tracking-tighter uppercase whitespace-nowrap">
          TESTIMONIALS
        </span>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-8 md:px-14 space-y-12">
        {/* Section Label */}
        <div className="flex items-center justify-between pb-6">
          <span className="font-mono text-xs sm:text-sm text-black tracking-widest uppercase font-bold">
            TESTIMONIALS —
          </span>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            ENDORSEMENTS
          </span>
        </div>

        {/* Staggered Floating Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Card 1: Left Top */}
          <div className="lg:col-span-6 bg-white border border-black/[0.12] rounded-[12px] p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.03)] space-y-6">
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-sans">
              &ldquo;{TESTIMONIALS[0].quote}&rdquo;
            </p>

            <div className="pt-4 border-t border-black/[0.08] flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[0].avatar}
                alt={TESTIMONIALS[0].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-sans font-black text-xs sm:text-sm text-accent-cobalt uppercase tracking-wider">
                    {TESTIMONIALS[0].name}
                  </h4>
                  {/* Verified Badge Icon (Screenshot 2) */}
                  <span className="w-4 h-4 rounded-full bg-accent-cobalt text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[0].role}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Right Staggered (Offset downwards) */}
          <div className="lg:col-span-6 lg:mt-16 bg-white border border-black/[0.12] rounded-[12px] p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.03)] space-y-6">
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-sans">
              &ldquo;{TESTIMONIALS[1].quote}&rdquo;
            </p>

            <div className="pt-4 border-t border-black/[0.08] flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[1].avatar}
                alt={TESTIMONIALS[1].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-sans font-black text-xs sm:text-sm text-accent-cobalt uppercase tracking-wider">
                    {TESTIMONIALS[1].name}
                  </h4>
                  <span className="w-4 h-4 rounded-full bg-accent-cobalt text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[1].role}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Bottom Left */}
          <div className="lg:col-span-6 bg-white border border-black/[0.12] rounded-[12px] p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.03)] space-y-6">
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-sans">
              &ldquo;{TESTIMONIALS[2].quote}&rdquo;
            </p>

            <div className="pt-4 border-t border-black/[0.08] flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[2].avatar}
                alt={TESTIMONIALS[2].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-sans font-black text-xs sm:text-sm text-accent-cobalt uppercase tracking-wider">
                    {TESTIMONIALS[2].name}
                  </h4>
                  <span className="w-4 h-4 rounded-full bg-accent-cobalt text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[2].role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
