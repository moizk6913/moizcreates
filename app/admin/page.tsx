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

type AdminView = 'all_work' | 'projects' | 'single_project' | 'playground' | 'collections' | 'journal' | 'inquiries' | 'settings';

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
              let poster = '';
              try {
                poster = canvas.toDataURL('image/webp', 0.85);
                if (!poster.startsWith('data:image/webp')) poster = canvas.toDataURL('image/jpeg', 0.85);
              } catch {
                poster = canvas.toDataURL('image/jpeg', 0.85);
              }
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
            try {
              thumbData = thumbCanvas.toDataURL('image/webp', 0.85);
              if (!thumbData.startsWith('data:image/webp')) thumbData = thumbCanvas.toDataURL('image/jpeg', 0.85);
            } catch {
              thumbData = thumbCanvas.toDataURL('image/jpeg', 0.85);
            }
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
              try {
                finalData = canvas.toDataURL('image/webp', 0.88);
                if (!finalData.startsWith('data:image/webp')) finalData = canvas.toDataURL('image/jpeg', 0.88);
              } catch {
                finalData = canvas.toDataURL('image/jpeg', 0.88);
              }
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
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);
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
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const [folderUploadStatus, setFolderUploadStatus] = useState<string | null>(null);

  // Dedicated Playground Lab State & Uploader
  const [isPlaygroundUploadOpen, setIsPlaygroundUploadOpen] = useState(false);
  const [pgAsset, setPgAsset] = useState<InspectedAsset | null>(null);
  const [pgFormat, setPgFormat] = useState<'9:16' | '16:9' | '4:5' | '1:1'>('9:16');
  const [pgTitle, setPgTitle] = useState('');
  const [pgRole, setPgRole] = useState('');
  const [pgYear, setPgYear] = useState(new Date().getFullYear().toString());
  const [pgDesc, setPgDesc] = useState('');
  const [pgTags, setPgTags] = useState('');
  const [isPublishingPg, setIsPublishingPg] = useState(false);
  const [pgFilterFormat, setPgFilterFormat] = useState<'all' | '9:16' | '16:9' | '4:5' | '1:1'>('all');
  const pgFileInputRef = useRef<HTMLInputElement>(null);

  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const [isUpdatingInquiry, setIsUpdatingInquiry] = useState(false);

  // Backups State
  const [backupSnapshots, setBackupSnapshots] = useState<any[]>([]);

  // Journal / Article Composer State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSubtitle, setArticleSubtitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('TECHNIQUE & PHILOSOPHY');
  const [articleCover, setArticleCover] = useState('');
  const [articleContentRaw, setArticleContentRaw] = useState('');
  const [articleCamera, setArticleCamera] = useState('');
  const [articleLighting, setArticleLighting] = useState('');
  const [articleAspect, setArticleAspect] = useState('2.39:1 Anamorphic & 9:16 Vertical');
  const [articleDeliverables, setArticleDeliverables] = useState('Director\'s Cut 60s, Stills Suite');
  const [articlePreviewMode, setArticlePreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const articleCoverInputRef = useRef<HTMLInputElement>(null);

  const notifyUser = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const refreshInquiries = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInquiries(data.inquiries || []);
        }
      }
    } catch {}
  }, []);

  const refreshBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup?action=list');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBackupSnapshots(data.snapshots || []);
        }
      }
    } catch {}
  }, []);

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
      
      // Fetch articles from database API with fallback
      try {
        const bRes = await fetch('/api/admin/blog');
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.success && Array.isArray(bData.posts) && bData.posts.length > 0) {
            setPosts(bData.posts);
          } else {
            setPosts(getStoredBlogPosts());
          }
        } else {
          setPosts(getStoredBlogPosts());
        }
      } catch {
        setPosts(getStoredBlogPosts());
      }

      setApiKey(getStoredApiKey());
      setSeoConfig(getStoredSeoConfig());
      await refreshInquiries();
      await refreshBackups();
    } catch (err) {
      console.error('Failed to load archive data', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshInquiries, refreshBackups]);

  // Auth Verification on Mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setIsAuthenticated(true);
          refreshData();
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsCheckingAuth(false));
  }, [refreshData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setLoginPassword('');
        refreshData();
        notifyUser('Studio Desk unlocked. Welcome, Director.');
      } else {
        setLoginError(data.error || 'Authentication rejected.');
      }
    } catch {
      setLoginError('Network failure connecting to Studio auth.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
    notifyUser('Studio Desk locked.');
  };

  const handleInquiryStatus = async (id: string, status: string) => {
    setIsUpdatingInquiry(true);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await refreshInquiries();
        notifyUser(`Inquiry status updated to ${status}.`);
      }
    } catch {
      notifyUser('Failed to update inquiry status.');
    } finally {
      setIsUpdatingInquiry(false);
    }
  };

  const handleInquiryDelete = async (id: string) => {
    if (!confirm('Permanently delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshInquiries();
        notifyUser('Inquiry deleted.');
      }
    } catch {
      notifyUser('Failed to delete inquiry.');
    }
  };

  const handleTriggerSnapshot = async () => {
    try {
      const res = await fetch('/api/admin/backup?action=create_snapshot');
      if (res.ok) {
        const data = await res.json();
        await refreshBackups();
        notifyUser(`Snapshot created: ${data.snapshot?.filename}`);
      }
    } catch {
      notifyUser('Snapshot creation failed.');
    }
  };

  const handleOpenNewArticleModal = () => {
    setEditingArticle(null);
    setArticleTitle('');
    setArticleSubtitle('');
    setArticleCategory('TECHNIQUE & PHILOSOPHY');
    setArticleCover('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&auto=format&fit=crop&q=80');
    setArticleContentRaw(
      'The modern visual eye is bombarded by resolution without intentionality. True art direction begins when every millimeter of the frame has purpose.\n\n' +
      '> "Lighting is not merely illumination; it is the philosophical architecture of shadow."\n\n' +
      '## The Discipline of Single-Source Lighting\n\n' +
      'By committing to a single dominant key light, the natural contrast ratio creates sculptural depth across both 35mm film stills and high-speed motion captures.'
    );
    setArticleCamera('ARRI Alexa Mini LF // Cooke Anamorphic /i Full Frame Plus');
    setArticleLighting('Single Source Soft Tungsten Key + Astera Titan Tubes');
    setArticleAspect('2.39:1 Anamorphic & 9:16 Vertical');
    setArticleDeliverables('Director\'s Cut 60s, Stills Suite');
    setArticlePreviewMode('edit');
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticleModal = (post: any) => {
    setEditingArticle(post);
    setArticleTitle(post.title || '');
    setArticleSubtitle(post.subtitle || '');
    setArticleCategory(post.category || 'TECHNIQUE & PHILOSOPHY');
    setArticleCover(post.coverImage || '');
    setArticleContentRaw(Array.isArray(post.content) ? post.content.join('\n\n') : (post.content || ''));
    setArticleCamera(post.specs?.camera || '');
    setArticleLighting(post.specs?.lighting || '');
    setArticleAspect(post.specs?.aspectRatio || '');
    setArticleDeliverables(Array.isArray(post.specs?.deliverables) ? post.specs.deliverables.join(', ') : (post.specs?.deliverables || ''));
    setArticlePreviewMode('edit');
    setIsArticleModalOpen(true);
  };

  const handleArticleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const asset = data.asset || (data.assets && data.assets[0]);
        if (data.success && asset) {
          setArticleCover(asset.url);
          notifyUser('Cover converted to WebP.');
        }
      }
    } catch {
      notifyUser('Failed to upload cover image.');
    }
  };

  const handleSaveArticle = async () => {
    if (!articleTitle.trim()) {
      alert('Article title is required.');
      return;
    }
    setIsSavingArticle(true);
    try {
      const paragraphs = articleContentRaw
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const deliverables = articleDeliverables
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const hasSpecs = articleCamera || articleLighting || articleAspect || deliverables.length > 0;
      const specs = hasSpecs ? {
        camera: articleCamera.trim() || undefined,
        lighting: articleLighting.trim() || undefined,
        aspectRatio: articleAspect.trim() || undefined,
        deliverables: deliverables.length > 0 ? deliverables : undefined,
      } : undefined;

      const payload = {
        title: articleTitle.trim(),
        subtitle: articleSubtitle.trim(),
        category: articleCategory.trim(),
        coverImage: articleCover.trim() || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&auto=format&fit=crop&q=80',
        content: paragraphs,
        specs,
        status: 'published',
      };

      if (editingArticle?.id) {
        const res = await fetch(`/api/admin/blog/${editingArticle.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          notifyUser(`Article "${articleTitle}" updated.`);
        }
      } else {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          notifyUser(`Article "${articleTitle}" published.`);
        }
      }

      await refreshData();
      setIsArticleModalOpen(false);
    } catch (err) {
      console.error('Failed to save article', err);
      notifyUser('Error saving article.');
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (post: any) => {
    if (!confirm(`Permanently delete article "${post.title}"?`)) return;
    try {
      if (post.id) {
        await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' });
      }
      deleteBlogPost(post.slug);
      await refreshData();
      notifyUser('Article deleted.');
    } catch {
      notifyUser('Failed to delete article.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const handleUpdate = () => refreshData();
      window.addEventListener('antigravity_content_updated', handleUpdate);
      return () => window.removeEventListener('antigravity_content_updated', handleUpdate);
    }
  }, [isAuthenticated, refreshData]);

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
  // INGESTION: RECURSIVE PROJECT FOLDER PIPELINE
  // ==========================================

  const scanEntry = async (entry: any, basePath = ''): Promise<Array<{ file: File; path: string }>> => {
    if (!entry) return [];
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file(
          (file: File) => {
            resolve([{ file, path: basePath ? `${basePath}/${file.name}` : file.name }]);
          },
          () => resolve([])
        );
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readAllEntries = async (): Promise<any[]> => {
        const entries: any[] = [];
        let batch: any[];
        do {
          batch = await new Promise((resolve) => dirReader.readEntries(resolve, () => resolve([])));
          entries.push(...batch);
        } while (batch.length > 0);
        return entries;
      };

      const childEntries = await readAllEntries();
      const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const nested = await Promise.all(childEntries.map((c) => scanEntry(c, currentPath)));
      return nested.flat();
    }
    return [];
  };

  const handleFolderUpload = async (items: Array<{ file: File; path: string }>) => {
    if (!items.length) return;

    const validMedia = items.filter(({ file }) =>
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      /\.(jpg|jpeg|png|webp|avif|gif|mp4|mov|webm)$/i.test(file.name)
    );

    if (!validMedia.length) {
      notifyUser('No supported image or video media found in this folder.');
      return;
    }

    // Detect project name from first item's root folder
    const firstParts = validMedia[0].path.split(/[/\\]/);
    const projectName = firstParts.length > 1 ? firstParts[0] : 'Uploaded Project';

    setIsUploadingFolder(true);
    setFolderUploadStatus(`Ingesting "${projectName}": Converting media & building sections...`);
    notifyUser(`Ingesting folder "${projectName}"...`);

    try {
      const formData = new FormData();
      formData.append('title', projectName);

      validMedia.forEach(({ file, path }) => {
        formData.append('files', file);
        formData.append('paths', path);
      });

      const res = await fetch('/api/admin/upload-folder', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notifyUser(`Success: "${data.project.title}" ingested with ${data.sectionCount} sections!`);

        // Sync to local Canvas / Store
        try {
          const p = data.project;
          const canvasFile: any = {
            id: p.slug || p.id,
            code: p.slug?.slice(0, 4).toUpperCase() || 'PROJ',
            name: p.title,
            discipline: 'Art Direction',
            client: p.client || p.title,
            year: p.year || '2026',
            role: p.role || 'Director of Visuals',
            x: Math.random() * 800 - 400,
            y: Math.random() * 600 - 300,
            rot: (Math.random() - 0.5) * 6,
            img: p.coverImage || (p.gallery?.[0]?.url || ''),
            aspect: '16:9',
            colorTag: '#111111',
            assetType: 'folder',
            photos: (p.gallery || []).map((g: any) => g.url || g),
            desc: p.fullDescription || p.shortDescription,
            deliverables: p.services || ['Creative Direction', 'Campaign Architecture'],
            sections: (p.sections || []).map((s: any) => ({
              id: s.id,
              title: s.title,
              type: s.type,
              items: (s.items || []).map((it: any) => ({
                url: it.url,
                aspectRatio: it.dimensions?.aspectRatio,
                title: it.altText || it.originalName,
                type: it.type,
              })),
            })),
          };
          try {
            const rawStored = localStorage.getItem('moiz_custom_canvas_files');
            const files = rawStored ? JSON.parse(rawStored) : [];
            const updated = [canvasFile, ...files.filter((f: any) => f.id !== canvasFile.id)];
            localStorage.setItem('moiz_custom_canvas_files', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('moiz_canvas_updated'));
          } catch {}
        } catch (err) {
          console.warn('Could not sync canvas file locally', err);
        }

        await refreshData();
        setIsAddWorkOpen(false);
        setSelectedProjectId(data.project.id);
        setActiveView('projects');
      } else {
        notifyUser(data.error || 'Failed to ingest folder.');
      }
    } catch (err: any) {
      notifyUser(`Folder ingestion error: ${err.message}`);
    } finally {
      setIsUploadingFolder(false);
      setFolderUploadStatus(null);
    }
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
      const newWorks: WorkItem[] = [];

      for (let i = 0; i < uploadQueue.length; i++) {
        const item = uploadQueue[i];
        let mediaUrl = item.dataUrl;
        let thumbUrl = item.thumbnailUrl;

        // Route through backend media pipeline if physical file object is available
        if (item.file) {
          try {
            const formData = new FormData();
            formData.append('file', item.file);
            if (item.projectId) {
              formData.append('projectId', item.projectId);
            }
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              const asset = uploadData.asset || (uploadData.assets && uploadData.assets[0]);
              if (uploadData.success && asset) {
                mediaUrl = asset.url;
                thumbUrl = asset.thumbnailUrl || asset.url;
                if (asset.dimensions) {
                  item.dimensions = {
                    ...item.dimensions,
                    ...asset.dimensions,
                  };
                }
              }
            } else {
              const errData = await uploadRes.json().catch(() => ({}));
              throw new Error(errData.error || `Upload failed (${uploadRes.status})`);
            }
          } catch (uploadErr: any) {
            console.error('Upload to /api/upload failed:', uploadErr);
            throw new Error(`Upload error for "${item.fileName}": ${uploadErr.message || 'Server rejected file'}`);
          }
        }

        newWorks.push({
          id: `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: item.title,
          mediaUrl,
          thumbnailUrl: thumbUrl,
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
          createdAt: Date.now() + i,
          updatedAt: Date.now() + i,
        });
      }

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
    } catch (err: any) {
      console.error('Failed to save batch', err);
      notifyUser(err.message || 'Error uploading works. Check server connection.');
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

  const handlePlaygroundFileSelect = async (files: FileList | File[]) => {
    if (!files || !files.length) return;
    const file = files[0];
    try {
      const inspected = await inspectMediaFile(file);
      setPgAsset(inspected);
      setPgTitle(inspected.title);
      const suggestedAspect =
        inspected.dimensions.aspectRatio === '9:16'
          ? '9:16'
          : inspected.dimensions.aspectRatio === '16:9'
          ? '16:9'
          : inspected.dimensions.aspectRatio === '1:1'
          ? '1:1'
          : '4:5';
      setPgFormat(suggestedAspect);
      setPgRole(
        inspected.mediaType === 'video'
          ? (suggestedAspect === '9:16' ? 'Reel Director' : 'Cinematographer')
          : (suggestedAspect === '1:1' ? '3D Kinetic Artist' : 'Art Director')
      );
    } catch (err) {
      console.error('Failed to inspect playground asset:', err);
    }
  };

  const handlePublishPlaygroundExperiment = async () => {
    if (!pgAsset) {
      alert('Please choose an image or video file first.');
      return;
    }
    setIsPublishingPg(true);
    try {
      const now = Date.now();
      const customTags = pgTags.split(',').map((t) => t.trim()).filter(Boolean);
      const allTags = Array.from(new Set(['playground', 'lab', pgFormat, ...customTags]));

      let mediaUrl = pgAsset.dataUrl;
      let thumbUrl = pgAsset.thumbnailUrl || pgAsset.dataUrl;

      if (pgAsset.file) {
        try {
          const formData = new FormData();
          formData.append('file', pgAsset.file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const asset = uploadData.asset || (uploadData.assets && uploadData.assets[0]);
            if (uploadData.success && asset) {
              mediaUrl = asset.url;
              thumbUrl = asset.thumbnailUrl || asset.url;
            }
          }
        } catch (uploadErr) {
          console.warn('Physical playground upload fallback to local dataUrl', uploadErr);
        }
      }

      const newWork: WorkItem = {
        id: `pg-${now}-${Math.random().toString(36).slice(2, 6)}`,
        title: pgTitle.trim() || pgAsset.title || 'Untitled Experiment',
        mediaUrl,
        thumbnailUrl: thumbUrl,
        mediaType: pgAsset.mediaType,
        fileType: pgAsset.fileType,
        fileName: pgAsset.fileName,
        fileSize: pgAsset.fileSize,
        dimensions: {
          ...pgAsset.dimensions,
          aspectRatio: pgFormat,
          orientation: pgFormat === '9:16' ? 'vertical' : pgFormat === '16:9' ? 'horizontal' : pgFormat === '1:1' ? 'square' : 'vertical',
        },
        workType: pgRole.trim() || (pgAsset.mediaType === 'video' ? 'Kinetic Reel' : 'Editorial Still'),
        disciplines: ['Playground', 'Lab'],
        tags: allTags,
        projectId: null,
        collectionIds: [],
        seriesId: null,
        client: 'DIRECTORIAL LAB',
        year: pgYear || new Date().getFullYear().toString(),
        caption: pgDesc.trim() || 'Uncommissioned directorial experiment.',
        status: 'published',
        createdAt: now,
        updatedAt: now,
      };

      await saveWorkAsync(newWork);
      await refreshData();
      setIsPlaygroundUploadOpen(false);
      setPgAsset(null);
      setPgTitle('');
      setPgRole('');
      setPgDesc('');
      setPgTags('');
      notifyUser(`Published "${newWork.title}" to Playground Lab!`);
    } catch (err) {
      console.error('Failed to publish playground experiment:', err);
      alert('Error saving experiment to database.');
    } finally {
      setIsPublishingPg(false);
    }
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

  // Playground Lab works memo
  const playgroundWorks = useMemo(() => {
    return works.filter((w) => {
      const isTaggedPg =
        w.tags &&
        w.tags.some(
          (t) =>
            t.toLowerCase().includes('playground') ||
            t.toLowerCase().includes('lab') ||
            t.toLowerCase().includes('experiment')
        );
      const isPgType =
        w.workType?.toLowerCase().includes('playground') ||
        w.workType?.toLowerCase().includes('experiment');
      return !w.projectId || isTaggedPg || isPgType;
    });
  }, [works]);

  const filteredPlaygroundWorks = useMemo(() => {
    if (pgFilterFormat === 'all') return playgroundWorks;
    return playgroundWorks.filter((w) => {
      const aspect = w.dimensions?.aspectRatio;
      if (pgFilterFormat === '9:16') return aspect === '9:16' || w.dimensions?.orientation === 'vertical';
      if (pgFilterFormat === '16:9') return aspect === '16:9' || w.dimensions?.orientation === 'horizontal';
      if (pgFilterFormat === '1:1') return aspect === '1:1' || w.dimensions?.orientation === 'square';
      if (pgFilterFormat === '4:5') return aspect === '4:5';
      return true;
    });
  }, [playgroundWorks, pgFilterFormat]);

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

  const filteredInquiries = useMemo(() => {
    if (inquiryFilter === 'all') return inquiries;
    return inquiries.filter((iq) => iq.status === inquiryFilter);
  }, [inquiries, inquiryFilter]);

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-[#0d0d0e] text-white flex items-center justify-center font-mono">
        <CustomCursor />
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-neutral-400">Verifying Studio Credentials...</span>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0d0d0e] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <CustomCursor />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#141416] border border-white/[0.08] shadow-2xl relative z-10 space-y-8">
          <div className="space-y-2 text-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Moiz Studio • Restricted Access</span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">Studio Desk</h1>
            <p className="font-mono text-xs text-neutral-400">Enter your administrative master password to manage archive projects, inquiries, and media.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block">Admin Password</label>
              <input
                type="password"
                required
                autoFocus
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.1] text-white font-mono text-sm outline-none focus:border-white transition-colors"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Unlock Studio Desk →'}
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.06] text-center">
            <Link href="/" className="font-mono text-xs text-neutral-500 hover:text-white transition-colors">
              ← Return to public website
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0e] text-white selection:bg-white selection:text-black font-sans flex flex-col">
      <CustomCursor />
      {/* Global Hidden Recursive Folder Ingestion Input */}
      <input
        ref={folderInputRef}
        type="file"
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          const items: Array<{ file: File; path: string }> = [];
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            items.push({
              file: f,
              path: (f as any).webkitRelativePath || f.name,
            });
          }
          await handleFolderUpload(items);
          if (folderInputRef.current) folderInputRef.current.value = '';
        }}
      />

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
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[9px] font-bold uppercase">
            Upload First CMS
          </span>
        </div>

        {/* View Switcher Pills */}
        <nav className="flex items-center bg-black/60 p-1 rounded-full text-xs font-mono">
          <button
            type="button"
            onClick={() => { setActiveView('all_work'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'all_work' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Work ({works.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('projects'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'projects' || activeView === 'single_project'
                ? 'bg-white text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('playground'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              activeView === 'playground'
                ? 'bg-white text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>Playground ({playgroundWorks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('inquiries'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              activeView === 'inquiries' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Inquiries</span>
            {inquiries.some((iq) => iq.status === 'new') && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <span className="text-[10px] opacity-75">({inquiries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('journal'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'journal' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Journal ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('settings'); setSelectedProjectId(null); }}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
              activeView === 'settings' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Actions Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              folderInputRef.current?.click();
            }}
            className="hidden sm:flex px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all items-center gap-1.5 cursor-pointer"
            title="Upload Complete Project Folder (KALADHAR/, etc.)"
          >
            <span>📁</span>
            <span>Upload Folder</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadQueue([]);
              setBatchSuggestion(null);
              setIsAddWorkOpen(true);
            }}
            className="px-5 py-2 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>Add Work</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Lock Studio Desk"
            className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5"
          >
            <span>🔒</span>
            <span>Lock</span>
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
              <span className="text-white font-bold">
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
                        ? 'border-white ring-2 ring-white/50'
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
                      {isSelected && <span className="text-white font-black text-xs">✓</span>}
                    </div>

                    {/* Single Picture Delete Quick Action */}
                    <button
                      type="button"
                      title="Delete Picture"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingleWork(work);
                      }}
                      className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-lg bg-black/80 hover:bg-white hover:text-black text-neutral-300 flex items-center justify-center text-xs transition-colors cursor-pointer border border-white/10 shadow-md"
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
                        <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
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
              className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
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
                className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
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
                            <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
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

                        <h3 className="font-display font-black text-xl text-white uppercase tracking-tight group-hover:text-neutral-400 transition-colors">
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
                  <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-widest">
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
                  className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
            className="p-6 rounded-2xl border border-dashed border-white/15 hover:border-white bg-white/[0.02] hover:bg-white/[0.06] transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] group-hover:bg-white group-hover:text-black flex items-center justify-center text-lg transition-colors shrink-0">
                ＋
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Drop new media to add directly to {currentProject.title}
                </p>
                <p className="font-mono text-[11px] text-neutral-400">
                  Auto-converts photos to WebP &amp; videos to web-optimized MP4 with WebP poster. Ratios auto-detected.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-4 py-2 rounded-full bg-white text-black group-hover:bg-neutral-200 transition-colors shrink-0">
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
                        <span className="absolute top-2.5 left-2.5 z-30 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full bg-white text-black shadow-lg flex items-center gap-1">
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
                        <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
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
      {/* VIEW 3.5: PLAYGROUND LAB (360° INFINITE CANVAS ASSETS)        */}
      {/* ============================================================ */}
      {activeView === 'playground' && (
        <section className="flex-1 max-w-[1700px] w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  Playground Lab • 360° Canvas ({playgroundWorks.length})
                </h2>
              </div>
              <p className="font-mono text-xs text-neutral-400 pt-1.5 max-w-2xl">
                Uncommissioned directorial experiments, kinetic 3D typography, 9:16 vertical reels, and 35mm stills.
                Everything uploaded here is instantly live in the infinite 360° wrapping canvas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/canvas?view=playground"
                target="_blank"
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-white/15 flex items-center gap-2"
              >
                <span>↗</span>
                <span>Open 360° Playground</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setPgAsset(null);
                  setPgTitle('');
                  setPgRole('');
                  setPgDesc('');
                  setPgTags('');
                  setIsPlaygroundUploadOpen(true);
                }}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Upload Experiment</span>
              </button>
            </div>
          </div>

          {/* Quick Format Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPgFilterFormat('all')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                pgFilterFormat === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              All ({playgroundWorks.length})
            </button>
            <button
              type="button"
              onClick={() => setPgFilterFormat('9:16')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                pgFilterFormat === '9:16'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              📱 Reels 9:16
            </button>
            <button
              type="button"
              onClick={() => setPgFilterFormat('16:9')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                pgFilterFormat === '16:9'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              🎬 Films 16:9
            </button>
            <button
              type="button"
              onClick={() => setPgFilterFormat('4:5')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                pgFilterFormat === '4:5'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              📷 Stills 4:5
            </button>
            <button
              type="button"
              onClick={() => setPgFilterFormat('1:1')}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                pgFilterFormat === '1:1'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              🌀 Kinetic 1:1
            </button>
          </div>

          {/* Grid of Playground Works */}
          {filteredPlaygroundWorks.length === 0 ? (
            <div className="p-16 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center text-3xl">
                ⚡
              </div>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                No Playground Experiments Found
              </h3>
              <p className="font-mono text-xs text-neutral-400 max-w-md">
                Upload your uncommissioned motion reels, 3D kinetic loops, cinema frames, and photography stills. They will be rendered on the seamless 360° torus canvas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPgAsset(null);
                  setIsPlaygroundUploadOpen(true);
                }}
                className="px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                + Upload First Experiment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaygroundWorks.map((work) => {
                const aspect = work.dimensions?.aspectRatio || (work.mediaType === 'video' ? '16:9' : '4:5');
                const isVideo = work.mediaType === 'video';

                return (
                  <div
                    key={work.id}
                    className="group bg-[#121214] rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col transition-all duration-300 hover:border-white/20 hover:shadow-xl"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
                      {isVideo ? (
                        <video
                          src={work.mediaUrl}
                          poster={work.thumbnailUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={work.thumbnailUrl || work.mediaUrl}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}

                      {/* Aspect Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider border border-white/10">
                        {aspect}
                      </span>

                      {/* Media Type Badge */}
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-neutral-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-white/10">
                        {isVideo ? 'VIDEO' : 'IMAGE'}
                      </span>
                    </div>

                    {/* Meta & Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-sans font-bold text-sm text-white line-clamp-1 group-hover:text-neutral-400 transition-colors">
                            {work.title}
                          </h4>
                          <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                            {work.year || '2026'}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-neutral-400">
                          {work.workType || 'Directorial Experiment'}
                        </p>
                        {work.caption && (
                          <p className="font-sans text-xs text-neutral-500 line-clamp-2 pt-1">
                            {work.caption}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {work.tags && work.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {work.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400 font-mono text-[9px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <Link
                          href="/canvas?view=playground"
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white font-mono text-[10px] font-bold uppercase transition-colors"
                        >
                          ↗ Canvas
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Permanently delete "${work.title}" from Playground Lab?`)) {
                              await deleteWorkAsync(work.id);
                              await refreshData();
                              notifyUser(`Deleted "${work.title}".`);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
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
      {/* VIEW 4: JOURNAL / BLOG                                       */}
      {/* ============================================================ */}
      {activeView === 'journal' && (
        <section className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Journal Articles ({posts.length})
              </h2>
              <p className="font-mono text-xs text-neutral-400 pt-1">
                Editorial thoughts, on-set technical notes, and typography manifestos. Complete with highlight quote styling and technical camera specs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewArticleModal}
              className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-2 shadow-sm"
            >
              <span>+</span>
              <span>Write Article</span>
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#141416] border border-white/[0.06] text-center space-y-4">
              <span className="text-3xl block">✍️</span>
              <h3 className="font-display font-bold text-lg text-white">No Journal Articles Yet</h3>
              <p className="font-mono text-xs text-neutral-400 max-w-sm mx-auto">
                Write on-set technical breakdowns, typography manifestos, or creative philosophy with rich highlight blocks.
              </p>
              <button
                type="button"
                onClick={handleOpenNewArticleModal}
                className="px-5 py-2 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 cursor-pointer"
              >
                Write First Essay →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.slug || post.id}
                  className="p-6 sm:p-7 rounded-2xl bg-[#141416] border border-white/[0.06] hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 max-w-3xl">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        {post.category} • {post.date || 'RECENT'}
                      </span>
                      {post.readTime && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/[0.05] text-neutral-400">
                          {post.readTime}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">
                      {post.title}
                    </h3>
                    {post.subtitle && (
                      <p className="font-sans text-xs text-neutral-400 line-clamp-1">
                        {post.subtitle}
                      </p>
                    )}
                    <p className="font-mono text-xs text-neutral-500 line-clamp-1">
                      {post.excerpt || (Array.isArray(post.content) ? post.content[0] : post.content)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEditArticleModal(post)}
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      View Post ↗
                    </Link>
                    <button
                      type="button"
                      title="Delete Article"
                      onClick={() => handleDeleteArticle(post)}
                      className="p-2 rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* VIEW 4.5: INQUIRIES & CLIENT CORRESPONDENCE                 */}
      {/* ============================================================ */}
      {activeView === 'inquiries' && (
        <section className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  Inquiries ({inquiries.length})
                </h2>
                {inquiries.some((iq) => iq.status === 'new') && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    {inquiries.filter((iq) => iq.status === 'new').length} New
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-neutral-400 pt-1">
                Direct client correspondence received from the website contact modal. Verified with server-side honeypot and rate limiting.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshInquiries}
              className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-2"
            >
              <span>↻</span>
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
            {(['all', 'new', 'read', 'replied', 'archived'] as const).map((st) => {
              const count = st === 'all' ? inquiries.length : inquiries.filter((iq) => iq.status === st).length;
              const isActive = inquiryFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setInquiryFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {/* Inquiries List */}
          {filteredInquiries.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#141416] border border-white/[0.06] text-center space-y-3">
              <span className="text-3xl block">📬</span>
              <h3 className="font-display font-bold text-lg text-white">No Inquiries Found</h3>
              <p className="font-mono text-xs text-neutral-500 max-w-sm mx-auto">
                No inquiries matching the current filter. Incoming proposals will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => {
                const dateStr = inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'Recently';

                return (
                  <div
                    key={inquiry.id}
                    className={`p-6 sm:p-7 rounded-3xl bg-[#141416] border transition-all ${
                      inquiry.status === 'new'
                        ? 'border-emerald-500/30 bg-emerald-950/[0.04] shadow-lg shadow-emerald-950/20'
                        : 'border-white/[0.06]'
                    } space-y-5`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display font-black text-lg text-white">
                            {inquiry.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${
                              inquiry.status === 'new'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : inquiry.status === 'replied'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : inquiry.status === 'archived'
                                ? 'bg-neutral-800 text-neutral-400'
                                : 'bg-neutral-700/50 text-neutral-300'
                            }`}
                          >
                            {inquiry.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-neutral-400">
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="text-white hover:underline underline-offset-4 flex items-center gap-1"
                          >
                            <span>✉</span>
                            <span>{inquiry.email}</span>
                          </a>
                          <span>•</span>
                          <span>{dateStr}</span>
                          {inquiry.budget && (
                            <>
                              <span>•</span>
                              <span className="text-neutral-300 font-bold">Budget: {inquiry.budget}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions Controls */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <a
                          href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                            `Re: ${inquiry.subject || 'Design & Art Direction Inquiry'} — Moiz Studio`
                          )}`}
                          onClick={() => {
                            if (inquiry.status === 'new' || inquiry.status === 'read') {
                              handleInquiryStatus(inquiry.id, 'replied');
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Reply</span>
                          <span>↗</span>
                        </a>

                        <select
                          value={inquiry.status}
                          disabled={isUpdatingInquiry}
                          onChange={(e) => handleInquiryStatus(inquiry.id, e.target.value)}
                          className="px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-neutral-300 font-mono text-xs outline-none cursor-pointer focus:border-white/30"
                        >
                          <option value="new">Mark New</option>
                          <option value="read">Mark Read</option>
                          <option value="replied">Mark Replied</option>
                          <option value="archived">Mark Archived</option>
                        </select>

                        <button
                          type="button"
                          title="Delete Inquiry"
                          onClick={() => handleInquiryDelete(inquiry.id)}
                          className="p-2 rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Inquiry Message */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/[0.04]">
                      {inquiry.subject && (
                        <h4 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                          Subject: {inquiry.subject}
                        </h4>
                      )}
                      <p className="font-mono text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {inquiry.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  setApiErrorMsg(null);
                }}
                placeholder="Enter Gemini API Key (e.g. AIzaSy... or AQ...)"
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/[0.08] text-white font-mono text-xs outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={async () => {
                  saveApiKey(apiKey);
                  notifyUser('Verifying API Key with Google...');
                  setApiErrorMsg(null);
                  try {
                    const res = await fetch('/api/ai', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'verify_key', geminiKey: apiKey }),
                    });
                    const data = await res.json();
                    if (data.verified) {
                      setApiVerified(true);
                      setApiErrorMsg(null);
                      notifyUser('API Key Verified & Saved to Server!');
                    } else {
                      setApiVerified(false);
                      setApiErrorMsg(data.error || 'Google rejected this key.');
                      notifyUser('Google rejected this API Key.');
                    }
                  } catch (err: any) {
                    setApiVerified(false);
                    setApiErrorMsg(err?.message || 'Connection failed.');
                  }
                }}
                className="px-6 py-3 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
              >
                Save &amp; Verify
              </button>
            </div>

            {apiVerified === true && (
              <div className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-2">
                <span>✓</span>
                <span>Active &amp; connected to Google Gemini 3.6 Flash.</span>
              </div>
            )}
            {apiVerified === false && (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2">
                <div className="font-mono text-xs text-red-400 font-bold flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">✕</span>
                  <span>{apiErrorMsg || 'Key invalid or refused by Google.'}</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-400 pl-4 space-y-1">
                  <p className="text-white font-bold">How to resolve:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-neutral-300">
                    <li>Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-400 underline hover:text-white">Google AI Studio (API Keys) ↗</a></li>
                    <li>Click <strong className="text-white">Create API key</strong></li>
                    <li>Select <strong className="text-white">Create API key in NEW project</strong> (do not reuse an old project)</li>
                    <li>Copy your fresh key, paste it in the box above, and click <strong className="text-white">Save &amp; Verify</strong></li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Server Database Snapshots & Backups */}
          <div className="p-8 rounded-3xl bg-[#141416] border border-white/[0.06] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Server Database Backups (data/portfolio-db.json)
                </h3>
                <p className="font-mono text-xs text-neutral-400">
                  Transactional file-based database backups. Snapshots are stored on server disk in data/backups/.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="/api/admin/backup?action=download"
                  download="portfolio-db.json"
                  className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Download DB File
                </a>
                <button
                  type="button"
                  onClick={handleTriggerSnapshot}
                  className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  + Create Snapshot Now
                </button>
              </div>
            </div>

            {backupSnapshots.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-bold block">
                  Available Disk Snapshots ({backupSnapshots.length})
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                  {backupSnapshots.map((snap) => (
                    <div
                      key={snap.filename}
                      className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between font-mono text-xs text-neutral-300"
                    >
                      <span className="text-white truncate max-w-sm">{snap.filename}</span>
                      <div className="flex items-center gap-4 text-neutral-400 shrink-0">
                        <span>{(snap.size / 1024).toFixed(1)} KB</span>
                        <span>{new Date(snap.modified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-neutral-500 italic">No automated disk snapshots created yet.</p>
            )}
          </div>

          {/* Database Backup & Export */}
          <div className="p-8 rounded-3xl bg-[#141416] border border-white/[0.06] space-y-4">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Client Archive JSON Export
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
          <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
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
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold uppercase tracking-wider">
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
              {/* Folder Upload Progress Banner */}
              {isUploadingFolder && (
                <div className="p-5 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                  <div className="space-y-0.5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-white">
                      Processing Project Folder &amp; Media Pipeline
                    </h5>
                    <p className="font-mono text-xs text-neutral-300">
                      {folderUploadStatus || 'Transcoding media into multi-variant WebP & FastStart MP4...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                    const entries: any[] = [];
                    for (let i = 0; i < e.dataTransfer.items.length; i++) {
                      const item = e.dataTransfer.items[i];
                      const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
                      if (entry) entries.push(entry);
                    }
                    const hasDirectory = entries.some((entry) => entry && entry.isDirectory);
                    if (hasDirectory) {
                      notifyUser('Detected project folder drop. Scanning structure...');
                      const scanned = (await Promise.all(entries.map((entry) => scanEntry(entry)))).flat();
                      await handleFolderUpload(scanned);
                      return;
                    }
                  }
                  if (e.dataTransfer.files) handleDropFiles(e.dataTransfer.files);
                }}
                className="p-10 rounded-3xl border-2 border-dashed border-white/15 hover:border-white hover:bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-4 transition-all duration-300 group"
              >
                {/* Hidden File Input */}
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

                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] group-hover:bg-white group-hover:text-black text-white flex items-center justify-center text-2xl transition-all group-hover:scale-110">
                  📁
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-lg text-white uppercase tracking-tight">
                    Drag &amp; Drop Creative Files or Entire Project Folder Here
                  </h4>
                  <p className="font-mono text-xs text-neutral-400 max-w-md mx-auto">
                    Drop a complete folder (e.g. <strong className="text-white">KALADHAR/</strong> with subfolders: catalog/, grid-1/, stories/, web-banners/, deck/). The system automatically extracts project title and builds responsive sections without cropping.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
                  >
                    Select Individual Files
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderInputRef.current?.click();
                    }}
                    className="px-5 py-2.5 rounded-full bg-white/[0.1] hover:bg-white/[0.2] border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📁</span>
                    <span>Upload Full Project Folder</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auto WebP Converter Active
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    FastStart Video Transcoder Active
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Folder Section Parser Active
                  </span>
                </div>
              </div>

              {/* AI Status Banner */}
              {isAnalyzingAi && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-3 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
                  <span className="font-mono text-xs text-neutral-300 font-bold">
                    Analyzing uploaded work and comparing against existing archive relationships...
                  </span>
                </div>
              )}

              {/* Batch Match Banner (Existing Project Suggestion) */}
              {batchSuggestion?.matchedProjectName && (
                <div className="p-5 rounded-2xl bg-[#1a1a1e] border border-white/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-white font-bold uppercase tracking-widest block">
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
                      className="px-4 py-2 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 cursor-pointer"
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
                      Standalone
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
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg"
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
                    className="text-white hover:text-neutral-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
                    className="text-white hover:text-neutral-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
                className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: WRITE / EDIT JOURNAL ARTICLE                         */}
      {/* ============================================================ */}
      {isArticleModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingArticle) setIsArticleModalOpen(false);
          }}
          className="fixed inset-0 z-[115] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] bg-[#121214] border border-white/[0.08] rounded-[32px] overflow-hidden flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121214]/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  {editingArticle ? 'Edit Journal Article' : 'Write Journal Article'}
                </h3>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold uppercase tracking-wider">
                  EDITORIAL COMPOSER
                </span>
              </div>

              {/* Edit vs Live Preview Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-black/60 p-1 rounded-full text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setArticlePreviewMode('edit')}
                    className={`px-3.5 py-1 rounded-full transition-all cursor-pointer font-bold ${
                      articlePreviewMode === 'edit' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ✏️ Compose
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticlePreviewMode('preview')}
                    className={`px-3.5 py-1 rounded-full transition-all cursor-pointer font-bold ${
                      articlePreviewMode === 'preview' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    👁️ Reader Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scroll Body */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              {articlePreviewMode === 'edit' ? (
                <div className="space-y-6 font-mono text-xs">
                  {/* Title & Category Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-neutral-400 block font-bold uppercase tracking-wider text-[11px]">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        value={articleTitle}
                        onChange={(e) => setArticleTitle(e.target.value)}
                        placeholder="e.g. THE ARCHITECTURE OF LIGHTING IN 35MM"
                        className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white font-display font-black text-lg outline-none focus:border-white/30 tracking-tight"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-400 block font-bold uppercase tracking-wider text-[11px]">
                        Category
                      </label>
                      <select
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value)}
                        className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30"
                      >
                        <option value="TECHNIQUE & PHILOSOPHY">TECHNIQUE & PHILOSOPHY</option>
                        <option value="ON-SET NOTES">ON-SET NOTES</option>
                        <option value="DIRECTORIAL MANIFESTO">DIRECTORIAL MANIFESTO</option>
                        <option value="CASE ANALYSIS">CASE ANALYSIS</option>
                        <option value="EDITORIAL ESSAY">EDITORIAL ESSAY</option>
                      </select>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 block font-bold uppercase tracking-wider text-[11px]">
                      Subtitle / Lead Treatment
                    </label>
                    <input
                      type="text"
                      value={articleSubtitle}
                      onChange={(e) => setArticleSubtitle(e.target.value)}
                      placeholder="e.g. A breakdown of intentional shadow structures across anamorphic film suites."
                      className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30 font-sans text-xs"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                        Hero Cover Image URL
                      </label>
                      <button
                        type="button"
                        onClick={() => articleCoverInputRef.current?.click()}
                        className="text-white hover:underline text-[10px] uppercase font-bold cursor-pointer"
                      >
                        ↑ Upload Image File
                      </button>
                      <input
                        ref={articleCoverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleArticleCoverUpload}
                      />
                    </div>
                    <input
                      type="text"
                      value={articleCover}
                      onChange={(e) => setArticleCover(e.target.value)}
                      placeholder="https://... or /uploads/images/..."
                      className="w-full p-3 rounded-xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30 text-xs"
                    />
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                      <label className="text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                        Article Body (Markdown &amp; Highlight Blocks)
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setArticleContentRaw((prev) => prev + '\n\n> "Lighting is not merely illumination; it is the philosophical architecture of shadow."\n\n');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          title="Inserts an elevated luxury pullquote card"
                        >
                          + Highlight Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setArticleContentRaw((prev) => prev + '\n\n## Section Sub-Heading\n\n');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          + Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setArticleContentRaw((prev) => prev + '\n\n---\n\n');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          + Divider
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={articleContentRaw}
                      onChange={(e) => setArticleContentRaw(e.target.value)}
                      rows={12}
                      placeholder="Write your article paragraphs here. Double enter = new paragraph. Lines starting with > become elevated luxury pullquotes."
                      className="w-full p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-white outline-none focus:border-white/30 font-sans text-xs leading-relaxed resize-y"
                    />
                    <span className="text-[10px] text-neutral-500 pt-1 block">
                      Tip: Double enter = new paragraph. Lines starting with &gt; become luxury highlight pullquotes with black contrast cards.
                    </span>
                  </div>

                  {/* Technical On-Set Specs (Optional) */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                    <span className="font-bold text-white uppercase tracking-widest text-[11px] block">
                      Technical On-Set Specs (Optional Callout Box)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-neutral-400 block text-[10px] uppercase pb-1">Camera &amp; Optics</label>
                        <input
                          type="text"
                          value={articleCamera}
                          onChange={(e) => setArticleCamera(e.target.value)}
                          placeholder="e.g. ARRI Alexa Mini LF // Cooke Anamorphic"
                          className="w-full p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-white outline-none focus:border-white/20 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 block text-[10px] uppercase pb-1">Lighting Package</label>
                        <input
                          type="text"
                          value={articleLighting}
                          onChange={(e) => setArticleLighting(e.target.value)}
                          placeholder="e.g. Single Source Soft Tungsten Key"
                          className="w-full p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-white outline-none focus:border-white/20 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 block text-[10px] uppercase pb-1">Frame Cadence / Aspect</label>
                        <input
                          type="text"
                          value={articleAspect}
                          onChange={(e) => setArticleAspect(e.target.value)}
                          placeholder="e.g. 2.39:1 Anamorphic & 9:16 Vertical"
                          className="w-full p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-white outline-none focus:border-white/20 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 block text-[10px] uppercase pb-1">Deliverables</label>
                        <input
                          type="text"
                          value={articleDeliverables}
                          onChange={(e) => setArticleDeliverables(e.target.value)}
                          placeholder="e.g. Director's Cut 60s, Stills Suite"
                          className="w-full p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-white outline-none focus:border-white/20 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* LIVE READER PREVIEW */
                <div className="p-8 sm:p-12 rounded-3xl bg-[#f7f6f3] text-black font-sans space-y-8 max-w-3xl mx-auto shadow-2xl">
                  {/* Meta */}
                  <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/10 text-black font-bold">
                      {articleCategory}
                    </span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-3 border-b border-black/10 pb-6">
                    <h1 className="font-display font-black text-3xl sm:text-4xl text-black uppercase tracking-tight leading-[0.95]">
                      {articleTitle || 'UNTITLED ESSAY'}
                    </h1>
                    {articleSubtitle && (
                      <p className="text-base text-neutral-600 font-medium">
                        {articleSubtitle}
                      </p>
                    )}
                  </div>

                  {/* Cover */}
                  {articleCover && (
                    <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={articleCover} alt={articleTitle} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Specs Box */}
                  {(articleCamera || articleLighting || articleAspect || articleDeliverables) && (
                    <div className="bg-white border-l-4 border-black p-6 rounded-r-2xl font-mono text-xs shadow-sm space-y-3">
                      <span className="font-bold text-black uppercase tracking-widest block text-[10px]">
                        TECHNICAL ON-SET SPECIFICATIONS
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        {articleCamera && (
                          <div>
                            <span className="text-neutral-400 block text-[9px] uppercase">Camera &amp; Optics</span>
                            <span className="text-black font-bold">{articleCamera}</span>
                          </div>
                        )}
                        {articleLighting && (
                          <div>
                            <span className="text-neutral-400 block text-[9px] uppercase">Lighting</span>
                            <span className="text-black font-bold">{articleLighting}</span>
                          </div>
                        )}
                        {articleAspect && (
                          <div>
                            <span className="text-neutral-400 block text-[9px] uppercase">Cadence</span>
                            <span className="text-black font-bold">{articleAspect}</span>
                          </div>
                        )}
                        {articleDeliverables && (
                          <div>
                            <span className="text-neutral-400 block text-[9px] uppercase">Deliverables</span>
                            <span className="text-black font-bold">{articleDeliverables}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Flow */}
                  <div className="space-y-6 text-sm sm:text-base leading-relaxed text-neutral-900">
                    {articleContentRaw.split('\n\n').map((p, idx) => {
                      const tr = p.trim();
                      if (tr.startsWith('>') || tr.startsWith('“') || (tr.startsWith('"') && tr.endsWith('"'))) {
                        const q = tr.replace(/^[>“"]+\s*/, '').replace(/["”]+$/, '');
                        return (
                          <blockquote
                            key={idx}
                            className="my-6 p-6 rounded-2xl bg-[#141416] text-white border-l-4 border-white shadow-xl relative"
                          >
                            <p className="font-display font-bold text-lg sm:text-xl tracking-tight leading-snug">
                              "{q}"
                            </p>
                          </blockquote>
                        );
                      }
                      if (tr.startsWith('## ') || tr.startsWith('# ')) {
                        return (
                          <h2 key={idx} className="font-display font-black text-xl text-black uppercase tracking-tight pt-4 border-t border-black/10">
                            {tr.replace(/^#+\s*/, '')}
                          </h2>
                        );
                      }
                      if (tr === '---') return <hr key={idx} className="border-black/10 my-4" />;
                      return (
                        <p key={idx} className={idx === 0 ? 'first-letter:text-4xl first-letter:font-display first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-black leading-relaxed' : 'leading-relaxed'}>
                          {p}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-5 border-t border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121214]/90 backdrop-blur-md">
              <span className="font-mono text-xs text-neutral-500">
                {articlePreviewMode === 'preview' ? 'Visualizing live reader view.' : 'Markdown highlights & specs enabled.'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingArticle}
                  onClick={handleSaveArticle}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingArticle ? 'Saving...' : editingArticle ? 'Save Changes' : 'Publish Article →'}
                </button>
              </div>
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
                <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
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
                className="w-full py-3 rounded-full bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
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

      {/* ============================================================ */}
      {/* PLAYGROUND LAB EXPERIMENT UPLOAD MODAL                         */}
      {/* ============================================================ */}
      {isPlaygroundUploadOpen && (
        <div
          onClick={() => setIsPlaygroundUploadOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[92vh] bg-[#121214] border border-white/[0.08] rounded-[28px] overflow-hidden flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121214]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                  Upload Playground Experiment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPlaygroundUploadOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 font-mono text-xs text-neutral-300">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) handlePlaygroundFileSelect(e.dataTransfer.files);
                }}
                onClick={() => pgFileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-white hover:bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-all group"
              >
                <input
                  ref={pgFileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handlePlaygroundFileSelect(e.target.files);
                  }}
                />
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] group-hover:bg-white group-hover:text-black text-white flex items-center justify-center text-xl transition-all">
                  📁
                </div>
                <div className="text-white font-bold font-sans text-sm">
                  {pgAsset ? `Selected: ${pgAsset.fileName}` : 'Drag & drop video (MP4/WebM) or high-res image'}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Auto-extracts video duration, aspect ratio, and generates instant thumbnail.
                </p>
              </div>

              {/* Preview Thumbnail if selected */}
              {pgAsset && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-4">
                  <div className="w-16 h-20 rounded-lg bg-black overflow-hidden relative shrink-0">
                    {pgAsset.mediaType === 'video' ? (
                      <video src={pgAsset.dataUrl} poster={pgAsset.thumbnailUrl} className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pgAsset.thumbnailUrl || pgAsset.dataUrl} alt={pgAsset.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-bold block">{pgAsset.title}</span>
                    <span className="text-neutral-500 text-[10px] block">
                      {pgAsset.dimensions.resolution} • {(pgAsset.fileSize / (1024 * 1024)).toFixed(1)} MB • {pgAsset.mediaType.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Format Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                  Canvas Aspect Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '9:16', label: '📱 Reel (9:16)' },
                    { id: '16:9', label: '🎬 Film (16:9)' },
                    { id: '4:5', label: '📷 Still (4:5)' },
                    { id: '1:1', label: '🌀 Kinetic (1:1)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setPgFormat(fmt.id as any)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        pgFormat === fmt.id
                          ? 'bg-white border-white text-black shadow-sm'
                          : 'bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={pgTitle}
                    onChange={(e) => setPgTitle(e.target.value)}
                    placeholder="e.g. KINETIC CHROME & TRANSIENTS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans text-xs focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Role / Category Medium
                  </label>
                  <input
                    type="text"
                    value={pgRole}
                    onChange={(e) => setPgRole(e.target.value)}
                    placeholder="e.g. Motion Director / 3D Loop"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Year & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Year
                  </label>
                  <input
                    type="text"
                    value={pgYear}
                    onChange={(e) => setPgYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={pgTags}
                    onChange={(e) => setPgTags(e.target.value)}
                    placeholder="Kinetic, 3D, Chrome, Sound"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                  Director Note / Technical Narrative
                </label>
                <textarea
                  rows={2}
                  value={pgDesc}
                  onChange={(e) => setPgDesc(e.target.value)}
                  placeholder="Notes about lenses, framerates, sound synchronization, or procedural shaders."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans text-xs focus:border-white focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3 shrink-0 bg-[#121214]">
              <button
                type="button"
                onClick={() => setIsPlaygroundUploadOpen(false)}
                className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white font-mono text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pgAsset || isPublishingPg}
                onClick={handlePublishPlaygroundExperiment}
                className="px-6 py-2 rounded-full bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                {isPublishingPg ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish to 360° Canvas</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
