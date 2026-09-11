import Link from 'next/link';
import {selectedBrand} from '../../../lib/hq';
import {requireOwner} from '../../../lib/auth';
import {BlockEditor,SliderEditor} from './editor';
import type {StoreBlock} from '../../../lib/storefront-content';
export default async function Appearance({searchParams}:{searchParams:Promise<{brand?:string}>}) {
 const {supabase}=await requireOwner();const slug=selectedBrand((await searchParams).brand)||'heritage';
 const {data:brand,error}=await supabase.from('brands').select('id,name,slider_auto,slider_seconds').eq('slug',slug).single();
 if(error)throw new Error('Tetapan kedai belum tersedia.');
 const {data:blocks,error:blockError}=await supabase.from('brand_banners').select('*').eq('brand_id',brand.id).eq('archived',false).order('position').order('id');
 if(blockError)throw new Error('Seksyen tidak dapat dimuatkan.');
 return <><Link className="breadcrumbs" href="/admin/stores">← Semua kedai</Link><div className="row"><h1>{brand.name} · Paparan</h1>{slug==='heritage'&&<Link className="button secondary" href="/preview/heritage">Lihat pratonton ↗</Link>}</div>{slug!=='heritage'&&<p className="notice">Kandungan disimpan untuk {brand.name}. Paparan kedai ini masih perlu disambungkan sebelum perubahan kelihatan kepada pelanggan.</p>}<p>Hero di atas, diikuti produk dan seksyen tambahan. Perubahan disimpan terus untuk paparan kedai; produk draf kekal untuk pratonton owner sahaja.</p><SliderEditor brand={slug} auto={brand.slider_auto} seconds={brand.slider_seconds}/>
 <h2>Hero banner</h2>{(blocks as StoreBlock[]).filter(b=>b.kind==='hero').map(b=><BlockEditor brand={slug} key={b.id} block={b}/>)}
 <h2>Seksyen selepas produk</h2>{!(blocks as StoreBlock[]).some(b=>b.kind!=='hero')&&<p>Belum ada seksyen tambahan. Tambah mengikut keperluan.</p>}{(blocks as StoreBlock[]).filter(b=>b.kind!=='hero').map(b=><BlockEditor brand={slug} key={b.id} block={b}/>)}
 <BlockEditor brand={slug} key={`new-${blocks.length}`} position={Math.max(0,...blocks.map(b=>b.position))+10}/></>;
}
