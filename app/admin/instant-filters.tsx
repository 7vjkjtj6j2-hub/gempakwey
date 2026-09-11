'use client';
import {useEffect,useRef,useTransition,type ReactNode} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
export function InstantFilters({children}:{children:ReactNode}){
 const router=useRouter(),params=useSearchParams(),form=useRef<HTMLFormElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [pending,startTransition]=useTransition();
 const cancel=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;};
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{
  const node=form.current;if(!node||node.contains(document.activeElement))return;
  for(const input of Array.from(node.elements))if((input instanceof HTMLInputElement||input instanceof HTMLSelectElement)&&input.name)input.value=params.get(input.name)??(input.name==='view'?'orders':'');
 },[params]);
 function apply(){cancel();if(!form.current)return;const query=new URLSearchParams();for(const [name,value] of new FormData(form.current))if(typeof value==='string'&&value.trim())query.set(name,value.trim());query.set('page','1');startTransition(()=>router.replace(`/admin?${query}`,{scroll:false}));}
 return <form ref={form} method="get" className="hq-filters" aria-busy={pending} onSubmit={e=>{e.preventDefault();apply();}} onChange={e=>{cancel();if(e.target instanceof HTMLSelectElement)apply();else if(e.target instanceof HTMLInputElement){timer.current=setTimeout(apply,400);}}} onCompositionStart={cancel} onCompositionEnd={()=>{cancel();timer.current=setTimeout(apply,400);}}>{children}<button type="button" className="secondary" onClick={()=>{cancel();if(form.current)for(const input of Array.from(form.current.elements))if((input instanceof HTMLInputElement||input instanceof HTMLSelectElement)&&input.name&&input.name!=='view')input.value='';apply();}}>Kosongkan</button><span className="filter-progress" role="status">{pending?'Memuatkan…':'Tapis automatik'}</span></form>;
}
