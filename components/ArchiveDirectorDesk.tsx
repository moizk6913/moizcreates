'use client';

import React from 'react';
import { ArchiveFile } from '@/app/canvas/page';
import ArchiveFolderCard from './ArchiveFolderCard';

interface ArchiveDirectorDeskProps {
  files: ArchiveFile[];
  onSelectFile: (file: ArchiveFile) => void;
}

const CORE_DISCIPLINE_KEYS = new Set([
  'art-direction',
  'brand-identity',
  'cinematography',
  'motion-graphics',
  'video-editing',
  'color-grading',
  'photography',
]);

// 7 Distinct Non-Colliding Desktop Coordinates for Core Disciplines (In Pixels)
const DESK_SLOTS: Record<string, { x: number; y: number; rot: number }> = {
  'art-direction': { x: -360, y: -210, rot: -2 },
  'brand-identity': { x: 360, y: -210, rot: 2 },
  'cinematography': { x: -480, y: 70, rot: 2 },
  'motion-graphics': { x: 0, y: -60, rot: 0 },
  'video-editing': { x: 480, y: 70, rot: -2 },
  'color-grading': { x: -240, y: 260, rot: -2 },
  'photography': { x: 240, y: 260, rot: 2 },
};

// Dedicated Non-Colliding Coordinates for Uploaded Client Campaigns (e.g. Kaldhar)
// Places campaign folders distinctly (honoring "folder need to come right")
const CAMPAIGN_SLOTS = [
  { x: 500, y: -190, rot: 2 },   // Campaign 1: Upper Right
  { x: 0, y: 230, rot: -1 },     // Campaign 2: Center Lower
  { x: -500, y: -190, rot: -2 },  // Campaign 3: Upper Left
  { x: 0, y: -260, rot: 1 },     // Campaign 4: Center Upper
  { x: -160, y: 70, rot: -1 },   // Campaign 5: Center-Left
  { x: 160, y: 70, rot: 1 },     // Campaign 6: Center-Right
];

function getSlot(file: ArchiveFile, index: number, usedCoords: Set<string>) {
  const fid = (file.id || '').toLowerCase().replace(/_/g, '-');
  const nameNorm = (file.name || '').toLowerCase();

  // 1. Core discipline direct match
  if (CORE_DISCIPLINE_KEYS.has(fid) && DESK_SLOTS[fid]) {
    const slot = DESK_SLOTS[fid];
    const key = `${slot.x},${slot.y}`;
    if (!usedCoords.has(key)) {
      usedCoords.add(key);
      return slot;
    }
  }

  // 2. Core discipline exact name match (e.g. "Art Direction")
  for (const coreKey of CORE_DISCIPLINE_KEYS) {
    if (nameNorm === coreKey.replace(/-/g, ' ') && DESK_SLOTS[coreKey]) {
      const slot = DESK_SLOTS[coreKey];
      const key = `${slot.x},${slot.y}`;
      if (!usedCoords.has(key)) {
        usedCoords.add(key);
        return slot;
      }
    }
  }

  // 3. Dedicated Campaign slots for custom uploaded folders (like Kaldhar)
  for (const cSlot of CAMPAIGN_SLOTS) {
    const key = `${cSlot.x},${cSlot.y}`;
    if (!usedCoords.has(key)) {
      usedCoords.add(key);
      return cSlot;
    }
  }

  // 4. Fallback: dynamic non-colliding offset
  const angle = (index * 45) * (Math.PI / 180);
  const radius = 380;
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * (radius * 0.6)),
    rot: index % 2 === 0 ? 2 : -2,
  };
}

export default function ArchiveDirectorDesk({
  files,
  onSelectFile,
}: ArchiveDirectorDeskProps) {
  const usedCoords = new Set<string>();
  return (
    <div className="relative w-full min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col items-center justify-between pt-20 pb-24 px-4 sm:px-8 select-none overflow-x-hidden">
      
      {/* GLOBAL SVG CLIP PATH DEFINITION (PROPORTIONAL MICRO-SCALE TABBED FOLDER) */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="folderTabClip" clipPathUnits="objectBoundingBox">
            <path d="
              M 0, 0.16
              C 0, 0.06, 0.04, 0, 0.12, 0
              L 0.36, 0
              C 0.42, 0, 0.44, 0.07, 0.47, 0.15
              C 0.49, 0.20, 0.52, 0.22, 0.56, 0.22
              L 0.88, 0.22
              C 0.95, 0.22, 1, 0.28, 1, 0.36
              L 1, 0.84
              C 1, 0.93, 0.94, 1, 0.86, 1
              L 0.14, 1
              C 0.06, 1, 0, 0.93, 0, 0.84
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      {/* 1. SOFT ELEGANT STUDIO DOT MATRIX */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundColor: '#faf9f6',
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 0.65px, transparent 0.65px)',
          backgroundSize: '26px 26px',
          backgroundPosition: '0 0',
        }}
      />

      {/* 2. MAIN DIRECTOR'S DESK STAGE (Spacious Apple Showcase Canvas) */}
      <main className="relative z-10 w-full max-w-7xl my-auto py-8 sm:py-12 flex items-center justify-center min-h-[820px]">
        
        {/* Desktop Absolute Desk Layout (All 7 Apple Folders Guaranteed Distinct and Non-Colliding on 1024px+ viewports) */}
        <div className="hidden lg:flex relative w-full max-w-7xl h-[780px] items-center justify-center">
          {files.map((file, index) => {
            const slot = getSlot(file, index, usedCoords);
            return (
              <div
                key={file.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(${slot.x}px, ${slot.y}px, 0) translate(-50%, -50%) rotate(${slot.rot}deg)`,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="hover:z-40"
              >
                <ArchiveFolderCard
                  id={file.id}
                  code={file.code}
                  name={file.name}
                  discipline={file.discipline}
                  year={file.year}
                  role={file.role}
                  photos={file.photos || (file.img ? [file.img] : [])}
                  photoCount={file.photoCount || (file.photos ? file.photos.length : 28)}
                  stickers={file.stickers}
                  colorTag={file.colorTag}
                  isComingSoon={file.isComingSoon}
                  variant={file.variant as any}
                  onClick={() => onSelectFile(file)}
                />
              </div>
            );
          })}
        </div>

        {/* Tablet & Mobile Responsive Grid Layout (Clean 1/2/3-Column Display with Ample Breathing Room) */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 w-full max-w-xs sm:max-w-xl md:max-w-4xl mx-auto pt-6">
          {files.map((file) => (
            <div key={file.id} className="flex justify-center">
              <ArchiveFolderCard
                id={file.id}
                code={file.code}
                name={file.name}
                discipline={file.discipline}
                year={file.year}
                role={file.role}
                photos={file.photos || (file.img ? [file.img] : [])}
                photoCount={file.photoCount || (file.photos ? file.photos.length : 28)}
                stickers={file.stickers}
                colorTag={file.colorTag}
                isComingSoon={file.isComingSoon}
                variant={file.variant as any}
                onClick={() => onSelectFile(file)}
              />
            </div>
          ))}
        </div>

      </main>

    </div>
  );
}
