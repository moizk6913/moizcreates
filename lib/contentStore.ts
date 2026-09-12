'use client';

import { BlogPost, INITIAL_BLOG_POSTS } from './blogData';
import {
  IDBWorkItem,
  IDBProject,
  IDBCollection,
  IDBSeriesGroup,
  getAllWorksIDB,
  saveWorkIDB,
  saveWorksBatchIDB,
  deleteWorkIDB,
  deleteWorksBatchIDB,
  getAllProjectsIDB,
  saveProjectIDB,
  deleteProjectIDB,
  getAllCollectionsIDB,
  saveCollectionIDB,
  deleteCollectionIDB,
  getAllSeriesIDB,
  saveSeriesIDB,
  deleteSeriesIDB,
  getAllCanvasFilesIDB,
  saveCanvasFileIDB,
  deleteCanvasFileIDB,
} from './idbStore';

// ==========================================
// CORE DOMAIN TYPES: UPLOAD FIRST, ORGANIZE SECOND
// ==========================================

export interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: string; // e.g. "9:16", "16:9", "4:5", "1:1", "custom"
  orientation: 'vertical' | 'horizontal' | 'square' | 'panoramic';
  duration?: number; // video duration in seconds
  resolution?: string; // e.g. "1920x1080", "3840x2160"
  fileSize?: number; // in bytes
}

export interface WorkItem {
  id: string; // UUID
  title: string;
  mediaUrl: string; // High-res asset data URL or hosted URI
  thumbnailUrl?: string; // Lightweight preview
  mediaType: 'image' | 'video';
  fileType: string; // "image/jpeg", "video/mp4", etc.
  fileName: string;
  fileSize: number;
  dimensions: MediaDimensions;
  
  // Content Taxonomy
  workType: string; // "Reel", "Social Design", "Advertisement", "Branding", "Photography", "Print", "Horizontal Video", "Poster", "Motion Graphic", etc.
  disciplines: string[]; // ["Art Direction", "Motion", "Editorial"]
  tags: string[]; // dynamic tags
  
  // Containers & Relationships (All Optional!)
  projectId: string | null; // null = Standalone Work!
  collectionIds: string[]; // e.g. ["selected-works", "2026-curation"]
  seriesId: string | null; // Optional sub-grouping (e.g. lookbook sequence, ad suite)
  seriesOrder?: number; // order inside the series/group
  
  // Metadata
  client?: string;
  year: string;
  caption?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: number;
  updatedAt: number;

  // AI Suggestions
  aiSuggestions?: {
    suggestedProjectId?: string;
    projectConfidence?: number;
    suggestedType?: string;
    suggestedDisciplines?: string[];
  };
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  tag?: string; // e.g. "HERITAGE LUXURY CAMPAIGN", "COMMERCIAL SHOOT"
  client?: string;
  role?: string; // e.g. "Lead Art Director"
  year: string;
  overview?: string; // narrative description
  coverWorkId?: string | null; // Reference to WorkItem ID (ZERO duplicated media!)
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'published' | 'draft';
}

export interface SeriesGroup {
  id: string;
  title: string; // e.g. "A4 Editorial Lookbook Vol. 1", "3-Part Reel Suite"
  type: 'lookbook' | 'campaign' | 'photo_series' | 'social_suite' | 'print_sequence' | 'exploration' | 'other';
  projectId: string | null;
}

// ==========================================
// LEGACY INTERFACE (FOR 100% BACKWARD COMPATIBILITY)
// ==========================================

export interface DynamicCanvasFile {
  id: string;
  code: string;
  name: string;
  discipline: string;
  client?: string;
  year: string;
  role: string;
  x: number;
  y: number;
  rot: number;
  img: string;
  aspect: string;
  colorTag: string;
  assetType?: 'folder' | 'single_photo' | 'single_reel';
  videoUrl?: string;
  photos?: string[];
  photoCount?: number;
  stickers?: any;
  desc: string;
  deliverables: string[];
}

export interface SeoConfig {
  googleSearchConsole?: string;
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  microsoftClarityId?: string;
  bingVerification?: string;
  ahrefsVerification?: string;
}

