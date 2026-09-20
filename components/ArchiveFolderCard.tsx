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

interface MicroGreenTheme {
  backPlateBase: string;
  flapGradient: string;
  code: string;
}

const FOLDER_THEMES: Record<string, MicroGreenTheme> = {
  // 1. Art Direction: Deep Botanical Sage
  'art-direction': {
    backPlateBase: 'bg-[#435345]',
    flapGradient: 'from-[#6b7f6c]/85 via-[#4a5c4c]/90 to-[#324034]/95',
    code: '01',
  },
  'amber-moov': {
    backPlateBase: 'bg-[#435345]',
    flapGradient: 'from-[#6b7f6c]/85 via-[#4a5c4c]/90 to-[#324034]/95',
    code: '01',
  },

  // 2. Brand Identity: Understated Forest Emerald
  'brand-identity': {
    backPlateBase: 'bg-[#2b4236]',
    flapGradient: 'from-[#406854]/85 via-[#2b4a3a]/90 to-[#1c3327]/95',
    code: '02',
  },
  'cobalt-modern': {
    backPlateBase: 'bg-[#2b4236]',
    flapGradient: 'from-[#406854]/85 via-[#2b4a3a]/90 to-[#1c3327]/95',
    code: '02',
  },

  // 3. Cinematography: Filmic Olive Moss
  'cinematography': {
    backPlateBase: 'bg-[#454c37]',
    flapGradient: 'from-[#687352]/85 via-[#4a5439]/90 to-[#313824]/95',
    code: '03',
  },
  'cinema-slate': {
    backPlateBase: 'bg-[#454c37]',
    flapGradient: 'from-[#687352]/85 via-[#4a5439]/90 to-[#313824]/95',
    code: '03',
  },

  // 4. Motion Graphics: Architectural Neo-Jade
  'motion-graphics': {
    backPlateBase: 'bg-[#234743]',
    flapGradient: 'from-[#386c65]/85 via-[#234c46]/90 to-[#14302c]/95',
    code: '04',
  },
  'neon-violet': {
    backPlateBase: 'bg-[#234743]',
    flapGradient: 'from-[#386c65]/85 via-[#234c46]/90 to-[#14302c]/95',
    code: '04',
  },

  // 5. Video Editing: Warm Cypress Khaki
  'video-editing': {
    backPlateBase: 'bg-[#434b35]',
    flapGradient: 'from-[#667250]/85 via-[#475235]/90 to-[#2e3621]/95',
    code: '05',
  },
  'terracotta-cut': {
    backPlateBase: 'bg-[#434b35]',
    flapGradient: 'from-[#667250]/85 via-[#475235]/90 to-[#2e3621]/95',
    code: '05',
  },

  // 6. Colour Grading: Deep Shadow Opal
  'color-grading': {
    backPlateBase: 'bg-[#223933]',
    flapGradient: 'from-[#35574e]/85 via-[#233d36]/90 to-[#142621]/95',
    code: '06',
  },
  'forest-emerald': {
    backPlateBase: 'bg-[#223933]',
    flapGradient: 'from-[#35574e]/85 via-[#233d36]/90 to-[#142621]/95',
    code: '06',
  },

  // 7. Photography: Clean Studio Eucalyptus
  'photography': {
    backPlateBase: 'bg-[#334b46]',
    flapGradient: 'from-[#4e7068]/85 via-[#34514a]/90 to-[#1e332e]/95',
    code: '07',
  },
  'frosted-photostyle': {
    backPlateBase: 'bg-[#334b46]',
    flapGradient: 'from-[#4e7068]/85 via-[#34514a]/90 to-[#1e332e]/95',
    code: '07',
  },
};

function getTheme(variant?: string, name?: string, id?: string): MicroGreenTheme {
  const key = (variant || '').toLowerCase();
  if (FOLDER_THEMES[key]) return FOLDER_THEMES[key];

  const text = `${id || ''} ${name || ''}`.toLowerCase();
  if (text.includes('art')) return FOLDER_THEMES['art-direction'];
  if (text.includes('brand')) return FOLDER_THEMES['brand-identity'];
  if (text.includes('cinema')) return FOLDER_THEMES['cinematography'];
  if (text.includes('motion')) return FOLDER_THEMES['motion-graphics'];
  if (text.includes('photo')) return FOLDER_THEMES['photography'];
  if (text.includes('color') || text.includes('colour')) return FOLDER_THEMES['color-grading'];
  if (text.includes('video') || text.includes('edit')) return FOLDER_THEMES['video-editing'];

  return FOLDER_THEMES['art-direction'];
}

export default function ArchiveFolderCard({
  id,
  code,
  name,
  photoCount = 0,
  variant = 'art-direction',
  onClick,
}: ArchiveFolderProps) {
  const theme = getTheme(variant, name, id);
  const projectCode = code && code.includes('/') ? code.split('/')[0]?.trim() : theme.code;

  return (
    <div
      data-folder-card="true"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative flex flex-col items-center cursor-pointer select-none touch-manipulation pointer-events-auto"
    >
      {/* 70% SMALLER MICRO-FOLDER: Dainty, compact, sleek 136px x 98px proportions */}
      <div className="relative w-[136px] h-[98px] flex items-end justify-center">
        
        {/* LAYER 1: BACK PLATE (Organic S-curve tab silhouette) */}
        <div
          style={{
            clipPath: 'url(#folderTabClip)',
            WebkitClipPath: 'url(#folderTabClip)',
          }}
          className={`absolute inset-0 ${theme.backPlateBase} shadow-xs`}
        />

        {/* LAYER 2: FRONT FLAP (Zero pictures inside, clean frosted glassmorphism & typography) */}
        <div
          style={{
            clipPath: 'url(#folderTabClip)',
            WebkitClipPath: 'url(#folderTabClip)',
          }}
          className={`absolute inset-0 backdrop-blur-md bg-gradient-to-br ${theme.flapGradient} shadow-[0_6px_16px_-4px_rgba(0,0,0,0.08),0_2px_6px_-2px_rgba(0,0,0,0.04)] group-hover:shadow-[0_14px_28px_-6px_rgba(0,0,0,0.14),0_4px_10px_-3px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:-translate-y-1.5 flex flex-col justify-end p-2.5 z-20`}
        >
          {/* Top Surface Specular Gloss Highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

          {/* Inner Highlight Border */}
          <div
            style={{
              clipPath: 'url(#folderTabClip)',
              WebkitClipPath: 'url(#folderTabClip)',
            }}
            className="absolute inset-0 border border-white/30 pointer-events-none"
          />

          {/* Clean Typography (No pictures, crisp project title) */}
          <div className="relative z-10 flex flex-col pointer-events-none">
            <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-white/70 font-semibold">
              PROJECT // {projectCode}
            </span>
            <h3 className="font-sans font-black text-[11px] tracking-tight uppercase text-white leading-tight mt-0.5 line-clamp-1 drop-shadow-xs">
              {name}
            </h3>
          </div>
        </div>

      </div>

      {/* MINIMAL ASSET COUNT PILL UNDERNEATH FOLDER */}
      <div className="mt-1.5 text-center">
        <span className="font-mono text-[9px] text-neutral-500 bg-white/80 border border-black/5 px-2 py-0.5 rounded-full font-medium shadow-2xs">
          {photoCount || 28} assets
        </span>
      </div>

    </div>
  );
}
