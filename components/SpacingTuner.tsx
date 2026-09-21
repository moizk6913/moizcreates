'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SpacingSettings {
  heroToManifesto: number;
  manifestoToWork: number;
  workToReferences: number;
  referencesBottom: number;
  sectionTop: number;
  sectionBottom: number;
  headerToContent: number;
  gridGap: number;
  faqTop: number;
  ctaPadding: number;
  footerTop: number;
}

export const DEFAULT_SPACING: SpacingSettings = {
  heroToManifesto: 120,
  manifestoToWork: 64,
  workToReferences: 80,
  referencesBottom: 72,
  sectionTop: 96,
  sectionBottom: 96,
  headerToContent: 64,
  gridGap: 24,
  faqTop: 88,
  ctaPadding: 120,
  footerTop: 64,
};

const STORAGE_KEY = 'moiz_spacing_custom_v1';

export default function SpacingTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<SpacingSettings>(DEFAULT_SPACING);

  const applyToDOM = useCallback((cfg: SpacingSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--hero-to-manifesto', `${cfg.heroToManifesto}px`);
    root.style.setProperty('--manifesto-to-work', `${cfg.manifestoToWork}px`);
    root.style.setProperty('--work-to-references', `${cfg.workToReferences}px`);
    root.style.setProperty('--references-bottom', `${cfg.referencesBottom}px`);
    root.style.setProperty('--section-top', `${cfg.sectionTop}px`);
    root.style.setProperty('--section-bottom', `${cfg.sectionBottom}px`);
    root.style.setProperty('--header-to-content', `${cfg.headerToContent}px`);
    root.style.setProperty('--grid-gap', `${cfg.gridGap}px`);
    root.style.setProperty('--faq-top', `${cfg.faqTop}px`);
    root.style.setProperty('--cta-padding', `${cfg.ctaPadding}px`);
    root.style.setProperty('--footer-top', `${cfg.footerTop}px`);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_SPACING, ...parsed };
        setSettings(merged);
        applyToDOM(merged);
      } else {
        applyToDOM(DEFAULT_SPACING);
      }
    } catch {
      applyToDOM(DEFAULT_SPACING);
    }
  }, [applyToDOM]);

  // Keyboard shortcut: Shift + S to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'S' || e.key === 's') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (key: keyof SpacingSettings, value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    applyToDOM(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleReset = () => {
    setSettings(DEFAULT_SPACING);
    applyToDOM(DEFAULT_SPACING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const handleCopy = () => {
    const text = JSON.stringify(settings, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill (Fixed in Bottom-Left Corner) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Open Live Spacing Tuner (or press Shift + S)"
          className="fixed bottom-6 left-6 z-50 group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/90 hover:bg-black text-white backdrop-blur-md font-mono text-[11px] font-bold tracking-wider uppercase shadow-[0_12px_36px_rgba(0,0,0,0.3)] ring-1 ring-white/20 transition-all hover:scale-105 cursor-pointer"
        >
          <span className="text-sm">🎚️</span>
          <span>SPACING TUNER</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-neutral-200">
            ⇧S
          </span>
        </button>
      )}

      {/* Slide-out Live Tuner Drawer */}
      {isOpen && (
        <aside
          aria-label="Live Spacing Tuner"
          className={`fixed bottom-6 left-6 z-50 w-[340px] sm:w-[380px] max-h-[85vh] bg-[#141414]/95 backdrop-blur-xl text-white rounded-[28px] ring-1 ring-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 select-none ${
            isMinimized ? 'h-auto' : ''
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">🎚️</span>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                SPACING TUNER
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '□' : '−'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Sliders Body (Scrollable) */}
              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)] text-xs">
                <p className="font-sans text-[11px] text-neutral-400 pb-1">
                  Drag any slider to adjust the live website in real-time. Changes are automatically saved.
                </p>

                {/* 1. Hero to Manifesto */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Hero → Manifesto</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.heroToManifesto}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={240}
                    step={4}
                    value={settings.heroToManifesto}
                    onChange={(e) => handleChange('heroToManifesto', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 2. Manifesto to Work */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Manifesto → Work Grid</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.manifestoToWork}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={180}
                    step={4}
                    value={settings.manifestoToWork}
                    onChange={(e) => handleChange('manifestoToWork', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 3. Work to References */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Work → Visual References</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.workToReferences}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={160}
                    step={4}
                    value={settings.workToReferences}
                    onChange={(e) => handleChange('workToReferences', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 4. Section Spacing (Top) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Section Spacing (Top)</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.sectionTop}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={200}
                    step={4}
                    value={settings.sectionTop}
                    onChange={(e) => handleChange('sectionTop', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 5. Section Spacing (Bottom) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Section Spacing (Bottom)</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.sectionBottom}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={200}
                    step={4}
                    value={settings.sectionBottom}
                    onChange={(e) => handleChange('sectionBottom', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 6. Header to Content */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Header → Content Gap</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.headerToContent}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={140}
                    step={4}
                    value={settings.headerToContent}
                    onChange={(e) => handleChange('headerToContent', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 7. Grid Gap */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Process &amp; Bento Gap</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.gridGap}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={48}
                    step={2}
                    value={settings.gridGap}
                    onChange={(e) => handleChange('gridGap', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 8. Testimonials to FAQ */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Testimonials → FAQ Gap</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.faqTop}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={180}
                    step={4}
                    value={settings.faqTop}
                    onChange={(e) => handleChange('faqTop', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 9. CTA Padding */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">CTA Statement Padding</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.ctaPadding}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    step={4}
                    value={settings.ctaPadding}
                    onChange={(e) => handleChange('ctaPadding', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 10. Footer Top */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-neutral-300">Footer Top Space</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {settings.footerTop}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={140}
                    step={4}
                    value={settings.footerTop}
                    onChange={(e) => handleChange('footerTop', Number(e.target.value))}
                    className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between gap-2 shrink-0 bg-black/40">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {copied ? '✓ Copied!' : 'Copy Values'}
                </button>
              </div>
            </>
          )}
        </aside>
      )}
    </>
  );
}
