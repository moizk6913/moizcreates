'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ServiceItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  timeline: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'creative-direction',
    number: '01',
    title: 'Creative & Art Direction',
    tagline: 'Translating brand vision into unmistakable visual authority.',
    description:
      'Guiding commercial campaigns from abstract founder brief to complete visual worldbuilding. We establish the moodboard architecture, lighting schemes, styling language, and on-set staging to ensure every frame reflects pure intentionality.',
    deliverables: [
      'Comprehensive Creative Treatments',
      'On-Set Directorial Supervision',
      'Shotlist & Framing Architecture',
      'Talent Staging & Lighting Strategy',
    ],
    timeline: '2 – 4 Weeks',
  },
  {
    id: 'editorial-lookbooks',
    number: '02',
    title: 'Editorial Lookbooks & Print',
    tagline: 'Tactile editorial publications and high-fashion spreads.',
    description:
      'Editorial lookbook design, double-page magazine spreads, and A4 print media. We treat print as a physical art object—balancing high-fashion typography, paper-weight texture, and deliberate white space for runway and commercial catalogs.',
    deliverables: [
      'A4 Editorial Magazine Spreads',
      'Tactile Lookbook Layouts & Grids',
      'Print Production & Pre-Press Files',
      'Typography & Micro-Copy Systems',
    ],
    timeline: '1 – 3 Weeks',
  },
  {
    id: 'cinematography-editing',
    number: '03',
    title: 'Cinematography & Video Editing',
    tagline: 'High-velocity commercial cuts and cinematic anamorphic pacing.',
    description:
      'From camera package selection and anamorphic practical haze to rhythmic, heartbeat-paced post-production. We craft director’s cuts that hold tension, evoke tactile emotion, and captivate modern viewers across digital screens.',
    deliverables: [
      '16:9 Director Cut Commercial Masters',
      'Anamorphic Lighting & Practical Haze',
      'Sound Design & Audio Pacing',
      'Color-Mastered Broadcast Exports',
    ],
    timeline: '2 – 5 Weeks',
  },
  {
    id: 'social-campaigns',
    number: '04',
    title: '9:16 Social Campaign Systems',
    tagline: 'High-retention vertical paid media ads engineered for conversion.',
    description:
      'Commercial advertising built natively for vertical screens (Meta, TikTok, YouTube Shorts). We design relentless 3-second hook frames, kinetic typography, and multi-asset suites that convert high-ticket audiences without feeling like cheap ads.',
    deliverables: [
      '9:16 Vertical Video Ad Suites',
      'High-Velocity Hook Variants (A/B)',
      'Kinetic Motion Graphics & Captions',
      'E-commerce & Brand Story Sets',
    ],
    timeline: '1 – 2 Weeks',
  },
  {
    id: 'color-grading',
    number: '05',
    title: 'Color Grading & Film Emulation',
    tagline: 'Analogue 35mm warmth, saturated pop, and skin-tone precision.',
    description:
      'Bespoke color science for luxury brands. Emulating classic 35mm and 16mm film stocks, balancing golden-hour tungsten warmth, rich shadow contrast, and authentic analogue grain structure calibrated for both mobile OLED and cinema projection.',
    deliverables: [
      'Custom Campaign Show LUTs',
      '35mm / 16mm Grain Emulation Passes',
      'Natural Skin-Tone Calibration',
      'Web, Social & SDR Deliverables',
    ],
    timeline: '3 – 7 Days',
  },
];

export default function ServicesSection() {
  const [activeId, setActiveId] = useState<string>('creative-direction');

  return (
    <section id="services" className="relative py-24 sm:py-32 px-4 sm:px-6 md:px-12 bg-canvas border-t border-border-hairline">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-hairline">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-accent-red font-bold tracking-widest uppercase mb-2">
              <span>●</span>
              <span>SERVICES &amp; CAPABILITIES</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-primary tracking-tight uppercase leading-[0.95]">
              WHAT WE BUILD
            </h2>
          </div>
          <div className="max-w-md text-secondary font-mono text-xs leading-relaxed">
            Directorial craftsmanship across commercial film, high-fashion editorial print, and multi-channel digital campaigns. Designed for brands that demand distinction.
          </div>
        </div>

        {/* Services Accordion List */}
        <div className="divide-y divide-border-hairline border-y border-border-hairline">
          {SERVICES.map((srv) => {
            const isOpen = activeId === srv.id;

            return (
              <div
                key={srv.id}
                className={`transition-colors duration-300 ${
                  isOpen ? 'bg-subtle/70' : 'hover:bg-subtle/30'
                }`}
              >
                {/* Accordion Row Header */}
                <button
                  type="button"
                  onClick={() => setActiveId(isOpen ? '' : srv.id)}
                  className="w-full py-6 sm:py-8 px-2 sm:px-4 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
                    <span className="font-mono text-xs sm:text-sm text-muted font-bold tracking-wider group-hover:text-accent-red transition-colors">
                      {srv.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-xl sm:text-3xl md:text-4xl uppercase tracking-tight text-primary group-hover:text-accent-red transition-colors">
                        {srv.title}
                      </h3>
                      <p className="font-mono text-xs text-secondary hidden sm:block truncate mt-1">
                        {srv.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="hidden md:inline-block font-mono text-[11px] px-3 py-1 rounded-full bg-border-hairline text-secondary uppercase font-semibold">
                      {srv.timeline}
                    </span>
                    <span className="w-8 h-8 rounded-full border border-border-medium flex items-center justify-center font-mono text-sm text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {/* Accordion Expanded Content */}
                {isOpen && (
                  <div className="px-4 sm:px-16 pb-8 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
                    <div className="lg:col-span-7 space-y-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent-red font-bold block">
                        THE APPROACH &amp; EXECUTION
                      </span>
                      <p className="text-sm sm:text-base text-secondary leading-relaxed">
                        {srv.description}
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/#contact"
                          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:text-accent-red transition-colors"
                        >
                          <span>Commission this service</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-canvas rounded-[12px] p-5 sm:p-6 border border-border-hairline space-y-3">
                      <div className="flex justify-between items-center font-mono text-[10px] text-muted uppercase tracking-wider pb-2 border-b border-border-hairline">
                        <span>DELIVERABLES SPEC</span>
                        <span>TIMELINE: {srv.timeline}</span>
                      </div>
                      <ul className="space-y-2 font-mono text-xs text-primary">
                        {srv.deliverables.map((d, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-red flex-shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 text-xs font-mono text-muted">
          <span>Need a customized cross-discipline package?</span>
          <Link
            href="/#contact"
            className="text-primary hover:text-accent-red font-bold uppercase tracking-wider underline underline-offset-4 transition-colors"
          >
            Start a Custom Brief ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
