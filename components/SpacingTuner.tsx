'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SpacingSettings {
  // 1. SERVICES ("WHAT I DO")
  servicesHeaderGap: number; // Gap between "WHAT I DO" title and "01 ART DIRECTION"
  serviceRowPadding: number; // Vertical padding for each service row (01, 02, 03, 04)
  servicesTop: number;
  servicesBottom: number;

  // 2. PROCESS ("HOW I GET THERE")
  processHeaderGap: number;
  processGridGap: number;
  processTop: number;
  processBottom: number;

  // 3. TESTIMONIALS ("PEOPLE I'VE WORKED WITH")
  testimonialsHeaderGap: number;
  testimonialsTop: number;
  testimonialsBottom: number;

  // 4. FAQ ("FREQUENTLY ASKED")
  faqHeaderGap: number;
  faqRowPadding: number;
  faqTop: number;
  faqBottom: number;

  // 5. HERO & MANIFESTO
  heroToManifesto: number;
  manifestoLineGap: number;
  manifestoToWork: number;

  // 6. WORK & BRAND REFERENCES
  gridGap: number;
  workToReferences: number;
  referencesBottom: number;

  // 7. STATEMENT BRIDGE & FOOTER
  ctaPadding: number;
  statementLineGap: number;
  footerTop: number;
}

export const DEFAULT_SPACING: SpacingSettings = {
  // Services: calibrated with a tight, intentional gap between "WHAT I DO" and "01"
  servicesHeaderGap: 36,
  serviceRowPadding: 28,
  servicesTop: 80,
  servicesBottom: 56,

  // Process
  processHeaderGap: 48,
  processGridGap: 34,
  processTop: 80,
  processBottom: 56,

  // Testimonials
  testimonialsHeaderGap: 48,
  testimonialsTop: 80,
  testimonialsBottom: 56,

  // FAQ
  faqHeaderGap: 48,
  faqRowPadding: 28,
  faqTop: 140,
  faqBottom: 80,

  // Hero & Manifesto
  heroToManifesto: 44,
  manifestoLineGap: 28,
  manifestoToWork: 156,

  // Work & References
  gridGap: 34,
  workToReferences: 128,
  referencesBottom: 72,

  // CTA & Footer
  ctaPadding: 200,
  statementLineGap: 28,
  footerTop: 56,
};

const STORAGE_KEY = 'moiz_spacing_custom_v2';

type SectionTab = 'all' | 'services' | 'process' | 'testimonials' | 'faq' | 'hero-work' | 'cta-footer';

