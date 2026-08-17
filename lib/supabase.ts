import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for the public storefront read.
 *
 * Uses the ANON key and only ever calls `rpc_public_storefront` — a SECURITY
 * DEFINER function granted to `anon` that returns whitelisted fields only. That
 * RPC is the security surface, so no service-role key is needed (least
 * privilege): this key cannot read raw tables that RLS protects. Still kept
 * server-only (no NEXT_PUBLIC_ prefix) and `import "server-only"` makes any
 * client-component import a build error, so nothing ships to the browser.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to .env.local.",
    );
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
