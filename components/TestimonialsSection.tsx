'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  category: 'ALL' | 'ART DIRECTION' | 'BRAND IDENTITY' | 'CREATIVE STRATEGY';
  rating: number;
  avatar: string;
  deliverables: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '01',
    quote:
      'Working with Moiz was a great experience. His ability to come up with concepts is amazing. You can completely rely on him when it comes to art direction. His adaptability and discipline are something every creative lead wants to see.',
    name: 'AKANSHA SINGH',
    role: 'Design & Marketing',
    company: 'Vryse',
    category: 'ART DIRECTION',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    deliverables: 'Visual Direction · Campaign Identity',
  },
  {
    id: '02',
    quote:
      'I had the pleasure of working with Moiz during his directorial campaigns, where he contributed to a wide range of brand projects. He consistently pushed beyond his comfort zone, showing great openness and expanding his visual language without hesitation, remaining attentive and detail-oriented throughout.',
    name: 'YAGYA GULATI',
    role: 'Founder & Directorial Lead',
    company: 'Chitram Design Studio',
    category: 'BRAND IDENTITY',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    deliverables: 'Brand Systems · Directorial Films',
  },
  {
    id: '03',
    quote:
      'I had the pleasure of working with Moiz on the branding and visual architecture, and his creativity and design sense truly elevated the identity. He translated complex ideas into a clear, impactful visual language with professionalism and attention to detail.',
    name: 'SUROOR FATIMA',
    role: 'Founder & Head of Visuals',
    company: 'Shadow Drafts',
    category: 'BRAND IDENTITY',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    deliverables: 'Visual Architecture · Brand Identity',
  },
  {
    id: '04',
    quote:
      'Moiz was a fantastic addition to our directorial team. He had consistently demonstrated a keen eye for detail, a strong understanding of visual direction, and a solid grasp of campaign media strategy.',
    name: 'BONTI DAS',
    role: 'Senior Graphic Designer',
    company: 'Coolfit Design Studio',
    category: 'ART DIRECTION',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    deliverables: 'Media Strategy · Campaign Direction',
  },
  {
    id: '05',
    quote:
      'Moiz is one of those creatives who always strives to refine ideas and create meaningful works. He is diligent and sincere in his approach. He will be an asset to the team or organization who chooses him.',
    name: 'NAMRITA SHARMA',
    role: 'Associate Director',
    company: 'Creative Strategy',
    category: 'CREATIVE STRATEGY',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    deliverables: 'Strategic Ideation · Design Refinement',
  },
];

