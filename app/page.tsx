'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroScatter from '@/components/HeroScatter';
import EditorialManifesto from '@/components/EditorialManifesto';
import ClientsStrip from '@/components/ClientsStrip';
import DisciplineDeck from '@/components/DisciplineDeck';
import BtsArcSection from '@/components/BtsArcSection';
import About from '@/components/About';
import Contact from '@/components/Contact';
import CaseModal from '@/components/CaseModal';

import CustomCursor from '@/components/CustomCursor';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [isIntroDone, setIsIntroDone] = useState(false);

  useEffect(() => {
    if (!isIntroDone) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isIntroDone]);

  return (
    <main className="relative min-h-screen bg-canvas">
      {/* Custom Luxury Magnetic Fluid Cursor */}
      <CustomCursor />

      {/* Header (Hidden during initial shutter, fades in smoothly) */}
      <Header visible={isIntroDone} />

      {/* Section 01: Hero Center Shutter & Tight Overlapping Cluster */}
      <HeroScatter
        onOpenCase={setSelectedCase}
        onShutterFinish={() => setIsIntroDone(true)}
      />

      {/* Section 01.5: Editorial Manifesto Strip */}
      <EditorialManifesto />

      {/* Section 01.8: Collaborated Companies & Clients B&W Logo Marquee */}
      <ClientsStrip />

      {/* Section 01.9: Interactive Discipline Cards Deck (Hover Lift & Shuffle) */}
      <DisciplineDeck />

      {/* Section 02: 3D Curved Arc BTS & Direction Reels */}
      <BtsArcSection />

      {/* Section 03: About Director Profile */}
      <About />

      {/* Section 04: Direct Inquiries & Contact */}
      <Contact />

      {/* Clean Footer */}
      <footer className="w-full py-8 bg-canvas">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center text-xs font-mono text-muted">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="Logo"
              width={18}
              height={18}
              className="h-4 w-auto object-contain"
            />
            <span>&copy; 2026. All rights reserved.</span>
          </div>
          <div>DUBAI / WORLDWIDE</div>
        </div>
      </footer>

      {/* Case Study Modal */}
      <CaseModal projectId={selectedCase} onClose={() => setSelectedCase(null)} />
    </main>
  );
}
