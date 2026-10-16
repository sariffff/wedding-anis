import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client that bypasses RLS. Never import this from a client component.
let client: SupabaseClient | null = null;

export function getAdminSupabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  client = createClient(url, secretKey, { auth: { persistSession: false } });
  return client;
}
