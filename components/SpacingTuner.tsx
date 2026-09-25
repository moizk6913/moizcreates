'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SpacingSettings {
  // 1. MANIFESTO ("I FIX THINGS THAT WERE / ALREADY APPROVED.")
  heroToManifesto: number; // Space above Manifesto
  manifestoLineGap: number; // Line spacing between Line 1 and Line 2
  manifestoToWork: number; // Space below Manifesto to Work Bento

  // 2. WORK BENTO & BRAND MARQUEE
  gridGap: number; // Bento lane gap
  workToReferences: number; // Space above logos (Work → Brand Logos)
  referencesBottom: number; // Space below logos (Brand Logos → "WHAT I DO")
  referencesLogoGap: number; // Horizontal gap between logos in marquee

  // 3. SERVICES ("WHAT I DO")
  servicesHeaderGap: number; // Gap between "WHAT I DO" title and "01 ART DIRECTION"
  serviceRowPadding: number; // Vertical padding for each service row (01–05)
  servicesTop: number;
  servicesBottom: number;

  // 4. PROCESS ("HOW I GET THERE")
  processHeaderGap: number;
  processGridGap: number;
  processTop: number;
  processBottom: number;

  // 5. TESTIMONIALS ("PEOPLE I'VE WORKED WITH")
  testimonialsHeaderGap: number;
  testimonialsTop: number;
  testimonialsBottom: number;

  // 6. FAQ ("FREQUENTLY ASKED")
  faqHeaderGap: number;
  faqRowPadding: number;
  faqTop: number;
  faqBottom: number;

  // 7. STATEMENT BRIDGE & FOOTER
  ctaPadding: number;
  statementLineGap: number;
  footerTop: number;

  // 8. CASE MODAL & DELIVERABLES (CANVAS)
  modalCardPadding: number; // Brand Overview Card Padding
  modalCardRadius: number; // Brand Overview Card Roundness
  modalMediaRadius: number; // Deliverables Media Cards Roundness
  modalGridGap: number; // Deliverables Grid Gap
  modalTitleGap: number; // Brand Name to Paragraph Gap
}

export const DEFAULT_SPACING: SpacingSettings = {
  // Manifesto
  heroToManifesto: 24,
  manifestoLineGap: 0,
  manifestoToWork: 144,

  // Work & References
  gridGap: 34,
  workToReferences: 160,
  referencesBottom: 124,
  referencesLogoGap: 80,

  // Services
  servicesHeaderGap: 124,
  serviceRowPadding: 24,
  servicesTop: 64,
  servicesBottom: 52,

  // Process
  processHeaderGap: 86,
  processGridGap: 44,
  processTop: 88,
  processBottom: 56,

  // Testimonials
  testimonialsHeaderGap: 126,
  testimonialsTop: 104,
  testimonialsBottom: 56,

  // FAQ
  faqHeaderGap: 54,
  faqRowPadding: 24,
  faqTop: 132,
  faqBottom: 80,

  // CTA & Footer
  ctaPadding: 200,
  statementLineGap: 28,
  footerTop: 56,

  // Case Modal
  modalCardPadding: 32,
  modalCardRadius: 40,
  modalMediaRadius: 28,
  modalGridGap: 10,
  modalTitleGap: 10,
};

const STORAGE_KEY = 'moiz_spacing_custom_v6';

type SectionTab =
  | 'manifesto'
  | 'work-marquee'
  | 'services'
  | 'process'
  | 'testimonials'
  | 'faq'
  | 'cta-footer'
  | 'all';

