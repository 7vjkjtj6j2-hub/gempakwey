import Link from 'next/link';
import {requireOwner} from '../../lib/auth';
import {logout} from './login/actions';
import {hqBrands,selectedBrand,rm,paymentLabels,fulfillmentLabels} from '../../lib/hq';
export default async function Dashboard({searchParams}:{searchParams:Promise<{brand?:string;view?:string;payment?:string;page?:string}>}) {
 const {supabase,user}=await requireOwner(); const params=await searchParams;
 const brand=selectedBrand(params.brand),view=params.view==='products'?'products':'orders';
 const payment=Object.hasOwn(paymentLabels,params.payment??'')?params.payment!:'';
 const page=Math.min(10000,Math.max(1,Number.parseInt(params.page??'1',10)||1));
 const {data:brands,error:brandError}=await supabase.from('brands').select('id,slug,name').order('name');
 if(brandError)throw new Error('Senarai kedai tidak dapat dimuatkan.');
 const activeBrand=brands?.find(b=>b.slug===brand); const missing=Boolean(brand&&!activeBrand);
 const queryString=(v:string,p=1)=>new URLSearchParams({view:v,brand,payment,page:String(p)}).toString();
 let content;
 if(view==='products') {
  let query=supabase.from('products').select('id,name,slug,status,brands(name),product_variants(sku,price_cents,size,color)',{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*30,page*30-1);
  if(activeBrand)query=query.eq('brand_id',activeBrand.id);
  const {data,error,count}=missing?{data:[],error:null,count:0}:await query;if(error)throw new Error('Katalog tidak dapat dimuatkan.');
  content=<><div className="row"><h2>Produk · {count??0}</h2><Link className="button" href="/admin/products/new">+ Tambah produk</Link></div>{!data?.length?<p>Belum ada produk untuk pilihan ini.</p>:<div className="scroll"><table><thead><tr><th>Produk / kedai</th><th>Varian</th><th>Harga</th><th>Status</th></tr></thead><tbody>{data.map(p=><tr key={p.id}><td>{p.name}<small>{[p.brands].flat().map(b=>b?.name).join(', ')}</small></td><td>{p.product_variants.map(v=>`${v.sku} · ${v.size} · ${v.color}`).join(', ')}</td><td>{p.product_variants.map(v=>rm(v.price_cents)).join(', ')}</td><td>{p.status==='draft'?'Draf':p.status}</td></tr>)}</tbody></table></div>}<Pagination page={page} count={count??0} url={p=>`?${queryString(view,p)}`}/></>;
 } else {
  // Filter via a second relation so matching orders retain ALL item/brand snapshots.
  const select=activeBrand?'id,order_number,customer_name,created_at,total_cents,payment_status,order_status,order_items(brand_name,quantity),fulfillments(status),matching:order_items!inner(product_variants!inner(products!inner(brand_id)))':'id,order_number,customer_name,created_at,total_cents,payment_status,order_status,order_items(brand_name,quantity),fulfillments(status)';
  let query=supabase.from('orders').select(select,{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*30,page*30-1);
  if(activeBrand)query=query.eq('matching.product_variants.products.brand_id',activeBrand.id);
  if(payment)query=query.eq('payment_status',payment);
  const {data,error,count}=missing?{data:[],error:null,count:0}:await query;if(error)throw new Error('Order tidak dapat dimuatkan.');
  type Order={id:string;order_number:number;customer_name:string;created_at:string;total_cents:number;payment_status:string;order_status:string;order_items:{brand_name:string;quantity:number}[];fulfillments:{status:string}[]|{status:string}|null};
  const orders=data as unknown as Order[];
  content=<><h2>Order · {count??0}</h2>{!orders?.length?<div className="empty-hq"><h3>Belum ada order untuk pilihan ini</h3><p>Order sebenar akan muncul apabila checkout kedai disambungkan ke sistem HQ. Tiada order contoh dimasukkan.</p></div>:<div className="scroll"><table><thead><tr><th>Order / tarikh</th><th>Pelanggan / kedai</th><th>Jumlah order</th><th>Bayaran</th><th>Packing</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><Link href={`/admin/orders/${o.id}`}>#{o.order_number} ↗</Link><small>{new Date(o.created_at).toLocaleDateString('ms-MY',{timeZone:'Asia/Kuala_Lumpur'})}</small></td><td>{o.customer_name}<small>{[...new Set(o.order_items.map(i=>i.brand_name))].join(', ')}</small></td><td>{rm(o.total_cents)}</td><td><span className="badge">{paymentLabels[o.payment_status]??o.payment_status}</span>{o.order_status==='cancelled'&&<small>Dibatalkan</small>}</td><td>{fulfillmentLabels[[o.fulfillments].flat()[0]?.status??'']??'Belum tersedia'}</td></tr>)}</tbody></table></div>}<Pagination page={page} count={count??0} url={p=>`?${queryString(view,p)}`}/><p><small>Jumlah ialah nilai penuh order, termasuk order yang mempunyai lebih daripada satu brand.</small></p></>;
 }
 return <><div className="row"><div><small>HQ GEMPAKWEY · {user.email}</small><h1>Satu HQ. Semua kedai.</h1></div><form action={logout}><button className="secondary">Log keluar</button></form></div><p>Urus katalog dan pantau order Heritage, ASAS, Waris Watan serta Baju Orang Melayu.</p><div className="hq-tabs"><Link className={view==='orders'?'button':'button secondary'} href={`?${queryString('orders')}`}>Order & packing</Link><Link className={view==='products'?'button':'button secondary'} href={`?${queryString('products')}`}>Produk</Link><Link className="button secondary" href="/admin/appearance">Paparan Heritage</Link></div><section className="card"><form method="get" className="hq-filters"><input type="hidden" name="view" value={view}/><label>Kedai<select name="brand" defaultValue={brand}><option value="">Semua kedai</option>{hqBrands.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></label>{view==='orders'&&<label>Bayaran<select name="payment" defaultValue={payment}><option value="">Semua status</option>{Object.entries(paymentLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>}<button>Tapis</button></form>{missing&&<p className="notice">Brand ini belum didaftarkan dalam database. Jalankan migration HQ untuk mengaktifkan pengurusan katalog.</p>}{content}</section></>;
}
function Pagination({page,count,url}:{page:number;count:number;url:(p:number)=>string}){return <div className="row"><small>Halaman {page} · {count} rekod</small><div>{page>1&&<Link className="button secondary" href={url(page-1)}>← Sebelum</Link>} {page*30<count&&<Link className="button secondary" href={url(page+1)}>Seterusnya →</Link>}</div></div>}
