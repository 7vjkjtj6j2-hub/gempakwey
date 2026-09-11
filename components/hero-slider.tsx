'use client';
import {useEffect,useRef,useState} from 'react';
import type {StoreBlock} from '../lib/storefront-content';
import {StorefrontMedia} from './storefront-media';
const fallback={id:'fallback',heading:'Gaya sendiri. Cerita kita.',body:'Kenali koleksi pertama Heritage.',button_label:'Terokai koleksi',link:'#collection',storage_path:null,mobile_path:null,alt_text:''};
export function HeroSlider({banners,auto,seconds}:{banners:StoreBlock[];auto:boolean;seconds:number}) {
 const slides=banners.length?banners:[fallback];const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const [hover,setHover]=useState(false);const [reduced,setReduced]=useState(true);const [hidden,setHidden]=useState(false);const touch=useRef<number|null>(null);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const motion=()=>setReduced(media.matches);const visibility=()=>setHidden(document.hidden);motion();visibility();media.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);return()=>{media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};},[]);
 const running=auto&&!paused&&!hover&&!reduced&&!hidden&&slides.length>1;
 useEffect(()=>{if(!running)return;const timer=setInterval(()=>setIndex(i=>(i+1)%slides.length),Math.max(3,Math.min(15,seconds))*1000);return()=>clearInterval(timer);},[running,seconds,slides.length]);
 const current=index%slides.length;const slide=slides[current];
 const go=(next:number)=>{setPaused(true);setIndex((next+slides.length)%slides.length);};
 return <section className="full-hero" role="region" aria-roledescription="carousel" aria-label="Koleksi Heritage" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={e=>{if(!(e.target as HTMLElement).closest('[data-slider-toggle]'))setPaused(true);}} onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null){const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>50&&slides.length>1)go(current+(delta<0?1:-1));}touch.current=null;}}>
 <div className="hero-slide" key={slide.id}><StorefrontMedia path={slide.storage_path} mobile={slide.mobile_path} alt={slide.alt_text} hero/><div className="hero-shade"/><div className="hero-overlay"><span className="hero-eyebrow">BERAKAR PADA WARISAN</span><h1>{slide.heading}</h1>{slide.body&&<p>{slide.body}</p>}{slide.button_label&&<a href={slide.link} className="hero-button">{slide.button_label} <span>↗</span></a>}</div></div>
 {slides.length>1&&<div className="slider-controls"><button type="button" onClick={()=>go(current-1)} aria-label="Banner sebelumnya">←</button><div className="slider-dots">{slides.map((s,i)=><button key={s.id} type="button" aria-label={`Lihat banner ${i+1}`} aria-current={i===current?'true':undefined} onClick={()=>go(i)}>{i+1}</button>)}</div><button type="button" onClick={()=>go(current+1)} aria-label="Banner seterusnya">→</button>{auto&&!reduced&&<button type="button" data-slider-toggle onClick={()=>setPaused(v=>!v)} aria-label={paused?'Sambung slider automatik':'Jeda slider automatik'}>{paused?'▶':'Ⅱ'}</button>}</div>}
 <span className="sr-only" aria-live={running?'off':'polite'}>Banner {current+1} daripada {slides.length}</span>
 </section>;
}
