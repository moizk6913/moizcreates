'use client';

import React, { useState, useEffect } from 'react';
import { ArchiveFile } from '@/app/canvas/page';

interface ArchiveFlatFileVaultProps {
  files: ArchiveFile[];
  onSelectFile: (file: ArchiveFile) => void;
  onEnlargePhoto?: (file: ArchiveFile, photoIndex: number) => void;
  initialFolderId?: string | null;
}

export default function ArchiveFlatFileVault({
  files,
  onSelectFile,
  onEnlargePhoto,
  initialFolderId,
}: ArchiveFlatFileVaultProps) {
  const [activeId, setActiveId] = useState<string>(() => {
    if (initialFolderId && files.some((f) => f.id === initialFolderId)) {
      return initialFolderId;
    }
    return files[0]?.id || 'art-direction';
  });

  // Keep active file in sync if files change or initialFolderId changes
  useEffect(() => {
    if (initialFolderId && files.some((f) => f.id === initialFolderId)) {
      setActiveId(initialFolderId);
    } else if (!files.some((f) => f.id === activeId) && files.length > 0) {
      setActiveId(files[0].id);
    }
  }, [initialFolderId, files, activeId]);

  const activeFile = files.find((f) => f.id === activeId) || files[0];

  if (!activeFile) {
    return null;
  }

  const activePhotos =
    activeFile.photos && activeFile.photos.length > 0
      ? activeFile.photos
      : activeFile.img
      ? [activeFile.img]
      : [];

  const assetCount = activeFile.photoCount || activePhotos.length;

  return (
    <div className="w-full h-full min-h-[85vh] flex flex-col justify-center px-4 sm:px-8 md:px-12 py-20 sm:py-24 max-w-[1700px] mx-auto select-none">
      
      {/* Top Vault Metadata Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1b00ff] animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#1b00ff] font-bold">
              DIRECTOR ARCHIVAL VAULT // 2024–2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
            Repertory Master Drawers
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <div>
            TOTAL DISCIPLINES: <span className="text-white font-bold">{files.length}</span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="hidden md:block">
            CALIBRATION: <span className="text-neutral-300 font-bold">5500K DAYLIGHT</span>
          </div>
        </div>
      </div>

      {/* Main Vault Interactive Split (Cabinet on Left, Active Drawer Tray on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: THE PHYSICAL FLAT-FILE CABINET                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-[#13131b]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-2.5">
          <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-mono text-neutral-400 border-b border-white/10 uppercase tracking-widest">
            <span>HEAVY-GAUGE FLAT-FILE</span>
            <span>CABINET NO. 01</span>
            <span>SELECT DRAWER</span>
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {files.map((file, index) => {
              const isActive = file.id === activeId;
              const fileCount =
                file.photoCount || (file.photos ? file.photos.length : 1);
              const numStr = String(index + 1).padStart(2, '0');

              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setActiveId(file.id)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl cursor-pointer flex items-center justify-between group transition-all duration-200 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1c1c28] to-[#161622] border-[#1b00ff] shadow-[0_0_25px_rgba(27,0,255,0.25),0_6px_20px_rgba(0,0,0,0.6)] translate-x-1'
                      : 'bg-gradient-to-r from-[#1a1a24]/90 to-[#14141d]/90 border-white/[0.07] hover:border-white/20 hover:bg-[#1f1f2c]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Number Stamp */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-[#1b00ff] text-white'
                          : 'bg-black/60 text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      {numStr}
                    </div>

                    {/* Discipline & Subdiscipline Title */}
                    <div className="min-w-0 truncate">
                      <div
                        className={`text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors truncate ${
                          isActive
                            ? 'text-white'
                            : 'text-neutral-200 group-hover:text-white'
                        }`}
                      >
                        {file.name}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 truncate">
                        {file.discipline || file.role}
                      </div>
                    </div>
                  </div>

                  {/* Asset Count Pill & Tactile Handle */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span
                      className={`font-mono text-[9.5px] px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#1b00ff]/20 text-[#7c7fff] border border-[#1b00ff]/30'
                          : 'bg-white/5 text-neutral-400 group-hover:text-neutral-300'
                      }`}
                    >
                      {fileCount} ASSETS
                    </span>

                    {/* Heavy Steel Drawer Pull Handle */}
                    <div
                      className={`w-10 sm:w-14 h-3 rounded-sm border transition-all ${
                        isActive
                          ? 'border-[#1b00ff]/60 bg-gradient-to-b from-[#404058] to-[#202030]'
                          : 'border-white/10 bg-gradient-to-b from-[#333340] to-[#1a1a24] group-hover:border-white/30'
                      }`}
                      style={{
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 5px rgba(0,0,0,0.5)',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: ILLUMINATED INTERIOR TRAY (ACTIVE DRAWER)     */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 bg-[#151520]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden min-h-[580px] flex flex-col justify-between">
          
          {/* Ambient Studio Lighting Glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#1b00ff]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Tray Header */}
          <div className="relative z-10 border-b border-white/10 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs text-[#1b00ff] font-bold tracking-wider">
                  DRAWER {activeFile.code || activeFile.id.toUpperCase()}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase text-white mt-0.5">
                  {activeFile.name}
                </h2>
                <div className="font-mono text-xs text-neutral-400 mt-1">
                  ROLE: <span className="text-white font-semibold">{activeFile.role}</span> • YEAR: <span className="text-white font-semibold">{activeFile.year || '2026'}</span>
                </div>
              </div>

              {/* Action Button: Inspect Full Repertory */}
              <button
                type="button"
                onClick={() => onSelectFile(activeFile)}
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b00ff] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-[0_4px_15px_rgba(27,0,255,0.4)] self-start sm:self-auto cursor-pointer active:scale-95"
              >
                <span>OPEN FULL DECK</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">↗</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-sans mt-3 leading-relaxed max-w-2xl font-normal">
              {activeFile.desc}
            </p>
          </div>

          {/* Tray Contact Sheet Grid (35mm Slide Mounts) */}
          <div className="relative z-10 my-6">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-3">
              <span className="uppercase tracking-widest text-[#1b00ff] font-bold">
                ● 35MM SLIDE CONTACT STRIP
              </span>
              <span className="text-neutral-500">
                CLICK SLIDE TO INSPECT FULL-RES
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {activePhotos.slice(0, 4).map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onEnlargePhoto) {
                      onEnlargePhoto(activeFile, idx);
                    } else {
                      onSelectFile(activeFile);
                    }
                  }}
                  className="group relative bg-[#1c1c28] border border-white/10 hover:border-[#1b00ff] rounded-xl overflow-hidden aspect-[4/5] cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                >
                  {/* Photo Stills */}
                  <img
                    src={photoUrl}
                    alt={`${activeFile.name} Still ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Scrim & Slide Details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[8px] font-mono text-white/70">
                      <span>KODAK 5219</span>
                      <span>FRAME {idx + 1}A</span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-[10px] font-mono font-bold">INSPECT ↗</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tray Footer: Deliverables & Specifications */}
          <div className="relative z-10 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-neutral-500 text-[10px] uppercase tracking-wider">
                DELIVERABLES:
              </span>
              {activeFile.deliverables &&
                activeFile.deliverables.map((deliv, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10.5px] text-neutral-300 font-sans"
                  >
                    {deliv}
                  </span>
                ))}
            </div>

            <div className="text-[11px] font-mono text-neutral-400">
              ASSET VAULT: <span className="text-white font-bold">{assetCount} ITEMS</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
