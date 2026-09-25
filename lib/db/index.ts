import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import {
  DatabaseSchema,
  Project,
  Category,
  MediaAsset,
  Inquiry,
  BlogPost,
  PortfolioSettings,
  ProjectStatus,
  InquiryStatus,
} from './schema';
import { DEFAULT_DISCIPLINE_FOLDERS } from '../defaultDisciplines';
import { INITIAL_BLOG_POSTS } from '../blogData';
import curatedData from '../curated_photos.json';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'portfolio-db.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'portfolio-db.json');
const SCHEMA_VERSION = 1;

// ============================================================================
// DEFAULT SEED GENERATOR (PRESERVES 100% VISUAL FIDELITY ON FIRST BOOT)
// ============================================================================

function generateInitialSeed(): DatabaseSchema {
  const now = new Date().toISOString();

  // 1. Categories matching the 7 Core Disciplines
  const categories: Category[] = DEFAULT_DISCIPLINE_FOLDERS.map((folder, index) => ({
    id: folder.id,
    name: folder.name,
    slug: folder.id,
    description: folder.desc,
    coverImage: folder.img,
    displayOrder: index + 1,
    visibility: 'visible',
    createdAt: now,
    updatedAt: now,
  }));

  // 2. Initial Projects seeded from existing disciplines and curated photography
  const projects: Project[] = DEFAULT_DISCIPLINE_FOLDERS.map((folder, index) => {
    const rawCurated = (curatedData as Record<string, { title: string; photos: string[] }>)[folder.id] || {
      title: folder.name,
      photos: folder.photos || [folder.img],
    };

    const galleryPhotos = rawCurated.photos || folder.photos || [folder.img];

    const gallery: MediaAsset[] = galleryPhotos.map((url, pIdx) => {
      const isPortrait = pIdx % 3 === 0;
      const isLandscape = pIdx % 3 === 1;
      return {
        id: `media-seed-${folder.id}-${pIdx}`,
        fileName: `${folder.id}-${pIdx + 1}.jpg`,
        originalName: `${folder.id}-${pIdx + 1}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: 250000,
        url,
        optimizedUrl: url,
        thumbnailUrl: url,
        dimensions: {
          width: isPortrait ? 1080 : isLandscape ? 1920 : 1080,
          height: isPortrait ? 1350 : isLandscape ? 1080 : 1080,
          aspectRatio: isPortrait ? '4:5' : isLandscape ? '16:9' : '1:1',
          orientation: isPortrait ? 'vertical' : isLandscape ? 'horizontal' : 'square',
        },
        altText: `${folder.name} Still Frame #${pIdx + 1}`,
        type: 'image',
        projectId: `proj-${folder.id}`,
        categoryId: folder.id,
        createdAt: now,
      };
    });

    return {
      id: `proj-${folder.id}`,
      slug: folder.id,
      title: folder.name,
      shortDescription: folder.desc.slice(0, 140) + '...',
      fullDescription: folder.desc,
      categoryId: folder.id,
      subcategory: folder.discipline,
      tags: [folder.role, folder.discipline, 'Directorial Cut', '2026 Archive'],
      coverImage: folder.img,
      coverMediaId: gallery[0]?.id || null,
      gallery,
      videos: folder.videoUrl
        ? [
            {
              id: `video-seed-${folder.id}`,
              url: folder.videoUrl,
              posterUrl: folder.img,
              duration: 15,
              dimensions: {
                width: 1920,
                height: 1080,
                aspectRatio: '16:9',
                orientation: 'horizontal',
              },
              type: 'direct',
              title: `${folder.name} Master Campaign Reel`,
            },
          ]
        : [],
      client: folder.client || 'Directorial Portfolio',
      year: folder.year || '2026',
      services: folder.deliverables || ['Creative Direction', 'Visual Architecture', 'Campaign Deliverables'],
      role: folder.role || 'Lead Art Director',
      credits: [{ role: 'Creative Direction', name: 'Moiz Khan' }],
      featured: index < 4,
      displayOrder: index + 1,
      status: 'published',
      createdAt: now,
      updatedAt: now,
      seoTitle: `${folder.name} — Directorial Case Study`,
      seoDescription: folder.desc,
      socialImage: folder.img,
    };
  });

  // 3. Blog Essays
  const blog: BlogPost[] = INITIAL_BLOG_POSTS.map((post) => ({
    id: `blog-${post.slug}`,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    readTime: post.readTime,
    specs: post.specs,
    status: 'published',
    createdAt: now,
    updatedAt: now,
  }));

  const settings: PortfolioSettings = {
    siteTitle: 'Moiz Khan // Art Director & Brand Visual Designer',
    siteDescription: 'Directorial portfolio specializing in high-contrast visual architecture, commercial campaigns, and editorial design.',
    authorName: 'Moiz Khan',
    contactEmail: 'hiremoiz.work@gmail.com',
    instagramUrl: 'https://www.instagram.com/moizcreates_/',
    linkedinUrl: 'https://www.linkedin.com/in/moizcreates/',
    city: 'Hyderabad, India',
    timezone: 'Asia/Kolkata',
    updatedAt: now,
  };

  return {
    version: SCHEMA_VERSION,
    lastUpdated: now,
    categories,
    projects,
    media: projects.flatMap((p) => p.gallery),
    inquiries: [],
    blog,
    settings,
  };
}

