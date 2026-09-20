'use client';

import { useState } from 'react';

interface FaqItem {
  number: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    number: '01',
    question: 'WHAT SERVICES DO YOU OFFER?',
    answer:
      'Art direction, brand identity, editorial lookbook design, UI/UX experience design, packaging, and commercial motion direction across digital and physical print formats.',
  },
  {
    number: '02',
    question: 'WHAT IS YOUR TYPICAL TURNAROUND TIME?',
    answer:
      'Timelines typically range between 2 to 4 weeks depending on the scope of work, asset volume, and required deliverables.',
  },
  {
    number: '03',
    question: 'CAN YOU WORK WITH MY EXISTING DESIGN?',
    answer:
      'Yes. We regularly work within existing brand guidelines to refine, elevate, or expand your visual identity system.',
  },
  {
    number: '04',
    question: 'HOW MANY REVISIONS DO YOU OFFER?',
    answer:
      'Each project includes structured rounds of revision to ensure every detail is refined and aligned with your goals.',
  },
  {
    number: '05',
    question: 'WHAT’S YOUR PROCESS LIKE?',
    answer:
      'A collaborative three-phase framework: Research, Design, and Deliver, with continuous updates throughout.',
  },
  {
    number: '06',
    question: 'HOW DO WE GET STARTED?',
    answer:
      'Send a brief via the direct contact section below with your project goals and timeline, and we’ll schedule an intro conversation.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="w-full py-16 sm:py-24 md:py-32 bg-white overflow-hidden select-none border-none relative"
    >
      {/* 1. GIANT RUNNING MARQUEE HEADER (Monochrome, Edge-to-Edge) */}
      <div className="w-full pb-10 sm:pb-14 md:pb-20 overflow-hidden">
        <div className="flex items-center w-max animate-marquee-left">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            FREQUENTLY ASKED — FREQUENTLY ASKED — FREQUENTLY ASKED —
          </div>
          <div className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[108px] tracking-tight uppercase text-black leading-none whitespace-nowrap pr-12">
            FREQUENTLY ASKED — FREQUENTLY ASKED — FREQUENTLY ASKED —
          </div>
        </div>
      </div>

      {/* 2. EDGE-ANCHORED ACCORDION ROWS (Stuck strictly to 68px/100px margins, no max-w clamp on zoom out) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-[68px] xl:px-[100px] space-y-3 sm:space-y-4 md:space-y-6">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;

          return (
            <div
              key={faq.number}
              className="w-full rounded-[22px] sm:rounded-[26px] transition-all duration-300 hover:bg-[#faf9f6]"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full py-6 sm:py-8 md:py-10 px-5 sm:px-8 md:px-10 flex items-center justify-between gap-6 text-left cursor-pointer group"
              >
                {/* Left: Number + Question */}
                <div className="flex items-baseline gap-4 sm:gap-6 md:gap-10 min-w-0">
                  <span className="font-mono text-base sm:text-lg md:text-2xl font-bold text-neutral-400 group-hover:text-black transition-colors shrink-0">
                    {faq.number}
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-[34px] xl:text-[40px] tracking-tight uppercase text-black group-hover:text-neutral-500 transition-colors leading-tight">
                    {faq.question}
                  </h3>
                </div>

                {/* Right: + / − Sign stuck to right edge */}
                <span className="font-mono text-2xl sm:text-3xl md:text-4xl text-black font-light shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {/* Expanded Answer */}
              {isOpen && (
                <div className="pb-8 pt-2 pl-12 sm:pl-20 md:pl-28 pr-6 max-w-4xl animate-fadeIn">
                  <p className="font-sans text-sm sm:text-base md:text-lg lg:text-[19px] text-neutral-600 leading-relaxed font-normal">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
