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

const TICKER_ITEMS = [
  'ART DIRECTION',
  'BRANDING',
  'VISUAL DESIGN',
  'UI/UX DESIGN',
  'MOTION DESIGN',
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full pt-16 sm:pt-24 bg-white border-t border-black/[0.08] overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14 pb-16 sm:pb-24">
        {/* Section Label */}
        <div className="flex items-center justify-between pb-8 sm:pb-12">
          <span className="font-mono text-xs sm:text-sm text-black tracking-widest uppercase font-bold">
            FREQUENTLY ASKED —
          </span>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            06 QUESTIONS
          </span>
        </div>

        {/* Full-Bleed Monospace FAQ Rows (Screenshot 3) */}
        <div className="border-t border-black/[0.08]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div key={faq.number} className="border-b border-black/[0.08] transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-7 sm:py-9 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-6 sm:gap-12 md:gap-16 flex-1 min-w-0">
                    <span className="font-mono text-sm sm:text-base text-accent-cobalt font-bold tracking-wider">
                      {faq.number}
                    </span>
                    <h3 className="font-sans font-black text-sm sm:text-base md:text-lg tracking-wider uppercase text-black group-hover:text-accent-cobalt transition-colors">
                      {faq.question}
                    </h3>
                  </div>

                  <span className="font-mono text-lg sm:text-xl text-accent-cobalt font-bold flex-shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-8 sm:pb-10 pl-12 sm:pl-28 md:pl-32 pr-4 max-w-3xl animate-fadeIn">
                    <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Width Signature Electric Cobalt Ticker Ribbon (Screenshot 3) */}
      <div className="w-full bg-accent-cobalt text-white py-4 px-4 sm:px-8 overflow-hidden select-none">
        <div className="max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-4 sm:gap-8 font-sans font-black text-xs sm:text-sm tracking-widest uppercase text-center">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="flex-1 min-w-max">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