// ============================================================================
// ATOMIC FILE ENGINE & ASYNCHRONOUS WRITE QUEUE
// ============================================================================

let memoryCache: DatabaseSchema | null = null;
let lastMtime: number = 0;
let writeQueue: Promise<any> = Promise.resolve();

function ensureDirectories() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  } catch {}
}

function readDatabaseSync(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Try reading the bundled DB_FILE
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content) as DatabaseSchema;
      memoryCache = data;
      return data;
    }
  } catch (err) {
    console.error('[Database] Failed to read bundled DB_FILE:', err);
  }

  // 2. Try reading /tmp fallback DB file (for Vercel serverless writes)
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const content = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const data = JSON.parse(content) as DatabaseSchema;
      memoryCache = data;
      return data;
    }
  } catch (err) {
    console.error('[Database] Failed to read TMP_DB_FILE:', err);
  }

  // 3. Initialize with seed in-memory
  const initial = generateInitialSeed();
  memoryCache = initial;
  try {
    writeDatabaseSync(initial);
  } catch {}
  return initial;
}

function writeDatabaseSync(data: DatabaseSchema): void {
  data.lastUpdated = new Date().toISOString();
  const serialized = JSON.stringify(data, null, 2);
  memoryCache = data;

  // 1. Try writing to DATA_DIR first (local dev / persistent disk)
  try {
    ensureDirectories();
    const tmpFile = `${DB_FILE}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(tmpFile, serialized, 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
    return;
  } catch (err) {
    // 2. If read-only filesystem (e.g. Vercel Serverless), fallback to writing to os.tmpdir()
    try {
      const tmpFile = `${TMP_DB_FILE}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tmpFile, serialized, 'utf-8');
      fs.renameSync(tmpFile, TMP_DB_FILE);
      lastMtime = fs.statSync(TMP_DB_FILE).mtimeMs;
    } catch (tmpErr) {
      console.warn('[Database] Could not persist to disk, held in memoryCache:', tmpErr);
    }
  }
}

// Asynchronously queue writes to guarantee serialized ACID transaction execution
function enqueueWrite(updater: (db: DatabaseSchema) => void | Promise<void>): Promise<DatabaseSchema> {
  const task = writeQueue.then(async () => {
    const current = readDatabaseSync();
    await updater(current);
    writeDatabaseSync(current);

    // Auto-create snapshot periodically or on writes
    maybeCreateSnapshot(current);

    return current;
  });

  writeQueue = task.catch((err) => {
    console.error('[Database] Enqueued write task failed:', err);
  });

  return task;
}

