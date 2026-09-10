import { createClient } from "@supabase/supabase-js";

/** Anonymous, stateless access only. Every database query remains subject to RLS.
 * Add separate cookie-aware clients before implementing authenticated HQ routes.
 */
export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  if (!key.startsWith("sb_publishable_")) {
    throw new Error("The public Supabase client requires a publishable key.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
