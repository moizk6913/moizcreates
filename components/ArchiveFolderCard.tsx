'use client';

import React, { useId } from 'react';

export type FolderVariantType =
  | 'amber-moov'
  | 'cobalt-modern'
  | 'cinema-slate'
  | 'neon-violet'
  | 'terracotta-cut'
  | 'forest-emerald'
  | 'frosted-photostyle'
  | 'art-direction'
  | 'brand-identity'
  | 'cinematography'
  | 'motion-graphics'
  | 'video-editing'
  | 'color-grading'
  | 'photography';

export interface ArchiveFolderProps {
  id?: string;
  code?: string;
  name: string;
  discipline?: string;
  year?: string;
  role?: string;
  photos?: string[];
  photoCount?: number;
  stickers?: any;
  colorTag?: string;
  isComingSoon?: boolean;
  variant?: FolderVariantType | string;
  onClick: () => void;
}

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
];

export default function ArchiveFolderCard({
  id,
  code,
  name,
  discipline,
  year = '2026',
  role,
  photos,
  photoCount = 0,
  onClick,
}: ArchiveFolderProps) {
  const uniqueId = useId().replace(/:/g, '');
  const clipId = `folder-clip-${uniqueId}`;
  const gradId = `folder-grad-${uniqueId}`;
  const strokeId = `folder-stroke-${uniqueId}`;

  // Select 3 display photos for the fan-out stack
  const photoList = photos && photos.length > 0 ? photos : FALLBACK_PHOTOS;
  const img1 = photoList[0] || FALLBACK_PHOTOS[0];
  const img2 = photoList[1] || FALLBACK_PHOTOS[1];
  const img3 = photoList[2] || FALLBACK_PHOTOS[2];

  const isMusicOrReel =
    (discipline || name || '').toLowerCase().includes('music') ||
    (discipline || name || '').toLowerCase().includes('audio');

  // Exact Apple tab shape (220px x 115px) matching reference:
  // Elevated tab on left (width 96px, height 115px), smooth organic S-curve down to shoulder (height 93px),
  // with bottom corners rounded at 26px to match the back plate.
  const flapPath =
    'M 0,20 A 20,20 0 0,1 20,0 L 96,0 C 104,0 110,6 114,14 C 118,20 123,22 130,22 L 202,22 A 18,18 0 0,1 220,40 L 220,89 A 26,26 0 0,1 194,115 L 26,115 A 26,26 0 0,1 0,89 Z';

  return (
    <div
      data-folder-card="true"
      role="button"
      tabIndex={0}
      aria-label={`Open ${name} archive`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col items-center cursor-pointer select-none touch-manipulation pointer-events-auto"
    >
      {/* FOLDER STAGE: 220px Wide x 185px Tall */}
      <div className="relative w-[220px] h-[185px] flex items-end justify-center">

        {/* LAYER 1: BACK FOLDER PLATE (Warm grey cardstock / aluminum squircle, 220px x 150px) */}
        <div className="absolute bottom-0 w-[220px] h-[150px] rounded-[26px] bg-gradient-to-b from-[#e1ded8] via-[#d5d2ca] to-[#c7c4bb] shadow-[0_6px_20px_rgba(0,0,0,0.06)] border border-black/[0.06]" />

        {/* LAYER 2: 3 FANNED-OUT PHOTO PRINTS */}
        {/* Strictly clipped at bottom with rounded-b-[26px] so no photo can EVER poke out from the bottom! */}
        <div className="absolute bottom-0 w-[220px] h-[180px] flex items-end justify-center pointer-events-none z-10 overflow-hidden rounded-b-[26px]">
          {/* Left Photo (Tilted -14deg) */}
          <div className="absolute bottom-[24px] w-[90px] h-[116px] p-1 bg-white rounded-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.16)] transform -rotate-12 -translate-x-8 group-hover:-rotate-[16deg] group-hover:-translate-x-10 transition-transform duration-400 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img1}
              alt="Campaign Still 1"
              className="w-full h-full object-cover rounded-[9px]"
            />
          </div>

          {/* Center Photo (Standing Highest, Upright) */}
          <div className="absolute bottom-[36px] w-[96px] h-[124px] p-1 bg-white rounded-[12px] shadow-[0_10px_24px_rgba(0,0,0,0.20)] z-10 transform group-hover:-translate-y-2 transition-transform duration-400 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img2}
              alt="Campaign Still 2"
              className="w-full h-full object-cover rounded-[9px]"
            />
          </div>

          {/* Right Photo (Tilted +14deg) */}
          <div className="absolute bottom-[24px] w-[90px] h-[116px] p-1 bg-white rounded-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.16)] transform rotate-12 translate-x-8 group-hover:rotate-[16deg] group-hover:translate-x-10 transition-transform duration-400 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img3}
              alt="Campaign Still 3"
              className="w-full h-full object-cover rounded-[9px]"
            />
          </div>
        </div>

        {/* LAYER 3: FRONT FROSTED GLASS FLAP (220px x 115px, Anchored at Bottom-0) */}
        <div className="absolute bottom-0 w-[220px] h-[115px] z-20 transition-transform duration-400 group-hover:-translate-y-1">
          {/* SVG Definitions for this Folder Card */}
          <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <path d={flapPath} />
              </clipPath>
              <linearGradient id={gradId} x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="45%" stopColor="#f3f4f6" stopOpacity="0.50" />
                <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.40" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.70" />
              </linearGradient>
            </defs>
          </svg>

          {/* Frosted Glass Background with Backdrop Blur */}
          <div
            style={{ clipPath: `url(#${clipId})`, WebkitClipPath: `url(#${clipId})` }}
            className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-white/70 via-white/50 to-white/35 shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
          />

          {/* SVG Vector Outline Border & Specular Shine */}
          <svg
            viewBox="0 0 220 115"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
            fill="none"
          >
            <path
              d={flapPath}
              fill={`url(#${gradId})`}
              stroke={`url(#${strokeId})`}
              strokeWidth="1.5"
            />
          </svg>

          {/* Top-Left Subtle Tab Label (Matching Reference PhotoStyle 1:1) */}
          <div className="absolute top-2.5 left-4 z-30 pointer-events-none">
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-black/45 select-none block">
              *CREATIVESTYLE.
            </span>
          </div>

          {/* Bottom-Right Circular Action Button (Matching Reference) */}
          <div className="absolute bottom-3 right-3.5 z-30 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-black transition-all duration-300">
              {isMusicOrReel ? (
                <span className="text-xs font-bold leading-none">♫</span>
              ) : (
                <span className="text-xs font-bold leading-none transform -rotate-12 group-hover:rotate-0 transition-transform">
                  ↗
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* LAYER 4: UNDERNEATH FOLDER — MONUMENTAL TITLE & YEAR PILL (Clear Vertical Separation) */}
      <div className="mt-5 sm:mt-6 flex flex-col items-center text-center">
        <h3 className="font-display font-black text-base sm:text-lg md:text-xl uppercase tracking-tight text-neutral-900 group-hover:text-black transition-colors leading-tight">
          {name}
        </h3>
        <span className="font-mono text-[10px] text-neutral-500 bg-neutral-200/70 px-3 py-0.5 rounded-full font-medium inline-block mt-1.5 tracking-wider">
          {year || '2026'}
        </span>
      </div>

    </div>
  );
}
