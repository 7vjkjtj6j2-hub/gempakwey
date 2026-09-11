import {getStoreContent} from '../lib/storefront-content';
import { HeritageStore } from "../components/heritage-store";
import { createPublicSupabaseClient } from "../lib/supabase/public";
import { heritageCatalog } from "../lib/heritage-catalog";
export const dynamic = "force-dynamic";
export default async function Home() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <HeritageStore products={[]}/>;
  const client = createPublicSupabaseClient();
  const [{data,error}, content] = await Promise.all([heritageCatalog(client),getStoreContent(client)]);
  return <HeritageStore products={data ?? []} content={content} unavailable={Boolean(error)}/>;
}
