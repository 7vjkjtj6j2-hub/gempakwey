import type { SupabaseClient } from '@supabase/supabase-js';
export type StoreBlock = {id:string;brand_id:string;kind:'hero'|'wide'|'split'|'pair';heading:string;body:string;button_label:string;link:string;alt_text:string;storage_path:string|null;mobile_path:string|null;second_path:string|null;active:boolean;position:number;archived:boolean};
export type StoreContent = {blocks:StoreBlock[];auto:boolean;seconds:number};
export function mediaUrl(path:string|null) {
  if (!path || !/^heritage\/[a-f0-9-]+\.webp$/.test(path)) return undefined;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storefront-media/${path}`;
}
export async function getStoreContent(client:SupabaseClient):Promise<StoreContent> {
  const {data:brand,error:brandError}=await client.from('brands').select('id,slider_auto,slider_seconds').eq('slug','heritage').single();
  if(brandError) throw new Error('Tetapan kedai tidak dapat dimuatkan.');
  const {data,error}=await client.from('brand_banners').select('*').eq('brand_id',brand.id).eq('archived',false).eq('active',true).order('position').order('id');
  if(error) throw new Error('Banner tidak dapat dimuatkan.');
  return {blocks:data ?? [],auto:brand.slider_auto,seconds:brand.slider_seconds};
}
export function parseBlock(form:FormData) {
  const text=(name:string,max:number)=>{const value=String(form.get(name)??'').trim();if(value.length>max)throw new Error(`Medan ${name} terlalu panjang.`);return value;};
  const kind=text('kind',10);
  if(!['hero','wide','split','pair'].includes(kind))throw new Error('Format seksyen tidak sah.');
  const link=text('link',300)||'#collection';
  if(!/^#[A-Za-z][A-Za-z0-9_-]*$|^\/[A-Za-z0-9/_-]*$/.test(link))throw new Error('Gunakan pautan dalaman seperti #collection atau /.');
  const image=(name:string)=>{const path=text(name,100);if(path&&!/^heritage\/[a-f0-9-]+\.webp$/.test(path))throw new Error('Fail gambar tidak sah.');return path||null;};
  const position=Number(form.get('position'));
  if(!Number.isInteger(position)||position<0||position>9999)throw new Error('Susunan mesti antara 0 hingga 9999.');
  return {kind,heading:text('heading',160),body:text('body',2000),button_label:text('button_label',60),link,alt_text:text('alt_text',300),storage_path:image('storage_path'),mobile_path:image('mobile_path'),second_path:image('second_path'),position,active:form.get('active')==='on'};
}
