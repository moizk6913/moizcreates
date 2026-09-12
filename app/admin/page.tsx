'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import {
  WorkItem,
  Project,
  Collection,
  SeriesGroup,
  MediaDimensions,
  getStoredWorksAsync,
  saveWorkAsync,
  saveWorksBatchAsync,
  deleteWorkAsync,
  deleteWorksBatchAsync,
  getStoredProjectsAsync,
  saveProjectAsync,
  deleteProjectAsync,
  getStoredCollectionsAsync,
  saveCollectionAsync,
  deleteCollectionAsync,
  getStoredSeriesAsync,
  saveSeriesAsync,
  deleteSeriesAsync,
  filterWorks,
  getStoredApiKey,
  saveApiKey,
  getStoredSeoConfig,
  saveSeoConfig,
  SeoConfig,
  getStoredBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  clearAllArchiveDataAsync,
  purgeMockAndCaldharProjectsAsync,
} from '@/lib/contentStore';
import { BlogPost } from '@/lib/blogData';

type AdminView = 'all_work' | 'projects' | 'single_project' | 'collections' | 'journal' | 'settings';

// ==========================================
// CLIENT-SIDE ASSET INSPECTOR (AUTO-DETECTS DIMENSIONS & RATIOS)
// ==========================================

interface InspectedAsset {
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
  mediaType: 'image' | 'video';
  dataUrl: string;
  thumbnailUrl: string;
  dimensions: MediaDimensions;
  title: string;
  workType: string;
  disciplines: string[];
  tags: string[];
  projectId: string | null;
  seriesId: string | null;
  suggestedProjectName?: string | null;
  projectConfidence?: number;
}

const COMMON_WORK_TYPES = [
  'Reel',
  'Lookbook Frame',
  'Advertisement',
  'Branding',
  'Photography',
  'Print Artwork',
  'Horizontal Video',
  'Social Design',
  'Poster',
  'Motion Graphic',
  'Campaign Visual',
];

const DISCIPLINE_PRESETS = [
  'Art Direction',
  'Motion',
  'Branding',
  'Editorial',
  'Photography',
  'Cinematography',
  'Creative Strategy',
  'Packaging',
];

const inspectMediaFile = (file: File): Promise<InspectedAsset> => {
  return new Promise((resolve) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
    const cleanTitle = file.name
      .replace(/\.[a-zA-Z0-9]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const objUrl = URL.createObjectURL(file);
      video.src = objUrl;

      const finishVideo = (w: number, h: number, dur: number, posterUrl: string, fullDataUrl: string) => {
        URL.revokeObjectURL(objUrl);
        const orientation: MediaDimensions['orientation'] =
          h > w * 1.1 ? 'vertical' : w > h * 1.1 ? 'horizontal' : 'square';
        let aspectRatio = orientation === 'vertical' ? '9:16' : '16:9';
        if (Math.abs(w / h - 1) < 0.1) aspectRatio = '1:1';

        resolve({
          file,
          fileName: file.name,
          fileType: file.type || 'video/mp4',
          fileSize: file.size,
          mediaType: 'video',
          dataUrl: fullDataUrl,
          thumbnailUrl: posterUrl,
          dimensions: {
            width: w,
            height: h,
            aspectRatio,
            orientation,
            duration: Math.round(dur),
            resolution: `${w}x${h}`,
            fileSize: file.size,
          },
          title: cleanTitle,
          workType: orientation === 'vertical' ? 'Reel' : 'Horizontal Video',
          disciplines: ['Motion', 'Art Direction'],
          tags: [cleanTitle.split(' ')[0] || 'Studio'],
          projectId: null,
          seriesId: null,
        });
      };

      video.onloadedmetadata = () => {
        const w = video.videoWidth || 1920;
        const h = video.videoHeight || 1080;
        const dur = video.duration || 10;

        video.currentTime = Math.min(0.5, dur / 2);
        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(w, 640);
            canvas.height = Math.round((canvas.width * h) / w);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const poster = canvas.toDataURL('image/jpeg', 0.85);
              finishVideo(w, h, dur, poster, objUrl);
              return;
            }
          } catch {}
          finishVideo(w, h, dur, '', objUrl);
        };
      };

      video.onerror = () => {
        finishVideo(1920, 1080, 15, '', objUrl);
      };
      return;
    }

    // Image inspection
    const reader = new FileReader();
    reader.onload = (e) => {
      const fullData = (e.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 1920;
        const h = img.naturalHeight || 1080;
        const orientation: MediaDimensions['orientation'] =
          h > w * 1.15 ? 'vertical' : w > h * 1.8 ? 'panoramic' : w > h * 1.15 ? 'horizontal' : 'square';

        let aspectRatio = '16:10';
        const ratio = w / h;
        if (Math.abs(ratio - 9 / 16) < 0.12) aspectRatio = '9:16';
        else if (Math.abs(ratio - 4 / 5) < 0.12) aspectRatio = '4:5';
        else if (Math.abs(ratio - 1) < 0.12) aspectRatio = '1:1';
        else if (Math.abs(ratio - 16 / 9) < 0.12) aspectRatio = '16:9';

        const maxDim = 2560;
        let finalData = fullData;
        let thumbData = fullData;

        try {
          const thumbCanvas = document.createElement('canvas');
          const thumbW = Math.min(w, 640);
          const thumbH = Math.round((thumbW * h) / w);
          thumbCanvas.width = thumbW;
          thumbCanvas.height = thumbH;
          const tCtx = thumbCanvas.getContext('2d');
          if (tCtx) {
            tCtx.drawImage(img, 0, 0, thumbW, thumbH);
            thumbData = thumbCanvas.toDataURL('image/jpeg', 0.85);
          }

          if (w > maxDim || h > maxDim) {
            const canvas = document.createElement('canvas');
            const targetW = w > h ? maxDim : Math.round((w * maxDim) / h);
            const targetH = h > w ? maxDim : Math.round((h * maxDim) / w);
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, targetW, targetH);
              finalData = canvas.toDataURL('image/jpeg', 0.9);
            }
          }
        } catch {}

        let workType = 'Photography';
        if (/print|a4|book|magazine|spread/i.test(cleanTitle)) workType = 'Print Artwork';
        else if (/brand|logo|identity/i.test(cleanTitle)) workType = 'Branding';
        else if (/ad|banner|billboard/i.test(cleanTitle)) workType = 'Advertisement';
        else if (aspectRatio === '4:5' || orientation === 'vertical') workType = 'Lookbook Frame';
        else if (aspectRatio === '1:1') workType = 'Social Design';

        resolve({
          file,
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          fileSize: file.size,
          mediaType: 'image',
          dataUrl: finalData,
          thumbnailUrl: thumbData,
          dimensions: {
            width: w,
            height: h,
            aspectRatio,
            orientation,
            resolution: `${w}x${h}`,
            fileSize: file.size,
          },
          title: cleanTitle,
          workType,
          disciplines: ['Art Direction'],
          tags: [cleanTitle.split(' ')[0] || 'Studio'],
          projectId: null,
          seriesId: null,
        });
      };

      img.onerror = () => {
        resolve({
          file,
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          fileSize: file.size,
          mediaType: 'image',
          dataUrl: fullData,
          thumbnailUrl: fullData,
          dimensions: {
            width: 1200,
            height: 800,
            aspectRatio: '16:10',
            orientation: 'horizontal',
            resolution: '1200x800',
            fileSize: file.size,
          },
          title: cleanTitle,
          workType: 'Photography',
          disciplines: ['Art Direction'],
          tags: ['Studio'],
          projectId: null,
          seriesId: null,
        });
      };
      img.src = fullData;
    };
    reader.readAsDataURL(file);
  });
};