export default function SpacingTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionTab>('manifesto');
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [settings, setSettings] = useState<SpacingSettings>(DEFAULT_SPACING);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const applyToDOM = useCallback((cfg: SpacingSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Manifesto
    root.style.setProperty('--hero-to-manifesto', `${cfg.heroToManifesto}px`);
    root.style.setProperty('--manifesto-line-gap', `${cfg.manifestoLineGap}px`);
    root.style.setProperty('--manifesto-to-work', `${cfg.manifestoToWork}px`);

    // 2. Work & Brand Logos
    root.style.setProperty('--grid-gap', `${cfg.gridGap}px`);
    root.style.setProperty('--work-to-references', `${cfg.workToReferences}px`);
    root.style.setProperty('--references-bottom', `${cfg.referencesBottom}px`);
    root.style.setProperty('--references-logo-gap', `${cfg.referencesLogoGap ?? 80}px`);

    // 3. Services
    root.style.setProperty('--services-header-gap', `${cfg.servicesHeaderGap}px`);
    root.style.setProperty('--service-row-padding', `${cfg.serviceRowPadding}px`);
    root.style.setProperty('--services-top', `${cfg.servicesTop}px`);
    root.style.setProperty('--services-bottom', `${cfg.servicesBottom}px`);

    // 4. Process
    root.style.setProperty('--process-header-gap', `${cfg.processHeaderGap}px`);
    root.style.setProperty('--process-grid-gap', `${cfg.processGridGap}px`);
    root.style.setProperty('--process-top', `${cfg.processTop}px`);
    root.style.setProperty('--process-bottom', `${cfg.processBottom}px`);

    // 5. Testimonials
    root.style.setProperty('--testimonials-header-gap', `${cfg.testimonialsHeaderGap}px`);
    root.style.setProperty('--testimonials-top', `${cfg.testimonialsTop}px`);
    root.style.setProperty('--testimonials-bottom', `${cfg.testimonialsBottom}px`);

    // 6. FAQ
    root.style.setProperty('--faq-header-gap', `${cfg.faqHeaderGap}px`);
    root.style.setProperty('--faq-row-padding', `${cfg.faqRowPadding}px`);
    root.style.setProperty('--faq-top', `${cfg.faqTop}px`);
    root.style.setProperty('--faq-bottom', `${cfg.faqBottom}px`);

    // 7. CTA & Footer
    root.style.setProperty('--cta-padding', `${cfg.ctaPadding}px`);
    root.style.setProperty('--statement-line-gap', `${cfg.statementLineGap}px`);
    root.style.setProperty('--footer-top', `${cfg.footerTop}px`);

    // 8. Case Modal & Deliverables (Canvas)
    root.style.setProperty('--modal-card-padding', `${cfg.modalCardPadding ?? 32}px`);
    root.style.setProperty('--modal-card-radius', `${cfg.modalCardRadius ?? 40}px`);
    root.style.setProperty('--modal-media-radius', `${cfg.modalMediaRadius ?? 28}px`);
    root.style.setProperty('--modal-grid-gap', `${cfg.modalGridGap ?? 10}px`);
    root.style.setProperty('--modal-title-gap', `${cfg.modalTitleGap ?? 10}px`);
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
    const handleOpenCustom = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-spacing-tuner', handleOpenCustom);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-spacing-tuner', handleOpenCustom);
    };
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
          className="fixed bottom-6 left-6 z-[20000] group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/90 hover:bg-black text-white backdrop-blur-md font-mono text-[11px] font-bold tracking-wider uppercase shadow-[0_12px_36px_rgba(0,0,0,0.3)] ring-1 ring-white/20 transition-all hover:scale-105 cursor-pointer"
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
          className={`fixed bottom-6 left-6 z-[20000] w-[360px] sm:w-[420px] max-h-[88vh] bg-[#141414]/95 backdrop-blur-xl text-white rounded-[28px] ring-1 ring-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 select-none ${
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

          {/* Section Navigation Tabs (Section-Wise in Page Order) */}
          {!isMinimized && (
            <div className="px-4 py-2.5 border-b border-white/10 bg-black/30 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {(
                [
                  { id: 'manifesto', label: 'Manifesto', sectionId: 'manifesto' },
                  { id: 'work-marquee', label: 'Work & Logos', sectionId: 'visual-references' },
                  { id: 'services', label: 'Services', sectionId: 'services' },
                  { id: 'process', label: 'Process', sectionId: 'approach' },
                  { id: 'testimonials', label: 'Testimonials', sectionId: 'testimonials' },
                  { id: 'faq', label: 'FAQ', sectionId: 'faq' },
                  { id: 'cta-footer', label: 'CTA & Footer', sectionId: 'contact' },
                  { id: 'all', label: 'All Sections' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if ('sectionId' in tab && tab.sectionId && typeof document !== 'undefined') {
                      const el = document.getElementById(tab.sectionId);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }
                  }}
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

                {/* 1. MANIFESTO SECTION (Image 1 in User Screenshot) */}
                {(activeTab === 'manifesto' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                          MANIFESTO
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">&ldquo;I FIX THINGS...&rdquo;</span>
                    </div>

                    {/* Prominent Control: Manifesto Line Spacing */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-white font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Line Spacing (Line 1 &rarr; Line 2)
                        </span>
                        <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                          {settings.manifestoLineGap}px
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-300 leading-tight">
                        Gap between &ldquo;I FIX THINGS THAT WERE&rdquo; and &ldquo;ALREADY APPROVED.&rdquo;
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={80}
                        step={2}
                        value={settings.manifestoLineGap}
                        onChange={(e) => handleChange('manifestoLineGap', Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-1"
                      />
                    </div>

                    {/* Space Above Manifesto */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Above (Hero &rarr; Manifesto)</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.heroToManifesto}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={220}
                        step={2}
                        value={settings.heroToManifesto}
                        onChange={(e) => handleChange('heroToManifesto', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Space Below Manifesto */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Below (Manifesto &rarr; Work Bento)</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.manifestoToWork}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={260}
                        step={4}
                        value={settings.manifestoToWork}
                        onChange={(e) => handleChange('manifestoToWork', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 2. WORK BENTO & BRAND LOGOS (Image 2 in User Screenshot) */}
                {(activeTab === 'work-marquee' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                          WORK BENTO &amp; BRAND LOGOS
                        </span>
                      </div>
                    </div>

                    {/* Space Above Logos */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Above Logos (Work &rarr; Logos)</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.workToReferences}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={16}
                        max={240}
                        step={4}
                        value={settings.workToReferences}
                        onChange={(e) => handleChange('workToReferences', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Prominent Control: Space Below Logos to WHAT I DO */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-white font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Space Below Logos (Logos &rarr; &ldquo;WHAT I DO&rdquo;)
                        </span>
                        <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                          {settings.referencesBottom}px
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-300 leading-tight">
                        Controls distance between the client logo marquee and WHAT I DO title.
                      </p>
                      <input
                        type="range"
                        min={16}
                        max={240}
                        step={4}
                        value={settings.referencesBottom}
                        onChange={(e) => handleChange('referencesBottom', Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-1"
                      />
                    </div>

                    {/* Horizontal Gap Between Logos */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Horizontal Gap Between Logos</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.referencesLogoGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={24}
                        max={160}
                        step={4}
                        value={settings.referencesLogoGap}
                        onChange={(e) => handleChange('referencesLogoGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Work Bento Vertical Grid Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Work Bento Vertical Grid Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.gridGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={80}
                        step={2}
                        value={settings.gridGap}
                        onChange={(e) => handleChange('gridGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 3. SERVICES SECTION ("WHAT I DO") */}
                {(activeTab === 'services' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                          SERVICES: WHAT I DO
                        </span>
                      </div>
                    </div>

                    {/* WHAT I DO Title to 01-05 Gap */}
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-white/5 ring-1 ring-white/15">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-white font-bold">
                          &ldquo;WHAT I DO&rdquo; &rarr; 01-05 Table Gap
                        </span>
                        <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                          {settings.servicesHeaderGap}px
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        Pulls 01 ART DIRECTION closer or farther from the title.
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
                        <span className="text-neutral-300">Each Row Line Padding (01–05)</span>
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

                {/* 4. PROCESS SECTION ("HOW I GET THERE") */}
                {(activeTab === 'process' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        PROCESS: HOW I GET THERE
                      </span>
                    </div>

                    {/* Process Title to Cards Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Title &rarr; Process Cards Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.processHeaderGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={160}
                        step={4}
                        value={settings.processHeaderGap}
                        onChange={(e) => handleChange('processHeaderGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Process 3-Column Grid Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">3-Column Grid Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.processGridGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={16}
                        max={80}
                        step={2}
                        value={settings.processGridGap}
                        onChange={(e) => handleChange('processGridGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Space Above Process */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Above Process</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.processTop}px
                        </span>
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

                    {/* Space Below Process */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Below Process</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.processBottom}px
                        </span>
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
                )}

                {/* 5. TESTIMONIALS SECTION ("PEOPLE I'VE WORKED WITH") */}
                {(activeTab === 'testimonials' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        TESTIMONIALS
                      </span>
                    </div>

                    {/* Testimonials Header Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Title &rarr; Cards Marquee Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.testimonialsHeaderGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={160}
                        step={4}
                        value={settings.testimonialsHeaderGap}
                        onChange={(e) => handleChange('testimonialsHeaderGap', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Space Above Testimonials */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Above Testimonials</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.testimonialsTop}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={200}
                        step={4}
                        value={settings.testimonialsTop}
                        onChange={(e) => handleChange('testimonialsTop', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    {/* Space Below Testimonials */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Space Below Testimonials</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.testimonialsBottom}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={180}
                        step={4}
                        value={settings.testimonialsBottom}
                        onChange={(e) => handleChange('testimonialsBottom', Number(e.target.value))}
                        className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* 6. FAQ SECTION ("FREQUENTLY ASKED") */}
                {(activeTab === 'faq' || activeTab === 'all') && (
                  <div className="space-y-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-white">
                        FAQ: FREQUENTLY ASKED
                      </span>
                    </div>

                    {/* FAQ Header Gap */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-neutral-300">Title &rarr; Questions Gap</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {settings.faqHeaderGap}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={16}
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

                {/* 7. CTA & FOOTER */}
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
