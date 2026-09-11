import Link from 'next/link';
import {requireOwner} from '../../../lib/auth';
import {BlockEditor,SliderEditor} from './editor';
import type {StoreBlock} from '../../../lib/storefront-content';
export default async function Appearance() {
 const {supabase}=await requireOwner();
 const {data:brand,error}=await supabase.from('brands').select('id,slider_auto,slider_seconds').eq('slug','heritage').single();
 if(error)throw new Error('Tetapan kedai belum tersedia.');
 const {data:blocks,error:blockError}=await supabase.from('brand_banners').select('*').eq('brand_id',brand.id).eq('archived',false).order('position').order('id');
 if(blockError)throw new Error('Seksyen tidak dapat dimuatkan.');
 return <><Link href="/admin">← Katalog HQ</Link><div className="row"><h1>Paparan Kedai</h1><Link className="button secondary" href="/preview/heritage">Lihat pratonton ↗</Link></div><p>Heritage · Hero di atas, diikuti produk dan seksyen tambahan. Perubahan disimpan terus untuk paparan kedai; produk draf kekal untuk pratonton owner sahaja.</p><SliderEditor auto={brand.slider_auto} seconds={brand.slider_seconds}/>
 <h2>Hero banner</h2>{(blocks as StoreBlock[]).filter(b=>b.kind==='hero').map(b=><BlockEditor key={b.id} block={b}/>)}
 <h2>Seksyen selepas produk</h2>{!(blocks as StoreBlock[]).some(b=>b.kind!=='hero')&&<p>Belum ada seksyen tambahan. Tambah mengikut keperluan.</p>}{(blocks as StoreBlock[]).filter(b=>b.kind!=='hero').map(b=><BlockEditor key={b.id} block={b}/>)}
 <BlockEditor key={`new-${blocks.length}`} position={Math.max(0,...blocks.map(b=>b.position))+10}/></>;
}
