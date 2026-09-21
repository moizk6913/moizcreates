'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SpacingSettings {
  // Layer & Section Gaps
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
  // Line & Row Spacing (Every line/row breathing room)
  manifestoLineGap: number;
  serviceRowPadding: number;
  faqRowPadding: number;
  statementLineGap: number;
}

export const DEFAULT_SPACING: SpacingSettings = {
  heroToManifesto: 44,
  manifestoToWork: 156,
  workToReferences: 128,
  referencesBottom: 72,
  sectionTop: 148,
  sectionBottom: 56,
  headerToContent: 128,
  gridGap: 34,
  faqTop: 180,
  ctaPadding: 200,
  footerTop: 56,
  manifestoLineGap: 28,
  serviceRowPadding: 28,
  faqRowPadding: 28,
  statementLineGap: 28,
};

const STORAGE_KEY = 'moiz_spacing_custom_v1';

export default function SpacingTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [settings, setSettings] = useState<SpacingSettings>(DEFAULT_SPACING);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    root.style.setProperty('--manifesto-line-gap', `${cfg.manifestoLineGap}px`);
    root.style.setProperty('--service-row-padding', `${cfg.serviceRowPadding}px`);
    root.style.setProperty('--faq-row-padding', `${cfg.faqRowPadding}px`);
    root.style.setProperty('--statement-line-gap', `${cfg.statementLineGap}px`);
  }, []);

  const syncToServer = useCallback(async (cfg: SpacingSettings) => {
    try {
      setSyncStatus('saving');
      await fetch('/api/spacing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2500);
    } catch {
      setSyncStatus('idle');
    }
  }, []);

  // Load from localStorage or API on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged = { ...DEFAULT_SPACING, ...parsed };
          setSettings(merged);
          applyToDOM(merged);
          // Sync existing localStorage values to backend disk file
          syncToServer(merged);
          return;
        }

        // If no localStorage, check if /api/spacing has a saved config
        const res = await fetch('/api/spacing');
        if (res.ok) {
          const data = await res.json();
          if (data?.config) {
            const merged = { ...DEFAULT_SPACING, ...data.config };
            setSettings(merged);
            applyToDOM(merged);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return;
          }
        }

        applyToDOM(DEFAULT_SPACING);
      } catch {
        applyToDOM(DEFAULT_SPACING);
      }
    }

    loadInitial();
  }, [applyToDOM, syncToServer]);

  // Keyboard shortcut: Shift + S to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.shiftKey &&
        (e.key === 'S' || e.key === 's') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
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

    // Debounce server file write (400ms)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      syncToServer(updated);
    }, 400);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SPACING);
    applyToDOM(DEFAULT_SPACING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    syncToServer(DEFAULT_SPACING);
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
          className={`fixed bottom-6 left-6 z-50 w-[350px] sm:w-[400px] max-h-[85vh] bg-[#141414]/95 backdrop-blur-xl text-white rounded-[28px] ring-1 ring-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 select-none ${
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
              {syncStatus === 'saving' && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 animate-pulse">
                  SAVING...
                </span>
              )}
              {syncStatus === 'saved' && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  ✓ SAVED TO FILE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                {isMinimized ? '□' : '−'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Tuner (Shift + S)"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs custom-scrollbar">
                
                {/* CATEGORY 1: LINE & ROW SPACING (Every line has breathing room) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      1. LINE &amp; ROW SPACING
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">BREATHING ROOM</span>
                  </div>

                  {/* Manifesto Text Lines */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-neutral-300">Manifesto Text Lines Gap</span>
                      <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {settings.manifestoLineGap}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={64}
                      step={2}
                      value={settings.manifestoLineGap}
                      onChange={(e) => handleChange('manifestoLineGap', Number(e.target.value))}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Services Row Padding */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-neutral-300">Services Row Padding (Each Line)</span>
                      <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {settings.serviceRowPadding}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={2}
                      value={settings.serviceRowPadding}
                      onChange={(e) => handleChange('serviceRowPadding', Number(e.target.value))}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* FAQ Row Padding */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-neutral-300">FAQ Question Padding (Each Line)</span>
                      <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {settings.faqRowPadding}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={2}
                      value={settings.faqRowPadding}
                      onChange={(e) => handleChange('faqRowPadding', Number(e.target.value))}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Statement Bridge Lines */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-neutral-300">Statement Bridge Text Lines</span>
                      <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {settings.statementLineGap}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={64}
                      step={2}
                      value={settings.statementLineGap}
                      onChange={(e) => handleChange('statementLineGap', Number(e.target.value))}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {/* CATEGORY 2: SECTION & LAYER GAPS */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      2. SECTION &amp; LAYER TRANSITIONS
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">VERTICAL FLOW</span>
                  </div>

                  {/* Hero to Manifesto */}
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

                  {/* Manifesto to Work */}
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

                  {/* Work to References */}
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

                  {/* Section Spacing (Top) */}
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

                  {/* Section Spacing (Bottom) */}
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

                  {/* Header to Content */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-neutral-300">Header Title → Content Gap</span>
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

                  {/* Grid Gap */}
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

                  {/* Testimonials to FAQ */}
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

                  {/* CTA Padding */}
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

                  {/* Footer Top */}
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => syncToServer(settings)}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-mono uppercase tracking-wider text-white transition-colors cursor-pointer"
                  >
                    💾 Save to File
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {copied ? '✓ Copied!' : 'Copy Values'}
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      )}
    </>
  );
}
