'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ModalSpacingSettings {
  modalTopSpacing: number;    // Top Spacing (window distance from screen top)
  modalNavTopSpacing: number; // Header Top Spacing (padding above nav bar)
  modalSideSpacing: number;   // Side Spacing (modal left/right padding)
  modalHeaderGap: number;     // Content Top Gap (gap below nav bar)
  modalTitleSize: number;     // Brand Name font size
  modalTitleGap: number;      // Text Spacing (gap between brand name & paragraph)
  modalOverviewGap: number;   // Space between narrative & bento grid
  modalGridGap: number;       // Bento Spacing (column gap between bento items)
  modalRowGap: number;        // Bento Row Spacing (vertical gap between bento rows)
  modalMediaRadius: number;   // Bento Roundness (media corner radius)
  // Backward compatibility
  modalCardPadding?: number;
  modalCardRadius?: number;
}

export const DEFAULT_MODAL_SPACING: ModalSpacingSettings = {
  modalTopSpacing: 40,
  modalNavTopSpacing: 30,
  modalSideSpacing: 36,
  modalHeaderGap: 16,
  modalTitleSize: 34,
  modalTitleGap: 10,
  modalOverviewGap: 34,
  modalGridGap: 12,
  modalRowGap: 16,
  modalMediaRadius: 28,
};

const STORAGE_KEY = 'moiz_modal_spacing_v5';

