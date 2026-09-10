// Read-only connection check; does not create users or read application records.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key?.startsWith("sb_publishable_")) {
  throw new Error("Set the Supabase URL and publishable key in .env.local first.");
}
// The Data API root is an administrative schema endpoint that requires a secret
// key. Test project connectivity here; test actual tables with RLS after migration.
for (const path of ["/auth/v1/settings"]) {
  const response = await fetch(new URL(path, url), {
    headers: { apikey: key },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Supabase ${path}: HTTP ${response.status}`);
  console.log(`Supabase ${path}: HTTP ${response.status}`);
  await response.body?.cancel();
}
console.log("Connection verified. Schema and RLS policies are not verified by this check.");
