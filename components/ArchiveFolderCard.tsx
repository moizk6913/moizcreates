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

  // Exact Apple tab shape path (200px x 110px) with smooth organic S-curve shoulder and rounded corners
  const flapPath =
    'M 0,18 A 18,18 0 0,1 18,0 L 88,0 C 95,0 100,6 104,13 C 107,18 111,20 116,20 L 182,20 A 18,18 0 0,1 200,38 L 200,92 A 18,18 0 0,1 182,110 L 18,110 A 18,18 0 0,1 0,92 Z';

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
      {/* FOLDER COMPOSITE STAGE (Width: 200px, Height: 175px) */}
      <div className="relative w-[200px] h-[175px] flex items-end justify-center">

        {/* LAYER 1: BACK PLATE (Silver-Grey Apple Rounded Squircle, 200px x 135px) */}
        <div className="absolute bottom-0 w-[200px] h-[135px] rounded-[22px] overflow-hidden bg-gradient-to-b from-[#e2e0dc] via-[#d6d4ce] to-[#c8c6be] shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/[0.06]" />

        {/* LAYER 2: 3 FANNED-OUT PHOTO PRINTS (White-framed polaroids) */}
        <div className="absolute bottom-6 w-full flex items-center justify-center pointer-events-none z-10">
          {/* Left Photo (Tilted -14deg) */}
          <div className="absolute w-[82px] h-[108px] p-1 bg-white rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] transform -rotate-12 -translate-x-7 -translate-y-5 group-hover:-rotate-[16deg] group-hover:-translate-x-9 group-hover:-translate-y-7 transition-transform duration-400 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img1}
              alt="Campaign Still 1"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>

          {/* Center Photo (Standing Highest, Upright) */}
          <div className="absolute w-[88px] h-[116px] p-1 bg-white rounded-[14px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] z-10 transform -translate-y-8 group-hover:-translate-y-10 transition-transform duration-400 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img2}
              alt="Campaign Still 2"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>

          {/* Right Photo (Tilted +14deg) */}
          <div className="absolute w-[82px] h-[108px] p-1 bg-white rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] transform rotate-12 translate-x-7 -translate-y-4 group-hover:rotate-[16deg] group-hover:translate-x-9 group-hover:-translate-y-6 transition-transform duration-400 ease-out overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img3}
              alt="Campaign Still 3"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
        </div>

        {/* LAYER 3: FROSTED GLASS FRONT FLAP (200px x 110px, Aligned to Bottom) */}
        <div className="absolute bottom-0 w-[200px] h-[110px] z-20 transition-transform duration-400 group-hover:-translate-y-1">
          {/* SVG Definitions for this Folder Card */}
          <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <path d={flapPath} />
              </clipPath>
              <linearGradient id={gradId} x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.80" />
                <stop offset="45%" stopColor="#f3f4f6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.45" />
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
            viewBox="0 0 200 110"
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

          {/* Top-Left Subtle Identifier Label inside Tab Area */}
          <div className="absolute top-2.5 left-3.5 z-30 pointer-events-none">
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-black/60 select-none block">
              *CREATIVESTYLE.
            </span>
          </div>

          {/* Bottom-Right Circular Action Button (Matching Reference) */}
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
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
