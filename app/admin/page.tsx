import {InstantFilters} from './instant-filters';
import {ProductRows,type CatalogRow} from './product-rows';
import {mediaUrl} from '../../lib/storefront-content';
import Link from 'next/link';
import {requireOwner} from '../../lib/auth';
import {logout} from './login/actions';
import {hqBrands,selectedBrand,rm,paymentLabels,fulfillmentLabels} from '../../lib/hq';
export default async function Dashboard({searchParams}:{searchParams:Promise<{brand?:string;view?:string;payment?:string;page?:string;q?:string;fulfillment?:string}>}) {
 const {supabase,user}=await requireOwner(); const params=await searchParams;
 const brand=selectedBrand(params.brand),view=params.view==='products'?'products':'orders';
 const term=typeof params.q==='string'?params.q.trim().slice(0,100):'';
 const fulfillment=Object.hasOwn(fulfillmentLabels,params.fulfillment??'')?params.fulfillment!:'';
 const payment=Object.hasOwn(paymentLabels,params.payment??'')?params.payment!:'';
 const page=Math.min(10000,Math.max(1,Number.parseInt(params.page??'1',10)||1));
 const {data:brands,error:brandError}=await supabase.from('brands').select('id,slug,name').order('name');
 if(brandError)throw new Error('Senarai kedai tidak dapat dimuatkan.');
 const activeBrand=brands?.find(b=>b.slug===brand); const missing=Boolean(brand&&!activeBrand);
 const queryString=(v:string,p=1)=>new URLSearchParams({view:v,brand,payment,q:term,fulfillment,page:String(p)}).toString();
 let content;
 if(view==='products') {
  let query=supabase.from('products').select('id,name,slug,description,category,status,brands(name),product_images(storage_path,position),product_variants(id,sku,price_cents,size,color,active,inventory(on_hand,reserved,updated_at))',{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*30,page*30-1);
  if(activeBrand)query=query.eq('brand_id',activeBrand.id);
  if(term)query=query.ilike('name',`%${term.replace(/[\\%_]/g,'\\$&')}%`);
  const {data,error,count}=missing?{data:[],error:null,count:0}:await query;if(error)throw new Error('Katalog tidak dapat dimuatkan.');
  content=<><div className="row"><h2>Produk · {count??0}</h2><Link className="button" href={`/admin/products/new${activeBrand?`?brand=${activeBrand.id}`:''}`}>+ Tambah produk</Link></div>{!data?.length?<p>Belum ada produk untuk pilihan ini.</p>:<ProductRows products={data.map(p=>({...p,brandName:[p.brands].flat().map(b=>b?.name).join(', '),image:mediaUrl([...p.product_images].sort((a,b)=>a.position-b.position)[0]?.storage_path??null)})) as unknown as CatalogRow[]}/>}<Pagination page={page} count={count??0} url={p=>`?${queryString(view,p)}`}/></>;
 } else {
  // Filter via a second relation so matching orders retain ALL item/brand snapshots.
  const select=(activeBrand?'id,order_number,customer_name,created_at,total_cents,payment_status,order_status,order_items(brand_name,quantity),fulfillments(status),matching:order_items!inner(product_variants!inner(products!inner(brand_id)))':'id,order_number,customer_name,created_at,total_cents,payment_status,order_status,order_items(brand_name,quantity),fulfillments(status)').replaceAll('fulfillments(status)',fulfillment?'fulfillments!inner(status)':'fulfillments(status)');
  let query=supabase.from('orders').select(select,{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*30,page*30-1);
  if(activeBrand)query=query.eq('matching.product_variants.products.brand_id',activeBrand.id);
  if(payment)query=query.eq('payment_status',payment);
  if(fulfillment)query=query.eq('fulfillments.status',fulfillment);
  if(term){if(/^#?\d+$/.test(term))query=query.eq('order_number',term.replace('#',''));else query=query.ilike('customer_name',`%${term.replace(/[\\%_]/g,'\\$&')}%`);}
  const {data,error,count}=missing?{data:[],error:null,count:0}:await query;if(error)throw new Error('Order tidak dapat dimuatkan.');
  type Order={id:string;order_number:number;customer_name:string;created_at:string;total_cents:number;payment_status:string;order_status:string;order_items:{brand_name:string;quantity:number}[];fulfillments:{status:string}[]|{status:string}|null};
  const orders=data as unknown as Order[];
  content=<><h2>Order · {count??0}</h2>{!orders?.length?<div className="empty-hq"><h3>Belum ada order untuk pilihan ini</h3><p>Order sebenar akan muncul apabila checkout kedai disambungkan ke sistem HQ. Tiada order contoh dimasukkan.</p></div>:<div className="scroll"><table><thead><tr><th>Order / tarikh</th><th>Pelanggan / kedai</th><th>Jumlah order</th><th>Bayaran</th><th>Packing</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><Link href={`/admin/orders/${o.id}`}>#{o.order_number} ↗</Link><small>{new Date(o.created_at).toLocaleDateString('ms-MY',{timeZone:'Asia/Kuala_Lumpur'})}</small></td><td>{o.customer_name}<small>{[...new Set(o.order_items.map(i=>i.brand_name))].join(', ')}</small></td><td>{rm(o.total_cents)}</td><td><span className={`badge ${o.payment_status}`}>{paymentLabels[o.payment_status]??o.payment_status}</span>{o.order_status==='cancelled'&&<small>Dibatalkan</small>}</td><td>{fulfillmentLabels[[o.fulfillments].flat()[0]?.status??'']??'Belum tersedia'}</td></tr>)}</tbody></table></div>}<Pagination page={page} count={count??0} url={p=>`?${queryString(view,p)}`}/><p><small>Jumlah ialah nilai penuh order, termasuk order yang mempunyai lebih daripada satu brand.</small></p></>;
 }
 return <><div className="row"><div><small>HQ GEMPAKWEY · {user.email}</small><h1>{view==='orders'?'Order & packing':'Produk & stok'}</h1></div><form action={logout}><button className="secondary">Log keluar</button></form></div><p className="page-subtitle">{view==='orders'?'Semak bayaran, sediakan pesanan dan urus penghantaran semua kedai.':'Urus gambar, harga, saiz, warna dan stok setiap produk.'}</p><div className="hq-tabs"><Link className={view==='orders'?'button':'button secondary'} href={`?${queryString('orders')}`}>Order & packing</Link><Link className={view==='products'?'button':'button secondary'} href={`?${queryString('products')}`}>Produk</Link><Link className="button secondary" href="/admin/appearance">Paparan Heritage</Link></div><section className="card"><InstantFilters><input type="hidden" name="view" value={view}/><label>{view==='orders'?'Cari order atau pelanggan':'Cari nama produk'}<input name="q" defaultValue={term} placeholder={view==='orders'?'#1001 atau nama pelanggan':'Contoh: Everyday Tee'}/></label><label>Kedai<select name="brand" defaultValue={brand}><option value="">Semua kedai</option>{(brands??[]).map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></label>{view==='orders'&&<label>Bayaran<select name="payment" defaultValue={payment}><option value="">Semua status</option>{Object.entries(paymentLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>}{view==='orders'&&<label>Packing<select name="fulfillment" defaultValue={fulfillment}><option value="">Semua peringkat</option>{Object.entries(fulfillmentLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>}</InstantFilters>{missing&&<p className="notice">Brand ini belum didaftarkan dalam database. Jalankan migration HQ untuk mengaktifkan pengurusan katalog.</p>}{content}</section></>;
}
function Pagination({page,count,url}:{page:number;count:number;url:(p:number)=>string}){return <div className="row pagination"><small>Halaman {page} · {count} rekod</small><div>{page>1&&<Link className="button secondary" href={url(page-1)}>← Sebelum</Link>} {page*30<count&&<Link className="button secondary" href={url(page+1)}>Seterusnya →</Link>}</div></div>}
