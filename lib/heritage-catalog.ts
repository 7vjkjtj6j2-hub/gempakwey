import type { SupabaseClient } from "@supabase/supabase-js";
export async function heritageCatalog(client: SupabaseClient, preview = false) {
  let query = client.from("products").select("id,name,description,brands!inner(slug),product_variants(price_cents,size,color,active)").eq("brands.slug", "heritage").eq("product_variants.active", true).order("created_at", {ascending:false}).limit(50);
  query = preview ? query.in("status", ["draft", "published"]) : query.eq("status", "published");
  return await query;
}