const CATEGORIES = ['ALL', 'ART DIRECTION', 'BRAND IDENTITY', 'CREATIVE STRATEGY'] as const;

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1 text-black">
      {Array.from({ length: count }).map((_, i) => (
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
  const containerRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const filteredTestimonials =
    activeCategory === 'ALL'
      ? TESTIMONIALS
      : TESTIMONIALS.filter((t) => t.category === activeCategory);

  const activeItem = TESTIMONIALS[activeIndex] || TESTIMONIALS[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.fromTo(
        '.testimonials-reveal',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="testimonials"
      className="relative w-full py-20 sm:py-28 md:py-36 bg-white overflow-hidden select-none border-none"
    >
      {/* 1. GIANT RUNNING MARQUEE HEADER (Seamless Monochrome) */}
      <div className="w-full pb-10 sm:pb-14 md:pb-20 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            CLIENT ENDORSEMENTS — CLIENT ENDORSEMENTS — CLIENT ENDORSEMENTS —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            CLIENT ENDORSEMENTS — CLIENT ENDORSEMENTS — CLIENT ENDORSEMENTS —
          </div>
        </div>
      </div>

      {/* 2. EDGE-ANCHORED CONTROL & METRIC BAR (Strictly 68px/100px from Viewport Edges) */}
      <div className="testimonials-reveal w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] pb-10 sm:pb-14">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Swiss Stats & Rating Pill */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="inline-flex items-center gap-2.5 bg-[#faf9f6] px-4 py-2 rounded-full">
              <StarRating count={5} />
              <span className="font-mono text-xs sm:text-sm font-bold text-black tracking-wider">
                5.0 / 5.0
              </span>
              <span className="font-sans text-xs text-neutral-400">· Verified Reputation</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 bg-[#faf9f6] px-4 py-2 rounded-full font-mono text-xs text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span>100% DIRECTORIAL EXCELLENCE</span>
            </div>
          </div>

          {/* Right: Interactive Controls (Previous / Next / Pause) */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            {/* Category Filter Pills */}
            <div className="hidden md:flex items-center gap-2 bg-[#faf9f6] p-1.5 rounded-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? 'bg-black text-white font-bold shadow-sm'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Review"
                className="w-10 h-10 rounded-full bg-[#faf9f6] hover:bg-black hover:text-white text-black flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Review"
                className="w-10 h-10 rounded-full bg-[#faf9f6] hover:bg-black hover:text-white text-black flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Play/Pause Flow Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3.5 py-2 rounded-full bg-[#faf9f6] hover:bg-neutral-200 font-mono text-xs text-neutral-800 flex items-center gap-2 transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-neutral-400' : 'bg-black animate-pulse'}`}></span>
              <span className="hidden sm:inline">{isPaused ? 'RESUME FLOW' : 'PAUSE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. HERO SPOTLIGHT CARD (Edge-Anchored Focus Card) */}
      <div className="testimonials-reveal w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] mb-12 sm:mb-16">
        <div className="w-full bg-[#faf9f6] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 md:p-16 relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
          {/* Subtle Apple-Grade Watermark Quote Mark */}
          <div className="absolute top-6 right-8 sm:top-10 sm:right-12 font-serif text-8xl sm:text-9xl text-black/[0.04] pointer-events-none select-none font-bold leading-none">
            “
          </div>

          <div className="relative z-10 flex flex-col justify-between space-y-8 md:space-y-12 min-h-[220px]">
            {/* Top Row: Rating & Deliverable Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <StarRating count={5} />
                <span className="font-mono text-xs text-neutral-400 tracking-wider">
                  VERIFIED DIRECTORIAL CLIENT
                </span>
              </div>
              <span className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-black/5 text-neutral-800 uppercase tracking-wider font-semibold">
                {activeItem.deliverables}
              </span>
            </div>

            {/* Center: Monumental Editorial Quote */}
            <p className="font-sans text-lg sm:text-2xl md:text-3xl lg:text-[32px] text-black font-normal leading-snug tracking-tight">
              &ldquo;{activeItem.quote}&rdquo;
            </p>

            {/* Bottom Row: Client Profile & Index Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.avatar}
                  alt={activeItem.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-neutral-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-black text-base sm:text-lg text-black uppercase tracking-wider">
                      {activeItem.name}
                    </h4>
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-neutral-500">
                    {activeItem.role} · <span className="font-medium text-black">{activeItem.company}</span>
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="font-mono text-xs text-neutral-400">
                <span className="text-black font-bold font-mono text-sm">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>{' '}
                / {String(TESTIMONIALS.length).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DUAL-LANE KINETIC FLOATING MARQUEE TRACKS (Continuous Silk Glide, Pauses on Hover) */}
      <div className="w-full space-y-4 sm:space-y-6 relative overflow-hidden">
        {/* Soft edge blur masks for ultra-high-end Apple aesthetic */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 md:w-48 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 md:w-48 z-10 bg-gradient-to-l from-white to-transparent" />

        {/* Track 1: Gliding Left */}
        <div
          className={`flex items-center w-max ${
            isPaused ? '' : 'animate-marquee-left'
          } pause-on-hover transition-transform duration-300`}
        >
          {filteredTestimonials.concat(filteredTestimonials).map((t, idx) => (
            <div
              key={`track-1-${t.id}-${idx}`}
              onClick={() => setActiveIndex(TESTIMONIALS.findIndex((item) => item.id === t.id))}
              className="w-[320px] sm:w-[420px] md:w-[480px] lg:w-[520px] shrink-0 mx-2.5 sm:mx-3.5 bg-[#faf9f6] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between space-y-5 cursor-pointer hover:bg-[#f3f2ee] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StarRating count={5} />
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    {t.category}
                  </span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-neutral-800 leading-relaxed line-clamp-3">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover bg-neutral-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-display font-black text-xs sm:text-sm text-black uppercase tracking-wider truncate">
                      {t.name}
                    </h5>
                    <span className="w-3.5 h-3.5 rounded-full bg-black text-white text-[8px] flex items-center justify-center font-bold shrink-0">
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

        {/* Track 2: Gliding Right (Opposite kinetic motion) */}
        <div
          className={`flex items-center w-max ${
            isPaused ? '' : 'animate-marquee-right'
          } pause-on-hover transition-transform duration-300`}
        >
          {filteredTestimonials
            .slice()
            .reverse()
            .concat(filteredTestimonials.slice().reverse())
            .map((t, idx) => (
              <div
                key={`track-2-${t.id}-${idx}`}
                onClick={() => setActiveIndex(TESTIMONIALS.findIndex((item) => item.id === t.id))}
                className="w-[320px] sm:w-[420px] md:w-[480px] lg:w-[520px] shrink-0 mx-2.5 sm:mx-3.5 bg-[#faf9f6] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between space-y-5 cursor-pointer hover:bg-[#f3f2ee] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StarRating count={5} />
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                      {t.deliverables.split('·')[0]}
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-neutral-800 leading-relaxed line-clamp-3">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover bg-neutral-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-display font-black text-xs sm:text-sm text-black uppercase tracking-wider truncate">
                        {t.name}
                      </h5>
                      <span className="w-3.5 h-3.5 rounded-full bg-black text-white text-[8px] flex items-center justify-center font-bold shrink-0">
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

      {/* 5. EDGE-ANCHORED BASELINE FOOTER (Zero lines, clean Swiss metadata) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] pt-12 sm:pt-16 flex items-center justify-between text-xs sm:text-sm font-mono text-neutral-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
          <span className="uppercase tracking-widest text-neutral-800 font-semibold">
            Directorial Trust
          </span>
        </div>
        <div className="text-neutral-400 uppercase tracking-wider hidden sm:block">
          5.0 ★ Client Rating · 100% On-Schedule Delivery
        </div>
      </div>
    </section>
  );
}