export default function AdminPage() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<AdminView>('all_work');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Relational Archive Data
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesGroup[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ingestion Modal State ("+ Add Work")
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<InspectedAsset[]>([]);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [batchSuggestion, setBatchSuggestion] = useState<{
    matchedProjectId?: string | null;
    matchedProjectName?: string | null;
    projectConfidence?: number;
    groupSuggestion?: { shouldGroup: boolean; groupTitle: string; groupType: string };
  } | null>(null);
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);

  // Search & Filtering State (All Work)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOrientation, setFilterOrientation] = useState<'vertical' | 'horizontal' | 'square' | 'panoramic' | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'published' | 'draft' | 'archived' | 'all'>('all');

  // Single Project Detail State
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');

  // Selection & Inspector Drawer
  const [selectedWorkIds, setSelectedWorkIds] = useState<Set<string>>(new Set());
  const [inspectingWork, setInspectingWork] = useState<WorkItem | null>(null);

  // Settings & Credentials
  const [apiKey, setApiKey] = useState('');
  const [apiVerified, setApiVerified] = useState<boolean | null>(null);
  const [seoConfig, setSeoConfig] = useState<SeoConfig>({});
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Project Creation Modal
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectTag, setNewProjectTag] = useState('COMMERCIAL CAMPAIGN');
  const [newProjectYear, setNewProjectYear] = useState(new Date().getFullYear().toString());
  const [newProjectRole, setNewProjectRole] = useState('Director of Visuals');
  const [newProjectOverview, setNewProjectOverview] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyUser = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [w, p, c, s] = await Promise.all([
        getStoredWorksAsync(),
        getStoredProjectsAsync(),
        getStoredCollectionsAsync(),
        getStoredSeriesAsync(),
      ]);
      setWorks(w);
      setProjects(p);
      setCollections(c);
      setSeriesList(s);
      setPosts(getStoredBlogPosts());
      setApiKey(getStoredApiKey());
      setSeoConfig(getStoredSeoConfig());
    } catch (err) {
      console.error('Failed to load archive data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('antigravity_content_updated', handleUpdate);
    return () => window.removeEventListener('antigravity_content_updated', handleUpdate);
  }, [refreshData]);

  // Check initial API key verification status if key exists
  useEffect(() => {
    const key = getStoredApiKey();
    if (key) {
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_key', geminiKey: key }),
      })
        .then((r) => r.json())
        .then((d) => setIsKeyVerified(d.verified === true))
        .catch(() => setIsKeyVerified(false));
    }
  }, []);

  const setIsKeyVerified = (verified: boolean) => {
    setApiVerified(verified);
  };

  // ==========================================
  // INGESTION: DRAG & DROP 1-100+ FILES
  // ==========================================

  const handleDropFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    notifyUser(`Inspecting ${files.length} creative file(s)...`);

    const inspectedList = await Promise.all(files.map((f) => inspectMediaFile(f)));

    // Pre-fill projectId if we are adding to a specific project
    const defaultProjectId = batchSuggestion?.matchedProjectId || (activeView === 'single_project' ? selectedProjectId : null);
    const updatedInspected = inspectedList.map((item) => ({
      ...item,
      projectId: defaultProjectId || item.projectId,
    }));

    setUploadQueue((prev) => [...prev, ...updatedInspected]);

    // Background AI Suggestion Pipeline
    setIsAnalyzingAi(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_work_metadata',
          geminiKey: apiKey,
          files: updatedInspected.map((item) => ({
            name: item.fileName,
            type: item.fileType,
            size: item.fileSize,
            aspectRatio: item.dimensions.aspectRatio,
            orientation: item.dimensions.orientation,
            duration: item.dimensions.duration,
          })),
          existingProjects: projects.map((p) => ({ id: p.id, title: p.title })),
          existingDisciplines: DISCIPLINE_PRESETS,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.matchedProjectId || data.matchedProjectName) {
          setBatchSuggestion({
            matchedProjectId: data.matchedProjectId,
            matchedProjectName: data.matchedProjectName,
            projectConfidence: data.confidence || 0.9,
            groupSuggestion: data.groupSuggestion,
          });

          // Auto-apply high confidence project match if not already assigned
          if (data.matchedProjectId && !defaultProjectId) {
            setUploadQueue((prev) =>
              prev.map((item) => ({
                ...item,
                projectId: item.projectId || data.matchedProjectId,
                workType: item.workType,
              }))
            );
          }
        }
      }
    } catch (err) {
      console.warn('AI analysis fallback', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handlePublishUploadQueue = async (status: 'published' | 'draft') => {
    if (!uploadQueue.length) return;
    setIsPublishingBatch(true);

    try {
      const newWorks: WorkItem[] = uploadQueue.map((item) => ({
        id: `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: item.title,
        mediaUrl: item.dataUrl,
        thumbnailUrl: item.thumbnailUrl,
        mediaType: item.mediaType,
        fileType: item.fileType,
        fileName: item.fileName,
        fileSize: item.fileSize,
        dimensions: item.dimensions,
        workType: item.workType,
        disciplines: item.disciplines,
        tags: item.tags,
        projectId: item.projectId, // null = STANDALONE WORK! 100% VALID!
        collectionIds: [],
        seriesId: item.seriesId,
        year: new Date().getFullYear().toString(),
        status,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      // If series grouping was suggested, create series container
      if (batchSuggestion?.groupSuggestion?.shouldGroup) {
        const newSeries: SeriesGroup = {
          id: `series-${Date.now()}`,
          title: batchSuggestion.groupSuggestion.groupTitle,
          type: (batchSuggestion.groupSuggestion.groupType as any) || 'lookbook',
          projectId: batchSuggestion.matchedProjectId || null,
        };
        await saveSeriesAsync(newSeries);
        newWorks.forEach((w, idx) => {
          w.seriesId = newSeries.id;
          w.seriesOrder = idx + 1;
        });
      }

      await saveWorksBatchAsync(newWorks);
      await refreshData();

      setUploadQueue([]);
      setBatchSuggestion(null);
      setIsAddWorkOpen(false);
      notifyUser(`Successfully saved ${newWorks.length} work(s)!`);
    } catch (err) {
      console.error('Failed to save batch', err);
      notifyUser('Error saving works. Check storage quota.');
    } finally {
      setIsPublishingBatch(false);
    }
  };

  // ==========================================
  // BULK ACTIONS (ZERO-COPY RELATIONSHIP UPDATES)
  // ==========================================

  const handleSelectAll = () => {
    if (selectedWorkIds.size === filteredWorks.length) {
      setSelectedWorkIds(new Set());
    } else {
      setSelectedWorkIds(new Set(filteredWorks.map((w) => w.id)));
    }
  };

  const toggleSelectWork = (id: string) => {
    setSelectedWorkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAssignProject = async (projId: string | null) => {
    if (!selectedWorkIds.size) return;
    const targets = works.filter((w) => selectedWorkIds.has(w.id));
    const updated = targets.map((w) => ({ ...w, projectId: projId, updatedAt: Date.now() }));
    await saveWorksBatchAsync(updated);
    await refreshData();
    setSelectedWorkIds(new Set());
    const projName = projId ? projects.find((p) => p.id === projId)?.title || 'Project' : 'Standalone';
    notifyUser(`Moved ${updated.length} work(s) to ${projName}.`);
  };

  const handleBulkSetType = async (workType: string) => {
    if (!selectedWorkIds.size) return;
    const targets = works.filter((w) => selectedWorkIds.has(w.id));
    const updated = targets.map((w) => ({ ...w, workType, updatedAt: Date.now() }));
    await saveWorksBatchAsync(updated);
    await refreshData();
    setSelectedWorkIds(new Set());
    notifyUser(`Updated ${updated.length} work(s) to ${workType}.`);
  };

  const handleBulkDelete = async () => {
    if (!selectedWorkIds.size) return;
    if (confirm(`Permanently delete ${selectedWorkIds.size} selected work(s)? This cannot be undone.`)) {
      await deleteWorksBatchAsync(Array.from(selectedWorkIds));
      await refreshData();
      setSelectedWorkIds(new Set());
      notifyUser('Deleted selected works.');
    }
  };

  const handleDetachWorkFromProject = async (workId: string) => {
    const work = works.find((w) => w.id === workId);
    if (!work) return;
    await saveWorkAsync({ ...work, projectId: null, updatedAt: Date.now() });
    await refreshData();
    notifyUser(`"${work.title}" is now a Standalone Work.`);
  };

  const handleCreateNewProject = async (): Promise<string | null> => {
    if (!newProjectTitle.trim()) {
      alert('Project title is required.');
      return null;
    }
    const slug = newProjectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newProj: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newProjectTitle.trim(),
      slug,
      tag: newProjectTag.trim() || 'COMMERCIAL CAMPAIGN',
      client: newProjectClient.trim() || newProjectTitle.trim(),
      role: newProjectRole.trim() || 'Director of Visuals',
      year: newProjectYear.trim() || new Date().getFullYear().toString(),
      overview: newProjectOverview.trim(),
      coverWorkId: null,
      status: 'published',
      featured: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProjectAsync(newProj);
    await refreshData();
    setIsNewProjectModalOpen(false);
    setNewProjectTitle('');
    setNewProjectClient('');
    setNewProjectOverview('');
    notifyUser(`Project "${newProj.title}" created successfully.`);
    return newProj.id;
  };

  const handleSetProjectCover = async (project: Project, workId: string) => {
    try {
      const updated: Project = { ...project, coverWorkId: workId, updatedAt: Date.now() };
      await saveProjectAsync(updated);
      await refreshData();
      notifyUser(`Hero cover updated for "${project.title}".`);
    } catch (err) {
      console.error('Failed to set cover:', err);
      notifyUser('Could not update cover image.');
    }
  };

  const handleGenerateEditorialCopy = async (
    title: string,
    client: string,
    currentOverview: string,
    categoryTag: string,
    onSuccess: (newOverview: string, newTag?: string) => void
  ) => {
    setIsGeneratingCopy(true);
    notifyUser('AI is writing elevated editorial copy...');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_editorial_overview',
          geminiKey: apiKey,
          projectTitle: title,
          clientName: client,
          notes: currentOverview,
          categoryTag: categoryTag,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.overview) {
          onSuccess(data.overview, data.suggestedTag);
          notifyUser('Editorial copy generated!');
        }
      } else {
        notifyUser('Could not generate copy, check API connection.');
      }
    } catch (err) {
      console.error('AI copy generation error:', err);
      notifyUser('Error generating editorial copy.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleSaveEditedProject = async () => {
    if (!editingProject) return;
    try {
      const updated: Project = { ...editingProject, updatedAt: Date.now() };
      await saveProjectAsync(updated);
      await refreshData();
      setEditingProject(null);
      notifyUser(`Project "${updated.title}" updated.`);
    } catch (err) {
      console.error('Failed to update project:', err);
      notifyUser('Error updating project.');
    }
  };

  const hasLegacyMockData = useMemo(() => {
    const isMock = (str: string = '') => {
      const s = str.toLowerCase();
      return (
        s.includes('kaldhar') ||
        s.includes('kaladhar') ||
        s.includes('caldhar') ||
        s.includes('easy hai bro') ||
        s.includes('windchasers') ||
        s.includes('porsche') ||
        s.includes('ruchi') ||
        s.includes('oxymorons')
      );
    };
    return (
      projects.some((p) => isMock(p.title) || isMock(p.client || '')) ||
      works.some((w) => isMock(w.title) || isMock(w.client || '') || (w.tags && w.tags.some(isMock)))
    );
  }, [projects, works]);

  const handleDeleteSingleWork = async (work: WorkItem) => {
    if (confirm(`Permanently delete "${work.title}"? This cannot be undone.`)) {
      try {
        await deleteWorkAsync(work.id);
        if (inspectingWork?.id === work.id) {
          setInspectingWork(null);
        }
        await refreshData();
        notifyUser('Picture deleted permanently.');
      } catch (err) {
        console.error('Failed to delete work:', err);
        notifyUser('Error deleting picture.');
      }
    }
  };

  const handleDeleteProjectConfirmed = async (project: Project, deleteWithWorks: boolean) => {
    try {
      await deleteProjectAsync(project.id, deleteWithWorks);
      if (selectedProjectId === project.id) {
        setSelectedProjectId(null);
        setActiveView('projects');
      }
      setProjectToDelete(null);
      await refreshData();
      notifyUser(
        deleteWithWorks
          ? `Project "${project.title}" and all its deliverables were deleted.`
          : `Project container deleted. Deliverables kept as Standalone.`
      );
    } catch (err) {
      console.error('Failed to delete project:', err);
      notifyUser('Error deleting project.');
    }
  };

  const handleResetAllArchiveData = async () => {
    try {
      await clearAllArchiveDataAsync();
      await refreshData();
      notifyUser('Archive reset. All projects and works have been cleared.');
    } catch (err) {
      console.error('Failed to reset archive:', err);
      notifyUser('Error resetting archive.');
    }
  };

  // ==========================================
  // FILTERED DATA COMPUTATION
  // ==========================================

  const filteredWorks = useMemo(() => {
    return filterWorks(works, {
      search: searchQuery,
      projectId: filterProject,
      workType: filterType,
      orientation: filterOrientation,
      status: filterStatus,
    });
  }, [works, searchQuery, filterProject, filterType, filterOrientation, filterStatus]);

  // Current project for single project detail view
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const currentProjectWorks = useMemo(() => {
    if (!selectedProjectId) return [];
    return works.filter((w) => w.projectId === selectedProjectId);
  }, [works, selectedProjectId]);

  // Dynamic Work Types that ACTUALLY exist in this project
  const currentProjectTypes = useMemo(() => {
    return Array.from(new Set(currentProjectWorks.map((w) => w.workType))).filter(Boolean);
  }, [currentProjectWorks]);

  const displayProjectWorks = useMemo(() => {
    if (projectTypeFilter === 'all') return currentProjectWorks;
    return currentProjectWorks.filter((w) => w.workType.toLowerCase() === projectTypeFilter.toLowerCase());
  }, [currentProjectWorks, projectTypeFilter]);

  return (
    <main className="min-h-screen bg-[#0d0d0e] text-white selection:bg-[#e60000] selection:text-white font-sans flex flex-col">
      <CustomCursor />

      {/* TOP EDITORIAL STUDIO BAR */}
      <header className="sticky top-0 z-40 bg-[#121214]/90 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            ← <span>Return to Portfolio</span>
          </Link>
          <span className="text-neutral-700 font-mono text-xs">•</span>
          <span className="font-display font-black text-xs uppercase tracking-wider text-white">
            Creative Archive
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#e60000]/15 text-[#e60000] font-mono text-[9px] font-bold uppercase">
            Upload First CMS
          </span>
        </div>

        {/* View Switcher Pills */}
        <nav className="flex items-center bg-black/60 p-1 rounded-full text-xs font-mono">
          <button
            type="button"
            onClick={() => { setActiveView('all_work'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'all_work' ? 'bg-[#e60000] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Work ({works.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('projects'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'projects' || activeView === 'single_project'
                ? 'bg-[#e60000] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('journal'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'journal' ? 'bg-[#e60000] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Journal ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('settings'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'settings' ? 'bg-[#e60000] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* + ADD WORK Primary Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setUploadQueue([]);
              setBatchSuggestion(null);
              setIsAddWorkOpen(true);
            }}
            className="px-5 py-2 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e60000] hover:text-white transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>Add Work</span>
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATION BANNER */}
      {statusNotification && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-bold shadow-2xl animate-fadeIn">
          {statusNotification}
        </div>
      )}

      {/* QUICK PURGE BANNER IF LEGACY SAMPLE PROJECT (KALDHAR) IS DETECTED */}
      {hasLegacyMockData && (
        <div className="max-w-[1700px] w-full mx-auto px-6 sm:px-10 pt-4">
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-tight">
                  Detected Legacy Sample / Kaldhar Project in Browser Storage
                </h4>
                <p className="font-mono text-xs text-red-300/80">
                  Legacy mock projects stored in your browser cache can be wiped with one click.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                const count = await purgeMockAndCaldharProjectsAsync();
                await refreshData();
                notifyUser(`Purged ${count} legacy sample item(s). Clean slate ready.`);
              }}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              1-Click Purge Kaldhar Now
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 1: ALL WORK (THE CENTRAL CREATIVE ARCHIVE LIBRARY)      */}
      {/* ============================================================ */}
      {activeView === 'all_work' && (
        <section className="flex-1 max-w-[1700px] w-full mx-auto px-6 sm:px-10 py-8 space-y-6">
          {/* Controls Bar: Search & Filter Chips */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#141416] p-4 sm:p-5 rounded-3xl border border-white/[0.06]">
            {/* Natural Language & Keyword Search */}
            <div className="relative flex-1 w-full max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search work, tags, or try natural queries: "all reels", "all standalone", "all 2026"...'
                className="w-full bg-black/60 border border-white/[0.08] text-white placeholder-neutral-500 px-5 py-3 rounded-full text-xs font-mono outline-none focus:border-white/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full lg:w-auto">
              {/* Project Filter */}
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-black/60 border border-white/[0.08] text-neutral-300 rounded-full px-3.5 py-2.5 outline-none cursor-pointer hover:border-white/20"
              >
                <option value="all" className="bg-neutral-900">All Projects &amp; Standalone</option>
                <option value="standalone" className="bg-neutral-900">Standalone Works Only</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-neutral-900">Project: {p.title}</option>
                ))}
              </select>

              {/* Work Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-black/60 border border-white/[0.08] text-neutral-300 rounded-full px-3.5 py-2.5 outline-none cursor-pointer hover:border-white/20"
              >
                <option value="all" className="bg-neutral-900">All Work Types</option>
                {COMMON_WORK_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-neutral-900">{t}</option>
                ))}
              </select>

              {/* Orientation Filter */}
              <select
                value={filterOrientation}
                onChange={(e) => setFilterOrientation(e.target.value as any)}
                className="bg-black/60 border border-white/[0.08] text-neutral-300 rounded-full px-3.5 py-2.5 outline-none cursor-pointer hover:border-white/20"
              >
                <option value="all" className="bg-neutral-900">All Orientations</option>
                <option value="vertical" className="bg-neutral-900">Vertical (9:16 / 4:5)</option>
                <option value="horizontal" className="bg-neutral-900">Horizontal (16:9 / 16:10)</option>
                <option value="square" className="bg-neutral-900">Square (1:1)</option>
                <option value="panoramic" className="bg-neutral-900">Panoramic</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-black/60 border border-white/[0.08] text-neutral-300 rounded-full px-3.5 py-2.5 outline-none cursor-pointer hover:border-white/20"
              >
                <option value="all" className="bg-neutral-900">All Statuses</option>
                <option value="published" className="bg-neutral-900">Published</option>
                <option value="draft" className="bg-neutral-900">Draft</option>
                <option value="archived" className="bg-neutral-900">Archived</option>
              </select>
            </div>
          </div>

          {/* Select All & Summary Header */}
          <div className="flex items-center justify-between font-mono text-xs text-neutral-400 px-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {selectedWorkIds.size === filteredWorks.length && filteredWorks.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
              <span>•</span>
              <span>Showing {filteredWorks.length} of {works.length} works</span>
            </div>

            {selectedWorkIds.size > 0 && (
              <span className="text-[#e60000] font-bold">
                {selectedWorkIds.size} work(s) selected
              </span>
            )}
          </div>

          {/* WORKS VISUAL GRID */}
          {isLoading ? (
            <div className="py-24 text-center font-mono text-xs text-neutral-500 animate-pulse">
              Hydrating archive from IndexedDB...
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="py-24 text-center space-y-3 bg-[#141416] rounded-3xl border border-white/[0.06] p-8">
              <p className="font-mono text-xs text-neutral-400">
                No works found matching your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterProject('all');
                  setFilterType('all');
                  setFilterOrientation('all');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 rounded-full bg-white/[0.08] text-white font-mono text-xs hover:bg-white/[0.15] cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredWorks.map((work) => {
                const isSelected = selectedWorkIds.has(work.id);
                const project = projects.find((p) => p.id === work.projectId);

                return (
                  <div
                    key={work.id}
                    onClick={() => setInspectingWork(work)}
                    className={`group relative rounded-2xl bg-[#141416] border overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                      isSelected
                        ? 'border-[#e60000] ring-2 ring-[#e60000]/50'
                        : 'border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    {/* Checkbox Overlay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectWork(work.id);
                      }}
                      className="absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:border-white transition-colors cursor-pointer"
                    >
                      {isSelected && <span className="text-[#e60000] font-black text-xs">✓</span>}
                    </div>

                    {/* Single Picture Delete Quick Action */}
                    <button
                      type="button"
                      title="Delete Picture"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingleWork(work);
                      }}
                      className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-lg bg-black/80 hover:bg-red-600 text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer border border-white/10 shadow-md"
                    >
                      🗑️
                    </button>

                    {/* Aspect Ratio Badge */}
                    <div className="absolute top-2.5 right-11 z-20 font-mono text-[9px] font-bold px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white">
                      {work.dimensions.aspectRatio}
                    </div>

                    {/* Media Thumbnail */}
                    <div className="relative aspect-[4/5] bg-black overflow-hidden">
                      {work.mediaType === 'video' ? (
                        <video
                          src={work.mediaUrl}
                          poster={work.thumbnailUrl}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={work.thumbnailUrl || work.mediaUrl}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>

                    {/* Card Meta */}
                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[9px] font-bold text-[#e60000] uppercase tracking-wider block">
                          {work.workType}
                        </span>
                        <h4 className="font-display font-bold text-xs text-white line-clamp-1">
                          {work.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between font-mono text-[9.5px]">
                        <span className="text-neutral-400 truncate max-w-[90px]">
                          {project ? project.title : 'Standalone'}
                        </span>
                        <span className="text-neutral-600 uppercase font-semibold">
                          {work.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: PROJECTS (CONTAINERS FOR BODIES OF WORK)             */}
      {/* ============================================================ */}
      {activeView === 'projects' && (
        <section className="flex-1 max-w-[1700px] w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Project Containers ({projects.length})
              </h2>
              <p className="font-mono text-xs text-neutral-400 pt-1">
                Optional containers representing larger campaigns or brand identities. Works exist independently.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e60000] hover:text-white transition-colors cursor-pointer"
            >
              + New Project Container
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="py-24 text-center space-y-3 bg-[#141416] rounded-3xl border border-white/[0.06] p-8">
              <p className="font-mono text-xs text-neutral-400">
                No projects created yet. You can create projects to group reels, lookbooks, and branding together.
              </p>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#e60000] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const projectWorks = works.filter((w) => w.projectId === project.id);
                const coverWork = works.find((w) => w.id === project.coverWorkId) || projectWorks[0];
                const workTypes = Array.from(new Set(projectWorks.map((w) => w.workType))).filter(Boolean);

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setProjectTypeFilter('all');
                      setActiveView('single_project');
                    }}
                    className="group rounded-3xl bg-[#141416] border border-white/[0.06] hover:border-white/20 p-6 space-y-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Cover Visual */}
                      <div className="w-full aspect-[16/9] rounded-2xl bg-black overflow-hidden relative">
                        {coverWork ? (
                          coverWork.mediaType === 'video' ? (
                            <video
                              src={coverWork.mediaUrl}
                              poster={coverWork.thumbnailUrl}
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coverWork.thumbnailUrl || coverWork.mediaUrl}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-600">
                            No Works Assigned Yet
                          </div>
                        )}
                        <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white">
                          {projectWorks.length} Deliverable(s)
                        </span>
                      </div>

                      {/* Project Meta */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#e60000] font-bold uppercase tracking-wider">
                              {project.tag || 'CAMPAIGN'}
                            </span>
                            <span className="text-neutral-600 font-mono text-xs">•</span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              {project.year}
                            </span>
                          </div>

                          <button
                            type="button"
                            title="Delete Project"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0 border border-red-500/20"
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        </div>

                        <h3 className="font-display font-black text-xl text-white uppercase tracking-tight group-hover:text-[#e60000] transition-colors">
                          {project.title}
                        </h3>

                        {project.client && (
                          <p className="font-mono text-xs text-neutral-400">
                            Client: <strong className="text-white">{project.client}</strong>
                          </p>
                        )}
                      </div>

                      {/* Dynamic Deliverable Breakdown Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {workTypes.map((type) => (
                          <span
                            key={type}
                            className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-neutral-300"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between font-mono text-xs text-neutral-500">
                      <span>OPEN PROJECT ARCHIVE</span>
                      <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* VIEW 3: SINGLE PROJECT DETAIL VIEW (DYNAMIC WORK TYPE TABS)  */}
      {/* ============================================================ */}
      {activeView === 'single_project' && currentProject && (
        <section className="flex-1 max-w-[1700px] w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
          {/* Back Navigation & Project Header */}
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => { setActiveView('projects'); setSelectedProjectId(null); }}
              className="font-mono text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>←</span>
              <span>BACK TO ALL PROJECTS</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-8 rounded-3xl bg-[#141416] border border-white/[0.06]">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#e60000] font-bold uppercase tracking-widest">
                    {currentProject.tag || 'PROJECT'}
                  </span>
                  <span className="font-mono text-xs text-neutral-500">•</span>
                  <span className="font-mono text-xs text-neutral-400 uppercase font-semibold">
                    {currentProject.year}
                  </span>
                </div>
                <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                  {currentProject.title}
                </h1>
                <p className="font-mono text-xs text-neutral-400">
                  Client: <strong className="text-white">{currentProject.client || currentProject.title}</strong> • Role: <strong className="text-white">{currentProject.role || 'Lead Art Director'}</strong>
                </p>
                {currentProject.overview && (
                  <p className="font-sans text-sm text-neutral-300 pt-2 leading-relaxed">
                    {currentProject.overview}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProject(currentProject)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
                >
                  <span>✏️</span>
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectToDelete(currentProject)}
                  className="px-5 py-2.5 rounded-full bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border border-red-500/20"
                >
                  <span>🗑️</span>
                  <span>Delete Project</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUploadQueue([]);
                    setBatchSuggestion({ matchedProjectId: currentProject.id, matchedProjectName: currentProject.title, projectConfidence: 1.0 });
                    setIsAddWorkOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-[#e60000] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  + Add Work To Project
                </button>
              </div>
            </div>
          </div>

          {/* DIRECT IN-PROJECT DROPZONE / ADD STRIP */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setUploadQueue([]);
                setBatchSuggestion({ matchedProjectId: currentProject.id, matchedProjectName: currentProject.title, projectConfidence: 1.0 });
                handleDropFiles(e.dataTransfer.files);
                setIsAddWorkOpen(true);
              }
            }}
            onClick={() => {
              setUploadQueue([]);
              setBatchSuggestion({ matchedProjectId: currentProject.id, matchedProjectName: currentProject.title, projectConfidence: 1.0 });
              setIsAddWorkOpen(true);
            }}
            className="p-6 rounded-2xl border border-dashed border-white/15 hover:border-[#e60000] bg-white/[0.02] hover:bg-[#e60000]/[0.03] transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] group-hover:bg-[#e60000] group-hover:text-white flex items-center justify-center text-lg transition-colors shrink-0">
                ＋
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Drop new media to add directly to {currentProject.title}
                </p>
                <p className="font-mono text-[11px] text-neutral-400">
                  Reels (9:16), Horizontal Videos (16:9), Lookbook Photos, Social Media Designs — Code auto-tags dimensions instantly.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-4 py-2 rounded-full bg-white text-black group-hover:bg-[#e60000] group-hover:text-white transition-colors shrink-0">
              Browse / Drop Files
            </span>
          </div>

          {/* DYNAMIC WORK TYPE TABS (ONLY RENDER WHAT ACTUALLY EXISTS IN THIS PROJECT) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.06] font-mono text-xs font-bold tracking-wider">
              <button
                type="button"
                onClick={() => setProjectTypeFilter('all')}
                className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                  projectTypeFilter === 'all' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                ALL ({currentProjectWorks.length})
              </button>

              {currentProjectTypes.map((type) => {
                const count = currentProjectWorks.filter((w) => w.workType.toLowerCase() === type.toLowerCase()).length;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setProjectTypeFilter(type)}
                    className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                      projectTypeFilter === type ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {type.toUpperCase()} ({count})
                  </button>
                );
              })}
            </div>

            {/* PROJECT WORKS GRID */}
            {displayProjectWorks.length === 0 ? (
              <div className="py-16 text-center font-mono text-xs text-neutral-500">
                No works found in this tab.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {displayProjectWorks.map((work) => (
                  <div
                    key={work.id}
                    className="group rounded-2xl bg-[#141416] border border-white/[0.06] hover:border-white/20 overflow-hidden flex flex-col cursor-pointer"
                    onClick={() => setInspectingWork(work)}
                  >
                    <div className="relative aspect-[4/5] bg-black overflow-hidden">
                      {work.mediaType === 'video' ? (
                        <video
                          src={work.mediaUrl}
                          poster={work.thumbnailUrl}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={work.thumbnailUrl || work.mediaUrl}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {/* Cover Badge or Set Cover Action */}
                      {currentProject.coverWorkId === work.id ? (
                        <span className="absolute top-2.5 left-2.5 z-30 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full bg-[#e60000] text-white shadow-lg flex items-center gap-1">
                          ★ COVER
                        </span>
                      ) : (
                        <button
                          type="button"
                          title="Set as Project Cover Thumbnail"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetProjectCover(currentProject, work.id);
                          }}
                          className="absolute top-2.5 left-2.5 z-30 px-2.5 py-1 rounded-full bg-black/80 hover:bg-white hover:text-black text-neutral-300 font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 shadow-md opacity-0 group-hover:opacity-100"
                        >
                          ★ Make Cover
                        </button>
                      )}

                      {/* Delete Single Picture Quick Action */}
                      <button
                        type="button"
                        title="Delete Picture"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingleWork(work);
                        }}
                        className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-lg bg-black/80 hover:bg-red-600 text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer border border-white/10 shadow-md"
                      >
                        🗑️
                      </button>

                      <span className="absolute top-2.5 right-11 font-mono text-[9px] font-bold px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white">
                        {work.dimensions.aspectRatio}
                      </span>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[9px] font-bold text-[#e60000] uppercase tracking-wider block">
                          {work.workType}
                        </span>
                        <h4 className="font-display font-bold text-xs text-white line-clamp-1">
                          {work.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        {currentProject.coverWorkId !== work.id && (
                          <button
                            type="button"
                            title="Set as Project Cover"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetProjectCover(currentProject, work.id);
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-neutral-300 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                          >
                            ★ Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSingleWork(work);
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetachWorkFromProject(work.id);
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Detach
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* VIEW 4: JOURNAL / BLOG                                       */}
      {/* ============================================================ */}
      {activeView === 'journal' && (
        <section className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Journal Articles ({posts.length})
              </h2>
              <p className="font-mono text-xs text-neutral-400 pt-1">
                Editorial thoughts, on-set technical notes, and typography manifestos. Independent from creative works.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="p-6 rounded-2xl bg-[#141416] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#e60000] font-bold uppercase tracking-wider">
                    {post.category} • {post.date}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white">
                    {post.title}
                  </h3>
                  <p className="font-mono text-xs text-neutral-400 line-clamp-1 max-w-2xl">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    View Post ↗
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete post "${post.title}"?`)) {
                        deleteBlogPost(post.slug);
                        setPosts(getStoredBlogPosts());
                        notifyUser('Post deleted.');
                      }
                    }}
                    className="p-2 rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* VIEW 5: SETTINGS & LIVE CREDENTIALS                          */}
      {/* ============================================================ */}
      {activeView === 'settings' && (
        <section className="flex-1 max-w-[1000px] w-full mx-auto px-6 sm:px-10 py-8 space-y-10">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Settings &amp; Directorial Configuration
            </h2>
            <p className="font-mono text-xs text-neutral-400 pt-1">
              Configure Google Gemini API keys, SEO verification tags, and archive backups.
            </p>
          </div>

          {/* Gemini AI API Key Manager */}
          <div className="p-8 rounded-3xl bg-[#141416] border border-white/[0.06] space-y-6">
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                Google Gemini API Key
              </h3>
              <p className="font-mono text-xs text-neutral-400">
                Powers real-time work analysis, project suggestion confidence, and editorial ghostwriting.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiVerified(null);
                }}
                placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/[0.08] text-white font-mono text-xs outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={async () => {
                  saveApiKey(apiKey);
                  notifyUser('Verifying API Key with Google...');
                  try {
                    const res = await fetch('/api/ai', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'verify_key', geminiKey: apiKey }),
                    });
                    const data = await res.json();
                    if (data.verified) {
                      setApiVerified(true);
                      notifyUser('API Key Verified Successfully!');
                    } else {
                      setApiVerified(false);
                      notifyUser('Google rejected this API Key.');
                    }
                  } catch {
                    setApiVerified(false);
                  }
                }}
                className="px-6 py-3 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e60000] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                Save &amp; Verify
              </button>
            </div>

            {apiVerified === true && (
              <div className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-2">
                <span>✓</span>
                <span>Active &amp; connected to Google Gemini 2.0 Flash.</span>
              </div>
            )}
            {apiVerified === false && (
              <div className="font-mono text-xs text-red-400 font-bold flex items-center gap-2">
                <span>✕</span>
                <span>Key invalid or refused by Google. Please check your credentials.</span>
              </div>
            )}
          </div>

          {/* Database Backup & Export */}
          <div className="p-8 rounded-3xl bg-[#141416] border border-white/[0.06] space-y-4">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Archive Backup &amp; Health
            </h3>
            <p className="font-mono text-xs text-neutral-400">
              Total Works: <strong className="text-white">{works.length}</strong> • Total Projects: <strong className="text-white">{projects.length}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                const data = { works, projects, collections, seriesList, timestamp: Date.now() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `moiz_creative_archive_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Export JSON Archive Backup
            </button>

            <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider block">
                  Reset Archive Data
                </span>
                <p className="font-mono text-[11px] text-neutral-500 max-w-md">
                  Permanently clear all stored works and projects from local browser storage to start completely fresh.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to completely clear all stored works and projects? This will reset your portfolio archive to a clean slate.')) {
                    await handleResetAllArchiveData();
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Reset Archive (Clean Slate)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* FLOATING BULK UTILITY BAR (WHEN 1+ WORKS SELECTED)           */}
      {/* ============================================================ */}
      {selectedWorkIds.size > 0 && activeView === 'all_work' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-wrap items-center gap-4 animate-fadeIn max-w-[95vw]">
          <span className="font-mono text-xs font-bold text-[#e60000] tracking-wider uppercase">
            {selectedWorkIds.size} Selected
          </span>

          <div className="h-4 w-px bg-white/20" />

          {/* Assign Project Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value === 'new') {
                setIsNewProjectModalOpen(true);
              } else if (e.target.value === 'standalone') {
                handleBulkAssignProject(null);
              } else if (e.target.value) {
                handleBulkAssignProject(e.target.value);
              }
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-white/[0.1] hover:bg-white/[0.2] text-white border-0 rounded-lg px-3 py-1.5 text-xs font-mono font-medium outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-neutral-900">Assign to Project...</option>
            <option value="standalone" className="bg-neutral-900">Make Standalone (No Project)</option>
            <option value="new" className="bg-neutral-900">+ Create New Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-neutral-900">{p.title}</option>
            ))}
          </select>

          {/* Set Type Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) handleBulkSetType(e.target.value);
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-white/[0.1] hover:bg-white/[0.2] text-white border-0 rounded-lg px-3 py-1.5 text-xs font-mono font-medium outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-neutral-900">Set Work Type...</option>
            {COMMON_WORK_TYPES.map((t) => (
              <option key={t} value={t} className="bg-neutral-900">{t}</option>
            ))}
          </select>

          {/* Bulk Delete */}
          <button
            type="button"
            onClick={handleBulkDelete}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Delete
          </button>

          {/* Clear Selection */}
          <button
            type="button"
            onClick={() => setSelectedWorkIds(new Set())}
            className="text-neutral-400 hover:text-white font-mono text-xs cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: "+ ADD WORK" (UPLOAD FIRST, ORGANIZE SECOND)          */}
      {/* ============================================================ */}
      {isAddWorkOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPublishingBatch) setIsAddWorkOpen(false);
          }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#121214] border border-white/[0.08] rounded-[32px] overflow-hidden flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
          >
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121214]/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  Add Creative Work
                </h3>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#e60000]/20 text-[#e60000] font-bold uppercase tracking-wider">
                  UPLOAD FIRST
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddWorkOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) handleDropFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="p-10 rounded-3xl border-2 border-dashed border-white/15 hover:border-[#e60000] hover:bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all duration-300 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleDropFiles(e.target.files);
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] group-hover:bg-[#e60000] text-white flex items-center justify-center text-2xl transition-all group-hover:scale-110">
                  📁
                </div>
                <h4 className="font-display font-black text-lg text-white uppercase tracking-tight">
                  Drag &amp; Drop Creative Files Here
                </h4>
                <p className="font-mono text-xs text-neutral-400 max-w-sm">
                  Upload 1, 5, 20, or 50+ files at once. The system extracts dimensions, aspect ratios, and orientations automatically.
                </p>
              </div>

              {/* AI Status Banner */}
              {isAnalyzingAi && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-3 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e60000] animate-ping shrink-0" />
                  <span className="font-mono text-xs text-neutral-300 font-bold">
                    Analyzing uploaded work and comparing against existing archive relationships...
                  </span>
                </div>
              )}

              {/* Batch Match Banner (Existing Project Suggestion) */}
              {batchSuggestion?.matchedProjectName && (
                <div className="p-5 rounded-2xl bg-[#1a1a1e] border border-[#e60000]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-[#e60000] font-bold uppercase tracking-widest block">
                      AI SUGGESTION • {Math.round((batchSuggestion.projectConfidence || 0.9) * 100)}% MATCH
                    </span>
                    <p className="font-sans text-sm text-white font-medium">
                      Possible match with existing project: <strong>{batchSuggestion.matchedProjectName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (batchSuggestion.matchedProjectId) {
                          setUploadQueue((prev) =>
                            prev.map((item) => ({ ...item, projectId: batchSuggestion.matchedProjectId || null }))
                          );
                          notifyUser(`Assigned to ${batchSuggestion.matchedProjectName}`);
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-[#e60000] text-white font-bold uppercase tracking-wider hover:bg-[#ff1a1a] cursor-pointer"
                    >
                      Accept Match
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadQueue((prev) => prev.map((item) => ({ ...item, projectId: null })));
                        setBatchSuggestion((prev) => (prev ? { ...prev, matchedProjectId: null, matchedProjectName: null } : null));
                        notifyUser('Set all as Standalone');
                      }}
                      className="px-4 py-2 rounded-full bg-white/[0.08] text-white hover:bg-white/[0.15] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Keep Standalone
                    </button>
                  </div>
                </div>
              )}

              {/* Series Grouping Prompt */}
              {batchSuggestion?.groupSuggestion?.shouldGroup && uploadQueue.length > 1 && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-4">
                  <div className="font-mono text-xs text-neutral-300">
                    These {uploadQueue.length} files share a naming rhythm. Group them as <strong>{batchSuggestion.groupSuggestion.groupTitle}</strong>?
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                    Auto-Group Active
                  </span>
                </div>
              )}

              {/* Ingested Files Preview & Adjustment Grid */}
              {uploadQueue.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                    <span>STAGED WORKS ({uploadQueue.length})</span>
                    <button
                      type="button"
                      onClick={() => setUploadQueue([])}
                      className="text-neutral-500 hover:text-white"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uploadQueue.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#18181c] border border-white/[0.06] flex items-center gap-4 relative"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-20 rounded-xl bg-black overflow-hidden relative shrink-0">
                          {item.mediaType === 'video' ? (
                            <video src={item.dataUrl} poster={item.thumbnailUrl} className="w-full h-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumbnailUrl || item.dataUrl} alt={item.title} className="w-full h-full object-cover" />
                          )}
                          <span className="absolute bottom-1 right-1 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-black/80 text-white">
                            {item.dimensions.aspectRatio}
                          </span>
                        </div>

                        {/* Staged Details Form */}
                        <div className="flex-1 space-y-2 min-w-0 font-mono text-xs">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUploadQueue((prev) =>
                                prev.map((q, qIdx) => (qIdx === idx ? { ...q, title: val } : q))
                              );
                            }}
                            className="w-full bg-transparent font-bold text-white text-xs border-b border-white/10 focus:border-white/40 outline-none pb-0.5"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            {/* Work Type */}
                            <select
                              value={item.workType}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUploadQueue((prev) =>
                                  prev.map((q, qIdx) => (qIdx === idx ? { ...q, workType: val } : q))
                                );
                              }}
                              className="bg-white/[0.06] text-white border-0 rounded-lg px-2 py-1 text-[11px] outline-none cursor-pointer"
                            >
                              {COMMON_WORK_TYPES.map((t) => (
                                <option key={t} value={t} className="bg-neutral-900">{t}</option>
                              ))}
                            </select>

                            {/* Project Assignment */}
                            <select
                              value={item.projectId || 'standalone'}
                              onChange={(e) => {
                                const val = e.target.value === 'standalone' ? null : e.target.value;
                                setUploadQueue((prev) =>
                                  prev.map((q, qIdx) => (qIdx === idx ? { ...q, projectId: val } : q))
                                );
                              }}
                              className="bg-white/[0.06] text-white border-0 rounded-lg px-2 py-1 text-[11px] outline-none cursor-pointer"
                            >
                              <option value="standalone" className="bg-neutral-900">None (Standalone)</option>
                              {projects.map((p) => (
                                <option key={p.id} value={p.id} className="bg-neutral-900">{p.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadQueue((prev) => prev.filter((_, qIdx) => qIdx !== idx));
                          }}
                          className="text-neutral-500 hover:text-white text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Bar */}
            <div className="px-8 py-5 border-t border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121214]">
              <span className="font-mono text-xs text-neutral-400">
                {uploadQueue.length} files ready to be saved
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePublishUploadQueue('draft')}
                  disabled={!uploadQueue.length || isPublishingBatch}
                  className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handlePublishUploadQueue('published')}
                  disabled={!uploadQueue.length || isPublishingBatch}
                  className="px-6 py-2.5 rounded-full bg-[#e60000] hover:bg-[#ff1a1a] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  {isPublishingBatch ? 'Publishing...' : `Publish All (${uploadQueue.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE NEW PROJECT CONTAINER                          */}
      {/* ============================================================ */}
      {isNewProjectModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNewProjectModalOpen(false);
          }}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#141416] border border-white/[0.08] rounded-3xl p-8 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                New Project Container
              </h3>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-neutral-400 block pb-1">Project Title *</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Luxury Brand Campaign"
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block pb-1">Client / Brand</label>
                  <input
                    type="text"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    placeholder="e.g. Brand Client"
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block pb-1">Year</label>
                  <input
                    type="text"
                    value={newProjectYear}
                    onChange={(e) => setNewProjectYear(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block pb-1">Category Tag</label>
                <input
                  type="text"
                  value={newProjectTag}
                  onChange={(e) => setNewProjectTag(e.target.value)}
                  placeholder="e.g. COMMERCIAL CAMPAIGN, BRAND IDENTITY"
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between pb-1">
                  <label className="text-neutral-400">Narrative / Overview</label>
                  <button
                    type="button"
                    disabled={isGeneratingCopy}
                    onClick={() => {
                      if (!newProjectTitle.trim()) {
                        alert('Please enter a Project Title first so AI can write the copy.');
                        return;
                      }
                      handleGenerateEditorialCopy(
                        newProjectTitle,
                        newProjectClient || newProjectTitle,
                        newProjectOverview,
                        newProjectTag,
                        (newOverview, newTag) => {
                          setNewProjectOverview(newOverview);
                          if (newTag) setNewProjectTag(newTag);
                        }
                      );
                    }}
                    className="text-[#e60000] hover:text-[#ff3333] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span>✨</span>
                    <span>{isGeneratingCopy ? 'Writing copy...' : 'AI Generate Editorial Copy'}</span>
                  </button>
                </div>
                <textarea
                  value={newProjectOverview}
                  onChange={(e) => setNewProjectOverview(e.target.value)}
                  rows={3}
                  placeholder="Type 2-3 quick bullet points or notes and click AI Generate, or write your own..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30 resize-none font-sans text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateNewProject()}
                className="px-6 py-2.5 rounded-full bg-[#e60000] hover:bg-[#ff1a1a] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT PROJECT DETAILS                                  */}
      {/* ============================================================ */}
      {editingProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProject(null);
          }}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#141416] border border-white/[0.08] rounded-3xl p-8 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  Edit Project Details
                </h3>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.08] text-neutral-300 uppercase font-bold">
                  {editingProject.year}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-neutral-400 block pb-1">Project Title *</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block pb-1">Client / Brand</label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block pb-1">Year</label>
                  <input
                    type="text"
                    value={editingProject.year}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block pb-1">Category Tag</label>
                  <input
                    type="text"
                    value={editingProject.tag || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, tag: e.target.value })}
                    placeholder="e.g. COMMERCIAL CAMPAIGN"
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block pb-1">Role</label>
                  <input
                    type="text"
                    value={editingProject.role || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                    placeholder="e.g. Lead Art Director"
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between pb-1">
                  <label className="text-neutral-400">Narrative / Overview</label>
                  <button
                    type="button"
                    disabled={isGeneratingCopy}
                    onClick={() => {
                      handleGenerateEditorialCopy(
                        editingProject.title,
                        editingProject.client || editingProject.title,
                        editingProject.overview || '',
                        editingProject.tag || 'COMMERCIAL CAMPAIGN',
                        (newOverview, newTag) => {
                          setEditingProject((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  overview: newOverview,
                                  tag: newTag || prev.tag,
                                }
                              : null
                          );
                        }
                      );
                    }}
                    className="text-[#e60000] hover:text-[#ff3333] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span>✨</span>
                    <span>{isGeneratingCopy ? 'Writing copy...' : 'AI Generate Editorial Copy'}</span>
                  </button>
                </div>
                <textarea
                  value={editingProject.overview || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                  rows={4}
                  placeholder="Editorial statement or creative treatment overview..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30 resize-none font-sans text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedProject}
                className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-[#e60000] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SLIDE-OVER DETAIL INSPECTOR (EDIT RELATIONSHIPS ZERO COPY)   */}
      {/* ============================================================ */}
      {inspectingWork && (
        <div
          onClick={() => setInspectingWork(null)}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex justify-end animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[#141416] border-l border-white/[0.08] p-8 overflow-y-auto space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#e60000] font-bold uppercase tracking-wider">
                  WORK INSPECTOR
                </span>
                <button
                  type="button"
                  onClick={() => setInspectingWork(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Preview */}
              <div className="w-full aspect-[4/5] rounded-2xl bg-black overflow-hidden relative">
                {inspectingWork.mediaType === 'video' ? (
                  <video
                    src={inspectingWork.mediaUrl}
                    poster={inspectingWork.thumbnailUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={inspectingWork.mediaUrl}
                    alt={inspectingWork.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-neutral-400 block pb-1">Title</label>
                  <input
                    type="text"
                    value={inspectingWork.title}
                    onChange={(e) => setInspectingWork({ ...inspectingWork, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block pb-1">Work Type</label>
                  <select
                    value={inspectingWork.workType}
                    onChange={(e) => setInspectingWork({ ...inspectingWork, workType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none"
                  >
                    {COMMON_WORK_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-neutral-900">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block pb-1">Project Container (Zero Duplication)</label>
                  <select
                    value={inspectingWork.projectId || 'standalone'}
                    onChange={(e) => {
                      const val = e.target.value === 'standalone' ? null : e.target.value;
                      setInspectingWork({ ...inspectingWork, projectId: val });
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none"
                  >
                    <option value="standalone" className="bg-neutral-900">None (Standalone Work)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900">{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block pb-1">Status</label>
                  <select
                    value={inspectingWork.status}
                    onChange={(e) => setInspectingWork({ ...inspectingWork, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none"
                  >
                    <option value="published" className="bg-neutral-900">Published</option>
                    <option value="draft" className="bg-neutral-900">Draft</option>
                    <option value="archived" className="bg-neutral-900">Archived</option>
                  </select>
                </div>

                {/* Technical Media Specs */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1 text-[11px] text-neutral-400">
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span className="text-white font-bold">{inspectingWork.dimensions.resolution || `${inspectingWork.dimensions.width}x${inspectingWork.dimensions.height}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aspect Ratio:</span>
                    <span className="text-white font-bold">{inspectingWork.dimensions.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orientation:</span>
                    <span className="text-white font-bold capitalize">{inspectingWork.dimensions.orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Type:</span>
                    <span className="text-white font-bold">{inspectingWork.fileType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={async () => {
                  await saveWorkAsync(inspectingWork);
                  await refreshData();
                  setInspectingWork(null);
                  notifyUser('Work updated successfully.');
                }}
                className="w-full py-3 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e60000] hover:text-white transition-colors cursor-pointer"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Permanently delete "${inspectingWork.title}"?`)) {
                    await deleteWorkAsync(inspectingWork.id);
                    await refreshData();
                    setInspectingWork(null);
                    notifyUser('Work deleted.');
                  }
                }}
                className="w-full py-2.5 rounded-full bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Delete Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONFIRM PROJECT DELETION WITH OPTIONS                 */}
      {/* ============================================================ */}
      {projectToDelete && (
        <div
          onClick={() => setProjectToDelete(null)}
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141416] border border-white/[0.12] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
          >
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-red-500 font-bold uppercase tracking-widest block">
                CONFIRM PROJECT DELETION
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                {projectToDelete.title}
              </h3>
              <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                Choose how you want to handle the {works.filter((w) => w.projectId === projectToDelete.id).length} deliverable picture(s) inside this project:
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Delete project AND all pictures */}
              <button
                type="button"
                onClick={() => handleDeleteProjectConfirmed(projectToDelete, true)}
                className="w-full p-4 rounded-2xl bg-red-500/20 hover:bg-red-600 border border-red-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="font-mono text-xs font-bold text-red-300 group-hover:text-white uppercase tracking-wider">
                  Delete Project &amp; ALL Pictures Permanently
                </div>
                <div className="font-mono text-[11px] text-neutral-400 group-hover:text-white/80 pt-1">
                  Permanently deletes this project container AND completely removes all its pictures from the entire website.
                </div>
              </button>

              {/* Option 2: Delete project container only */}
              <button
                type="button"
                onClick={() => handleDeleteProjectConfirmed(projectToDelete, false)}
                className="w-full p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-left transition-all cursor-pointer group"
              >
                <div className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Delete Project Only (Keep Pictures Standalone)
                </div>
                <div className="font-mono text-[11px] text-neutral-400 group-hover:text-neutral-300 pt-1">
                  Removes the project container, but preserves all images/videos as standalone works in your library.
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
