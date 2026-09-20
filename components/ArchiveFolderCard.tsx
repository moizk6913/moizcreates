'use client';

import React from 'react';

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
  // Select 3 display photos for the fan-out stack
  const photoList = photos && photos.length > 0 ? photos : FALLBACK_PHOTOS;
  const img1 = photoList[0] || FALLBACK_PHOTOS[0];
  const img2 = photoList[1] || FALLBACK_PHOTOS[1];
  const img3 = photoList[2] || FALLBACK_PHOTOS[2];

  const isMusicOrReel = (discipline || name || '').toLowerCase().includes('music') || (discipline || name || '').toLowerCase().includes('audio');

  return (
    <div
      data-folder-card="true"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative flex flex-col items-center cursor-pointer select-none touch-manipulation pointer-events-auto"
    >
      {/* SVG Clip-Path Definition for the signature Asymmetric Apple Folder Tab Cut */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="appleFolderFrontTab" clipPathUnits="objectBoundingBox">
            <path d="
              M 0, 0.16
              C 0, 0.06, 0.05, 0, 0.14, 0
              L 0.38, 0
              C 0.46, 0, 0.49, 0.08, 0.54, 0.20
              C 0.58, 0.28, 0.62, 0.30, 0.70, 0.30
              L 0.86, 0.30
              C 0.94, 0.30, 1, 0.38, 1, 0.48
              L 1, 0.82
              C 1, 0.93, 0.93, 1, 0.84, 1
              L 0.16, 1
              C 0.06, 1, 0, 0.93, 0, 0.82
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      {/* FOLDER STAGE (Photos + Back Plate + Front Frosted Flap) */}
      <div className="relative w-[196px] sm:w-[216px] h-[170px] sm:h-[185px] flex items-end justify-center">
        
        {/* LAYER 1: BACK PLATE (Silver-Grey Apple Squircle) */}
        <div className="absolute bottom-0 w-[184px] sm:w-[204px] h-[126px] sm:h-[138px] rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#e3e1dd] to-[#cdc9c2] shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/5" />

        {/* LAYER 2: 3 FANNED-OUT PHOTO CARDS (With Apple-grade white border frames) */}
        <div className="absolute bottom-6 w-full flex items-center justify-center pointer-events-none z-10">
          {/* Left Photo (Tilted -12deg) */}
          <div className="absolute w-[80px] sm:w-[88px] h-[104px] sm:h-[116px] p-1.5 bg-white rounded-[18px] sm:rounded-[22px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] transform -rotate-12 -translate-x-6 -translate-y-4 group-hover:-rotate-[16deg] group-hover:-translate-x-8 group-hover:-translate-y-6 transition-transform duration-500 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img1}
              alt="Campaign Still 1"
              className="w-full h-full object-cover rounded-[14px] sm:rounded-[18px]"
            />
          </div>

          {/* Center Photo (Standing Highest, Upright) */}
          <div className="absolute w-[86px] sm:w-[94px] h-[112px] sm:h-[124px] p-1.5 bg-white rounded-[18px] sm:rounded-[22px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] z-10 transform -translate-y-6 sm:-translate-y-7 group-hover:-translate-y-9 sm:group-hover:-translate-y-10 transition-transform duration-500 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img2}
              alt="Campaign Still 2"
              className="w-full h-full object-cover rounded-[14px] sm:rounded-[18px]"
            />
          </div>

          {/* Right Photo (Tilted +12deg) */}
          <div className="absolute w-[80px] sm:w-[88px] h-[104px] sm:h-[116px] p-1.5 bg-white rounded-[18px] sm:rounded-[22px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] transform rotate-12 translate-x-6 -translate-y-3 group-hover:rotate-[16deg] group-hover:translate-x-8 group-hover:-translate-y-5 transition-transform duration-500 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img3}
              alt="Campaign Still 3"
              className="w-full h-full object-cover rounded-[14px] sm:rounded-[18px]"
            />
          </div>
        </div>

        {/* LAYER 3: FROSTED GLASS FRONT FLAP (Signature Asymmetric Tab Cut + Specular Glow) */}
        <div
          style={{
            clipPath: 'url(#appleFolderFrontTab)',
            WebkitClipPath: 'url(#appleFolderFrontTab)',
          }}
          className="absolute bottom-0 w-full h-[116px] sm:h-[128px] backdrop-blur-xl bg-gradient-to-br from-white/80 via-white/55 to-white/40 shadow-[0_12px_28px_rgba(0,0,0,0.10)] border border-white/70 z-20 flex flex-col justify-between p-3.5 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.14)] transition-all duration-400 group-hover:-translate-y-1"
        >
          {/* Top Surface Specular Gloss Highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none" />

          {/* Top-Left Metadata Text */}
          <div className="relative z-10 text-left pointer-events-none max-w-[120px] space-y-0.5">
            <span className="font-mono text-[8px] uppercase tracking-wider text-black/55 font-bold block">
              *CREATIVESTYLE.
            </span>
            <span className="font-sans font-black text-[10px] sm:text-[11px] text-black tracking-tight block truncate uppercase leading-tight">
              {name}
            </span>
            <span className="font-sans text-[8px] sm:text-[9px] text-neutral-600 block truncate leading-tight">
              {discipline || role || 'DIRECTOR ARCHIVE'}
            </span>
          </div>

          {/* Bottom-Right Circular Black Action Button (Matches Reference Images 3 & 4) */}
          <div className="relative z-10 self-end">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-neutral-800 transition-all duration-300">
              {isMusicOrReel ? (
                <span className="text-xs font-bold leading-none">♫</span>
              ) : (
                <span className="text-sm font-bold leading-none transform -rotate-12 group-hover:rotate-0 transition-transform">
                  ↗
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* LAYER 4: UNDERNEATH FOLDER — MONUMENTAL TITLE & 2026 PILL */}
      <div className="mt-3.5 flex flex-col items-center text-center">
        <h3 className="font-display font-black text-base sm:text-lg md:text-xl uppercase tracking-tight text-black group-hover:text-neutral-600 transition-colors leading-tight">
          {name}
        </h3>
        <span className="font-mono text-[11px] text-neutral-500 bg-neutral-200/60 px-3.5 py-0.5 rounded-full font-medium inline-block mt-1">
          {year || '2026'}
        </span>
      </div>

    </div>
  );
}
