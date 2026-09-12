'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import HeroScatter from '@/components/HeroScatter';
import EditorialManifesto from '@/components/EditorialManifesto';
import BtsArcSection from '@/components/BtsArcSection';
import ClientsStrip from '@/components/ClientsStrip';
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
  purgeMockAndCaldharProjectsAsync,
} from '@/lib/contentStore';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<DynamicCanvasFile[]>([]);

  const loadUploads = useCallback(async () => {
    try {
      await purgeMockAndCaldharProjectsAsync();
    } catch {}
    const syncFiles = getStoredCanvasFiles();
    if (syncFiles && syncFiles.length > 0) {
      setUploadedFiles(syncFiles);
    }
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

  useEffect(() => {
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
      {/* Custom Luxury Fluid Cursor */}
      <CustomCursor />

      {/* Header Nav (WORK, PLAYGROUND, Center Logo, ARCHIVE, ABOUT, CONTACT in BN Cringe Sans) */}
      <Header visible={true} />

      {/* Section 01: Hero Center Scatter & Shutter Pop */}
      <HeroScatter
        onOpenCase={setSelectedCase}
        uploadedFiles={uploadedFiles}
        userPhotos={userPhotos}
      />

      {/* Section 01.5: Editorial Manifesto */}
      <EditorialManifesto userPhotos={userPhotos} />

      {/* Section 02: Work Showcase (3D Curved Arc Bento Reels & Campaigns) */}
      <BtsArcSection
        onOpenCase={setSelectedCase}
        uploadedFiles={uploadedFiles}
      />

      {/* Section 02.2: Collaborated Brands & Clients B&W Marquee */}
      <ClientsStrip />

      {/* Section 03: Services (01 Art Direction ... 05 Creative Strategy) */}
      <ServicesSection />

      {/* Section 04: Process / Approach (Research, Direct, Deliver with Star Glyphs) */}
      <ProcessSection />

      {/* Section 05: Testimonials (Line-Free Floating Cards with Red Verified Badges) */}
      <TestimonialsSection />

      {/* Section 06: Frequently Asked Questions (Line-Free Accordion) */}
      <FaqSection />

      {/* Section 07: Statement Bridge */}
      <StatementBridge />

      {/* Section 08: Direct Inquiries & Contact (1-Click Clipboard Feedback) */}
      <Contact />

      {/* Case Study Modal (Apple-Style Roundness, 4-Col Archived Frames, Asymmetric Bento End Part) */}
      <CaseModal
        projectId={selectedCase}
        onClose={() => setSelectedCase(null)}
        uploadedFiles={uploadedFiles}
        userPhotos={userPhotos}
      />
    </main>
  );
}
