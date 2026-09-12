'use client';

export interface IDBWorkItem {
  id: string;
  title: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'image' | 'video';
  fileType: string;
  fileName: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
    orientation: 'vertical' | 'horizontal' | 'square' | 'panoramic';
    duration?: number;
    resolution?: string;
  };
  workType: string;
  disciplines: string[];
  tags: string[];
  projectId: string | null;
  collectionIds: string[];
  seriesId: string | null;
  seriesOrder?: number;
  client?: string;
  year: string;
  caption?: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: number;
  updatedAt: number;
  aiSuggestions?: {
    suggestedProjectId?: string;
    projectConfidence?: number;
    suggestedType?: string;
    suggestedDisciplines?: string[];
  };
}

export interface IDBProject {
  id: string;
  title: string;
  slug: string;
  tag?: string;
  client?: string;
  role?: string;
  year: string;
  overview?: string;
  coverWorkId?: string | null;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IDBCollection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'published' | 'draft';
}

export interface IDBSeriesGroup {
  id: string;
  title: string;
  type: 'lookbook' | 'campaign' | 'photo_series' | 'social_suite' | 'print_sequence' | 'exploration' | 'other';
  projectId: string | null;
}

const DB_NAME = 'MoizPortfolioDB';
const DB_VERSION = 2;

const STORES = {
  WORKS: 'works',
  PROJECTS: 'projects',
  COLLECTIONS: 'collections',
  SERIES: 'series',
  LEGACY_CANVAS: 'canvas_files',
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Legacy store
      if (!db.objectStoreNames.contains(STORES.LEGACY_CANVAS)) {
        db.createObjectStore(STORES.LEGACY_CANVAS, { keyPath: 'id' });
      }

      // Works store
      if (!db.objectStoreNames.contains(STORES.WORKS)) {
        const workStore = db.createObjectStore(STORES.WORKS, { keyPath: 'id' });
        workStore.createIndex('projectId', 'projectId', { unique: false });
        workStore.createIndex('workType', 'workType', { unique: false });
        workStore.createIndex('status', 'status', { unique: false });
      }

      // Projects store
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }

      // Collections store
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        db.createObjectStore(STORES.COLLECTIONS, { keyPath: 'id' });
      }

      // Series store
      if (!db.objectStoreNames.contains(STORES.SERIES)) {
        db.createObjectStore(STORES.SERIES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };
  });
}

// ==========================================
// WORKS OPERATIONS
// ==========================================

export async function getAllWorksIDB(): Promise<IDBWorkItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORES.WORKS)) {
        db.close();
        resolve([]);
        return;
      }
      const transaction = db.transaction(STORES.WORKS, 'readonly');
      const store = transaction.objectStore(STORES.WORKS);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as IDBWorkItem[]) || []);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve([]); };
    });
  } catch (err) {
    console.warn('Could not read works from IndexedDB:', err);
    return [];
  }
}

export async function saveWorkIDB(work: IDBWorkItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.WORKS, 'readwrite');
    const store = transaction.objectStore(STORES.WORKS);
    const request = store.put(work);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(new Error('Transaction aborted')); };
  });
}

export async function saveWorksBatchIDB(works: IDBWorkItem[]): Promise<void> {
  if (!works.length) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.WORKS, 'readwrite');
    const store = transaction.objectStore(STORES.WORKS);
    for (const work of works) {
      store.put(work);
    }

    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(new Error('Batch save aborted')); };
  });
}

export async function deleteWorkIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.WORKS, 'readwrite');
    const store = transaction.objectStore(STORES.WORKS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); resolve(); };
  });
}

export async function deleteWorksBatchIDB(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.WORKS, 'readwrite');
    const store = transaction.objectStore(STORES.WORKS);
    for (const id of ids) {
      store.delete(id);
    }

    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); resolve(); };
  });
}

// ==========================================
// PROJECTS OPERATIONS
// ==========================================

export async function getAllProjectsIDB(): Promise<IDBProject[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.close();
        resolve([]);
        return;
      }
      const transaction = db.transaction(STORES.PROJECTS, 'readonly');
      const store = transaction.objectStore(STORES.PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as IDBProject[]) || []);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve([]); };
    });
  } catch (err) {
    console.warn('Could not read projects from IndexedDB:', err);
    return [];
  }
}

