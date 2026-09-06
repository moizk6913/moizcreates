'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroScatter from '@/components/HeroScatter';
import EditorialManifesto from '@/components/EditorialManifesto';
import ClientsStrip from '@/components/ClientsStrip';
import DisciplineDeck from '@/components/DisciplineDeck';
import BtsArcSection from '@/components/BtsArcSection';
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

      {/* Section 01.85: 3D Curved Arc BTS & Direction Reels (Upper from deck) */}
      <BtsArcSection onOpenCase={setSelectedCase} />

      {/* Section 01.9: Interactive Discipline Cards Deck (Hover Lift & Shuffle) */}
      <DisciplineDeck />

      {/* Section 04: Direct Inquiries & Contact */}
      <Contact />


      {/* Case Study Modal */}
      <CaseModal projectId={selectedCase} onClose={() => setSelectedCase(null)} />
    </main>
  );
}
