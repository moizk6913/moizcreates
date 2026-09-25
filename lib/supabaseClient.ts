import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://eztcznarhdmpfurrtbgx.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_D22slN-FI3-0hfJpXqnXgQ_v7jO83_D';

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}

/**
 * Uploads an optimized buffer to Supabase Storage bucket 'portfolio-media'.
 * Returns the public CDN URL or null if Supabase Storage is not yet configured.
 */
export async function uploadToSupabaseStorage(
  filePath: string,
  buffer: Buffer,
  contentType: string = 'image/webp'
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const BUCKET = 'portfolio-media';

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('[Supabase Storage] Upload error:', error.message);
      return null;
    }

    const { data: pubData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return pubData?.publicUrl || null;
  } catch (err) {
    console.warn('[Supabase Storage] Exception during upload:', err);
    return null;
  }
}

/**
 * Syncs the portfolio database state to Supabase table 'portfolio_state'.
 */
export async function syncDatabaseToSupabase(data: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('portfolio_state')
      .upsert({
        id: 'current',
        data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[Supabase DB] Sync error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase DB] Exception during sync:', err);
    return false;
  }
}

/**
 * Fetches the portfolio database state from Supabase table 'portfolio_state'.
 */
export async function fetchDatabaseFromSupabase(): Promise<any | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('portfolio_state')
      .select('data')
      .eq('id', 'current')
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data.data;
  } catch {
    return null;
  }
}

/**
 * Verifies Supabase health: checks connection, storage bucket, and state table.
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  bucketReady: boolean;
  tableReady: boolean;
  projectUrl: string;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      connected: false,
      bucketReady: false,
      tableReady: false,
      projectUrl: supabaseUrl,
      error: 'Supabase credentials not configured',
    };
  }

  let bucketReady = false;
  let tableReady = false;

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && Array.isArray(buckets)) {
      bucketReady = buckets.some((b) => b.name === 'portfolio-media');
    }
  } catch {}

  try {
    const { data, error } = await supabase
      .from('portfolio_state')
      .select('id')
      .limit(1);
    if (!error) {
      tableReady = true;
    }
  } catch {}

  return {
    connected: true,
    bucketReady,
    tableReady,
    projectUrl: supabaseUrl,
  };
}