export async function saveProjectIDB(project: IDBProject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROJECTS);
    const request = store.put(project);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(new Error('Transaction aborted')); };
  });
}

export async function deleteProjectIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORES.PROJECTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); resolve(); };
  });
}

// ==========================================
// COLLECTIONS OPERATIONS
// ==========================================

export async function getAllCollectionsIDB(): Promise<IDBCollection[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        db.close();
        resolve([]);
        return;
      }
      const transaction = db.transaction(STORES.COLLECTIONS, 'readonly');
      const store = transaction.objectStore(STORES.COLLECTIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as IDBCollection[]) || []);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve([]); };
    });
  } catch (err) {
    return [];
  }
}

export async function saveCollectionIDB(collection: IDBCollection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.COLLECTIONS, 'readwrite');
    const store = transaction.objectStore(STORES.COLLECTIONS);
    const request = store.put(collection);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(new Error('Transaction aborted')); };
  });
}

export async function deleteCollectionIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.COLLECTIONS, 'readwrite');
    const store = transaction.objectStore(STORES.COLLECTIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); resolve(); };
  });
}

// ==========================================
// SERIES OPERATIONS
// ==========================================

export async function getAllSeriesIDB(): Promise<IDBSeriesGroup[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORES.SERIES)) {
        db.close();
        resolve([]);
        return;
      }
      const transaction = db.transaction(STORES.SERIES, 'readonly');
      const store = transaction.objectStore(STORES.SERIES);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as IDBSeriesGroup[]) || []);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve([]); };
    });
  } catch (err) {
    return [];
  }
}

export async function saveSeriesIDB(series: IDBSeriesGroup): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SERIES, 'readwrite');
    const store = transaction.objectStore(STORES.SERIES);
    const request = store.put(series);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(new Error('Transaction aborted')); };
  });
}

export async function deleteSeriesIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SERIES, 'readwrite');
    const store = transaction.objectStore(STORES.SERIES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); resolve(); };
  });
}

// ==========================================
// LEGACY COMPATIBILITY OPERATIONS
// ==========================================

export async function getAllCanvasFilesIDB(): Promise<any[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORES.LEGACY_CANVAS)) {
        db.close();
        resolve([]);
        return;
      }
      const transaction = db.transaction(STORES.LEGACY_CANVAS, 'readonly');
      const store = transaction.objectStore(STORES.LEGACY_CANVAS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve([]); };
    });
  } catch (err) {
    console.warn('Could not read legacy canvas files from IndexedDB:', err);
    return [];
  }
}

export async function saveCanvasFileIDB(file: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LEGACY_CANVAS, 'readwrite');
      const store = transaction.objectStore(STORES.LEGACY_CANVAS);
      const request = store.put(file);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); reject(new Error('Legacy save aborted')); };
    });
  } catch (err) {
    console.error('Failed to save to legacy store:', err);
  }
}

export async function deleteCanvasFileIDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LEGACY_CANVAS, 'readwrite');
      const store = transaction.objectStore(STORES.LEGACY_CANVAS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve(); };
    });
  } catch (err) {
    console.error('Failed to delete from legacy store:', err);
  }
}

export async function clearLegacyCanvasStoreIDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORES.LEGACY_CANVAS)) {
        db.close();
        resolve();
        return;
      }
      const transaction = db.transaction(STORES.LEGACY_CANVAS, 'readwrite');
      transaction.objectStore(STORES.LEGACY_CANVAS).clear();
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); resolve(); };
    });
  } catch {
    // ignore
  }
}

export async function clearAllStoresIDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const storeNames = [
        STORES.WORKS,
        STORES.PROJECTS,
        STORES.COLLECTIONS,
        STORES.SERIES,
        STORES.LEGACY_CANVAS,
      ].filter((name) => db.objectStoreNames.contains(name));

      if (storeNames.length === 0) {
        db.close();
        resolve();
        return;
      }

      const transaction = db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        transaction.objectStore(name).clear();
      }

      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
      transaction.onabort = () => { db.close(); resolve(); };
    });
  } catch (err) {
    console.warn('Error clearing all IDB stores:', err);
  }
}
