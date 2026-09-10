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
  {
    quote:
      'Moiz was a fantastic addition to our directorial team. He had consistently demonstrated a keen eye for detail, a strong understanding of visual direction, and a solid grasp of campaign media strategy.',
    name: 'BONTI DAS',
    role: 'Senior Graphic Designer, Coolfit Design Studio',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    quote:
      'Moiz is one of those creatives who always strives to refine ideas and create meaningful works. He is diligent and sincere in his approach. He will be an asset to the team or organization who chooses him.',
    name: 'NAMRITA SHARMA',
    role: 'Associate Director, Creative Strategy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative w-full pt-16 sm:pt-24 pb-24 sm:pb-36 bg-white overflow-hidden select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14 space-y-12">
        {/* Giant Typographic Running Header (Page 2/3 Reference) */}
        <div className="overflow-hidden pb-4 sm:pb-8 select-none">
          <h2 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap">
            Testimonials — Testim
          </h2>
        </div>

        {/* Staggered Floating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Card 1: Left */}
          <div className="lg:col-span-6 bg-[#faf9f6] rounded-[22px] p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-6 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)] transition-all border-none">
            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-normal">
              &ldquo;{TESTIMONIALS[0].quote}&rdquo;
            </p>

            <div className="flex items-center gap-3.5 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[0].avatar}
                alt={TESTIMONIALS[0].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#e60000] uppercase tracking-wider">
                    {TESTIMONIALS[0].name}
                  </h4>
                  {/* Verified Badge in Red #e60000 */}
                  <span className="w-4 h-4 rounded-full bg-[#e60000] text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[0].role}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Right Staggered */}
          <div className="lg:col-span-6 lg:mt-16 bg-[#faf9f6] rounded-[22px] p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-6 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)] transition-all border-none">
            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-normal">
              &ldquo;{TESTIMONIALS[1].quote}&rdquo;
            </p>

            <div className="flex items-center gap-3.5 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[1].avatar}
                alt={TESTIMONIALS[1].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#e60000] uppercase tracking-wider">
                    {TESTIMONIALS[1].name}
                  </h4>
                  <span className="w-4 h-4 rounded-full bg-[#e60000] text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[1].role}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Left Bottom */}
          <div className="lg:col-span-6 bg-[#faf9f6] rounded-[22px] p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-6 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)] transition-all border-none">
            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-normal">
              &ldquo;{TESTIMONIALS[2].quote}&rdquo;
            </p>

            <div className="flex items-center gap-3.5 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[2].avatar}
                alt={TESTIMONIALS[2].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#e60000] uppercase tracking-wider">
                    {TESTIMONIALS[2].name}
                  </h4>
                  <span className="w-4 h-4 rounded-full bg-[#e60000] text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[2].role}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Right Bottom */}
          <div className="lg:col-span-6 bg-[#faf9f6] rounded-[22px] p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] space-y-6 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)] transition-all border-none">
            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-normal">
              &ldquo;{TESTIMONIALS[3].quote}&rdquo;
            </p>

            <div className="flex items-center gap-3.5 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TESTIMONIALS[3].avatar}
                alt={TESTIMONIALS[3].name}
                className="w-10 h-10 rounded-full object-cover bg-neutral-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#e60000] uppercase tracking-wider">
                    {TESTIMONIALS[3].name}
                  </h4>
                  <span className="w-4 h-4 rounded-full bg-[#e60000] text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500 mt-0.5">
                  {TESTIMONIALS[3].role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
