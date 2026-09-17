'use client';

import React, { useState, useRef } from 'react';
import { ArchiveFile } from '@/app/canvas/page';

interface ArchiveEditorialRepertoryProps {
  files: ArchiveFile[];
  onSelectFile: (file: ArchiveFile) => void;
  onEnlargePhoto?: (file: ArchiveFile, photoIndex: number) => void;
  initialFolderId?: string | null;
}

export default function ArchiveEditorialRepertory({
  files,
  onSelectFile,
  onEnlargePhoto,
  initialFolderId,
}: ArchiveEditorialRepertoryProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(initialFolderId || null);
  const [portalSrc, setPortalSrc] = useState<string | null>(null);
  const [portalPos, setPortalPos] = useState({ x: -1000, y: -1000 });
  const [isPortalVisible, setIsPortalVisible] = useState(false);

  // Filter files
  const filteredFiles = files.filter((f) => {
    if (activeFilter === 'all') return true;
    const text = (f.name + ' ' + f.discipline + ' ' + f.id).toLowerCase();
    if (activeFilter === 'direction') return text.includes('art') || text.includes('concept') || text.includes('direction');
    if (activeFilter === 'cinema') return text.includes('cinema') || text.includes('video') || text.includes('grade');
    if (activeFilter === 'identity') return text.includes('identity') || text.includes('brand') || text.includes('editorial');
    if (activeFilter === 'photo') return text.includes('photo') || text.includes('lookbook') || text.includes('vision');
    return true;
  });

  const handleRowMouseEnter = (file: ArchiveFile, e: React.MouseEvent) => {
    const photo = file.photos && file.photos.length > 0 ? file.photos[0] : file.img;
    if (photo) {
      setPortalSrc(photo);
      setPortalPos({ x: e.clientX, y: e.clientY - 20 });
      setIsPortalVisible(true);
    }
  };

  const handleRowMouseMove = (e: React.MouseEvent) => {
    setPortalPos({ x: e.clientX, y: e.clientY - 20 });
  };

  const handleRowMouseLeave = () => {
    setIsPortalVisible(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full min-h-screen bg-[#faf9f6] text-black pt-24 sm:pt-28 pb-32 px-4 sm:px-8 md:px-14 max-w-[1650px] mx-auto select-none relative">
      
      {/* Floating Cursor Media Portal (Desktop only) */}
      <div
        style={{
          left: `${portalPos.x}px`,
          top: `${portalPos.y}px`,
          opacity: isPortalVisible ? 1 : 0,
          transform: isPortalVisible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.85)',
        }}
        className="fixed w-[280px] sm:w-[340px] h-[190px] sm:h-[230px] rounded-2xl overflow-hidden pointer-events-none z-[60] shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition-[opacity,transform] duration-250 ease-out hidden md:block border border-black/10 bg-black"
      >
        {portalSrc && (
          <img
            src={portalSrc}
            alt="Repertory Preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Top Filter Bar (High-Fashion Editorial Pills) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1b00ff] animate-pulse"></span>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold">
            ARCHIVE REPERTORY // 2024–2026
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-white border border-black/10 shadow-xs font-mono text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            ALL ({files.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('direction')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'direction'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            DIRECTION
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('cinema')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'cinema'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            CINEMA
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('identity')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'identity'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            IDENTITY
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('photo')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeFilter === 'photo'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            PHOTO
          </button>
        </div>
      </div>

      {/* Giant Typographic Marquee Header (Matches Services & Testimonials) */}
      <div className="pt-6 sm:pt-10 pb-8 sm:pb-12 border-b border-black/10 overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
          <span className="font-bold text-[#1b00ff]">CURATED MASTER REPERTORY</span>
          <span className="hidden sm:inline">HOVER ROW TO PREVIEW • CLICK TO EXPAND LOOKBOOK</span>
        </div>
        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[104px] tracking-tight uppercase text-black leading-none whitespace-nowrap select-none">
          ARCHIVE — ARCHIVE — ARCHIVE — ARCHIVE
        </h1>
      </div>

      {/* Editorial Rows Container */}
      <div className="divide-y divide-black/10 my-4">
        {filteredFiles.map((file, index) => {
          const isExpanded = expandedId === file.id;
          const photos = file.photos && file.photos.length > 0 ? file.photos : file.img ? [file.img] : [];
          const assetCount = file.photoCount || photos.length;
          const numStr = String(index + 1).padStart(2, '0');

          return (
            <div key={file.id} className="py-2">
              {/* Main Row */}
              <div
                onMouseEnter={(e) => handleRowMouseEnter(file, e)}
                onMouseMove={handleRowMouseMove}
                onMouseLeave={handleRowMouseLeave}
                onClick={() => toggleExpand(file.id)}
                className={`py-5 sm:py-7 px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-center cursor-pointer rounded-2xl transition-all duration-200 group ${
                  isExpanded ? 'bg-white shadow-xs border border-black/5' : 'hover:bg-[#f2efe9]'
                }`}
              >
                {/* Col 1: Number */}
                <div className="sm:col-span-1 font-mono text-base font-bold text-black group-hover:text-[#1b00ff] transition-colors">
                  {numStr}
                </div>

                {/* Col 2: Title & Discipline */}
                <div className="sm:col-span-4">
                  <h2 className="font-sans font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight uppercase text-black group-hover:text-[#1b00ff] transition-colors leading-tight">
                    {file.name}
                  </h2>
                  <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mt-1">
                    {file.discipline || file.role}
                  </span>
                </div>

                {/* Col 3: Editorial Description */}
                <div className="sm:col-span-5">
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans max-w-lg font-normal">
                    {file.desc}
                  </p>
                </div>

                {/* Col 4: Action & Count */}
                <div className="sm:col-span-2 flex items-center sm:justify-end gap-3 font-mono text-xs">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-neutral-700 font-bold text-[11px]">
                    {assetCount} ASSETS
                  </span>
                  <span
                    className={`text-lg font-bold transition-transform duration-300 text-[#1b00ff] ${
                      isExpanded ? 'rotate-90 text-black' : 'group-hover:translate-x-1'
                    }`}
                  >
                    {isExpanded ? '−' : '↗'}
                  </span>
                </div>
              </div>

              {/* Inline Expandable Lookbook (Smoothly reveals high-res 35mm contact lookbook) */}
              {isExpanded && (
                <div className="py-6 sm:py-8 px-4 sm:px-8 bg-white rounded-2xl shadow-sm border border-black/5 my-3 space-y-6">
                  {/* Lookbook Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1b00ff] uppercase">
                        {numStr} {file.name} // 35MM STILLS LOOKBOOK
                      </span>
                      <span className="text-neutral-400">|</span>
                      <span className="text-neutral-600">ROLE: {file.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#1b00ff] text-white hover:bg-black transition-colors font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                      >
                        OPEN FULL REPERTORY ↗
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(file.id);
                        }}
                        className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black font-bold uppercase text-[11px] cursor-pointer"
                      >
                        CLOSE ✕
                      </button>
                    </div>
                  </div>

                  {/* 4-Column Photo Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {photos.slice(0, 4).map((photoUrl, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => {
                          if (onEnlargePhoto) {
                            onEnlargePhoto(file, pIdx);
                          } else {
                            onSelectFile(file);
                          }
                        }}
                        className="group/photo relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 shadow-sm border border-black/5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <img
                          src={photoUrl}
                          alt={`${file.name} Still ${pIdx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span>KODAK 5219</span>
                            <span>FRAME {pIdx + 1}A</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold">INSPECT MASTER</span>
                            <span className="text-sm">↗</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Deliverables Footer */}
                  {file.deliverables && file.deliverables.length > 0 && (
                    <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold">
                          DELIVERABLES:
                        </span>
                        {file.deliverables.map((deliv, dIdx) => (
                          <span
                            key={dIdx}
                            className="px-2.5 py-1 rounded-md bg-neutral-100 border border-black/5 text-[11px] text-neutral-800 font-sans"
                          >
                            #{deliv}
                          </span>
                        ))}
                      </div>

                      <div className="text-neutral-400 text-[11px]">
                        FORMAT: <span className="text-black font-semibold">35MM / 4K MASTER</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Repertory Footer */}
      <div className="mt-16 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1b00ff]"></span>
          <span className="text-black font-bold uppercase">HAUTE COUTURE REPERTORY ARCHIVE</span>
        </div>
        <div>
          TOTAL DISCIPLINES: <span className="text-black font-bold">{files.length}</span>
        </div>
      </div>

    </div>
  );
}