// Auto-snapshotting engine
let lastSnapshotTime = 0;
function maybeCreateSnapshot(data: DatabaseSchema) {
  const now = Date.now();
  // Only snapshot once per 10 minutes unless triggered manually
  if (now - lastSnapshotTime < 10 * 60 * 1000) return;

  try {
    ensureDirectories();
    if (!fs.existsSync(BACKUP_DIR)) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotFile = path.join(BACKUP_DIR, `portfolio-backup-${timestamp}.json`);
    fs.writeFileSync(snapshotFile, JSON.stringify(data, null, 2), 'utf-8');
    lastSnapshotTime = now;

    // Prune snapshots older than 30 files
    const all = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).sort();
    if (all.length > 30) {
      all.slice(0, all.length - 30).forEach((f) => {
        try {
          fs.unlinkSync(path.join(BACKUP_DIR, f));
        } catch {}
      });
    }
  } catch (err) {
    // Non-fatal if backup directory is read-only on serverless
  }
}

// ============================================================================
// DATA ACCESS LAYER (DAL) / REPOSITORY
// ============================================================================

export const db = {
  // Raw Access
  get: () => readDatabaseSync(),

  // PROJECTS REPOSITORY
  projects: {
    getAll: async (filter?: { status?: ProjectStatus; categoryId?: string; featured?: boolean }) => {
      const data = readDatabaseSync();
      let list = [...data.projects];

      if (filter?.status) {
        list = list.filter((p) => p.status === filter.status);
      }
      if (filter?.categoryId) {
        list = list.filter((p) => p.categoryId === filter.categoryId);
      }
      if (filter?.featured !== undefined) {
        list = list.filter((p) => p.featured === filter.featured);
      }

      return list.sort((a, b) => a.displayOrder - b.displayOrder);
    },

    getPublished: async (categoryId?: string) => {
      const data = readDatabaseSync();
      let list = data.projects.filter((p) => p.status === 'published');
      if (categoryId) {
        list = list.filter((p) => p.categoryId === categoryId);
      }
      return list.sort((a, b) => a.displayOrder - b.displayOrder);
    },

    getBySlug: async (slug: string) => {
      const data = readDatabaseSync();
      const norm = slug.toLowerCase().trim();
      return data.projects.find((p) => p.slug.toLowerCase() === norm || p.id.toLowerCase() === norm) || null;
    },

    getById: async (id: string) => {
      const data = readDatabaseSync();
      return data.projects.find((p) => p.id === id || p.slug === id) || null;
    },

    create: async (item: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      let created: Project | null = null;
      await enqueueWrite((data) => {
        const id = `proj-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const now = new Date().toISOString();
        const maxOrder = data.projects.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);

        created = {
          ...item,
          id,
          slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          displayOrder: item.displayOrder ?? maxOrder + 1,
          createdAt: now,
          updatedAt: now,
        };

        data.projects.push(created);
      });
      return created!;
    },

    update: async (id: string, updates: Partial<Project>) => {
      let updated: Project | null = null;
      await enqueueWrite((data) => {
        const idx = data.projects.findIndex((p) => p.id === id || p.slug === id);
        if (idx >= 0) {
          const now = new Date().toISOString();
          data.projects[idx] = {
            ...data.projects[idx],
            ...updates,
            id: data.projects[idx].id, // Prevent ID mutation
            updatedAt: now,
          };
          updated = data.projects[idx];
        }
      });
      return updated;
    },

    delete: async (id: string, archiveOnly: boolean = false) => {
      let success = false;
      await enqueueWrite((data) => {
        const idx = data.projects.findIndex((p) => p.id === id || p.slug === id);
        if (idx >= 0) {
          if (archiveOnly) {
            data.projects[idx].status = 'archived';
            data.projects[idx].updatedAt = new Date().toISOString();
          } else {
            data.projects.splice(idx, 1);
          }
          success = true;
        }
      });
      return success;
    },

    reorder: async (orderMap: Array<{ id: string; displayOrder: number }>) => {
      await enqueueWrite((data) => {
        const map = new Map(orderMap.map((o) => [o.id, o.displayOrder]));
        data.projects.forEach((p) => {
          if (map.has(p.id)) {
            p.displayOrder = map.get(p.id)!;
          }
        });
      });
      return true;
    },
  },

  // CATEGORIES REPOSITORY
  categories: {
    getAll: async (includeHidden: boolean = false) => {
      const data = readDatabaseSync();
      let list = [...data.categories];
      if (!includeHidden) {
        list = list.filter((c) => c.visibility === 'visible');
      }
      return list.sort((a, b) => a.displayOrder - b.displayOrder);
    },

    getById: async (id: string) => {
      const data = readDatabaseSync();
      return data.categories.find((c) => c.id === id || c.slug === id) || null;
    },

    getBySlug: async (slug: string) => {
      const data = readDatabaseSync();
      const norm = slug.toLowerCase().trim();
      return data.categories.find((c) => c.slug.toLowerCase() === norm || c.id.toLowerCase() === norm) || null;
    },

    create: async (item: Omit<Category, 'createdAt' | 'updatedAt'>) => {
      let created: Category | null = null;
      await enqueueWrite((data) => {
        const now = new Date().toISOString();
        created = {
          ...item,
          createdAt: now,
          updatedAt: now,
        };
        data.categories.push(created);
      });
      return created!;
    },

    update: async (id: string, updates: Partial<Category>) => {
      let updated: Category | null = null;
      await enqueueWrite((data) => {
        const idx = data.categories.findIndex((c) => c.id === id);
        if (idx >= 0) {
          data.categories[idx] = {
            ...data.categories[idx],
            ...updates,
            id: data.categories[idx].id,
            updatedAt: new Date().toISOString(),
          };
          updated = data.categories[idx];
        }
      });
      return updated;
    },

    delete: async (id: string) => {
      let success = false;
      await enqueueWrite((data) => {
        const idx = data.categories.findIndex((c) => c.id === id);
        if (idx >= 0) {
          data.categories.splice(idx, 1);
          success = true;
        }
      });
      return success;
    },
  },

  // MEDIA ASSETS REPOSITORY
  media: {
    getAll: async (projectId?: string) => {
      const data = readDatabaseSync();
      let list = [...data.media];
      if (projectId) {
        list = list.filter((m) => m.projectId === projectId);
      }
      return list;
    },

    getById: async (id: string) => {
      const data = readDatabaseSync();
      return data.media.find((m) => m.id === id) || null;
    },

    create: async (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => {
      let created: MediaAsset | null = null;
      await enqueueWrite((data) => {
        const id = `media-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        created = {
          ...asset,
          id,
          createdAt: new Date().toISOString(),
        };
        data.media.push(created);

        // If associated with a project, append to project's gallery
        if (asset.projectId) {
          const proj = data.projects.find((p) => p.id === asset.projectId || p.slug === asset.projectId);
          if (proj) {
            if (!proj.gallery.some((g) => g.url === created!.url)) {
              proj.gallery.push(created!);
            }
            if (created!.type === 'video' && !proj.videos.some((v) => v.url === created!.url)) {
              proj.videos.push({
                id: created!.id,
                url: created!.url,
                posterUrl: created!.thumbnailUrl || created!.url,
                duration: created!.dimensions?.duration,
                dimensions: created!.dimensions,
                type: 'direct',
                title: created!.altText,
              });
            }
            if (!proj.coverImage || proj.coverImage.includes('unsplash')) {
              proj.coverImage = created!.optimizedUrl || created!.url;
              proj.coverMediaId = created!.id;
            }
          }
        }
      });
      return created!;
    },

    delete: async (id: string) => {
      let success = false;
      await enqueueWrite((data) => {
        const idx = data.media.findIndex((m) => m.id === id);
        if (idx >= 0) {
          data.media.splice(idx, 1);
          // Remove from projects
          data.projects.forEach((p) => {
            p.gallery = p.gallery.filter((g) => g.id !== id);
          });
          success = true;
        }
      });
      return success;
    },
  },

  // INQUIRIES / CONTACT REPOSITORY
  inquiries: {
    create: async (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
      let created: Inquiry | null = null;
      await enqueueWrite((data) => {
        created = {
          ...inquiry,
          id: `inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          status: 'new',
          createdAt: new Date().toISOString(),
        };
        data.inquiries.unshift(created);
      });
      return created!;
    },

    getAll: async (status?: InquiryStatus) => {
      const data = readDatabaseSync();
      let list = [...data.inquiries];
      if (status) {
        list = list.filter((i) => i.status === status);
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    updateStatus: async (id: string, status: InquiryStatus) => {
      let updated: Inquiry | null = null;
      await enqueueWrite((data) => {
        const item = data.inquiries.find((i) => i.id === id);
        if (item) {
          item.status = status;
          updated = item;
        }
      });
      return updated;
    },

    delete: async (id: string) => {
      let success = false;
      await enqueueWrite((data) => {
        const idx = data.inquiries.findIndex((i) => i.id === id);
        if (idx >= 0) {
          data.inquiries.splice(idx, 1);
          success = true;
        }
      });
      return success;
    },
  },

  // BLOG REPOSITORY
  blog: {
    getAll: async (includeDrafts: boolean = false) => {
      const data = readDatabaseSync();
      let list = [...data.blog];
      if (!includeDrafts) {
        list = list.filter((b) => b.status === 'published');
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getBySlug: async (slug: string) => {
      const data = readDatabaseSync();
      const norm = slug.toLowerCase().trim();
      return data.blog.find((b) => b.slug.toLowerCase() === norm || b.id.toLowerCase() === norm) || null;
    },

    create: async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
      let created: BlogPost | null = null;
      await enqueueWrite((data) => {
        const now = new Date().toISOString();
        created = {
          ...post,
          id: `blog-${Date.now()}`,
          slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          createdAt: now,
          updatedAt: now,
        };
        data.blog.unshift(created);
      });
      return created!;
    },

    update: async (id: string, updates: Partial<BlogPost>) => {
      let updated: BlogPost | null = null;
      await enqueueWrite((data) => {
        const idx = data.blog.findIndex((b) => b.id === id);
        if (idx >= 0) {
          data.blog[idx] = {
            ...data.blog[idx],
            ...updates,
            id: data.blog[idx].id,
            updatedAt: new Date().toISOString(),
          };
          updated = data.blog[idx];
        }
      });
      return updated;
    },

    delete: async (id: string) => {
      let success = false;
      await enqueueWrite((data) => {
        const idx = data.blog.findIndex((b) => b.id === id);
        if (idx >= 0) {
          data.blog.splice(idx, 1);
          success = true;
        }
      });
      return success;
    },
  },

  // BACKUP & RESTORATION
  backup: {
    createSnapshot: async () => {
      ensureDirectories();
      const data = readDatabaseSync();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `portfolio-backup-${timestamp}.json`;
      const snapshotPath = path.join(BACKUP_DIR, filename);
      fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
      return { filename, timestamp, size: fs.statSync(snapshotPath).size };
    },

    exportAll: async () => {
      return readDatabaseSync();
    },

    restoreFromContent: async (jsonContent: string) => {
      const parsed = JSON.parse(jsonContent) as DatabaseSchema;
      if (!parsed.version || !Array.isArray(parsed.projects) || !Array.isArray(parsed.categories)) {
        throw new Error('Invalid backup file schema.');
      }
      await enqueueWrite((data) => {
        data.version = parsed.version;
        data.categories = parsed.categories;
        data.projects = parsed.projects;
        data.media = parsed.media || [];
        data.inquiries = parsed.inquiries || [];
        data.blog = parsed.blog || [];
        data.settings = parsed.settings || data.settings;
        data.lastUpdated = new Date().toISOString();
      });
      return true;
    },

    listSnapshots: async () => {
      ensureDirectories();
      return fs
        .readdirSync(BACKUP_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return { filename: f, size: stats.size, mtime: stats.mtime.toISOString() };
        })
        .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
    },
  },
};