const STORAGE_KEYS = {
  BLOG_POSTS: 'moiz_custom_blog_posts',
  CANVAS_FILES: 'moiz_custom_canvas_files',
  WORKS_INDEX: 'moiz_works_index',
  PROJECTS_INDEX: 'moiz_projects_index',
  GEMINI_KEY: 'moiz_gemini_api_key',
  SEO_CONFIG: 'moiz_seo_config',
};

// Real-time Event System
export const CANVAS_UPDATE_EVENT = 'moiz_canvas_updated';

export function notifyCanvasUpdated(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(CANVAS_UPDATE_EVENT));
  } catch {}
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('moiz_portfolio_channel');
      channel.postMessage({ type: CANVAS_UPDATE_EVENT, timestamp: Date.now() });
      setTimeout(() => {
        try {
          channel.close();
        } catch {}
      }, 150);
    }
  } catch {}
}

export function subscribeToCanvasUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = () => callback();
  window.addEventListener(CANVAS_UPDATE_EVENT, handleCustom);

  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === STORAGE_KEYS.CANVAS_FILES ||
      e.key === STORAGE_KEYS.WORKS_INDEX ||
      e.key === STORAGE_KEYS.PROJECTS_INDEX
    ) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel('moiz_portfolio_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === CANVAS_UPDATE_EVENT) {
          callback();
        }
      };
    } catch {}
  }

  return () => {
    window.removeEventListener(CANVAS_UPDATE_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
    if (channel) {
      channel.close();
    }
  };
}

// ==========================================
// WORK OPERATIONS
// ==========================================

export async function getStoredWorksAsync(): Promise<WorkItem[]> {
  if (typeof window === 'undefined') return [];
  try {
    const idbWorks = await getAllWorksIDB();
    if (idbWorks && idbWorks.length > 0) {
      return idbWorks as WorkItem[];
    }
  } catch (err) {
    console.warn('IDB works read failed, checking localStorage fallback:', err);
  }

  // Check lightweight localStorage index
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKS_INDEX);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Auto-migration check: if legacy canvas files exist, convert them to Projects + Works
  const migrated = await migrateLegacyCanvasFiles();
  return migrated;
}

export async function saveWorkAsync(work: WorkItem): Promise<void> {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const prepared: WorkItem = {
    ...work,
    updatedAt: now,
    createdAt: work.createdAt || now,
  };

  try {
    await saveWorkIDB(prepared as IDBWorkItem);
  } catch (err) {
    console.warn('Error saving work to IDB:', err);
  }

  // Update lightweight index in localStorage (without heavy base64 strings)
  try {
    const existing = await getStoredWorksAsync();
    const lightweight: WorkItem = {
      ...prepared,
      mediaUrl: prepared.mediaUrl.length > 1000 ? '' : prepared.mediaUrl, // exclude heavy data URLs from localStorage
    };
    const updated = [lightweight, ...existing.filter((w) => w.id !== work.id)];
    localStorage.setItem(STORAGE_KEYS.WORKS_INDEX, JSON.stringify(updated.slice(0, 100)));
  } catch {}

  notifyCanvasUpdated();
}

export async function saveWorksBatchAsync(works: WorkItem[]): Promise<void> {
  if (typeof window === 'undefined' || !works.length) return;
  const now = Date.now();
  const prepared = works.map((w, idx) => ({
    ...w,
    updatedAt: now,
    createdAt: w.createdAt || (now + idx),
  }));

  try {
    await saveWorksBatchIDB(prepared as IDBWorkItem[]);
  } catch (err) {
    console.warn('Error batch saving works to IDB:', err);
  }

  notifyCanvasUpdated();
}

export async function deleteWorkAsync(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await deleteWorkIDB(id);
  } catch (err) {
    console.warn('Error deleting work from IDB:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKS_INDEX);
    if (raw) {
      const items: WorkItem[] = JSON.parse(raw);
      const filtered = items.filter((w) => w.id !== id);
      localStorage.setItem(STORAGE_KEYS.WORKS_INDEX, JSON.stringify(filtered));
    }
  } catch {}

  notifyCanvasUpdated();
}