interface ModalSpacingPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalSpacingPopover({ isOpen, onClose }: ModalSpacingPopoverProps) {
  const [settings, setSettings] = useState<ModalSpacingSettings>(DEFAULT_MODAL_SPACING);
  const [activeTab, setActiveTab] = useState<'sliders' | 'json'>('sliders');
  const [jsonText, setJsonText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const applyToDOM = useCallback((cfg: ModalSpacingSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--modal-top-spacing', `${cfg.modalTopSpacing}px`);
    root.style.setProperty('--modal-nav-top-spacing', `${cfg.modalNavTopSpacing}px`);
    root.style.setProperty('--modal-side-spacing', `${cfg.modalSideSpacing}px`);
    root.style.setProperty('--modal-header-gap', `${cfg.modalHeaderGap}px`);
    root.style.setProperty('--modal-title-size', `${cfg.modalTitleSize}px`);
    root.style.setProperty('--modal-title-gap', `${cfg.modalTitleGap}px`);
    root.style.setProperty('--modal-overview-gap', `${cfg.modalOverviewGap}px`);
    root.style.setProperty('--modal-grid-gap', `${cfg.modalGridGap}px`);
    root.style.setProperty('--modal-row-gap', `${cfg.modalRowGap}px`);
    root.style.setProperty('--modal-media-radius', `${cfg.modalMediaRadius}px`);
  }, []);

  const syncToServer = useCallback(async (cfg: ModalSpacingSettings) => {
    try {
      await fetch('/api/spacing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
    } catch {}
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged = { ...DEFAULT_MODAL_SPACING, ...parsed };
          setSettings(merged);
          applyToDOM(merged);
          setJsonText(JSON.stringify(merged, null, 2));
          return;
        }

        const res = await fetch('/api/spacing');
        if (res.ok) {
          const data = await res.json();
          if (data?.config) {
            const merged: ModalSpacingSettings = {
              modalTopSpacing: data.config.modalTopSpacing ?? DEFAULT_MODAL_SPACING.modalTopSpacing,
              modalNavTopSpacing: data.config.modalNavTopSpacing ?? DEFAULT_MODAL_SPACING.modalNavTopSpacing,
              modalSideSpacing: data.config.modalSideSpacing ?? DEFAULT_MODAL_SPACING.modalSideSpacing,
              modalHeaderGap: data.config.modalHeaderGap ?? DEFAULT_MODAL_SPACING.modalHeaderGap,
              modalTitleSize: data.config.modalTitleSize ?? DEFAULT_MODAL_SPACING.modalTitleSize,
              modalTitleGap: data.config.modalTitleGap ?? DEFAULT_MODAL_SPACING.modalTitleGap,
              modalOverviewGap: data.config.modalOverviewGap ?? DEFAULT_MODAL_SPACING.modalOverviewGap,
              modalGridGap: data.config.modalGridGap ?? DEFAULT_MODAL_SPACING.modalGridGap,
              modalRowGap: data.config.modalRowGap ?? DEFAULT_MODAL_SPACING.modalRowGap,
              modalMediaRadius: data.config.modalMediaRadius ?? DEFAULT_MODAL_SPACING.modalMediaRadius,
            };
            setSettings(merged);
            applyToDOM(merged);
            setJsonText(JSON.stringify(merged, null, 2));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return;
          }
        }
        applyToDOM(DEFAULT_MODAL_SPACING);
        setJsonText(JSON.stringify(DEFAULT_MODAL_SPACING, null, 2));
      } catch {
        applyToDOM(DEFAULT_MODAL_SPACING);
        setJsonText(JSON.stringify(DEFAULT_MODAL_SPACING, null, 2));
      }
    }
    load();
  }, [applyToDOM]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleChange = (key: keyof ModalSpacingSettings, value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    applyToDOM(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      syncToServer(updated);
    }, 400);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const merged: ModalSpacingSettings = {
        modalTopSpacing: Number(parsed.modalTopSpacing ?? parsed.topSpacing ?? parsed.cardTopSpacing ?? settings.modalTopSpacing),
        modalNavTopSpacing: Number(parsed.modalNavTopSpacing ?? parsed.navTopSpacing ?? parsed.headerTopSpacing ?? parsed.headerPaddingTop ?? settings.modalNavTopSpacing),
        modalSideSpacing: Number(parsed.modalSideSpacing ?? parsed.sideSpacing ?? settings.modalSideSpacing),
        modalHeaderGap: Number(parsed.modalHeaderGap ?? parsed.headerGap ?? parsed.contentTopGap ?? settings.modalHeaderGap),
        modalTitleSize: Number(parsed.modalTitleSize ?? parsed.titleSize ?? settings.modalTitleSize),
        modalTitleGap: Number(parsed.modalTitleGap ?? parsed.textSpacing ?? settings.modalTitleGap),
        modalOverviewGap: Number(parsed.modalOverviewGap ?? parsed.overviewGap ?? settings.modalOverviewGap),
        modalGridGap: Number(parsed.modalGridGap ?? parsed.bentoSpacing ?? settings.modalGridGap),
        modalRowGap: Number(parsed.modalRowGap ?? parsed.rowSpacing ?? settings.modalRowGap),
        modalMediaRadius: Number(parsed.modalMediaRadius ?? parsed.bentoRoundness ?? settings.modalMediaRadius),
      };
      setSettings(merged);
      applyToDOM(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {}
      syncToServer(merged);
    } catch {
      alert('Invalid JSON format. Please check syntax.');
    }
  };

  const handleCopyJson = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_MODAL_SPACING);
    setJsonText(JSON.stringify(DEFAULT_MODAL_SPACING, null, 2));
    applyToDOM(DEFAULT_MODAL_SPACING);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MODAL_SPACING));
    } catch {}
    syncToServer(DEFAULT_MODAL_SPACING);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-16 right-2 sm:right-6 z-[20100] w-88 max-w-[calc(100vw-24px)] bg-[#151618] text-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.65)] border border-white/10 p-4 sm:p-5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none text-left max-h-[85vh] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🎚️</span>
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-neutral-200">
            Layout &amp; Spacing
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-neutral-800 rounded-lg p-0.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('sliders')}
              className={`px-2 py-0.5 rounded-md transition ${activeTab === 'sliders' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              Sliders
            </button>
            <button
              type="button"
              onClick={() => {
                setJsonText(JSON.stringify(settings, null, 2));
                setActiveTab('json');
              }}
              className={`px-2 py-0.5 rounded-md transition ${activeTab === 'json' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              JSON
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            aria-label="Close Tuner"
          >
            ✕
          </button>
        </div>
      </div>

      {activeTab === 'sliders' ? (
        /* Sliders: Complete Set for All Detail View Elements */
        <div className="space-y-3.5 overflow-y-auto no-scrollbar pr-1 flex-1 min-h-0">
          {/* 1. Top Spacing (from screen top) */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Top Spacing (Screen)</span>
              <span className="text-emerald-400 font-bold">{settings.modalTopSpacing}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={2}
              value={settings.modalTopSpacing}
              onChange={(e) => handleChange('modalTopSpacing', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 2. Header Top Spacing (inside card nav padding) */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Header Top Spacing</span>
              <span className="text-emerald-400 font-bold">{settings.modalNavTopSpacing}px</span>
            </div>
            <input
              type="range"
              min={4}
              max={48}
              step={2}
              value={settings.modalNavTopSpacing}
              onChange={(e) => handleChange('modalNavTopSpacing', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 3. Side Spacing */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Side Spacing</span>
              <span className="text-emerald-400 font-bold">{settings.modalSideSpacing}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={96}
              step={2}
              value={settings.modalSideSpacing}
              onChange={(e) => handleChange('modalSideSpacing', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 4. Content Gap Below Header */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Content Top Gap</span>
              <span className="text-emerald-400 font-bold">{settings.modalHeaderGap}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              step={2}
              value={settings.modalHeaderGap}
              onChange={(e) => handleChange('modalHeaderGap', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 5. Title Size */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Title Size</span>
              <span className="text-emerald-400 font-bold">{settings.modalTitleSize}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={56}
              step={1}
              value={settings.modalTitleSize}
              onChange={(e) => handleChange('modalTitleSize', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 6. Text Spacing (Title to Paragraph Gap) */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Text Spacing</span>
              <span className="text-emerald-400 font-bold">{settings.modalTitleGap}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={36}
              step={1}
              value={settings.modalTitleGap}
              onChange={(e) => handleChange('modalTitleGap', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 7. Overview to Bento Gap */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Text to Bento Gap</span>
              <span className="text-emerald-400 font-bold">{settings.modalOverviewGap}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={80}
              step={2}
              value={settings.modalOverviewGap}
              onChange={(e) => handleChange('modalOverviewGap', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 8. Bento Spacing (Column Gap) */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Bento Spacing</span>
              <span className="text-emerald-400 font-bold">{settings.modalGridGap}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={48}
              step={2}
              value={settings.modalGridGap}
              onChange={(e) => handleChange('modalGridGap', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 9. Bento Row Gap */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Bento Row Gap</span>
              <span className="text-emerald-400 font-bold">{settings.modalRowGap}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={60}
              step={2}
              value={settings.modalRowGap}
              onChange={(e) => handleChange('modalRowGap', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          {/* 10. Bento Roundness */}
          <div>
            <div className="flex justify-between items-center mb-1 font-mono text-xs">
              <span className="text-neutral-300">Bento Roundness</span>
              <span className="text-emerald-400 font-bold">{settings.modalMediaRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={56}
              step={2}
              value={settings.modalMediaRadius}
              onChange={(e) => handleChange('modalMediaRadius', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>
        </div>
      ) : (
        /* Direct JSON Editor */
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <p className="font-mono text-[11px] text-neutral-400">Edit values and click Apply JSON:</p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            className="w-full p-2.5 bg-black/60 border border-white/20 rounded-xl font-mono text-[11px] text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 flex-1 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApplyJson}
              className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded-lg transition"
            >
              Apply JSON
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs rounded-lg transition"
            >
              {copyFeedback ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono flex-shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="text-neutral-400 hover:text-white transition cursor-pointer"
        >
          Reset Defaults
        </button>
        <span className="text-neutral-500">Live preview active</span>
      </div>
    </div>
  );
}
