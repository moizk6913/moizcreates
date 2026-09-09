'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FaqItem {
  id: string;
  number: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    number: '01',
    question: 'What type of projects do you accept?',
    answer:
      'We direct high-impact commercial film campaigns, fashion editorial lookbooks (both tactile A4 print and digital spreads), high-retention 9:16 paid social video suites, and brand visual systems. We specialize in work that demands high-fashion restraint, cinematic lighting, and sharp editorial precision.',
  },
  {
    id: 'faq-2',
    number: '02',
    question: 'What is your typical project turnaround timeline?',
    answer:
      'Turnaround depends on project scope. Editorial lookbook design and 9:16 social suites are typically delivered within 1 to 3 weeks. Full-scale commercial productions—encompassing treatment architecture, on-set shooting, sound design, color grade, and multi-format delivery—typically span 3 to 5 weeks from signed brief to final master handoff.',
  },
  {
    id: 'faq-3',
    number: '03',
    question: 'Are you available for on-set direction in Dubai and internationally?',
    answer:
      'Yes. Headquartered in Dubai, UAE, we regularly travel for on-set direction across London, Paris, Milan, New York, and international production hubs. For remote or overseas clients, we provide live, low-latency monitor streaming directly from camera village so founders and stakeholders can review takes in real time.',
  },
  {
    id: 'faq-4',
    number: '04',
    question: 'How many revisions are included in a campaign scope?',
    answer:
      'Every project includes two formal, comprehensive revision rounds per milestone (Treatment phase, Rough Cut assembly, and Color/Audio final mastering). This structured review process eliminates miscommunication and guarantees the final output surpasses expectations without unexpected delays.',
  },
  {
    id: 'faq-5',
    number: '05',
    question: 'What master formats and deliverables will our team receive?',
    answer:
      'Deliverables are delivered organized in an archival cloud repository: 16:9 4K ProRes 422HQ/4444 master exports for broadcast/web, 9:16 high-bitrate vertical formats optimized for Meta/TikTok with optional kinetic captions, 300 DPI CMYK print-ready A4 PDFs for print, and custom Show LUTs for ongoing brand continuity.',
  },
  {
    id: 'faq-6',
    number: '06',
    question: 'How do we kick off a project and lock production dates?',
    answer:
      'Submit an inquiry below with your project goals, preferred launch date, and budget tier. We schedule an initial 20-minute alignment call to review your brief. Following alignment, a Directorial Treatment and project agreement are issued, locking your production dates on our studio calendar.',
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string>('faq-1');

  return (
    <section id="faq" className="relative py-24 sm:py-32 px-4 sm:px-6 md:px-12 bg-subtle/30 border-t border-border-hairline">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-hairline">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-accent-red font-bold tracking-widest uppercase mb-2">
              <span>●</span>
              <span>CLIENT QUESTIONS &amp; PROTOCOLS</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-primary tracking-tight uppercase leading-[0.95]">
              FREQUENTLY ASKED
            </h2>
          </div>
          <p className="max-w-md text-secondary font-mono text-xs leading-relaxed">
            Everything you need to know regarding scope, deliverables, international availability, and production workflows before initiating a brief.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto divide-y divide-border-hairline border-y border-border-hairline">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={`transition-colors duration-200 ${
                  isOpen ? 'bg-canvas' : 'hover:bg-canvas/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : faq.id)}
                  className="w-full py-6 sm:py-7 px-4 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <span className="font-mono text-xs text-muted font-bold tracking-wider group-hover:text-accent-red transition-colors">
                      {faq.number}
                    </span>
                    <h3 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-primary group-hover:text-accent-red transition-colors">
                      {faq.question}
                    </h3>
                  </div>

                  <span className="w-8 h-8 rounded-full border border-border-medium flex items-center justify-center font-mono text-sm text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-14 pb-8 pt-1 animate-fadeIn">
                    <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-3xl">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="text-center pt-4 space-y-2">
          <p className="font-mono text-xs text-muted">
            Have a question that is not covered here?
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-accent-red font-bold uppercase tracking-wider underline underline-offset-4 transition-colors"
          >
            <span>Ask directly via contact form</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
