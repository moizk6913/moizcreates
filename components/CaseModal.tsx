'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DynamicCanvasFile, deleteCanvasFile } from '@/lib/contentStore';

interface CaseModalProps {
  projectId: string | null;
  onClose: () => void;
  uploadedFiles?: DynamicCanvasFile[];
  userPhotos?: string[];
}

export interface CaseMediaItem {
  format?: '16-9' | '4-5' | '9-16' | 'grid-2' | 'auto';
  caption?: string;
  image?: string;
  videoUrl?: string;
  items?: Array<{ image: string }>;
}

export interface CaseProjectData {
  tag: string;
  title: string;
  role: string;
  team: string;
  scope: string;
  market: string;
  narrative: string;
  media: CaseMediaItem[];
  videoUrl?: string;
  scopePills?: string[];
}

export default function CaseModal({ projectId, onClose, uploadedFiles, userPhotos }: CaseModalProps) {
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (enlargedPhoto) {
          setEnlargedPhoto(null);
        } else {
          onClose();
        }
      }
    };

    if (projectId) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projectId, enlargedPhoto, onClose]);

  // Match active project
  const { projectData, userProject } = useMemo(() => {
    if (!projectId) return { projectData: null, userProject: null };

    const lowerId = projectId.toLowerCase().trim();

    // Check user uploaded files first
    const matchedUser = uploadedFiles?.find(
      (f) =>
        f.id.toLowerCase() === lowerId ||
        f.name.toLowerCase() === lowerId ||
        f.code?.toLowerCase() === lowerId ||
        f.name.toLowerCase().includes(lowerId)
    );

    if (matchedUser) {
      const photos =
        matchedUser.photos && matchedUser.photos.length > 0
          ? matchedUser.photos
          : matchedUser.img
          ? [matchedUser.img]
          : [];

      const pData: CaseProjectData = {
        tag: (matchedUser.discipline || 'DIRECTORIAL CAMPAIGN').toUpperCase(),
        title: matchedUser.name,
        role: matchedUser.role || 'Director of Visuals',
        team: matchedUser.client ? `Client: ${matchedUser.client}` : 'Direct with Production Crew & Founders',
        scope:
          matchedUser.deliverables?.join(' • ') ||
          'Comprehensive Creative Direction',
        market: matchedUser.discipline || 'Art Direction • Visual Systems',
        narrative:
          matchedUser.desc ||
          `${matchedUser.name} — Directorial campaign with ${photos.length} deliverable(s).`,
        videoUrl: matchedUser.videoUrl,
        scopePills:
          matchedUser.deliverables && matchedUser.deliverables.length > 0
            ? matchedUser.deliverables
            : ['Campaign Architecture', 'Visual Direction'],
        media: photos.map((p) => ({
          image: p,
          format: 'auto',
        })),
      };

      return { projectData: pData, userProject: matchedUser };
    }

    return { projectData: null, userProject: null };
  }, [projectId, uploadedFiles]);

  if (!projectData) return null;

  // Extract all images
  const allImages: string[] =
    userProject?.photos && userProject.photos.length > 0
      ? userProject.photos
      : userProject?.img
      ? [userProject.img]
      : projectData.media
          .map((m) => m.image || m.items?.[0]?.image)
          .filter((img): img is string => Boolean(img));

  // Bento Key Visuals:
  // Card 1: Wide primary key visual (Left ~65% width)
  const bentoWide = allImages[0];
  // Card 2: Vertical lookbook / secondary visual (Right ~35% width)
  const bentoVertical = allImages[1] || allImages[0];

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-8 overscroll-contain transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Apple-Style Continuous Rounded Modal Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] bg-white text-black shadow-[0_30px_90px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col rounded-[32px] sm:rounded-[36px] border-none"
      >
        {/* Top Minimal Bar (Matching User Image 2 Header) */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 sm:px-10 py-5 bg-white/95 backdrop-blur-md gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-wider">
              PROJECT
            </span>
            <span className="font-mono text-[11px] text-[#e60000] bg-red-50 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {projectData.tag}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {userProject && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${projectData.title}" from portfolio?`)) {
                    deleteCanvasFile(userProject.id);
                    onClose();
                  }
                }}
                className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-red-50 text-[#e60000] hover:bg-[#e60000] hover:text-white transition-all font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs px-4 py-2 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-black transition-all flex items-center gap-1.5 cursor-pointer font-bold"
              aria-label="Close Case Study"
            >
              <span>✕</span>
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div
          data-lenis-prevent
          className="modal-scroll-content overflow-y-auto px-6 sm:px-10 md:px-14 pb-14 pt-2 overscroll-contain space-y-12"
        >
          {/* Project Title & Metadata Header (Matching media_1789049860810.png) */}
          <div className="space-y-6 max-w-5xl">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest block">
                {projectData.market.toUpperCase()}
              </span>
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-black uppercase tracking-tight leading-[0.92]">
                {projectData.title}
              </h1>
            </div>

            <p className="font-sans text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed font-normal max-w-4xl">
              {projectData.narrative}
            </p>

            {/* 4 Metadata Columns with Red Dot Indicator */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">
                  ROLE
                </span>
                <span className="font-bold text-black block">{projectData.role}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                    CREW / LEADERSHIP
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e60000]" />
                </div>
                <span className="font-bold text-black block">{projectData.team}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">
                  SCOPE
                </span>
                <span className="font-bold text-black block">{projectData.scope}</span>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">
                  MARKET
                </span>
                <span className="font-bold text-black block">{projectData.market}</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: CAMPAIGN MOTION VIDEO (IF PRESENT) */}
          {projectData.videoUrl && (
            <div className="w-full rounded-[28px] sm:rounded-[34px] overflow-hidden bg-black shadow-xl p-2">
              <video
                src={projectData.videoUrl}
                controls
                playsInline
                autoPlay
                muted
                loop
                className="w-full h-auto max-h-[75vh] object-contain mx-auto block rounded-[22px]"
              />
            </div>
          )}

          {/* SECTION 2: THE 4-COLUMN DELIVERABLES GALLERY (Matching User Image 2 media_1789053470192.png) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-500 tracking-wider uppercase font-semibold">
                Archived Campaign Frames ({allImages.length} Plates)
              </span>
              <span className="font-mono text-xs text-neutral-400 tracking-wider">
                Click any frame to inspect
              </span>
            </div>

            {/* Apple-Style Rounded 4-Column Grid with FRAME XX Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {allImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setEnlargedPhoto(imgUrl)}
                  className="group relative rounded-[20px] sm:rounded-[24px] overflow-hidden bg-neutral-900 aspect-[4/5] cursor-zoom-in shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] transition-all duration-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${projectData.title} Frame ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Bottom-left pill badge (Matching Image 2: FRAME XX) */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-[6px] tracking-wider uppercase pointer-events-none">
                    FRAME {80 + idx}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: THE END PART - SIGNATURE APPLE-STYLE ASYMMETRIC BENTO SPREAD (Image 1 media_1789053458855.png) */}
          <div className="space-y-6 pt-6">
            {/* Bento Row with Strictly Locked Equal Height and Apple-Style Continuous Curvature */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              {/* Left Bento: Wide Key Visual (~65% width, lg:col-span-8) */}
              {bentoWide && (
                <div
                  onClick={() => setEnlargedPhoto(bentoWide)}
                  className="lg:col-span-8 rounded-[28px] sm:rounded-[34px] lg:rounded-[38px] overflow-hidden bg-[#111111] cursor-zoom-in group shadow-[0_10px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all h-[360px] sm:h-[460px] lg:h-[520px] relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bentoWide}
                    alt={`${projectData.title} Master Visual`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-5 left-5 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full uppercase tracking-wider">
                    PRIMARY KEY VISUAL (16:9)
                  </div>
                </div>
              )}

              {/* Right Bento: Lookbook Visual (~35% width, lg:col-span-4) - FLUSH EQUAL HEIGHT */}
              {bentoVertical && (
                <div
                  onClick={() => setEnlargedPhoto(bentoVertical)}
                  className="lg:col-span-4 rounded-[28px] sm:rounded-[34px] lg:rounded-[38px] overflow-hidden bg-[#111111] cursor-zoom-in group shadow-[0_10px_35px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all h-[360px] sm:h-[460px] lg:h-[520px] relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bentoVertical}
                    alt={`${projectData.title} Editorial Lookbook`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-5 left-5 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full uppercase tracking-wider">
                    EDITORIAL LOOKBOOK
                  </div>
                </div>
              )}
            </div>

            {/* Subtitle Under Bento Row (Matching Image 1: Left Narrative + Right ALL RIGHTS RESERVED + Logo) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-xs font-mono text-neutral-500 uppercase tracking-wider">
              <span className="max-w-2xl font-medium leading-relaxed">
                {projectData.title} — {projectData.narrative.toUpperCase()}
              </span>

              <div className="flex items-center gap-2 text-neutral-400 font-bold flex-shrink-0">
                <span>ALL RIGHTS RESERVED</span>
                <Image
                  src="/assets/logo.png"
                  alt="Moiz Khan"
                  width={18}
                  height={18}
                  className="h-3.5 w-auto object-contain inline-block opacity-75"
                />
              </div>
            </div>

            {/* Directorial Vision & Strategy Summary Card */}
            <div className="bg-[#faf9f6] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-[#e60000] uppercase tracking-widest block">
                  DIRECTORIAL VISION &amp; STRATEGY
                </span>
                <p className="font-sans text-sm sm:text-base text-neutral-800 leading-relaxed font-normal max-w-4xl">
                  {projectData.narrative}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <span className="font-mono text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
                  CAMPAIGN SCOPE:
                </span>
                <div className="flex flex-wrap gap-2">
                  {projectData.scopePills?.map((pill, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-100 font-mono text-[11px] text-neutral-700 font-semibold"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: THE EXACT BOTTOM ACTION BAR (Matching Image 2 media_1789053470192.png) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                {allImages.length} FRAMES ARCHIVED • {projectData.title.toUpperCase()}
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {userProject && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Completely delete "${projectData.title}" from your portfolio? This cannot be undone.`)) {
                        deleteCanvasFile(userProject.id);
                        onClose();
                      }
                    }}
                    className="font-mono text-xs px-4 py-2.5 rounded-full border border-red-200 text-[#e60000] hover:bg-[#e60000] hover:text-white transition-all cursor-pointer font-bold flex items-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>Delete Entire Campaign</span>
                  </button>
                )}

                <Link
                  href="/canvas"
                  onClick={onClose}
                  className="font-mono text-xs px-5 py-2.5 rounded-full bg-black text-white hover:bg-[#e60000] transition-colors cursor-pointer font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>EXPLORE ARCHIVE CANVAS</span>
                  <span>↗</span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="font-mono text-xs px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-700 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer font-bold"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Resolution Lightbox Zoom */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setEnlargedPhoto(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enlargedPhoto}
            alt="Enlarged Visual"
            className="max-w-[95vw] max-h-[92vh] object-contain rounded-[20px] shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
