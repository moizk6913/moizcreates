'use client';

import { BlogPost, INITIAL_BLOG_POSTS } from './blogData';
import {
  getAllCanvasFilesIDB,
  saveCanvasFileIDB,
  deleteCanvasFileIDB,
} from './idbStore';

export interface DynamicCanvasFile {
  id: string;
  code: string;
  name: string;
  discipline: string;
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
  GEMINI_KEY: 'moiz_gemini_api_key',
  SEO_CONFIG: 'moiz_seo_config',
};

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

export function getStoredCanvasFiles(): DynamicCanvasFile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CANVAS_FILES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getStoredCanvasFilesAsync(): Promise<DynamicCanvasFile[]> {
  if (typeof window === 'undefined') return [];
  try {
    const idbFiles = await getAllCanvasFilesIDB();
    if (idbFiles && idbFiles.length > 0) {
      return idbFiles;
    }
  } catch (err) {
    console.warn('IDB read failed, checking localStorage:', err);
  }
  return getStoredCanvasFiles();
}

export async function saveCanvasFileAsync(file: DynamicCanvasFile): Promise<void> {
  if (typeof window === 'undefined') return;
  // 1. Save full-fidelity file (all 38+ photos) to IndexedDB
  try {
    await saveCanvasFileIDB(file);
  } catch (err) {
    console.warn('Could not save to IndexedDB:', err);
  }

  // 2. Save lightweight index copy to localStorage (keep only first 4 preview photos to stay within 5MB quota)
  try {
    const lightweightFile: DynamicCanvasFile = {
      ...file,
      photos: (file.photos || []).slice(0, 4),
    };
    const existing = getStoredCanvasFiles();
    const updated = [lightweightFile, ...existing.filter((f) => f.id !== file.id)];
    localStorage.setItem(STORAGE_KEYS.CANVAS_FILES, JSON.stringify(updated));
  } catch (err) {
    console.warn('localStorage quota reached, relying on IndexedDB:', err);
  }
}

export function saveCanvasFile(file: DynamicCanvasFile): void {
  saveCanvasFileAsync(file).catch((err) => {
    console.error('Error in saveCanvasFile:', err);
  });
}

export function deleteCanvasFile(id: string): void {
  if (typeof window === 'undefined') return;
  deleteCanvasFileIDB(id).catch(console.warn);
  try {
    const existing = getStoredCanvasFiles();
    const updated = existing.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANVAS_FILES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete canvas file from localStorage', err);
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

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || 'AIzaSyCic-8hibtiEY2wbUMDj7YUwgDXw1yqXr4';
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


