'use client';
import {useState} from 'react';
import {mediaUrl} from '../lib/storefront-content';
export function StorefrontMedia({path,mobile,alt,hero=false}:{path:string|null;mobile?:string|null;alt:string;hero?:boolean}) {
 const [failed,setFailed]=useState(false);const url=mediaUrl(path);const mobileUrl=mediaUrl(mobile??null);
 if(!url||failed)return hero?<div className="hero-fallback" aria-hidden="true"><span>HERITAGE</span></div>:<div className="section-placeholder" role="img" aria-label="Gambar akan datang"><span>HERITAGE</span><small>Gambar akan datang</small></div>;
 return <picture>{mobileUrl&&<source media="(max-width: 700px)" srcSet={mobileUrl}/>}<img src={url} alt={alt} loading={hero?'eager':'lazy'} onError={()=>setFailed(true)}/></picture>;
}
