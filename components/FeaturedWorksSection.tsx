'use client';

import { useMemo } from 'react';
import { DynamicCanvasFile } from '@/lib/contentStore';

interface FeaturedWorksSectionProps {
  onOpenCase: (id: string) => void;
  uploadedFiles?: DynamicCanvasFile[];
}

export default function FeaturedWorksSection({
  onOpenCase,
  uploadedFiles,
}: FeaturedWorksSectionProps) {
  // Check if user has uploaded a custom Kaldhar or any custom projects
  const userKaldhar = useMemo(() => {
    return uploadedFiles?.find(
      (f) =>
        f.id.toLowerCase().includes('kaldhar') ||
        f.name.toLowerCase().includes('kaldhar') ||
        f.code?.toLowerCase().includes('kaldhar')
    );
  }, [uploadedFiles]);

  // Lead image for Kaldhar
  const kaldharImg =
    userKaldhar?.photos?.[0] ||
    userKaldhar?.img ||
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop';

  const kaldharCount = userKaldhar?.photos?.length || 88;

  // Additional custom uploads from user
  const otherUploads = useMemo(() => {
    return (
      uploadedFiles?.filter(
        (f) =>
          !f.id.toLowerCase().includes('kaldhar') &&
          !f.name.toLowerCase().includes('kaldhar')
      ) || []
    );
  }, [uploadedFiles]);

  return (
    <section
      id="work"
      className="w-full py-20 sm:py-28 md:py-32 px-6 sm:px-10 md:px-14 bg-canvas space-y-12 sm:space-y-16"
    >
      {/* Section Header (Matching Vaishvik Kalva's 'Featured Works  —' rhythm) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-black uppercase tracking-tight">
            Featured Works
          </h2>
          <span className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#e60000]">
            —
          </span>
        </div>
        <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest font-semibold">
          DIRECTED CAMPAIGNS &amp; BRAND SYSTEMS (2024–2026)
        </span>
      </div>

      {/* Bento Grid Showcase */}
      <div className="space-y-6 sm:space-y-8">
        {/* 1. MASTER LEAD BENTO CARD: KALDHAR (Full 12-Column Luxury Spread) */}
        <div
          onClick={() => onOpenCase(userKaldhar?.id || 'kaldhar')}
          className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#faf9f6] p-6 sm:p-10 md:p-12 cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest">
                  HERITAGE LUXURY CAMPAIGN
                </span>
                <span className="font-mono text-[10px] text-neutral-400 bg-neutral-200/60 px-2 py-0.5 rounded-full font-semibold">
                  {kaldharCount} DELIVERABLES
                </span>
              </div>

              <h3 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-black uppercase tracking-tight leading-none group-hover:text-[#e60000] transition-colors duration-300">
                Kaldhar
              </h3>

              <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-md">
                Complete multi-channel campaign with {kaldharCount} deliverables including lookbook editorial spreads, vertical social media motion, and retail standee assets.
              </p>

              <div className="pt-2 flex flex-wrap gap-2">
                {['Editorial Lookbook (4:5)', 'Social Stories & Motion (9:16)', 'Retail Displays', 'Hero Banners'].map(
                  (scope, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-neutral-100 font-mono text-[11px] text-neutral-600 font-semibold"
                    >
                      {scope}
                    </span>
                  )
                )}
              </div>

              <div className="pt-4 flex items-center gap-2 font-display font-black text-xs uppercase tracking-widest text-black group-hover:text-[#e60000] transition-colors">
                <span>OPEN FULL CASE STUDY &amp; BENTO SPREAD</span>
                <span className="transform group-hover:translate-x-1.5 transition-transform">
                  ↗
                </span>
              </div>
            </div>

            {/* Right Visual Column (Widescreen Master Still) */}
            <div className="lg:col-span-7 rounded-[22px] sm:rounded-[26px] overflow-hidden bg-neutral-900 aspect-[16/10] sm:aspect-[16/9] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={kaldharImg}
                alt="Kaldhar Master Visual"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wider">
                MASTER WIDESCREEN KEY ART
              </div>
            </div>
          </div>
        </div>

        {/* 2. ASYMMETRIC BENTO ROW: EASY HAI BRO (7-Col) + PORSCHE (5-Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Card 02: Easy Hai Bro (7-Col) */}
          <div
            onClick={() => onOpenCase('easyhaibro')}
            className="lg:col-span-7 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#faf9f6] p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 min-h-[440px]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest">
                  STREETWEAR &amp; YOUTH CULTURE
                </span>
                <span className="font-mono text-xs text-neutral-400">2025</span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-4xl text-black uppercase tracking-tight leading-none group-hover:text-[#e60000] transition-colors duration-300">
                Easy Hai Bro
              </h3>

              <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                Full brand identity, commercial shoot direction, cinematography, and editorial lookbooks for high-energy youth apparel.
              </p>
            </div>

            <div className="mt-6 rounded-[20px] overflow-hidden aspect-[16/9] bg-neutral-900 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop"
                alt="Easy Hai Bro Campaign"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-neutral-500 pt-2">
              <span className="font-semibold">SHOOT DIRECTION • EDITORIAL</span>
              <span className="font-bold text-black group-hover:text-[#e60000] transition-colors">
                EXPLORE ↗
              </span>
            </div>
          </div>

          {/* Card 03: Porsche Carrera Telemetry (5-Col) */}
          <div
            onClick={() => onOpenCase('porsche')}
            className="lg:col-span-5 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#faf9f6] p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 min-h-[440px]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest">
                  AUTOMOTIVE BROADCAST
                </span>
                <span className="font-mono text-xs text-neutral-400">2025</span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-4xl text-black uppercase tracking-tight leading-none group-hover:text-[#e60000] transition-colors duration-300">
                Porsche Carrera
              </h3>

              <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                Visceral automotive director cut sync-edited to raw exhaust acoustics and precision asphalt telemetry.
              </p>
            </div>

            <div className="mt-6 rounded-[20px] overflow-hidden aspect-[4/3] bg-neutral-900 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop"
                alt="Porsche Telemetry Campaign"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-neutral-500 pt-2">
              <span className="font-semibold">PURSUIT ARM • SOUND DESIGN</span>
              <span className="font-bold text-black group-hover:text-[#e60000] transition-colors">
                EXPLORE ↗
              </span>
            </div>
          </div>
        </div>

        {/* 3. TERTIARY BENTO ROW: RUCHI FRIED CHICKEN + CUSTOM USER UPLOADS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Card 04: Ruchi Fried Chicken */}
          <div
            onClick={() => onOpenCase('ruchi')}
            className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#faf9f6] p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest">
                  COMMERCIAL FOOD DIRECTION
                </span>
                <span className="font-mono text-xs text-neutral-400">2025</span>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight group-hover:text-[#e60000] transition-colors duration-300">
                Ruchi Fried Chicken
              </h3>

              <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                High-speed probe lenses and saturated RGB rim lighting for commercial QSR television and mobile feeds.
              </p>
            </div>

            <div className="mt-6 rounded-[20px] overflow-hidden aspect-[16/9] bg-neutral-900 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200&auto=format&fit=crop"
                alt="Ruchi Fried Chicken"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-neutral-500 pt-2">
              <span className="font-semibold">PROBE CAMERA • RGB RIM</span>
              <span className="font-bold text-black group-hover:text-[#e60000] transition-colors">
                EXPLORE ↗
              </span>
            </div>
          </div>

          {/* Card 05: User Upload or Windchasers */}
          {otherUploads.length > 0 ? (
            <div
              onClick={() => onOpenCase(otherUploads[0].id)}
              className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#faf9f6] p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest">
                    {otherUploads[0].discipline || 'LIVE CAMPAIGN'}
                  </span>
                  <span className="font-mono text-xs text-neutral-400">
                    {otherUploads[0].year || '2026'}
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight group-hover:text-[#e60000] transition-colors duration-300">
                  {otherUploads[0].name}
                </h3>

                <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                  {otherUploads[0].desc || 'Directorial campaign archived in Moiz Khan studio vault.'}
                </p>
              </div>

              <div className="mt-6 rounded-[20px] overflow-hidden aspect-[16/9] bg-neutral-900 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={otherUploads[0].photos?.[0] || otherUploads[0].img}
                  alt={otherUploads[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs text-neutral-500 pt-2">
                <span className="font-semibold">
                  {otherUploads[0].photos?.length || 1} DELIVERABLES
                </span>
                <span className="font-bold text-black group-hover:text-[#e60000] transition-colors">
                  EXPLORE ↗
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => onOpenCase('windchasers')}
              className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#faf9f6] p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest">
                    LOOKBOOK &amp; BRAND SHOOT
                  </span>
                  <span className="font-mono text-xs text-neutral-400">2026</span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-black uppercase tracking-tight group-hover:text-[#e60000] transition-colors duration-300">
                  Windchasers Aviation
                </h3>

                <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                  Flight deck cinematography and brand shoot direction across cockpit lookbooks and pilot recruitment collateral.
                </p>
              </div>

              <div className="mt-6 rounded-[20px] overflow-hidden aspect-[16/9] bg-neutral-900 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop"
                  alt="Windchasers Aviation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs text-neutral-500 pt-2">
                <span className="font-semibold">LOOKBOOK • BRAND SHOOT</span>
                <span className="font-bold text-black group-hover:text-[#e60000] transition-colors">
                  EXPLORE ↗
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
