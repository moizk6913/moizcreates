import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eztcznarhdmpfurrtbgx.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_D22slN-FI3-0hfJpXqnXgQ_v7jO83_D";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
