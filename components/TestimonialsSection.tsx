'use client';

import { useState } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  brand: string;
  location: string;
  category: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Working with Moiz on our seasonal campaign completely elevated our brand into an international luxury echelon. His eye for lighting, tactile A4 lookbook layouts, and on-set talent direction gave our collection a presence that rivaled Paris runway books.',
    author: 'Sara Al-Mansoor',
    role: 'Founder & Creative Director',
    brand: 'Maison Aura',
    location: 'Dubai, UAE',
    category: 'Haute Couture & Lookbook',
  },
  {
    quote:
      'Moiz brings a rare discipline to set. His treatments leave zero ambiguity, and his speed in camera blocking and anamorphic framing allowed us to capture three multi-aspect formats simultaneously without missing a single scheduled shot.',
    author: 'Marcus Vance',
    role: 'Executive Producer',
    brand: 'Apex Studio Productions',
    location: 'London / Dubai',
    category: 'Commercial Cinema',
  },
  {
    quote:
      'His understanding of 9:16 paid media pacing is exceptional. The vertical ad suites Moiz directed cut through feed fatigue immediately, generating our highest-retention Meta campaign to date while looking like pure cinematic art.',
    author: 'Liam Chen',
    role: 'Head of Growth & Brand',
    brand: 'Veloce Goods',
    location: 'Singapore',
    category: '9:16 Paid Social Suite',
  },
  {
    quote:
      'Moiz’s ability to balance commercial conversion with high-fashion restraint is unmatched. You never get generic commercial work; every single frame is distinctive, bold, and unmistakably intentional.',
    author: 'Elena Rostova',
    role: 'Senior Art Director',
    brand: 'Continuum Creative',
    location: 'Milan / Zurich',
    category: 'Editorial Direction',
  },
];

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 md:px-12 bg-canvas border-t border-border-hairline">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-hairline">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-accent-red font-bold tracking-widest uppercase mb-2">
              <span>●</span>
              <span>CLIENT ENDORSEMENTS &amp; REPUTATION</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-primary tracking-tight uppercase leading-[0.95]">
              TRUSTED COLLABORATIONS
            </h2>
          </div>
          <p className="max-w-md text-secondary font-mono text-xs leading-relaxed">
            Direct feedback from brand founders, executive producers, and agency leads who have partnered with Moiz Khan across Dubai, London, and international markets.
          </p>
        </div>

        {/* Testimonials Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-subtle/50 rounded-[16px] p-6 sm:p-10 border border-border-hairline flex flex-col justify-between space-y-6 hover:border-primary transition-all duration-300 shadow-xs group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono text-[10px] text-muted uppercase tracking-wider pb-3 border-b border-border-hairline">
                  <span className="text-accent-red font-bold">{t.category}</span>
                  <span>{t.location}</span>
                </div>

                <p className="text-base sm:text-lg text-primary font-serif italic leading-relaxed pt-2">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border-hairline flex justify-between items-end">
                <div>
                  <h4 className="font-display font-black text-lg uppercase tracking-tight text-primary">
                    {t.author}
                  </h4>
                  <p className="font-mono text-xs text-secondary mt-0.5">
                    {t.role} • <span className="text-primary font-bold">{t.brand}</span>
                  </p>
                </div>
                <span className="font-mono text-xs text-muted font-bold">
                  0{idx + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
