'use client';
import {Fragment,useState} from 'react';
import Link from 'next/link';
import {DetailsForm,VariantForm,ImageUpload,type Variant} from './products/[id]/forms';
import {QuickStock} from './quick-stock';
import {rm} from '../../lib/hq';
export type CatalogRow={id:string;name:string;slug:string;description:string;category:string;status:string;brandName:string;image?:string;product_variants:Variant[]};
export function ProductRows({products}:{products:CatalogRow[]}){
 const [open,setOpen]=useState<string|null>(null);
 return <div className="scroll product-list"><table><thead><tr><th>Produk / kedai</th><th>Varian</th><th>Harga</th><th>Stok tersedia</th><th>Status</th><th><span className="sr-only">Tindakan</span></th></tr></thead><tbody>{products.map(p=>{
 const active=p.product_variants.filter(v=>v.active),prices=active.map(v=>v.price_cents),low=Math.min(...prices),high=Math.max(...prices);
 const stock=active.reduce((n,v)=>n+(v.inventory?v.inventory.on_hand-v.inventory.reserved:0),0);
 return <Fragment key={p.id}><tr className={open===p.id?'product-row selected':'product-row'}><td><div className="product-identity">{p.image?<img src={p.image} alt=""/>:<span className="product-thumb-placeholder" aria-hidden="true">—</span>}<div><Link href={`/admin/products/${p.id}`}>{p.name}</Link><small>{p.brandName}</small></div></div></td><td><span>{p.product_variants.length} varian</span><small className="variant-summary" title={p.product_variants.map(v=>`${v.size} / ${v.color}`).join(', ')}>{[...new Set(p.product_variants.map(v=>v.size))].join(' · ')}</small></td><td className="product-price"><button className="cell-edit" onClick={()=>setOpen(p.id)} aria-label={`Edit harga ${p.name}`}>{prices.length?(low===high?rm(low):`${rm(low)} – ${rm(high)}`):'—'}</button></td><td><button className="cell-edit" onClick={()=>setOpen(p.id)} aria-label={`Edit stok ${p.name}`}>{stock}</button><small>unit aktif</small></td><td><span className={`badge ${p.status}`}>{p.status==='draft'?'Draf':p.status==='published'?'Dipaparkan':'Arkib'}</span></td><td><button type="button" className="secondary" aria-expanded={open===p.id} aria-controls={`edit-${p.id}`} onClick={()=>setOpen(open===p.id?null:p.id)}>{open===p.id?'Tutup':'Edit'}</button></td></tr>{open===p.id&&<tr id={`edit-${p.id}`} className="product-inline-row"><td colSpan={6}><InlineEditor product={p}/></td></tr>}</Fragment>;
 })}</tbody></table></div>;
}
function InlineEditor({product:p}:{product:CatalogRow}){
 return <section className="inline-editor" aria-label={`Edit ${p.name}`}><div className="inline-editor-heading"><strong>Edit pantas · {p.name}</strong><Link href={`/admin/products/${p.id}`}>Edit lanjut ↗</Link></div><QuickStock productId={p.id} variants={p.product_variants}/><details><summary>+ Tambah varian</summary><VariantForm productId={p.id}/></details></section>;
}
