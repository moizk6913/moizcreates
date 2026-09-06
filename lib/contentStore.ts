'use client';

import { BlogPost, INITIAL_BLOG_POSTS } from './blogData';

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

export function saveCanvasFile(file: DynamicCanvasFile): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCanvasFiles();
    const updated = [file, ...existing.filter((f) => f.id !== file.id)];
    localStorage.setItem(STORAGE_KEYS.CANVAS_FILES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save canvas file to localStorage', err);
  }
}

export function deleteCanvasFile(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCanvasFiles();
    const updated = existing.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANVAS_FILES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete canvas file', err);
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


