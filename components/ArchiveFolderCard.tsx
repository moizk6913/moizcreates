'use client';

import React from 'react';

export type FolderVariantType =
  | 'amber-moov'
  | 'cobalt-modern'
  | 'cinema-slate'
  | 'neon-violet'
  | 'terracotta-cut'
  | 'forest-emerald'
  | 'frosted-photostyle';

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
  isComingSoon?: boolean;
  variant?: FolderVariantType;
  onClick: () => void;
}

// Compact Perforated Postage Stamp (Reference image tactile touch)
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
      className="relative w-7 h-9 sm:w-8 sm:h-10 p-0.5 flex flex-col items-center justify-between rounded-sm select-none shadow-[0_2px_6px_rgba(0,0,0,0.12)] border border-black/10 transition-transform duration-300 group-hover:scale-105"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {/* Postage Stamp Perforations */}
      <div className="absolute inset-0 pointer-events-none border-[2px] border-dashed border-[#ddd9d0] rounded-sm opacity-60" />

      {/* Flag / Graphic Inset */}
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/90 rounded-[2px] overflow-hidden p-0.5">
        <span className="text-xs sm:text-sm leading-none filter drop-shadow-sm select-none">
          {flag}
        </span>
        <span className="font-mono text-[5.5px] sm:text-[6.5px] font-black text-black/60 tracking-wider uppercase mt-0.5">
          {countryCode}
        </span>
      </div>

      {/* Faint cancellation stamp curve */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
        <svg viewBox="0 0 40 40" className="w-5 h-5 stroke-black fill-none stroke-[1.2]">
          <path d="M2,20 Q12,12 20,20 T38,20" />
          <path d="M2,26 Q12,18 20,26 T38,26" />
        </svg>
      </div>
    </div>
  );
}

// Compact Die-Cut Vinyl Sticker Component
function DieCutSticker({ type = 'lemon' }: { type?: string }) {
  const renderStickerGraphic = () => {
    switch (type) {
      case 'torii':
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <path
              d="M6 14 Q32 10 58 14 L56 22 L50 21 L52 56 L42 56 L44 32 L20 32 L22 56 L12 56 L14 21 L8 22 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M8 15 Q32 11 56 15 L54 21 L10 21 Z" fill="#222" />
            <path d="M12 25 L52 25 L50 30 L14 30 Z" fill="#ff3823" />
            <rect x="16" y="21" width="6" height="35" fill="#ff3823" rx="1" />
            <rect x="42" y="21" width="6" height="35" fill="#ff3823" rx="1" />
          </svg>
        );

      case 'lemon':
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <ellipse cx="32" cy="36" rx="20" ry="16" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
            <ellipse cx="32" cy="36" rx="18" ry="14" fill="#ffcc00" />
            <ellipse cx="30" cy="34" rx="14" ry="10" fill="#fed836" />
            <path d="M36 24 Q48 14 44 26 Q36 28 36 24 Z" fill="#22c55e" stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        );

      case 'camera':
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <rect x="10" y="20" width="44" height="30" rx="5" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
            <rect x="12" y="22" width="40" height="26" rx="3" fill="#262626" />
            <rect x="12" y="22" width="40" height="7" rx="2" fill="#94a3b8" />
            <circle cx="32" cy="37" r="8" fill="#171717" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="32" cy="37" r="4.5" fill="#38bdf8" opacity="0.85" />
            <circle cx="45" cy="26" r="2" fill="#ef4444" />
          </svg>
        );

      case 'film':
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <rect x="12" y="16" width="40" height="32" rx="4" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
            <rect x="14" y="18" width="36" height="28" rx="3" fill="#b45309" />
            <rect x="20" y="23" width="24" height="18" rx="2" fill="#78350f" />
            <rect x="16" y="20" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="16" y="26" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="16" y="32" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="16" y="38" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="45" y="20" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="45" y="26" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="45" y="32" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
            <rect x="45" y="38" width="2.5" height="2.5" rx="0.5" fill="#ffffff" />
          </svg>
        );

      case 'airplane':
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <path
              d="M32 10 L35 26 L52 36 L52 40 L35 34 L34 48 L40 52 L40 55 L32 53 L24 55 L24 52 L30 48 L29 34 L12 40 L12 36 L29 26 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="3.5"
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
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <path
              d="M32 10 Q40 22 46 32 Q50 42 42 50 Q34 56 24 50 Q16 42 22 32 Q26 26 28 20 Q30 14 32 10 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <path
              d="M32 13 Q39 24 44 33 Q48 42 41 49 Q34 54 25 49 Q18 42 23 33 Q27 28 29 22 Q30 17 32 13 Z"
              fill="#ea580c"
            />
            <path d="M32 28 Q36 34 38 40 Q40 46 35 50 Q30 53 26 49 Q22 44 25 38 Z" fill="#facc15" />
          </svg>
        );

      case 'diamond':
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <path
              d="M20 18 L44 18 L54 30 L32 52 L10 30 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M22 20 L42 20 L50 30 L32 48 L14 30 Z" fill="#06b6d4" />
            <path d="M22 20 L32 48 L42 20" stroke="#cffafe" strokeWidth="1.5" fill="none" />
            <path d="M14 30 L50 30" stroke="#cffafe" strokeWidth="1.5" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 64 64" className="w-6 h-6 sm:w-7 sm:h-7 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]">
            <ellipse cx="32" cy="36" rx="20" ry="16" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
            <ellipse cx="32" cy="36" rx="18" ry="14" fill="#ffcc00" />
            <ellipse cx="30" cy="34" rx="14" ry="10" fill="#fed836" />
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

