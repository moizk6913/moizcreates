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
    <section id="faq" className="w-full pt-16 sm:pt-24 bg-white overflow-hidden select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14 pb-16 sm:pb-24">
        {/* Giant Headline (Page 3 Reference) */}
        <div className="overflow-hidden pb-8 sm:pb-14 select-none">
          <h2 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap">
            Frequently Asked
          </h2>
        </div>

        {/* Clean Accordion Rows — Zero Lines */}
        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div key={faq.number} className="rounded-[20px] transition-all hover:bg-[#faf9f6] p-2 sm:p-4 border-none">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-4 sm:py-6 px-4 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-6 sm:gap-12 md:gap-16 flex-1 min-w-0">
                    <span className="font-mono text-sm sm:text-base font-bold text-black group-hover:text-[#e60000] tracking-wider transition-colors">
                      {faq.number}
                    </span>
                    <h3 className="font-display font-black text-sm sm:text-base md:text-lg tracking-wider uppercase text-black group-hover:text-[#e60000] transition-colors">
                      {faq.question}
                    </h3>
                  </div>

                  <span className="font-mono text-lg sm:text-2xl text-[#e60000] font-bold flex-shrink-0 transition-transform duration-200">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-8 sm:pb-10 pl-12 sm:pl-28 md:pl-32 pr-4 max-w-3xl animate-fadeIn">
                    <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-normal">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Signature Full-Width Red #e60000 Ticker Ribbon (Page 3 Reference) */}
      <div className="w-full bg-[#e60000] text-white py-4 px-4 sm:px-8 overflow-hidden select-none">
        <div className="max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-4 sm:gap-8 font-display font-black text-xs sm:text-sm tracking-widest uppercase text-center">
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
