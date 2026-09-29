export const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

// Client initialization placeholder
export function getSupabaseClient() {
  return {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
  };
}