// Visual theme configurations for the 7 distinct folder archetypes
interface FolderStyleConfig {
  backPlate: string;
  tabStyle: {
    bg: string;
    position: string;
    width: string;
    shape: string;
  };
  frontFlap: string;
  border: string;
  shadow: string;
  titleColor: string;
  subtitleColor: string;
  badgeType: 'arrow-moov' | 'arrow-photostyle' | 'pill-code' | 'gear-tag';
}

const FOLDER_VARIANTS: Record<FolderVariantType, FolderStyleConfig> = {
  // 1. Warm Golden Amber with Frosted Glass Flap (Reference 1: "PROJECT MOOV")
  'amber-moov': {
    backPlate: 'bg-gradient-to-b from-[#fbbf24] to-[#f59e0b]',
    tabStyle: {
      bg: 'bg-[#f59e0b]',
      position: 'left-2.5',
      width: 'w-14 sm:w-16',
      shape: 'rounded-t-[8px]',
    },
    frontFlap: 'bg-gradient-to-b from-[#fef3c7]/95 via-[#fde68a]/90 to-[#f59e0b]/90 backdrop-blur-md',
    border: 'border-[#f59e0b]/40',
    shadow: 'shadow-[0_10px_24px_rgba(245,158,11,0.22)]',
    titleColor: 'text-[#78350f]',
    subtitleColor: 'text-[#92400e]',
    badgeType: 'arrow-moov',
  },

  // 2. Royal Cobalt Blue Modernist Folder (Reference 3: Folder 2/6)
  'cobalt-modern': {
    backPlate: 'bg-gradient-to-b from-[#2563eb] to-[#1d4ed8]',
    tabStyle: {
      bg: 'bg-[#1d4ed8]',
      position: 'left-2.5',
      width: 'w-16 sm:w-18',
      shape: 'rounded-tl-[8px] rounded-tr-[2px]',
    },
    frontFlap: 'bg-gradient-to-b from-[#3b82f6]/95 via-[#2563eb]/95 to-[#1d4ed8]/95 backdrop-blur-md',
    border: 'border-blue-300/40',
    shadow: 'shadow-[0_10px_24px_rgba(29,78,216,0.25)]',
    titleColor: 'text-white',
    subtitleColor: 'text-blue-100',
    badgeType: 'pill-code',
  },

  // 3. Dark Titanium Slate 35mm Film Noir (Reference 3: Folder 7)
  'cinema-slate': {
    backPlate: 'bg-gradient-to-b from-[#27272a] to-[#18181b]',
    tabStyle: {
      bg: 'bg-[#18181b]',
      position: 'left-3',
      width: 'w-14 sm:w-16',
      shape: 'rounded-t-[6px] border-t border-l border-r border-white/10',
    },
    frontFlap: 'bg-gradient-to-b from-[#27272a]/95 via-[#1e1e22]/95 to-[#141416]/98 backdrop-blur-md',
    border: 'border-white/10',
    shadow: 'shadow-[0_12px_28px_rgba(0,0,0,0.4)]',
    titleColor: 'text-neutral-100',
    subtitleColor: 'text-neutral-400',
    badgeType: 'arrow-photostyle',
  },

  // 4. Vibrant Electric Violet / Kinetic (Reference 3: Folder 11)
  'neon-violet': {
    backPlate: 'bg-gradient-to-b from-[#8b5cf6] to-[#7c3aed]',
    tabStyle: {
      bg: 'bg-[#7c3aed]',
      position: 'left-1/2 -translate-x-1/2',
      width: 'w-14 sm:w-16',
      shape: 'rounded-t-[10px]',
    },
    frontFlap: 'bg-gradient-to-b from-[#a78bfa]/95 via-[#8b5cf6]/95 to-[#7c3aed]/95 backdrop-blur-md',
    border: 'border-purple-300/40',
    shadow: 'shadow-[0_10px_24px_rgba(124,58,237,0.25)]',
    titleColor: 'text-white',
    subtitleColor: 'text-purple-100',
    badgeType: 'pill-code',
  },

  // 5. Warm Terracotta Burnt Sienna with Chamfered Tab (Reference 3: Folder 12)
  'terracotta-cut': {
    backPlate: 'bg-gradient-to-b from-[#f97316] to-[#c2410c]',
    tabStyle: {
      bg: 'bg-[#c2410c]',
      position: 'right-2.5',
      width: 'w-14 sm:w-16',
      shape: 'rounded-tr-[10px] rounded-tl-[2px]',
    },
    frontFlap: 'bg-gradient-to-b from-[#fb923c]/95 via-[#ea580c]/95 to-[#c2410c]/95 backdrop-blur-md',
    border: 'border-orange-300/40',
    shadow: 'shadow-[0_10px_24px_rgba(234,88,12,0.25)]',
    titleColor: 'text-white',
    subtitleColor: 'text-orange-100',
    badgeType: 'gear-tag',
  },

  // 6. Deep Forest Emerald / Stepped Notch (Reference 3: Folder 5)
  'forest-emerald': {
    backPlate: 'bg-gradient-to-b from-[#059669] to-[#064e3b]',
    tabStyle: {
      bg: 'bg-[#064e3b]',
      position: 'left-3',
      width: 'w-16 sm:w-18',
      shape: 'rounded-t-[8px]',
    },
    frontFlap: 'bg-gradient-to-b from-[#10b981]/95 via-[#059669]/95 to-[#047857]/95 backdrop-blur-md',
    border: 'border-emerald-300/40',
    shadow: 'shadow-[0_10px_24px_rgba(5,150,105,0.25)]',
    titleColor: 'text-white',
    subtitleColor: 'text-emerald-100',
    badgeType: 'pill-code',
  },

  // 7. Frosted Crystal Ice Sleeve (Reference 2: "PHOTOSTYLE 2026")
  'frosted-photostyle': {
    backPlate: 'bg-gradient-to-b from-[#f1f5f9] to-[#cbd5e1]',
    tabStyle: {
      bg: 'bg-[#cbd5e1]',
      position: 'left-2.5',
      width: 'w-14 sm:w-16',
      shape: 'rounded-t-[8px] border-t border-l border-r border-white/60',
    },
    frontFlap: 'bg-white/75 backdrop-blur-lg',
    border: 'border-white/80',
    shadow: 'shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
    titleColor: 'text-neutral-900',
    subtitleColor: 'text-neutral-500',
    badgeType: 'arrow-photostyle',
  },
};


