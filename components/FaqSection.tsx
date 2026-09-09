'use client';

import { useState } from 'react';

const FAQS = [
  {
    number: '01',
    question: 'What services do you offer?',
    answer:
      'Art direction, brand identity, editorial design, UI/UX experience design, and motion direction across commercial print and digital channels.',
  },
  {
    number: '02',
    question: 'What is your typical turnaround time?',
    answer:
      'Timelines typically range between 2 to 4 weeks depending on the scope of work and required deliverables.',
  },
  {
    number: '03',
    question: 'Can you work with my existing design?',
    answer:
      'Yes. We can work within your existing brand guidelines to refine, elevate, or expand your visual identity system.',
  },
  {
    number: '04',
    question: 'How many revisions do you offer?',
    answer:
      'Each project includes structured rounds of revision to ensure the work is refined and aligned with your goals.',
  },
  {
    number: '05',
    question: 'What’s your process like?',
    answer:
      'A collaborative three-phase framework: Research, Design, and Deliver, with continuous updates throughout.',
  },
  {
    number: '06',
    question: 'How do we get started?',
    answer:
      'Send a note via the contact section below with your project goals and timeline, and we’ll schedule an intro conversation.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-canvas border-t border-border-hairline">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-border-hairline pb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-primary uppercase tracking-tight">
            Frequently Asked
          </h2>
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            06 Questions
          </span>
        </div>

        {/* Clean Accordion (Like Vaishvik Kalva) */}
        <div className="divide-y divide-border-hairline border-b border-border-hairline">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div key={faq.number} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-6 sm:py-7 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
                    <span className="font-mono text-xs text-muted font-bold tracking-wider group-hover:text-accent-red transition-colors">
                      {faq.number}
                    </span>
                    <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl uppercase tracking-tight text-primary group-hover:text-accent-red transition-colors">
                      {faq.question}
                    </h3>
                  </div>

                  <span className="font-mono text-base text-muted group-hover:text-primary transition-colors flex-shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-6 sm:pb-8 pl-8 sm:pl-16 pr-4 max-w-3xl animate-fadeIn">
                    <p className="text-sm sm:text-base text-secondary leading-relaxed font-sans">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
