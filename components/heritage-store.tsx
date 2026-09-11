import Link from "next/link";
import {HeroSlider} from './hero-slider';
import {StoreSections} from './store-sections';
import type {StoreContent} from '../lib/storefront-content';
import './storefront-content.css';
import styles from "./heritage-store.module.css";

export type StoreProduct = {
  id: string; name: string; description: string;
  product_variants: { price_cents: number; size: string; color: string }[];
};

export function HeritageStore({ products, preview = false, unavailable = false, content = {blocks:[],auto:false,seconds:6} }: { products: StoreProduct[]; preview?: boolean; unavailable?: boolean; content?:StoreContent }) {
  return <div className={styles.store}>
    {preview && <aside className={styles.preview}><span>PRATONTON OWNER · Termasuk produk draf</span><Link href="/admin">Kembali ke HQ ↗</Link></aside>}
    <div className={styles.announcement}>BERAKAR PADA WARISAN · DIBAWA KE HARI INI</div>
    <header className={styles.header}><a href={preview ? "/preview/heritage" : "/"} className={styles.logo}>HERITAGE<span>BY GEMPAKWEY</span></a><nav className={styles.navigation} aria-label="Navigasi Heritage"><a className={styles.nav} href="#cerita">Cerita kita</a><a className={styles.nav} href="#collection">Koleksi ↗</a></nav></header>
    <HeroSlider banners={content.blocks.filter(b=>b.kind==='hero')} auto={content.auto} seconds={content.seconds}/>
    <main className={styles.main}>
      <section className={styles.collection} id="collection"><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>BAB PERTAMA / KOLEKSI</span><h2>Koleksi pertama.</h2></div><span className={styles.note}>Pembelian akan dibuka nanti</span></div>
      {unavailable ? <p className={styles.empty}>Koleksi tidak dapat dimuatkan buat masa ini. Sila cuba sebentar lagi.</p> : products.length === 0 ? <p className={styles.empty}>Koleksi sedang disediakan. Nantikan produk pertama Heritage.</p> : <div className={styles.products}>{products.map(product => <article className={styles.product} key={product.id}>
        <div className={styles.placeholder} role="img" aria-label={`Gambar ${product.name} akan datang`}><span className={styles.imageLabel}>HERITAGE COLLECTION</span><svg width="54" height="54" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="7" width="34" height="34" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="m8 34 10-10 8 8 6-6 9 9" stroke="currentColor" strokeWidth="1.5"/></svg><p>Gambar akan datang</p><span className={styles.imageFoot}>Foto produk akan dimuat naik kemudian</span></div>
        <div className={styles.productInfo}><div className={styles.productHeading}><h3>{product.name}</h3><span className={styles.price}>{product.product_variants.length ? `${new Set(product.product_variants.map(v => Number(v.price_cents))).size > 1 ? "Dari " : ""}RM ${(Math.min(...product.product_variants.map(v => Number(v.price_cents))) / 100).toFixed(2)}` : "Harga akan datang"}</span></div><p className={styles.variant}>{[...new Set(product.product_variants.map(v => v.color))].join(" / ") + " · " + [...new Set(product.product_variants.map(v => v.size))].join(" / ")}</p><p className={styles.description}>{product.description}</p><div className={styles.saleStatus}>AKAN DATANG <span>Belum dibuka untuk pembelian</span></div></div>
      </article>)}</div>}
      </section>
    <StoreSections blocks={content.blocks}/>
      <section className={styles.story} id="cerita" aria-labelledby="heritage-story-title">
        <div className={styles.storyHeading}><span className={styles.eyebrow}>JIWA HERITAGE</span><h2 id="heritage-story-title">Warisan yang<br/><em>kita bawa.</em></h2><span className={styles.storySignature}>SILAT · BUDAYA · CERITA KITA</span></div>
        <div className={styles.storyCopy}><p>Berpaksikan semangat silat dan cerita orang Melayu, Heritage membawa warisan ke dalam gaya seharian.</p><p>Daripada yang asas, kita membina identiti. Baju dan topi menjadi permulaan untuk membawa cerita ini bersama, ke mana sahaja kita melangkah.</p><a href="#collection">Kenali koleksi pertama <span aria-hidden="true">↗</span></a></div>
      </section>
    </main><footer className={styles.footer}><span className={styles.footerBrand}>HERITAGE</span><span>Sebuah brand dalam keluarga Gempakwey.</span><a href="#collection">Lihat koleksi ↑</a></footer>
  </div>;
}