export const DEFAULT_PREVIEW_PHOTOS: Record<FolderVariantType, string[]> = {
  'amber-moov': [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
  ],
  'cobalt-modern': [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
  ],
  'cinema-slate': [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
  ],
  'neon-violet': [
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&auto=format&fit=crop&q=80',
  ],
  'terracotta-cut': [
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
  ],
  'forest-emerald': [
    'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&auto=format&fit=crop&q=80',
  ],
  'frosted-photostyle': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
  ],
};

export default function ArchiveFolderCard({
  code,
  name,
  photos = [],
  photoCount = 0,
  stickers,
  isComingSoon,
  variant = 'amber-moov',
  onClick,
}: ArchiveFolderProps) {
  const isSoon = isComingSoon || photoCount === 0;
  const config = FOLDER_VARIANTS[variant] || FOLDER_VARIANTS['amber-moov'];

  const fallbackPhotos = DEFAULT_PREVIEW_PHOTOS[variant] || DEFAULT_PREVIEW_PHOTOS['amber-moov'];
  const validPhotos = (photos || []).filter((p) => typeof p === 'string' && p.trim().length > 0);
  const displayPhotos = [
    validPhotos[0] || fallbackPhotos[0],
    validPhotos[1] || fallbackPhotos[1] || fallbackPhotos[0],
    validPhotos[2] || fallbackPhotos[2] || fallbackPhotos[0],
    validPhotos[3] || fallbackPhotos[3] || fallbackPhotos[1],
  ];

  return (
    <div
      data-folder-card="true"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative flex flex-col items-center cursor-pointer select-none touch-manipulation pointer-events-auto"
    >
      {/* 3D FOLDER STAGE: Compact, proportional headroom for fanning polaroid photo cards */}
      <div className="relative w-[155px] sm:w-[172px] md:w-[188px] h-[142px] sm:h-[156px] md:h-[168px] flex items-end justify-center">
        
        {/* LAYER 1: BACK FOLDER PLATE & TAB */}
        <div
          className={`absolute inset-x-0 bottom-0 h-[96px] sm:h-[106px] md:h-[114px] ${config.backPlate} rounded-[9px] shadow-[0_4px_14px_rgba(0,0,0,0.08)]`}
        >
          {/* Top Folder Tab */}
          <div
            className={`absolute -top-2.5 ${config.tabStyle.position} ${config.tabStyle.width} h-3 ${config.tabStyle.bg} ${config.tabStyle.shape}`}
          />
        </div>

        {/* LAYER 2: FANNED POLAROID PHOTO STACK (Tucked inside folder, peeking above flap) */}
        <div className="absolute inset-x-0 bottom-4 flex items-end justify-center pointer-events-none">
          
          {/* Card 1: Far Left (-15deg resting -> -24deg hover bloom) */}
          <div className="absolute w-[62px] sm:w-[68px] md:w-[74px] h-[76px] sm:h-[84px] md:h-[92px] p-1 sm:p-1.2 bg-white rounded-[7px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] ring-1 ring-black/5 transform -rotate-[15deg] -translate-x-[26px] -translate-y-[46px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[24deg] group-hover:-translate-x-[38px] group-hover:-translate-y-[70px] group-hover:scale-105 z-10">
            {isSoon || !displayPhotos[0] ? (
              <div className="w-full h-full bg-[#161618] rounded-[5px] flex flex-col items-center justify-center text-center p-1 text-white select-none">
                <span className="font-mono text-[6px] tracking-widest text-neutral-400 uppercase">ARCHIVE</span>
                <span className="font-display font-black text-[9px] text-accent-red tracking-wider uppercase">01</span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayPhotos[0]}
                alt={`${name} 1`}
                className="w-full h-full object-cover rounded-[5px] block pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            )}
          </div>

          {/* Card 2: Center Left (-5deg resting -> -8deg hover bloom) */}
          <div className="absolute w-[66px] sm:w-[72px] md:w-[78px] h-[80px] sm:h-[88px] md:h-[96px] p-1 sm:p-1.2 bg-white rounded-[7px] shadow-[0_8px_18px_rgba(0,0,0,0.16)] ring-1 ring-black/5 transform -rotate-[5deg] -translate-x-[9px] -translate-y-[56px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-[8deg] group-hover:-translate-x-[12px] group-hover:-translate-y-[84px] group-hover:scale-110 z-20">
            {isSoon || !displayPhotos[1] ? (
              <div className="w-full h-full bg-[#1b1b1f] rounded-[5px] flex flex-col items-center justify-center text-center p-1 text-white select-none">
                <span className="font-mono text-[6px] tracking-widest text-neutral-400 uppercase">STUDIO</span>
                <span className="font-display font-black text-[9px] text-white tracking-wider uppercase">2026</span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayPhotos[1]}
                alt={`${name} 2`}
                className="w-full h-full object-cover rounded-[5px] block pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            )}
          </div>

          {/* Card 3: Center Right (+6deg resting -> +8deg hover bloom) */}
          <div className="absolute w-[66px] sm:w-[72px] md:w-[78px] h-[80px] sm:h-[88px] md:h-[96px] p-1 sm:p-1.2 bg-white rounded-[7px] shadow-[0_8px_18px_rgba(0,0,0,0.16)] ring-1 ring-black/5 transform rotate-[6deg] translate-x-[9px] -translate-y-[54px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[8deg] group-hover:translate-x-[12px] group-hover:-translate-y-[82px] group-hover:scale-110 z-20">
            {isSoon || !displayPhotos[2] ? (
              <div className="w-full h-full bg-[#1b1b1f] rounded-[5px] flex flex-col items-center justify-center text-center p-1 text-white select-none">
                <span className="font-mono text-[6px] tracking-widest text-neutral-400 uppercase">DIRECT</span>
                <span className="font-display font-black text-[9px] text-white tracking-wider uppercase">CUT</span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayPhotos[2]}
                alt={`${name} 3`}
                className="w-full h-full object-cover rounded-[5px] block pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            )}
          </div>

          {/* Card 4: Far Right (+16deg resting -> +24deg hover bloom) */}
          <div className="absolute w-[62px] sm:w-[68px] md:w-[74px] h-[76px] sm:h-[84px] md:h-[92px] p-1 sm:p-1.2 bg-white rounded-[7px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] ring-1 ring-black/5 transform rotate-[16deg] translate-x-[26px] -translate-y-[44px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[24deg] group-hover:translate-x-[38px] group-hover:-translate-y-[68px] group-hover:scale-105 z-10">
            {isSoon || !displayPhotos[3] ? (
              <div className="w-full h-full bg-[#161618] rounded-[5px] flex flex-col items-center justify-center text-center p-1 text-white select-none">
                <span className="font-mono text-[6px] tracking-widest text-neutral-400 uppercase">VISION</span>
                <span className="font-display font-black text-[9px] text-accent-red tracking-wider uppercase">PROD</span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayPhotos[3]}
                alt={`${name} 4`}
                className="w-full h-full object-cover rounded-[5px] block pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            )}
          </div>

        </div>

        {/* LAYER 3: FRONT FLAP (Distinctive Material, Cut & Frosted Envelope Styling) */}
        <div
          className={`relative w-full h-[96px] sm:h-[106px] md:h-[114px] rounded-[9px] ${config.frontFlap} border ${config.border} ${config.shadow} overflow-hidden flex flex-col justify-between p-2.5 sm:p-3 z-30 transition-all duration-300 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.16)]`}
        >
          {/* Subtle Top Gloss Highlight */}
          <div className="absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />

          {/* TOP ROW: STAMP & STICKER ACCENTS */}
          <div className="relative z-10 flex justify-between items-start">
            {stickers?.stamp ? (
              <div className="transform -rotate-4 transition-transform duration-300 group-hover:-rotate-8 group-hover:scale-105">
                <PostageStamp
                  flag={stickers.stamp.flag || '🇯🇵'}
                  countryCode={stickers.stamp.countryCode || 'JPN'}
                  bgColor={stickers.stamp.bgColor || '#ffffff'}
                />
              </div>
            ) : (
              <span className={`font-mono text-[8px] sm:text-[9px] font-bold tracking-widest uppercase opacity-75 ${config.subtitleColor}`}>
                {code.split('/')[0]?.trim() || 'PROJ'}
              </span>
            )}

            {stickers?.sticker ? (
              <div className="transform rotate-4 transition-transform duration-300 group-hover:rotate-8 group-hover:scale-105">
                <DieCutSticker type={stickers.sticker.type || 'lemon'} />
              </div>
            ) : (
              <span className={`font-mono text-[7px] sm:text-[8px] tracking-wider uppercase opacity-60 ${config.subtitleColor}`}>
                *SERIES.26
              </span>
            )}
          </div>

          {/* BOTTOM ROW: TYPOGRAPHY & ARROW BADGE */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="flex flex-col">
              <span className={`font-mono text-[7px] sm:text-[8px] tracking-wider uppercase font-semibold opacity-75 ${config.subtitleColor}`}>
                {code}
              </span>
              <span className={`font-display font-black text-xs sm:text-sm tracking-tight leading-tight line-clamp-1 ${config.titleColor}`}>
                {name}
              </span>
            </div>

            {/* BADGES */}
            {config.badgeType === 'arrow-photostyle' && (
              /* Reference 2: Circular dark button with white upward-right arrow */
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            )}

            {config.badgeType === 'arrow-moov' && (
              /* Reference 1: Clean right arrow */
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 text-[#b45309] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            )}

            {config.badgeType === 'pill-code' && (
              /* Pill style count or year indicator */
              <span className="font-mono text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-sm border border-white/20">
                {photoCount > 0 ? `${photoCount}P` : '2026'}
              </span>
            )}

            {config.badgeType === 'gear-tag' && (
              /* Gear/setting icon like Reference 3 Folder 3 */
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white/80 transition-transform duration-300 group-hover:rotate-45">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* TYPOGRAPHY UNDERNEATH FOLDER (Reference 2 style: Clean bold title & minimal pill) */}
      <div className="mt-2.5 flex flex-col items-center justify-center text-center gap-0.5 max-w-[170px]">
        <h3 className="font-display font-black text-xs sm:text-sm text-neutral-900 tracking-tight leading-snug group-hover:text-accent-red transition-colors line-clamp-1">
          {name}
        </h3>
        
        {isSoon ? (
          <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-wider text-accent-red bg-accent-red/10 border border-accent-red/20 px-2 py-0.5 rounded-full uppercase">
            In Production
          </span>
        ) : (
          <span className="font-mono text-[9px] sm:text-[10px] font-medium tracking-wide text-neutral-500 bg-black/[0.04] group-hover:bg-black/[0.08] px-2.5 py-0.5 rounded-full transition-colors">
            {photoCount} items
          </span>
        )}
      </div>

    </div>
  );
}
