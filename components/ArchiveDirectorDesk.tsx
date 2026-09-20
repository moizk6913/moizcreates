'use client';

import React from 'react';
import { ArchiveFile } from '@/app/canvas/page';
import ArchiveFolderCard from './ArchiveFolderCard';

interface ArchiveDirectorDeskProps {
  files: ArchiveFile[];
  onSelectFile: (file: ArchiveFile) => void;
}

// 7 Distinct Non-Colliding Desktop Coordinates (In Pixels)
// Wide 800px+ horizontal clearance providing generous, airy breathing room between all items
const DESK_SLOTS: Record<string, { x: number; y: number; rot: number }> = {
  'art-direction': { x: -340, y: -160, rot: -2 },
  'brand-identity': { x: 340, y: -160, rot: 2 },
  'cinematography': { x: -440, y: 30, rot: 2 },
  'motion-graphics': { x: 0, y: -20, rot: 0 },
  'video-editing': { x: 440, y: 30, rot: -2 },
  'color-grading': { x: -220, y: 200, rot: -2 },
  'photography': { x: 220, y: 200, rot: 2 },
};

// Fallback slot order if IDs vary
const FALLBACK_SLOTS = [
  { x: -340, y: -160, rot: -2 }, // Slot 0: Top Left
  { x: 340, y: -160, rot: 2 },   // Slot 1: Top Right
  { x: -440, y: 30, rot: 2 },    // Slot 2: Far Left
  { x: 0, y: -20, rot: 0 },      // Slot 3: Center
  { x: 440, y: 30, rot: -2 },    // Slot 4: Far Right
  { x: -220, y: 200, rot: -2 },  // Slot 5: Bottom Left
  { x: 220, y: 200, rot: 2 },    // Slot 6: Bottom Right
];

function getSlot(file: ArchiveFile, index: number) {
  // 1. Direct ID match first (100% reliable, zero collisions)
  if (file.id && DESK_SLOTS[file.id]) {
    return DESK_SLOTS[file.id];
  }

  // 2. Strict ID normalization
  const fid = (file.id || '').toLowerCase().replace(/_/g, '-');
  if (DESK_SLOTS[fid]) return DESK_SLOTS[fid];

  // 3. Normalized discipline / name matching (ordered specifically without collisions)
  const norm = (file.name + ' ' + (file.discipline || '')).toLowerCase();
  if (norm.includes('art') || norm.includes('concept')) return DESK_SLOTS['art-direction'];
  if (norm.includes('brand') || norm.includes('identity')) return DESK_SLOTS['brand-identity'];
  if (norm.includes('cinema') || norm.includes('camera') || norm.includes('shoot')) return DESK_SLOTS['cinematography'];
  if (norm.includes('motion') || norm.includes('kinetic') || norm.includes('3d')) return DESK_SLOTS['motion-graphics'];
  if (norm.includes('photo') || norm.includes('stills') || norm.includes('lookbook')) return DESK_SLOTS['photography'];
  if (norm.includes('color') || norm.includes('colour') || norm.includes('grade')) return DESK_SLOTS['color-grading'];
  if (norm.includes('video') || norm.includes('social') || norm.includes('reel') || norm.includes('post-production')) return DESK_SLOTS['video-editing'];

  return FALLBACK_SLOTS[index % FALLBACK_SLOTS.length];
}

export default function ArchiveDirectorDesk({
  files,
  onSelectFile,
}: ArchiveDirectorDeskProps) {
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
      <main className="relative z-10 w-full max-w-7xl my-auto py-8 sm:py-12 flex items-center justify-center min-h-[700px]">
        
        {/* Desktop Absolute Desk Layout (All 7 Apple Folders Guaranteed Distinct and Non-Colliding) */}
        <div className="hidden md:flex relative w-full max-w-6xl h-[680px] items-center justify-center">
          {files.map((file, index) => {
            const slot = getSlot(file, index);
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

        {/* Mobile Responsive Grid Layout (Clean 1/2-Column Display with Ample Breathing Room) */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-12 w-full max-w-xs sm:max-w-lg mx-auto pt-6">
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