export async function deleteWorksBatchAsync(ids: string[]): Promise<void> {
  if (typeof window === 'undefined' || !ids.length) return;
  try {
    await deleteWorksBatchIDB(ids);
  } catch (err) {
    console.warn('Error batch deleting works from IDB:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKS_INDEX);
    if (raw) {
      const items: WorkItem[] = JSON.parse(raw);
      const idSet = new Set(ids);
      const filtered = items.filter((w) => !idSet.has(w.id));
      localStorage.setItem(STORAGE_KEYS.WORKS_INDEX, JSON.stringify(filtered));
    }
  } catch {}

  notifyCanvasUpdated();
}

// ==========================================
// PROJECT OPERATIONS
// ==========================================

export async function getStoredProjectsAsync(): Promise<Project[]> {
  if (typeof window === 'undefined') return [];
  try {
    const idbProjects = await getAllProjectsIDB();
    if (idbProjects && idbProjects.length > 0) {
      return idbProjects as Project[];
    }
  } catch (err) {
    console.warn('IDB projects read failed, checking localStorage fallback:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS_INDEX);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function saveProjectAsync(project: Project): Promise<void> {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const prepared: Project = {
    ...project,
    updatedAt: now,
    createdAt: project.createdAt || now,
    slug: project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  };

  try {
    await saveProjectIDB(prepared as IDBProject);
  } catch (err) {
    console.warn('Error saving project to IDB:', err);
  }

  try {
    const existing = await getStoredProjectsAsync();
    const updated = [prepared, ...existing.filter((p) => p.id !== project.id)];
    localStorage.setItem(STORAGE_KEYS.PROJECTS_INDEX, JSON.stringify(updated));
  } catch {}

  notifyCanvasUpdated();
}

export async function deleteProjectAsync(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // 1. Delete project container
  try {
    await deleteProjectIDB(id);
  } catch (err) {
    console.warn('Error deleting project from IDB:', err);
  }

  // 2. CRITICAL PRINCIPLE: Detach contained works to Standalone (never delete underlying works!)
  try {
    const works = await getStoredWorksAsync();
    const affected = works.filter((w) => w.projectId === id);
    if (affected.length > 0) {
      const detached = affected.map((w) => ({ ...w, projectId: null }));
      await saveWorksBatchIDB(detached as IDBWorkItem[]);
    }
  } catch (err) {
    console.warn('Error detaching works upon project deletion:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS_INDEX);
    if (raw) {
      const items: Project[] = JSON.parse(raw);
      const filtered = items.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROJECTS_INDEX, JSON.stringify(filtered));
    }
  } catch {}

  notifyCanvasUpdated();
}

// ==========================================
// COLLECTIONS & SERIES OPERATIONS
// ==========================================

export async function getStoredCollectionsAsync(): Promise<Collection[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await getAllCollectionsIDB();
    return res as Collection[];
  } catch {
    return [];
  }
}

export async function saveCollectionAsync(col: Collection): Promise<void> {
  if (typeof window === 'undefined') return;
  await saveCollectionIDB(col as IDBCollection);
  notifyCanvasUpdated();
}

export async function deleteCollectionAsync(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await deleteCollectionIDB(id);
  notifyCanvasUpdated();
}

export async function getStoredSeriesAsync(): Promise<SeriesGroup[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await getAllSeriesIDB();
    return res as SeriesGroup[];
  } catch {
    return [];
  }
}

export async function saveSeriesAsync(series: SeriesGroup): Promise<void> {
  if (typeof window === 'undefined') return;
  await saveSeriesIDB(series as IDBSeriesGroup);
  notifyCanvasUpdated();
}

export async function deleteSeriesAsync(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await deleteSeriesIDB(id);
  notifyCanvasUpdated();
}

// ==========================================
// INTELLIGENT SEARCH & FILTER ENGINE
// ==========================================

export interface WorkQueryFilter {
  search?: string;
  projectId?: string | null | 'all' | 'standalone';
  workType?: string | 'all';
  discipline?: string | 'all';
  orientation?: 'vertical' | 'horizontal' | 'square' | 'panoramic' | 'all';
  status?: 'published' | 'draft' | 'archived' | 'all';
}

