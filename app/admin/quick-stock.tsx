'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {quickSaveVariant} from './products/[id]/actions';
import type {Variant} from './products/[id]/forms';
export function QuickStock({productId,variants}:{productId:string;variants:Variant[]}) {
 return <div className="quick-stock"><p>Klik angka untuk edit · Enter atau Tab untuk simpan · Stok fizikal termasuk unit ditempah.</p><table><thead><tr><th>Saiz / warna</th><th>Harga (RM)</th><th>Stok fizikal</th><th>Ditempah</th><th>Simpanan</th></tr></thead><tbody>{variants.map(v=><QuickRow key={v.id} productId={productId} variant={v}/>)}</tbody></table>{!variants.length&&<p>Tambah varian melalui Edit lanjut.</p>}</div>;
}
function QuickRow({productId,variant}:{productId:string;variant:Variant}){
 const router=useRouter(),latest=useRef(variant),queue=useRef(Promise.resolve());
 const [price,setPrice]=useState((variant.price_cents/100).toFixed(2)),[stock,setStock]=useState(String(variant.inventory?.on_hand??0)),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 const blocked=useRef(false);
 function save(field:'price'|'stock',value:string){
  queue.current=queue.current.then(async()=>{
   if(blocked.current)return;
   const v=latest.current;
   if(value.trim()!==''&&Number(value)===(field==='price'?v.price_cents/100:v.inventory?.on_hand))return;
   setMessage('Menyimpan…');setFailed(false);
   try{
    const result=await quickSaveVariant({id:v.id,productId,field,value,expected:v.inventory?.updated_at??''});
    if(result.error||!result.variant)throw new Error(result.error);
    latest.current=result.variant as Variant;setMessage('✓ Disimpan');router.refresh();
   }catch(e){blocked.current=true;setFailed(true);setMessage(e instanceof Error?e.message:'Sambungan gagal. Semak dan cuba lagi.');}
  });
 }
 return <tr><td><strong>{variant.size}</strong><small>{variant.color}{variant.active?'':' · Tidak aktif'}</small></td><td><input aria-label={`Harga ${variant.size} ${variant.color}`} inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} onBlur={e=>save('price',e.target.value)} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></td><td><input aria-label={`Stok ${variant.size} ${variant.color}`} inputMode="numeric" value={stock} onChange={e=>setStock(e.target.value)} onBlur={e=>save('stock',e.target.value)} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></td><td>{latest.current.inventory?.reserved??0}</td><td><span role={failed?'alert':'status'} className={failed?'quick-error':'quick-status'}>{message||'—'}</span>{failed&&<button className="secondary" onClick={()=>{blocked.current=false;save('price',price);save('stock',stock);}}>Cuba lagi</button>}{failed&&<button className="secondary" onClick={()=>window.location.reload()}>Muat semula</button>}</td></tr>;
}
