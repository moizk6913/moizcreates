// ============================================================================
// CORE PORTFOLIO CONTENT MODEL SCHEMA (TYPESCRIPT SCHEMAS & INTERFACES)
// ============================================================================

export type ProjectStatus = 'draft' | 'published' | 'archived';
export type CategoryVisibility = 'visible' | 'hidden';
export type MediaType = 'image' | 'video';
export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: string; // e.g. "16:9", "4:5", "9:16", "1:1", "21:9", "16:10"
  orientation: 'vertical' | 'horizontal' | 'square' | 'panoramic';
  duration?: number; // In seconds (for videos)
  resolution?: string; // e.g. "1920x1080"
}

export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string; // Master / optimized URL
  originalUrl?: string; // Path to preserved original asset
  optimizedUrl?: string; // WebP optimized URL
  thumbnailUrl?: string; // Lightweight 400px preview WebP
  dimensions: MediaDimensions;
  altText: string;
  type: MediaType;
  projectId?: string | null;
  categoryId?: string | null;
  createdAt: string; // ISO 8601
}

export interface VideoAsset {
  id: string;
  url: string;
  posterUrl?: string;
  duration?: number;
  dimensions?: MediaDimensions;
  type: 'embed' | 'direct' | 'stream';
  title?: string;
  caption?: string;
}

export type ProjectSectionType = 'grid' | 'lookbook' | 'stories' | 'banner' | 'deck' | 'video';

export interface ProjectSection {
  id: string;
  title: string;
  type: ProjectSectionType;
  items: MediaAsset[];
  description?: string;
  displayOrder?: number;
}

export interface ProjectCredit {
  role: string;
  name: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string; // Foreign key referencing Category.id
  subcategory?: string; // e.g. "Commercial Campaign", "Editorial Lookbook"
  tags: string[]; // e.g. ["35mm", "Anamorphic", "ACES", "Lighting"]
  coverImage: string; // URL of cover asset
  coverMediaId?: string | null; // MediaAsset ID reference
  gallery: MediaAsset[]; // Deliverable stills & assets
  videos: VideoAsset[]; // Campaign motion & video items
  sections?: ProjectSection[]; // Structured section-based asset sets (e.g. Catalog, Stories, Web Banners, Decks)
  client?: string; // e.g. "Paris Repertory", "Acne Studios"
  year: string; // e.g. "2026"
  services: string[]; // e.g. ["Creative Direction", "Lighting Scheme", "Master Grade"]
  role: string; // e.g. "Lead Art Director & Cinematographer"
  credits?: ProjectCredit[];
  featured: boolean; // Homepage priority
  displayOrder: number; // Manual sorting order
  status: ProjectStatus; // 'draft' | 'published' | 'archived'
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}

export interface Category {
  id: string; // Unique key e.g. 'art-direction', 'brand-identity', 'cinematography'
  name: string; // Display name e.g. "Art Direction", "Motion Graphics"
  slug: string;
  description: string;
  coverImage?: string;
  displayOrder: number;
  visibility: CategoryVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  service?: string;
  budget?: string;
  status: InquiryStatus;
  createdAt: string;
  ipHash?: string; // Anonymized hash for rate limiting
}

export interface BlogPostSpecs {
  camera?: string;
  lighting?: string;
  aspectRatio?: string;
  deliverables?: string[];
  [key: string]: any;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  specs?: BlogPostSpecs;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSettings {
  siteTitle: string;
  siteDescription: string;
  authorName: string;
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
  city: string;
  timezone: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  categories: Category[];
  projects: Project[];
  media: MediaAsset[];
  inquiries: Inquiry[];
  blog: BlogPost[];
  settings: PortfolioSettings;
}