export function filterWorks(works: WorkItem[], query: WorkQueryFilter): WorkItem[] {
  let result = [...works];

  // 1. Project filtering
  if (query.projectId === 'standalone') {
    result = result.filter((w) => !w.projectId);
  } else if (query.projectId && query.projectId !== 'all') {
    result = result.filter((w) => w.projectId === query.projectId);
  }

  // 2. Work Type filtering
  if (query.workType && query.workType !== 'all') {
    const targetType = query.workType.toLowerCase();
    result = result.filter((w) => w.workType.toLowerCase() === targetType);
  }

  // 3. Discipline filtering
  if (query.discipline && query.discipline !== 'all') {
    const targetDisc = query.discipline.toLowerCase();
    result = result.filter((w) =>
      w.disciplines.some((d) => d.toLowerCase().includes(targetDisc))
    );
  }

  // 4. Orientation filtering
  if (query.orientation && query.orientation !== 'all') {
    result = result.filter((w) => w.dimensions.orientation === query.orientation);
  }

  // 5. Status filtering
  if (query.status && query.status !== 'all') {
    result = result.filter((w) => w.status === query.status);
  }

  // 6. Natural Language & Semantic Search
  if (query.search && query.search.trim()) {
    const rawSearch = query.search.toLowerCase().trim();

    // Natural language shorthands
    if (rawSearch === 'all reels' || rawSearch === 'reels') {
      return result.filter((w) => /reel|video/i.test(w.workType) || (w.mediaType === 'video' && w.dimensions.orientation === 'vertical'));
    }
    if (rawSearch === 'all standalone' || rawSearch === 'standalone') {
      return result.filter((w) => !w.projectId);
    }
    if (rawSearch === 'all horizontal' || rawSearch === 'horizontal') {
      return result.filter((w) => w.dimensions.orientation === 'horizontal');
    }
    if (rawSearch === 'all vertical' || rawSearch === 'vertical') {
      return result.filter((w) => w.dimensions.orientation === 'vertical');
    }
    if (rawSearch === 'all branding' || rawSearch === 'branding') {
      return result.filter((w) => /brand|identity|logo/i.test(w.workType) || w.disciplines.some((d) => /brand/i.test(d)));
    }
    if (rawSearch === 'all photography' || rawSearch === 'photography' || rawSearch === 'stills') {
      return result.filter((w) => /photo|still|lookbook/i.test(w.workType) || w.disciplines.some((d) => /photo/i.test(d)));
    }
    if (rawSearch === 'all motion' || rawSearch === 'motion') {
      return result.filter((w) => /motion/i.test(w.workType) || w.disciplines.some((d) => /motion/i.test(d)));
    }

    const tokens = rawSearch.split(/\s+/).filter(Boolean);
    result = result.filter((w) => {
      const corpus = [
        w.title,
        w.workType,
        w.fileName,
        w.client || '',
        w.year,
        w.caption || '',
        w.dimensions.aspectRatio,
        w.dimensions.orientation,
        w.mediaType,
        ...w.disciplines,
        ...w.tags,
      ].join(' ').toLowerCase();

      return tokens.every((token) => corpus.includes(token));
    });
  }

  // Return newest first
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

// ==========================================
// PUBLIC SITE COMPATIBILITY ADAPTER
// (Synthesizes Relational Works/Projects into DynamicCanvasFile[])
// ==========================================

export async function getStoredCanvasFilesAsync(): Promise<DynamicCanvasFile[]> {
  try {
    const [works, projects] = await Promise.all([
      getStoredWorksAsync(),
      getStoredProjectsAsync(),
    ]);

    // If we have projects or works in the new schema, synthesize dynamic files
    if (projects.length > 0 || works.length > 0) {
      const dynamicFiles: DynamicCanvasFile[] = [];

      // 1. Synthesize Projects into Campaign Folders
      for (const project of projects) {
        if (project.status === 'draft') continue;
        const projectWorks = works.filter((w) => w.projectId === project.id && w.status !== 'draft');
        const photos = projectWorks.map((w) => w.mediaUrl).filter(Boolean);
        const coverWork = projectWorks.find((w) => w.id === project.coverWorkId) || projectWorks[0];
        const videoWork = projectWorks.find((w) => w.mediaType === 'video');

        const uniqueDeliverables = Array.from(
          new Set(projectWorks.map((w) => w.workType).filter(Boolean))
        );

        dynamicFiles.push({
          id: project.id,
          code: `PRJ_${project.year.slice(-2)}.${(project.tag || 'DIR').slice(0, 3).toUpperCase()}`,
          name: project.title,
          discipline: project.tag || projectWorks[0]?.disciplines[0] || 'Art Direction',
          client: project.client,
          year: project.year,
          role: project.role || 'Lead Art Director',
          x: 0,
          y: 0,
          rot: 0,
          img: coverWork?.mediaUrl || photos[0] || '',
          aspect: coverWork?.dimensions.aspectRatio === '9:16' ? 'aspect-[9/16]' : coverWork?.dimensions.aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-[16/10]',
          colorTag: 'bg-[#ff3300]',
          assetType: 'folder',
          videoUrl: videoWork?.mediaUrl,
          photos,
          photoCount: photos.length,
          desc: project.overview || `${project.title} — Multi-deliverable directorial campaign with ${photos.length} visual assets.`,
          deliverables: uniqueDeliverables.length > 0 ? uniqueDeliverables : ['Art Direction', 'Visual Architecture', 'Campaign Deck'],
        });
      }

      // 2. Synthesize Standalone Works (Individual pieces with no project)
      const standaloneWorks = works.filter((w) => !w.projectId && w.status !== 'draft');
      for (const work of standaloneWorks) {
        dynamicFiles.push({
          id: work.id,
          code: `WRK_${work.year.slice(-2)}.${(work.workType || 'AST').slice(0, 3).toUpperCase()}`,
          name: work.title,
          discipline: work.disciplines[0] || 'Creative Work',
          client: work.client,
          year: work.year,
          role: 'Art Director',
          x: 0,
          y: 0,
          rot: 0,
          img: work.mediaUrl,
          aspect: work.dimensions.aspectRatio === '9:16' ? 'aspect-[9/16]' : work.dimensions.aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-[16/10]',
          colorTag: 'bg-[#181818]',
          assetType: work.mediaType === 'video' ? 'single_reel' : 'single_photo',
          videoUrl: work.mediaType === 'video' ? work.mediaUrl : undefined,
          photos: [work.mediaUrl],
          photoCount: 1,
          desc: work.caption || `${work.title} — Standalone creative output (${work.workType}).`,
          deliverables: [work.workType],
        });
      }

      if (dynamicFiles.length > 0) {
        return dynamicFiles;
      }
    }
  } catch (err) {
    console.warn('Error synthesizing dynamic canvas files from relational model:', err);
  }

  // Fallback to legacy IDB canvas files if any
  try {
    const legacy = await getAllCanvasFilesIDB();
    if (legacy && legacy.length > 0) return legacy as DynamicCanvasFile[];
  } catch {}

  return getStoredCanvasFiles();
}

export function getStoredCanvasFiles(): DynamicCanvasFile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CANVAS_FILES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCanvasFileAsync(file: DynamicCanvasFile): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await saveCanvasFileIDB(file);
  } catch (err) {
    console.warn('Legacy saveCanvasFileIDB error:', err);
  }

  try {
    const lightweightFile: DynamicCanvasFile = {
      ...file,
      photos: (file.photos || []).slice(0, 4),
    };
    const existing = getStoredCanvasFiles();
    const updated = [lightweightFile, ...existing.filter((f) => f.id !== file.id)];
    localStorage.setItem(STORAGE_KEYS.CANVAS_FILES, JSON.stringify(updated));
  } catch {}

  notifyCanvasUpdated();
}

