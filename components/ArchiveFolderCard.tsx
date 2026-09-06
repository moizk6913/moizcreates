'use client';

import React from 'react';

export interface FolderStickerData {
  stamp?: {
    flag?: string;
    countryCode?: string;
    bgColor?: string;
  };
  sticker?: {
    name?: string;
    type:
      | 'torii'
      | 'lemon'
      | 'eiffel'
      | 'tulip'
      | 'camera'
      | 'film'
      | 'car'
      | 'sneaker'
      | 'airplane'
      | 'flame'
      | 'lotus'
      | 'diamond'
      | 'audio';
  };
}

export interface ArchiveFolderProps {
  id: string;
  code: string;
  name: string;
  discipline: string;
  year: string;
  role: string;
  photos: string[];
  photoCount: number;
  stickers?: FolderStickerData;
  colorTag?: string;
  onClick: () => void;
}

// Scalloped perforated postage stamp component (Image 1 & 3 reference)
function PostageStamp({
  flag = '🇯🇵',
  countryCode = 'JPN',
  bgColor = '#ffffff',
}: {
  flag?: string;
  countryCode?: string;
  bgColor?: string;
}) {
  return (
    <div
      className="relative w-11 h-13 sm:w-13 sm:h-15 p-1 flex flex-col items-center justify-between rounded-sm select-none shadow-[0_3px_10px_rgba(0,0,0,0.12)] border border-black/10 transition-transform duration-300 group-hover:scale-105"
      style={{
        backgroundColor: bgColor,
        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
      }}
    >
      {/* Postage Stamp Perforations along edges */}
      <div className="absolute inset-0 pointer-events-none border-[3px] border-dashed border-[#ddd9d0] rounded-sm opacity-60" />

      {/* Flag / Graphic Inset */}
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/90 rounded-[2px] overflow-hidden p-1">
        <span className="text-lg sm:text-xl leading-none filter drop-shadow-sm select-none">
          {flag}
        </span>
        <span className="font-mono text-[7px] sm:text-[8px] font-black text-black/60 tracking-wider uppercase mt-1">
          {countryCode}
        </span>
      </div>

      {/* Faint cancellation stamp curve */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
        <svg viewBox="0 0 40 40" className="w-8 h-8 stroke-black fill-none stroke-[1.2]">
          <path d="M2,20 Q12,12 20,20 T38,20" />
          <path d="M2,26 Q12,18 20,26 T38,26" />
        </svg>
      </div>
    </div>
  );
}

// High-end tactile die-cut sticker component with white vinyl outline & drop shadow (Image 1, 3, 4 reference)
function DieCutSticker({ type = 'lemon' }: { type?: string }) {
  const renderStickerGraphic = () => {
    switch (type) {
      case 'torii':
        return (
          /* Red Japanese Torii Gate */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M6 14 Q32 10 58 14 L56 22 L50 21 L52 56 L42 56 L44 32 L20 32 L22 56 L12 56 L14 21 L8 22 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d="M8 15 Q32 11 56 15 L54 21 L10 21 Z" fill="#222" />
            <path d="M12 25 L52 25 L50 30 L14 30 Z" fill="#ff3823" />
            <rect x="16" y="21" width="6" height="35" fill="#ff3823" rx="1" />
            <rect x="42" y="21" width="6" height="35" fill="#ff3823" rx="1" />
            <rect x="15" y="52" width="8" height="5" fill="#222" rx="1" />
            <rect x="41" y="52" width="8" height="5" fill="#222" rx="1" />
          </svg>
        );

      case 'lemon':
        return (
          /* Juicy Yellow Lemon with Green Leaf (Image 1 reference) */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <ellipse cx="32" cy="36" rx="20" ry="16" fill="#ffffff" stroke="#ffffff" strokeWidth="5" />
            <ellipse cx="32" cy="36" rx="18" ry="14" fill="#ffcc00" />
            <ellipse cx="30" cy="34" rx="14" ry="10" fill="#fed836" />
            <path d="M14 36 Q10 36 12 34 Q14 36 14 36" stroke="#ffcc00" strokeWidth="4" />
            <path d="M50 36 Q54 36 52 38 Q50 36 50 36" stroke="#ffcc00" strokeWidth="4" />
            <path
              d="M36 24 Q48 14 44 26 Q36 28 36 24 Z"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </svg>
        );

      case 'eiffel':
        return (
          /* Eiffel Tower Silhouette (Image 4 reference) */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M32 6 L35 22 L40 40 L46 54 L38 54 Q32 46 26 54 L18 54 L24 40 L29 22 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M32 8 L34 22 L39 40 L44 52 L37 52 Q32 45 27 52 L20 52 L25 40 L30 22 Z" fill="#64748b" />
            <rect x="27" y="24" width="10" height="2" fill="#334155" />
            <rect x="24" y="38" width="16" height="3" fill="#334155" />
          </svg>
        );

      case 'tulip':
        return (
          /* Dutch Tulip Blossom (Image 4 reference) */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M22 20 Q32 10 42 20 Q44 34 32 38 Q20 34 22 20 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
            />
            <path d="M24 22 Q32 14 40 22 Q42 32 32 36 Q22 32 24 22 Z" fill="#f97316" />
            <path d="M32 22 Q32 34 32 36" stroke="#ea580c" strokeWidth="2" />
            <path d="M32 36 L32 54" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
            <path d="M32 46 Q24 44 26 38" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'camera':
        return (
          /* Rangefinder Analog Camera (Image 4 reference) */
          <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <rect x="10" y="20" width="44" height="30" rx="6" fill="#ffffff" stroke="#ffffff" strokeWidth="5" />
            <rect x="12" y="22" width="40" height="26" rx="4" fill="#262626" />
            <rect x="12" y="22" width="40" height="8" rx="2" fill="#94a3b8" />
            <circle cx="32" cy="37" r="9" fill="#171717" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="32" cy="37" r="5" fill="#38bdf8" opacity="0.85" />
            <circle cx="46" cy="26" r="2.5" fill="#ef4444" />
          </svg>
        );

      case 'film':
        return (
          /* 35mm Celluloid Film Frame (Image 4 reference) */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <rect x="12" y="16" width="40" height="32" rx="4" fill="#ffffff" stroke="#ffffff" strokeWidth="5" />
            <rect x="14" y="18" width="36" height="28" rx="3" fill="#b45309" />
            <rect x="20" y="23" width="24" height="18" rx="2" fill="#78350f" />
            <rect x="16" y="20" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="16" y="26" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="16" y="32" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="16" y="38" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="45" y="20" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="45" y="26" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="45" y="32" width="3" height="3" rx="0.5" fill="#ffffff" />
            <rect x="45" y="38" width="3" height="3" rx="0.5" fill="#ffffff" />
          </svg>
        );

      case 'car':
        return (
          /* High-Performance Sports Coupe Silhouette */
          <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M10 40 L16 30 Q28 26 42 28 L54 36 L56 42 L52 44 L48 44 Q46 38 40 38 Q34 38 32 44 L26 44 Q24 38 18 38 Q12 38 10 44 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d="M12 40 L17 31 Q28 27 41 29 L52 36 L54 42 L12 42 Z"
              fill="#e11d48"
            />
            <circle cx="19" cy="42" r="5" fill="#18181b" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="43" cy="42" r="5" fill="#18181b" stroke="#e2e8f0" strokeWidth="2" />
          </svg>
        );

      case 'airplane':
        return (
          /* Modern Commercial Jetliner */
          <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M32 10 L35 26 L52 36 L52 40 L35 34 L34 48 L40 52 L40 55 L32 53 L24 55 L24 52 L30 48 L29 34 L12 40 L12 36 L29 26 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M32 12 L34 26 L50 36 L50 39 L34 34 L33 48 L39 52 L39 54 L32 52 L25 54 L25 52 L31 48 L30 34 L14 39 L14 36 L30 26 Z"
              fill="#0284c7"
            />
          </svg>
        );

      case 'flame':
        return (
          /* Red Hot Kinetic Flame */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M32 10 Q40 22 46 32 Q50 42 42 50 Q34 56 24 50 Q16 42 22 32 Q26 26 28 20 Q30 14 32 10 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
            />
            <path
              d="M32 13 Q39 24 44 33 Q48 42 41 49 Q34 54 25 49 Q18 42 23 33 Q27 28 29 22 Q30 17 32 13 Z"
              fill="#ea580c"
            />
            <path
              d="M32 28 Q36 34 38 40 Q40 46 35 50 Q30 53 26 49 Q22 44 25 38 Z"
              fill="#facc15"
            />
          </svg>
        );

      case 'sneaker':
        return (
          /* Streetwear Sneaker */
          <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M12 40 L16 26 L26 26 L30 32 L46 34 L54 40 L52 46 L14 46 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d="M14 39 L17 28 L25 28 L29 34 L45 36 L52 41 L14 41 Z" fill="#1e293b" />
            <path d="M12 42 L53 42 L51 45 L14 45 Z" fill="#ef4444" />
          </svg>
        );

      case 'diamond':
        return (
          /* Brilliant Cut Diamond */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <path
              d="M20 18 L44 18 L54 30 L32 52 L10 30 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path d="M22 20 L42 20 L50 30 L32 48 L14 30 Z" fill="#06b6d4" />
            <path d="M22 20 L32 48 L42 20" stroke="#cffafe" strokeWidth="2" fill="none" />
            <path d="M14 30 L50 30" stroke="#cffafe" strokeWidth="2" />
          </svg>
        );

      default:
        return (
          /* Default Lemon Sticker */
          <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]">
            <ellipse cx="32" cy="36" rx="20" ry="16" fill="#ffffff" stroke="#ffffff" strokeWidth="5" />
            <ellipse cx="32" cy="36" rx="18" ry="14" fill="#ffcc00" />
            <ellipse cx="30" cy="34" rx="14" ry="10" fill="#fed836" />
            <path
              d="M36 24 Q48 14 44 26 Q36 28 36 24 Z"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </svg>
        );
    }
  };

  return (
    <div className="select-none transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
      {renderStickerGraphic()}
    </div>
  );
}

export default function ArchiveFolderCard({
  name,
  photos = [],
  photoCount = 42,
  stickers,
  onClick,
}: ArchiveFolderProps) {
  const pointerStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);

  // Ensure we have at least 4 photos for the fanned stack
  const displayPhotos = [
    photos[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop',
    photos[1] || photos[0] || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop',
    photos[2] || photos[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    photos[3] || photos[1] || photos[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
  ];

  const handlePointerDown = (e: React.PointerEvent) => {
    // Record starting coordinate & time
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);
    const elapsed = performance.now() - pointerStartRef.current.time;
    pointerStartRef.current = null;

    // Genuine click: mouse moved less than 14px and held under 500ms
    if (deltaX < 14 && deltaY < 14 && elapsed < 500) {
      e.stopPropagation();
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      data-folder-card="true"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="group relative flex flex-col items-center cursor-pointer select-none touch-manipulation pointer-events-auto"
    >
      {/* 3D FOLDER STAGE: Headroom for upward peeking polaroid photo cards */}
      <div className="relative w-[215px] sm:w-[245px] md:w-[265px] h-[200px] sm:h-[225px] md:h-[240px] flex items-end justify-center">
        
        {/* LAYER 1: Back Folder Plate (Solid ivory folder back with top-left folder tab, 10px roundness) */}
        <div className="absolute inset-x-0 bottom-0 h-[135px] sm:h-[150px] md:h-[160px] bg-gradient-to-b from-[#ece8df] to-[#ded9ce] rounded-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-black/[0.04]">
          {/* Top Folder Tab (Apple macOS style 10px roundness) */}
          <div className="absolute -top-2.5 left-3 w-20 sm:w-24 h-3.5 bg-[#ded8cc] rounded-t-[8px] border-t border-l border-r border-black/[0.04]" />
        </div>

        {/* LAYER 2: FANNED POLAROID PHOTO STACK (Tucked inside folder, peeking HIGH above flap with crisp borders) */}
        <div className="absolute inset-x-0 bottom-6 flex items-end justify-center pointer-events-none">
          
          {/* Card 1: Far Left (-16deg resting, peeking up -> -24deg hover bloom, peeking up even higher) */}
          <div className="absolute w-[86px] sm:w-[98px] md:w-[108px] h-[106px] sm:h-[120px] md:h-[132px] p-1.5 sm:p-2 bg-white rounded-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.16)] ring-1 ring-black/5 transform -rotate-[16deg] -translate-x-[42px] -translate-y-[68px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[24deg] group-hover:-translate-x-[58px] group-hover:-translate-y-[96px] group-hover:scale-105 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhotos[0]}
              alt="Archive photo 1"
              className="w-full h-full object-cover rounded-[7px] block pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </div>

          {/* Card 2: Center Left (-5deg resting, peeking up -> -8deg hover bloom, peeking up even higher) */}
          <div className="absolute w-[92px] sm:w-[104px] md:w-[114px] h-[112px] sm:h-[126px] md:h-[138px] p-1.5 sm:p-2 bg-white rounded-[10px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transform -rotate-[5deg] -translate-x-[15px] -translate-y-[84px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[8deg] group-hover:-translate-x-[20px] group-hover:-translate-y-[115px] group-hover:scale-110 z-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhotos[1]}
              alt="Archive photo 2"
              className="w-full h-full object-cover rounded-[7px] block pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </div>

          {/* Card 3: Center Right (+6deg resting, peeking up -> +8deg hover bloom, peeking up even higher) */}
          <div className="absolute w-[92px] sm:w-[104px] md:w-[114px] h-[112px] sm:h-[126px] md:h-[138px] p-1.5 sm:p-2 bg-white rounded-[10px] shadow-[0_10px_24px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transform rotate-[6deg] translate-x-[15px] -translate-y-[80px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[8deg] group-hover:translate-x-[20px] group-hover:-translate-y-[110px] group-hover:scale-110 z-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhotos[2]}
              alt="Archive photo 3"
              className="w-full h-full object-cover rounded-[7px] block pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </div>

          {/* Card 4: Far Right (+18deg resting, peeking up -> +24deg hover bloom, peeking up even higher) */}
          <div className="absolute w-[86px] sm:w-[98px] md:w-[108px] h-[106px] sm:h-[120px] md:h-[132px] p-1.5 sm:p-2 bg-white rounded-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.16)] ring-1 ring-black/5 transform rotate-[18deg] translate-x-[42px] -translate-y-[66px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[24deg] group-hover:translate-x-[58px] group-hover:-translate-y-[94px] group-hover:scale-105 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhotos[3]}
              alt="Archive photo 4"
              className="w-full h-full object-cover rounded-[7px] block pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </div>

        </div>

        {/* LAYER 3: FRONT OPAQUE/TRANSLUCENT IVORY FLAP (Crisp, ZERO backdrop-blur smudge, 10px Apple radius) */}
        <div className="relative w-full h-[135px] sm:h-[150px] md:h-[160px] rounded-[10px] bg-gradient-to-b from-[#fbf9f4] via-[#f7f4ed] to-[#eee8dd] border border-black/[0.08] shadow-[0_12px_28px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 z-30 transition-shadow duration-300 group-hover:shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
          
          {/* Subtle Clean Highlight Gradient across the top lip */}
          <div className="absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

          {/* STICKERS & POSTAGE STAMPS ROW (Images 1, 3, 4 reference) */}
          <div className="relative z-10 flex justify-between items-start pt-0.5">
            
            {/* Stamp 1: Perforated Postage Stamp (Left) */}
            <div className="transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-105">
              <PostageStamp
                flag={stickers?.stamp?.flag || '🇮🇹'}
                countryCode={stickers?.stamp?.countryCode || 'IT'}
                bgColor={stickers?.stamp?.bgColor || '#ffffff'}
              />
            </div>

            {/* Sticker 2: Die-Cut Glossy Sticker with White Vinyl Border (Right) */}
            <div className="transform rotate-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 pt-1 pr-1">
              <DieCutSticker type={stickers?.sticker?.type || 'lemon'} />
            </div>

          </div>

          {/* Debossed Bottom Grip Ridges (Iconic tactile folder detail from reference images) */}
          <div className="relative z-10 w-full flex flex-col gap-1 items-center pb-0.5 opacity-40 group-hover:opacity-60 transition-opacity">
            <div className="w-10/12 h-[2px] rounded-full bg-black/15 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]" />
            <div className="w-10/12 h-[2px] rounded-full bg-black/15 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]" />
          </div>

        </div>

      </div>

      {/* TYPOGRAPHY UNDERNEATH FOLDER (10px Apple radius count pill) */}
      <div className="mt-3 flex flex-col items-center justify-center text-center gap-1 max-w-[240px]">
        <h3 className="font-display font-black text-sm sm:text-base text-primary tracking-tight leading-snug group-hover:text-accent-red transition-colors line-clamp-1">
          {name}
        </h3>
        
        {/* Soft Count Pill Badge ("68 photos", "88 photos", etc. - 10px radius) */}
        <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wide text-secondary/80 bg-black/[0.05] group-hover:bg-black/[0.08] px-3 py-0.5 rounded-[10px] transition-colors">
          {photoCount} photos
        </span>
      </div>

    </div>
  );
}
