'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import HeroScatter from '@/components/HeroScatter';
import EditorialManifesto from '@/components/EditorialManifesto';
import ClientsStrip from '@/components/ClientsStrip';
import DisciplineDeck from '@/components/DisciplineDeck';
import BtsArcSection from '@/components/BtsArcSection';
import ServicesSection from '@/components/ServicesSection';
import ProcessSection from '@/components/ProcessSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FaqSection from '@/components/FaqSection';
import StatementBridge from '@/components/StatementBridge';
import Contact from '@/components/Contact';
import CaseModal from '@/components/CaseModal';
import CustomCursor from '@/components/CustomCursor';
import {
  getStoredCanvasFiles,
  getStoredCanvasFilesAsync,
  subscribeToCanvasUpdates,
  DynamicCanvasFile,
} from '@/lib/contentStore';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<DynamicCanvasFile[]>([]);

  const loadUploads = useCallback(async () => {
    // 1. Sync load from localStorage for instant initial paint
    const syncFiles = getStoredCanvasFiles();
    if (syncFiles && syncFiles.length > 0) {
      setUploadedFiles(syncFiles);
    }
    // 2. Full-fidelity async load from IndexedDB (contains all 38+ pictures)
    try {
      const idbFiles = await getStoredCanvasFilesAsync();
      if (idbFiles && idbFiles.length > 0) {
        setUploadedFiles(idbFiles);
      }
    } catch (err) {
      console.warn('Could not load async files on home:', err);
    }
  }, []);

  useEffect(() => {
    loadUploads();
    const unsubscribe = subscribeToCanvasUpdates(() => {
      loadUploads();
    });
    return () => unsubscribe();
  }, [loadUploads]);

  // Flatten all photos uploaded across all campaigns
  const userPhotos = useMemo(() => {
    const photos: string[] = [];
    uploadedFiles.forEach((file) => {
      if (file.photos && file.photos.length > 0) {
        photos.push(...file.photos);
      } else if (file.img) {
        photos.push(file.img);
      }
    });
    return photos;
  }, [uploadedFiles]);

  const handleShutterFinish = useCallback(() => {
    setIsIntroDone(true);
  }, []);

  useEffect(() => {
    // Check if intro was already played this session
    const introDoneThisSession = typeof window !== 'undefined' && sessionStorage.getItem('moiz_intro_done') === 'true';

    if (introDoneThisSession && !isIntroDone) {
      setIsIntroDone(true);
      return;
    }

    if (isIntroDone && typeof window !== 'undefined') {
      sessionStorage.setItem('moiz_intro_done', 'true');
    }
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
        onShutterFinish={handleShutterFinish}
        userPhotos={userPhotos}
        uploadedFiles={uploadedFiles}
      />

      {/* Section 01.5: Editorial Manifesto Strip */}
      <EditorialManifesto userPhotos={userPhotos} />

      {/* Section 01.8: Collaborated Companies & Clients B&W Logo Marquee */}
      <ClientsStrip />

      {/* Section 01.85: 3D Curved Arc BTS & Direction Reels (Upper from deck) */}
      <BtsArcSection
        onOpenCase={setSelectedCase}
        uploadedFiles={uploadedFiles}
      />

      {/* Section 01.9: Interactive Discipline Cards Deck (Hover Lift & Shuffle) */}
      <DisciplineDeck />

      {/* Section 02: Services (01 - 05 Wide Table) */}
      <ServicesSection />

      {/* Section 02.5: Approach (01 - 03 Phases) */}
      <ProcessSection />

      {/* Section 02.8: Endorsements & Testimonials (Watermark + Floating Cards) */}
      <TestimonialsSection />

      {/* Section 03: Frequently Asked (01 - 06 + Cobalt Ribbon) */}
      <FaqSection />

      {/* Section 03.5: Statement Bridge */}
      <StatementBridge />

      {/* Section 04: Direct Inquiries & Contact with 1-Click Clipboard Feedback */}
      <Contact />

      {/* Case Study Modal */}
      <CaseModal
        projectId={selectedCase}
        onClose={() => setSelectedCase(null)}
        uploadedFiles={uploadedFiles}
        userPhotos={userPhotos}
      />
    </main>
  );
}
