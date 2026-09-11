import {getStoreContent} from '../../../lib/storefront-content';
import { HeritageStore } from "../../../components/heritage-store";
import { requireOwner } from "../../../lib/auth";
import { heritageCatalog } from "../../../lib/heritage-catalog";
export const metadata = { title: "Pratonton Heritage | HQ", robots: {index:false,follow:false} };
export default async function Preview() {
  const {supabase} = await requireOwner();
  const [{data,error}, content] = await Promise.all([heritageCatalog(supabase,true),getStoreContent(supabase)]);
  return <HeritageStore products={data ?? []} content={content} preview unavailable={Boolean(error)}/>;
}
