import curatedData from './curated_photos.json';

export interface DeliverableAsset {
  url: string;
  title: string;
  type: 'stills' | 'banners' | 'social';
  aspect: 'portrait' | 'landscape' | 'vertical';
}

export function get35CuratedDeliverables(fileId: string, customPhotos?: string[]): DeliverableAsset[] {
  const normalized = (fileId || '').toLowerCase().replace(/_/g, '-');
  const data = curatedData as Record<string, { title: string; photos: string[] }>;

  let matched = data[normalized];
  if (!matched) {
    for (const [key, val] of Object.entries(data)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        matched = val;
        break;
      }
    }
  }
  if (!matched) matched = data['motion-graphics'];

  const fallbackUrls = matched.photos || [];
  const combinedUrls: string[] = [];
  const seenKeys = new Set<string>();

  const getCleanKey = (u: string) => {
    try {
      return u.split('?')[0].toLowerCase().trim();
    } catch {
      return u.toLowerCase().trim();
    }
  };

  // 1. Put all custom user photos first
  if (customPhotos && customPhotos.length > 0) {
    customPhotos.forEach((url) => {
      if (url && typeof url === 'string' && url.trim().length > 0) {
        const key = getCleanKey(url);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combinedUrls.push(url);
        }
      }
    });
  }

  // 2. Pad up to 35 photos using curated high-res assets
  fallbackUrls.forEach((url) => {
    if (url && typeof url === 'string' && url.trim().length > 0) {
      const key = getCleanKey(url);
      if (!seenKeys.has(key) && combinedUrls.length < 35) {
        seenKeys.add(key);
        combinedUrls.push(url);
      }
    }
  });

  return combinedUrls.map((url, i) => {
    const type = (i % 3 === 0 ? 'stills' : i % 3 === 1 ? 'banners' : 'social') as 'stills' | 'banners' | 'social';
    const aspect = (i % 3 === 0 ? 'portrait' : i % 3 === 1 ? 'landscape' : 'vertical') as 'portrait' | 'landscape' | 'vertical';
    return {
      url,
      title: `${matched.title} #${String(i + 1).padStart(2, '0')}`,
      type,
      aspect,
    };
  });
}