export default function SpacingTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionTab>('services');
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [settings, setSettings] = useState<SpacingSettings>(DEFAULT_SPACING);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const applyToDOM = useCallback((cfg: SpacingSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Services
    root.style.setProperty('--services-header-gap', `${cfg.servicesHeaderGap}px`);
    root.style.setProperty('--service-row-padding', `${cfg.serviceRowPadding}px`);
    root.style.setProperty('--services-top', `${cfg.servicesTop}px`);
    root.style.setProperty('--services-bottom', `${cfg.servicesBottom}px`);

    // Process
    root.style.setProperty('--process-header-gap', `${cfg.processHeaderGap}px`);
    root.style.setProperty('--process-grid-gap', `${cfg.processGridGap}px`);
    root.style.setProperty('--process-top', `${cfg.processTop}px`);
    root.style.setProperty('--process-bottom', `${cfg.processBottom}px`);

    // Testimonials
    root.style.setProperty('--testimonials-header-gap', `${cfg.testimonialsHeaderGap}px`);
    root.style.setProperty('--testimonials-top', `${cfg.testimonialsTop}px`);
    root.style.setProperty('--testimonials-bottom', `${cfg.testimonialsBottom}px`);

    // FAQ
    root.style.setProperty('--faq-header-gap', `${cfg.faqHeaderGap}px`);
    root.style.setProperty('--faq-row-padding', `${cfg.faqRowPadding}px`);
    root.style.setProperty('--faq-top', `${cfg.faqTop}px`);
    root.style.setProperty('--faq-bottom', `${cfg.faqBottom}px`);

    // Hero & Manifesto
    root.style.setProperty('--hero-to-manifesto', `${cfg.heroToManifesto}px`);
    root.style.setProperty('--manifesto-line-gap', `${cfg.manifestoLineGap}px`);
    root.style.setProperty('--manifesto-to-work', `${cfg.manifestoToWork}px`);

    // Work & References
    root.style.setProperty('--grid-gap', `${cfg.gridGap}px`);
    root.style.setProperty('--work-to-references', `${cfg.workToReferences}px`);
    root.style.setProperty('--references-bottom', `${cfg.referencesBottom}px`);

    // CTA & Footer
    root.style.setProperty('--cta-padding', `${cfg.ctaPadding}px`);
    root.style.setProperty('--statement-line-gap', `${cfg.statementLineGap}px`);
    root.style.setProperty('--footer-top', `${cfg.footerTop}px`);
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
          syncToServer(merged);
          return;
        }

        // Check if backend API has saved config
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
          className={`fixed bottom-6 left-6 z-50 w-[360px] sm:w-[420px] max-h-[88vh] bg-[#141414]/95 backdrop-blur-xl text-white rounded-[28px] ring-1 ring-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 select-none ${
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

          {/* Section Navigation Tabs (Section-Wise) */}
          {!isMinimized && (
            <div className="px-4 py-2.5 border-b border-white/10 bg-black/30 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {(
                [
                  { id: 'services', label: 'Services 01' },
                  { id: 'process', label: 'Process 02' },
                  { id: 'testimonials', label: 'Endorsements 03' },
                  { id: 'faq', label: 'FAQ 04' },
                  { id: 'hero-work', label: 'Hero & Work' },
                  { id: 'cta-footer', label: 'CTA & Footer' },
                  { id: 'all', label: 'All Sections' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Body Content */}
          {!isMinimized && (
            <>
              <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs custom-scrollbar">

                {/* 1. SERVICES SECTION ("WHAT I DO" + 01 to 04) */}
                {(activeTab === 'services' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                          SERVICES: WHAT I DO
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">01 / CAPABILITIES</span>
                    </div>

                    {/* The EXACT Control Requested: WHAT I DO Title to 01-04 Gap */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-white/5 ring-1 ring-white/15">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-white font-bold">
                          &ldquo;WHAT I DO&rdquo; → 01-04 Gap
                        </span>
                        <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                          {settings.servicesHeaderGap}px
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        Pulls 01 ART DIRECTION closer or farther from the title (your screenshot).
                      </p>
                      <input
                        type="range"
                        min={8}
                        max={140}
                        step={2}
                        value={settings.servicesHeaderGap}
                        onChange={(e) => handleChange('servicesHeaderGap', Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-1"
                      />
                    </div>

                    {/* Services Row Line Padding */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Each Row Line Padding (01–04)</span>
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

                    {/* Services Section Top */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Services Section Top Space</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.servicesTop}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={180}
                        step={4}
                        value={settings.servicesTop}
                        onChange={(e) => handleChange('servicesTop', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Services Section Bottom */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Services Section Bottom Space</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.servicesBottom}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={180}
                        step={4}
                        value={settings.servicesBottom}
                        onChange={(e) => handleChange('servicesBottom', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 2. PROCESS SECTION ("HOW I GET THERE") */}
                {(activeTab === 'process' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        PROCESS: HOW I GET THERE
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">02 / APPROACH</span>
                    </div>

                    {/* Process Title to Cards Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Title → Step Cards Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.processHeaderGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={140}
                        step={2}
                        value={settings.processHeaderGap}
                        onChange={(e) => handleChange('processHeaderGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Process Step Grid Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Between Step Cards (Grid Gap)</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.processGridGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={56}
                        step={2}
                        value={settings.processGridGap}
                        onChange={(e) => handleChange('processGridGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Process Top & Bottom */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span className="text-neutral-300">Top Space</span>
                          <span className="font-bold text-white">{settings.processTop}px</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={180}
                          step={4}
                          value={settings.processTop}
                          onChange={(e) => handleChange('processTop', Number(e.target.value))}
                          className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span className="text-neutral-300">Bottom Space</span>
                          <span className="font-bold text-white">{settings.processBottom}px</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={180}
                          step={4}
                          value={settings.processBottom}
                          onChange={(e) => handleChange('processBottom', Number(e.target.value))}
                          className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TESTIMONIALS SECTION ("PEOPLE I'VE WORKED WITH") */}
                {(activeTab === 'testimonials' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        TESTIMONIALS
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">03 / ENDORSEMENTS</span>
                    </div>

                    {/* Testimonials Title to Stream Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Title → Testimonials Stream Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.testimonialsHeaderGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={140}
                        step={2}
                        value={settings.testimonialsHeaderGap}
                        onChange={(e) => handleChange('testimonialsHeaderGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Testimonials Top Space */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Testimonials Top Space</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.testimonialsTop}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={180}
                        step={4}
                        value={settings.testimonialsTop}
                        onChange={(e) => handleChange('testimonialsTop', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 4. FAQ SECTION ("FREQUENTLY ASKED") */}
                {(activeTab === 'faq' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        FAQ: INQUIRIES
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">04 / QUESTIONS</span>
                    </div>

                    {/* FAQ Title to Questions Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Title → Questions Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.faqHeaderGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={140}
                        step={2}
                        value={settings.faqHeaderGap}
                        onChange={(e) => handleChange('faqHeaderGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* FAQ Question Padding */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Question Row Line Padding</span>
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

                    {/* Space Above FAQ */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Above FAQ</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.faqTop}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={220}
                        step={4}
                        value={settings.faqTop}
                        onChange={(e) => handleChange('faqTop', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 5. HERO & MANIFESTO & WORK */}
                {(activeTab === 'hero-work' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        HERO &amp; MANIFESTO &amp; WORK
                      </span>
                    </div>

                    {/* Hero to Manifesto */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Hero Scatter → Manifesto Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.heroToManifesto}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={220}
                        step={4}
                        value={settings.heroToManifesto}
                        onChange={(e) => handleChange('heroToManifesto', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
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

                    {/* Manifesto to Work */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Manifesto → Work Reels Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.manifestoToWork}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={200}
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
                        max={180}
                        step={4}
                        value={settings.workToReferences}
                        onChange={(e) => handleChange('workToReferences', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 6. CTA & FOOTER */}
                {(activeTab === 'cta-footer' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        CTA STATEMENT &amp; FOOTER
                      </span>
                    </div>

                    {/* CTA Statement Padding */}
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
                        max={240}
                        step={4}
                        value={settings.ctaPadding}
                        onChange={(e) => handleChange('ctaPadding', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Footer Top Space */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Footer Top Space</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.footerTop}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={140}
                        step={4}
                        value={settings.footerTop}
                        onChange={(e) => handleChange('footerTop', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

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
