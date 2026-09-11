import type {StoreBlock} from '../lib/storefront-content';
import {StorefrontMedia} from './storefront-media';
export function StoreSections({blocks}:{blocks:StoreBlock[]}) {
 return <div className="store-sections">{blocks.filter(b=>b.kind!=='hero').map(b=><section key={b.id} className={`store-section section-${b.kind}`}>
 <div className="section-media"><StorefrontMedia key={b.storage_path??'none'} path={b.storage_path} mobile={b.mobile_path} alt={b.alt_text}/></div>
 {b.kind==='pair'&&<div className="section-media"><StorefrontMedia key={b.second_path??'none'} path={b.second_path} alt={b.alt_text}/></div>}
 {(b.heading||b.body||b.button_label)&&<div className="section-copy">{b.heading&&<h2>{b.heading}</h2>}{b.body&&<p>{b.body}</p>}{b.button_label&&<a className="hero-button" href={b.link}>{b.button_label} ↗</a>}</div>}
 </section>)}</div>;
}
