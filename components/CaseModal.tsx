'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DynamicCanvasFile, deleteCanvasFile, saveCanvasFile } from '@/lib/contentStore';
import { DEFAULT_DISCIPLINE_FOLDERS } from '@/lib/defaultDisciplines';

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

export interface CaseSectionItem {
  id: string;
  title: string;
  type: 'grid' | 'lookbook' | 'stories' | 'banner' | 'deck' | 'video';
  items: Array<{
    url: string;
    aspectRatio?: string;
    title?: string;
    type?: 'image' | 'video';
  }>;
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
  sections?: CaseSectionItem[];
  videoUrl?: string;
  scopePills?: string[];
}

export default function CaseModal({ projectId, onClose, uploadedFiles, userPhotos }: CaseModalProps) {
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [editingNarrative, setEditingNarrative] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      setEditingNarrative(null);
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      });
      const t = setTimeout(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }, 50);
      return () => clearTimeout(t);
    }
  }, [projectId]);

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
    let matchedUser = uploadedFiles?.find(
      (f) =>
        f.id.toLowerCase() === lowerId ||
        f.name.toLowerCase() === lowerId ||
        f.code?.toLowerCase() === lowerId ||
        f.name.toLowerCase().includes(lowerId)
    );

    // Fallback to default discipline folders
    if (!matchedUser) {
      matchedUser = DEFAULT_DISCIPLINE_FOLDERS.find(
        (f) =>
          f.id.toLowerCase() === lowerId ||
          f.name.toLowerCase() === lowerId ||
          f.code?.toLowerCase() === lowerId ||
          f.name.toLowerCase().includes(lowerId) ||
          f.discipline.toLowerCase().includes(lowerId.replace(/-/g, ' '))
      ) as any;
    }

    if (matchedUser) {
      const photos =
        matchedUser.photos && matchedUser.photos.length > 0
          ? matchedUser.photos
          : matchedUser.img
          ? [matchedUser.img]
          : [];

      const sections: CaseSectionItem[] =
        matchedUser.sections && matchedUser.sections.length > 0
          ? matchedUser.sections.map((s: any) => ({
              id: s.id,
              title: s.title,
              type: s.type,
              items: (s.items || []).map((it: any) => ({
                url: typeof it === 'string' ? it : it.url,
                aspectRatio: it.aspectRatio,
                title: it.title,
                type: it.type || (typeof it === 'string' && it.endsWith('.mp4') ? 'video' : 'image'),
              })),
            }))
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
        sections,
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

  // Extract all images smartly from photos, sections, or media
  const allImages: string[] =
    userProject?.photos && userProject.photos.length > 0
      ? userProject.photos
      : projectData.sections && projectData.sections.length > 0
      ? projectData.sections.flatMap((s) =>
          s.items.filter((it) => it.type !== 'video' && !it.url.endsWith('.mp4')).map((it) => it.url)
        )
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
      style={{
        paddingTop: 'var(--modal-top-spacing, 40px)',
        paddingBottom: 'var(--modal-top-spacing, 40px)',
      }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center px-2 sm:px-4 md:px-8 overscroll-contain transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Apple-Style Continuous Rounded Modal Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          height: 'calc(100vh - (var(--modal-top-spacing, 40px) * 2))',
          maxHeight: '920px',
        }}
        className="relative w-full max-w-6xl bg-white text-black shadow-[0_30px_90px_rgba(0,0,0,0.4)] apple-widget-lg rounded-[48px] sm:rounded-[56px] overflow-hidden flex flex-col border-none"
      >
        {/* Top Minimal Bar (Matching User Image 2 Header) */}
        <div
          style={{
            paddingLeft: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
            paddingRight: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
            paddingTop: 'var(--modal-nav-top-spacing, 30px)',
            paddingBottom: 'var(--modal-nav-top-spacing, 30px)',
          }}
          className="sticky top-0 z-30 flex items-center justify-between bg-white/95 backdrop-blur-md gap-4 flex-shrink-0 border-b border-black/[0.04]"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-wider">
              PROJECT
            </span>
            <span className="font-mono text-[11px] text-black bg-neutral-100 font-bold px-3 py-1 apple-pill rounded-full uppercase tracking-wider">
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
                className="font-mono text-xs px-3.5 py-1.5 apple-pill rounded-full bg-neutral-100 text-neutral-700 hover:bg-black hover:text-white transition-all font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 apple-pill rounded-full bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              aria-label="Close Case Study"
            >
              <span>✕</span>
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent
          style={{
            paddingLeft: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
            paddingRight: 'clamp(16px, 4vw, var(--modal-side-spacing, 36px))',
            gap: 'var(--modal-grid-gap, 12px)',
          }}
          className="modal-scroll-content overflow-y-auto pb-14 pt-4 overscroll-contain flex flex-col"
        >
          {/* Brand Name & Paragraph ONLY on clean canvas */}
          <section
            className="w-full bg-transparent select-text transition-all pt-2 pb-6"
          >
            <div
              style={{ gap: 'var(--modal-title-gap, 10px)' }}
              className="flex flex-col max-w-4xl"
            >
              <h1 className="text-2xl sm:text-3xl md:text-[34px] font-black text-neutral-900 uppercase tracking-tight leading-tight">
                {projectData.title}
              </h1>

              {editingNarrative !== null ? (
                <div className="space-y-3 mt-1">
                  <textarea
                    value={editingNarrative}
                    onChange={(e) => setEditingNarrative(e.target.value)}
                    rows={4}
                    placeholder="Describe what the project is, your directorial execution (can be long or short)..."
                    className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border border-neutral-300 text-neutral-900 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-black shadow-xs font-normal"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (userProject) {
                          saveCanvasFile({ ...userProject, desc: editingNarrative });
                        }
                        projectData.narrative = editingNarrative;
                        setEditingNarrative(null);
                      }}
                      className="px-4 py-1.5 apple-pill rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Save Narrative
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNarrative(null)}
                      className="px-4 py-1.5 apple-pill rounded-full bg-neutral-200 text-neutral-800 hover:bg-neutral-300 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p
                    onDoubleClick={() => setEditingNarrative(projectData.narrative)}
                    className="text-neutral-700 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line"
                    title="Double-click to edit narrative"
                  >
                    {projectData.narrative}
                  </p>
                </div>
              )}
            </div>
          </section>

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

          {/* SECTION 2: DELIVERABLES / STRUCTURED PROJECT SECTIONS */}
          {projectData.sections && projectData.sections.length > 0 ? (
            <div className="space-y-10">
              {projectData.sections.map((section, sIdx) => (
                <div key={section.id || sIdx} className="space-y-4">
                  {/* Section Editorial Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      <h3 className="font-display font-black text-sm uppercase tracking-wider text-neutral-900">
                        {section.title}
                      </h3>
                      <span className="font-mono text-[10px] text-neutral-500 bg-neutral-100 font-bold px-2 py-0.5 rounded-full">
                        {section.items.length} {section.items.length === 1 ? 'asset' : 'assets'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                      {section.type}
                    </span>
                  </div>

                  {/* Section Content based on Type */}
                  {section.type === 'banner' ? (
                    <div className="space-y-4">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          onClick={() => setEnlargedPhoto(item.url)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="relative overflow-hidden bg-neutral-900 w-full aspect-[21/9] sm:aspect-[3/1] max-h-[460px] cursor-zoom-in group shadow-xs hover:shadow-xl transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.title || `${section.title} Banner ${iIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute top-4 left-4 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider">
                            WEB BANNER • WIDE FORMAT
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : section.type === 'stories' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          onClick={() => setEnlargedPhoto(item.url)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="relative overflow-hidden bg-neutral-900 aspect-[9/16] cursor-zoom-in group shadow-xs hover:shadow-xl transition-all"
                        >
                          {item.type === 'video' || item.url.endsWith('.mp4') ? (
                            <video
                              src={item.url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.url}
                              alt={item.title || `${section.title} Frame ${iIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute bottom-3 left-3 font-mono text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            STORY 9:16
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : section.type === 'lookbook' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          onClick={() => setEnlargedPhoto(item.url)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="relative overflow-hidden bg-neutral-900 aspect-[4/5] cursor-zoom-in group shadow-xs hover:shadow-xl transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.title || `${section.title} Frame ${iIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 font-mono text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            LOOKBOOK (4:5)
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : section.type === 'deck' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          onClick={() => setEnlargedPhoto(item.url)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="relative overflow-hidden bg-neutral-900 aspect-[16/9] cursor-zoom-in group shadow-xs hover:shadow-xl transition-all"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.title || `${section.title} Slide ${iIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 font-mono text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            SLIDE {iIdx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : section.type === 'video' ? (
                    <div className="space-y-4">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="overflow-hidden bg-black p-2 shadow-xl"
                        >
                          <video
                            src={item.url}
                            controls
                            playsInline
                            muted
                            loop
                            className="w-full h-auto max-h-[70vh] object-contain mx-auto block rounded-[20px]"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    >
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          onClick={() => setEnlargedPhoto(item.url)}
                          style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                          className="group relative overflow-hidden bg-neutral-900 aspect-[4/5] cursor-zoom-in shadow-xs hover:shadow-xl transition-all duration-300"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.title || `${section.title} Frame ${iIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tunable Grid with Zero Missing Card Slots */}
              <div
                style={{ gap: 'var(--modal-grid-gap, 10px)' }}
                className={`grid ${
                  allImages.length === 1
                    ? 'grid-cols-1'
                    : allImages.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : allImages.length === 3
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {allImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setEnlargedPhoto(imgUrl)}
                    style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                    className="group relative overflow-hidden bg-neutral-900 aspect-[4/5] cursor-zoom-in shadow-xs hover:shadow-xl transition-all duration-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`${projectData.title} Frame ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: THE END PART - SIGNATURE ASYMMETRIC BENTO SPREAD */}
          <div className="space-y-6 pt-2">
            {/* Bento Row with Strictly Locked Equal Height and Apple-Style Continuous Curvature */}
            <div
              style={{ gap: 'var(--modal-grid-gap, 10px)' }}
              className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
            >
              {/* Left Bento: Wide Key Visual (~65% width, lg:col-span-8) */}
              {bentoWide && (
                <div
                  onClick={() => setEnlargedPhoto(bentoWide)}
                  style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                  className="lg:col-span-8 overflow-hidden bg-[#111111] cursor-zoom-in group shadow-xs hover:shadow-xl transition-all h-[360px] sm:h-[460px] lg:h-[520px] relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bentoWide}
                    alt={`${projectData.title} Master Visual`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-5 left-5 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3.5 py-1 apple-pill rounded-full uppercase tracking-wider">
                    PRIMARY KEY VISUAL (16:9)
                  </div>
                </div>
              )}

              {/* Right Bento: Lookbook Visual (~35% width, lg:col-span-4) - FLUSH EQUAL HEIGHT */}
              {bentoVertical && (
                <div
                  onClick={() => setEnlargedPhoto(bentoVertical)}
                  style={{ borderRadius: 'var(--modal-media-radius, 28px)' }}
                  className="lg:col-span-4 overflow-hidden bg-[#111111] cursor-zoom-in group shadow-xs hover:shadow-xl transition-all h-[360px] sm:h-[460px] lg:h-[520px] relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bentoVertical}
                    alt={`${projectData.title} Editorial Lookbook`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-5 left-5 font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-3.5 py-1 apple-pill rounded-full uppercase tracking-wider">
                    EDITORIAL LOOKBOOK
                  </div>
                </div>
              )}
            </div>

            {/* Subtitle Under Bento Row */}
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
                    className="font-mono text-xs px-4 py-2.5 rounded-full border border-neutral-300 text-neutral-700 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer font-bold flex items-center gap-1.5"
                  >
                    <span>🗑️</span>
                    <span>Delete Entire Campaign</span>
                  </button>
                )}

                <Link
                  href="/canvas"
                  onClick={onClose}
                  className="font-mono text-xs px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer font-bold flex items-center gap-1.5 shadow-sm"
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
