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
    question: 'WHAT DO YOU ACTUALLY DO?',
    answer:
      "I direct and design visual identities, campaigns, and creative work. Sometimes that means building a brand from zero. Sometimes that means fixing something that isn't working.",
  },
  {
    number: '02',
    question: 'DO YOU WORK WITH OTHER CREATIVES?',
    answer:
      'Yes. Designers, 3D artists, motion designers, developers, photographers. I direct the vision and work with whoever makes it better.',
  },
  {
    number: '03',
    question: 'CAN YOU TAKE AN IDEA FROM CONCEPT TO PRODUCTION?',
    answer:
      'Yes. From the first reference board to the final export.',
  },
  {
    number: '04',
    question: 'LOOKING TO WORK TOGETHER?',
    answer:
      "Send an email with what you're working on, timeline, and what you need. If it makes sense, we'll talk.",
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
              className="w-full bg-transparent transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-6 text-left cursor-pointer group"
              >
                {/* Left: Number + Question */}
                <div className="flex items-baseline gap-4 sm:gap-6 md:gap-10 min-w-0 transition-transform duration-300 group-hover:translate-x-2">
                  <span className="font-mono text-base sm:text-lg md:text-2xl font-bold text-neutral-300 group-hover:text-black transition-colors shrink-0">
                    {faq.number}
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl lg:text-[34px] xl:text-[40px] tracking-tight uppercase text-black leading-tight">
                    {faq.question}
                  </h3>
                </div>

                {/* Right: + / − Sign stuck to right edge in circular control */}
                <span className="w-8 h-8 sm:w-10 sm:h-10 apple-circle rounded-full bg-black/5 group-hover:bg-black group-hover:text-white text-black flex items-center justify-center font-mono text-xl sm:text-2xl font-light shrink-0 transition-all duration-200">
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
