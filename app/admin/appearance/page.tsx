export const maxDuration=300;
import Link from 'next/link';
import {selectedBrand} from '../../../lib/hq';
import {requireOwner} from '../../../lib/auth';
import {VisualEditor} from './visual-editor';
import type {StoreBlock} from '../../../lib/storefront-content';
export default async function Appearance({searchParams}:{searchParams:Promise<{brand?:string}>}) {
 const {supabase}=await requireOwner();const slug=selectedBrand((await searchParams).brand)||'heritage';
 const {data:brand,error}=await supabase.from('brands').select('id,name,slider_auto,slider_seconds').eq('slug',slug).single();
 if(error)throw new Error('Tetapan kedai belum tersedia.');
 const {data:blocks,error:blockError}=await supabase.from('brand_banners').select('*').eq('brand_id',brand.id).eq('archived',false).order('position').order('id');
 if(blockError)throw new Error('Seksyen tidak dapat dimuatkan.');
 return <><Link className="breadcrumbs" href="/admin/stores">← Semua kedai</Link><div className="row"><h1>{brand.name} · Paparan</h1>{slug==='heritage'&&<Link className="button secondary" href="/preview/heritage">Lihat pratonton ↗</Link>}</div>{slug!=='heritage'&&<p className="notice">Kandungan disimpan untuk {brand.name}. Paparan kedai ini masih perlu disambungkan sebelum perubahan kelihatan kepada pelanggan.</p>}<VisualEditor key={slug} brand={slug} name={brand.name} blocks={blocks as StoreBlock[]} auto={brand.slider_auto} seconds={brand.slider_seconds}/></>;
}