export function saveCanvasFile(file: DynamicCanvasFile): void {
  saveCanvasFileAsync(file).catch(console.error);
}

export function deleteCanvasFile(id: string): void {
  if (typeof window === 'undefined') return;
  deleteCanvasFileIDB(id).catch(console.warn);
  try {
    const existing = getStoredCanvasFiles();
    const updated = existing.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANVAS_FILES, JSON.stringify(updated));
  } catch {}
  notifyCanvasUpdated();
}

// ==========================================
// LEGACY MIGRATION UTILITY
// ==========================================

async function migrateLegacyCanvasFiles(): Promise<WorkItem[]> {
  if (typeof window === 'undefined') return [];
  try {
    const legacyFiles = await getAllCanvasFilesIDB();
    if (!legacyFiles || legacyFiles.length === 0) return [];

    const migratedWorks: WorkItem[] = [];
    const migratedProjects: Project[] = [];

    for (const file of legacyFiles) {
      const photos: string[] = file.photos && file.photos.length > 0 ? file.photos : file.img ? [file.img] : [];
      
      const project: Project = {
        id: file.id,
        title: file.name,
        slug: file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tag: file.discipline,
        client: file.client || file.name,
        role: file.role || 'Lead Art Director',
        year: file.year || '2026',
        overview: file.desc,
        status: 'published',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      migratedProjects.push(project);

      photos.forEach((photoUrl, pIdx) => {
        const isVideo = file.videoUrl && pIdx === 0;
        const work: WorkItem = {
          id: `${file.id}-asset-${pIdx}`,
          title: `${file.name} — Plate ${String(pIdx + 1).padStart(2, '0')}`,
          mediaUrl: isVideo ? file.videoUrl : photoUrl,
          mediaType: isVideo ? 'video' : 'image',
          fileType: isVideo ? 'video/mp4' : 'image/jpeg',
          fileName: `${file.name.toLowerCase()}_${pIdx + 1}.${isVideo ? 'mp4' : 'jpg'}`,
          fileSize: 1024 * 500,
          dimensions: {
            width: 1920,
            height: 1080,
            aspectRatio: file.aspect?.includes('9/16') ? '9:16' : file.aspect?.includes('4/5') ? '4:5' : '16:9',
            orientation: file.aspect?.includes('9/16') || file.aspect?.includes('4/5') ? 'vertical' : 'horizontal',
          },
          workType: isVideo ? 'Reel' : (file.deliverables?.[pIdx % (file.deliverables?.length || 1)] || 'Editorial Lookbook'),
          disciplines: [file.discipline || 'Art Direction'],
          tags: [file.name],
          projectId: project.id,
          collectionIds: [],
          seriesId: null,
          year: file.year || '2026',
          status: 'published',
          createdAt: Date.now() + pIdx,
          updatedAt: Date.now(),
        };
        migratedWorks.push(work);
      });
    }

    if (migratedProjects.length > 0) {
      for (const p of migratedProjects) {
        await saveProjectIDB(p as IDBProject);
      }
      await saveWorksBatchIDB(migratedWorks as IDBWorkItem[]);
    }

    return migratedWorks;
  } catch (err) {
    console.warn('Could not complete legacy migration:', err);
    return [];
  }
}

// ==========================================
// BLOG / JOURNAL OPERATIONS
// ==========================================

export function getStoredBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return INITIAL_BLOG_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
    if (!raw) return INITIAL_BLOG_POSTS;
    const custom: BlogPost[] = JSON.parse(raw);
    return [...custom, ...INITIAL_BLOG_POSTS];
  } catch {
    return INITIAL_BLOG_POSTS;
  }
}

export function saveBlogPost(post: BlogPost): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
    const existing: BlogPost[] = raw ? JSON.parse(raw) : [];
    const updated = [post, ...existing.filter((p) => p.slug !== post.slug)];
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save blog post to localStorage', err);
  }
}

export function deleteBlogPost(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
    if (!raw) return;
    const existing: BlogPost[] = JSON.parse(raw);
    const updated = existing.filter((p) => p.slug !== slug);
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete blog post', err);
  }
}

// ==========================================
// CONFIGURATION & CREDENTIALS
// ==========================================

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  const key = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '';
  if (key.includes('AIzaSyCic-8hibtiEY2wbUMDj7YUwgDXw1yqXr4')) {
    try {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
    } catch {}
    return '';
  }
  return key;
}

export function saveApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
}

export function getStoredSeoConfig(): SeoConfig {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEO_CONFIG);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSeoConfig(config: SeoConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SEO_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save SEO config', err);
  }
}



