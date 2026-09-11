'use server';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { requireOwner } from '../../../lib/auth';
import { parseBlock } from '../../../lib/storefront-content';
const refresh=()=>{revalidatePath('/admin/appearance');revalidatePath('/preview/heritage');revalidatePath('/');};
export async function saveBlock(form:FormData) {
 const {supabase}=await requireOwner();
 try {
  const input=parseBlock(form);const id=String(form.get('id')??'');
  if(id&&!/^[0-9a-f-]{36}$/.test(id))return {error:'ID tidak sah.'};
  const {data:brand,error:brandError}=await supabase.from('brands').select('id').eq('slug','heritage').single();
  if(brandError)throw brandError;
  const query=id?supabase.from('brand_banners').update(input).eq('id',id).eq('brand_id',brand.id).eq('archived',false):supabase.from('brand_banners').insert({...input,brand_id:brand.id});
  const {data,error}=await query.select('id').single();if(error||!data)throw error;
  refresh();return {success:'Perubahan disimpan.',id:data.id};
 } catch(error) {return {error:error instanceof Error?error.message:'Tidak dapat menyimpan. Cuba lagi.'};}
}
export async function archiveBlock(id:string) {
 const {supabase}=await requireOwner();
 const {error}=await supabase.from('brand_banners').update({archived:true,active:false}).eq('id',id);
 if(error)return {error:'Seksyen tidak dapat dibuang.'};refresh();return {success:true};
}
export async function saveSlider(form:FormData) {
 const {supabase}=await requireOwner();const seconds=Number(form.get('seconds'));
 if(!Number.isInteger(seconds)||seconds<3||seconds>15)return {error:'Pilih 3 hingga 15 saat.'};
 const {error}=await supabase.from('brands').update({slider_auto:form.get('auto')==='on',slider_seconds:seconds}).eq('slug','heritage');
 if(error)return {error:'Tetapan slider tidak dapat disimpan.'};refresh();return {success:'Tetapan slider disimpan.'};
}
export async function uploadStoreImage(form:FormData) {
 const {supabase}=await requireOwner();const file=form.get('image');
 if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3*1024*1024||file.size===0)return {error:'Pilih JPG, PNG atau WebP, maksimum 3 MB.'};
 try {
  const original=Buffer.from(await file.arrayBuffer());
  const metadata=await sharp(original,{limitInputPixels:40000000}).metadata();
  if(!['jpeg','png','webp'].includes(metadata.format??'')||(metadata.pages??1)>1)return {error:'Gunakan gambar statik JPG, PNG atau WebP.'};
  const output=await sharp(original,{limitInputPixels:40000000}).rotate().resize({width:2400,height:3000,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
  if(output.length>3*1024*1024)return {error:'Gambar terlalu besar selepas diproses.'};
  const path=`heritage/${crypto.randomUUID()}.webp`;
  const {error}=await supabase.storage.from('storefront-media').upload(path,output,{contentType:'image/webp',upsert:false});
  if(error)return {error:'Upload gagal. Semak sambungan dan cuba lagi.'};
  return {path};
 }catch{return {error:'Fail gambar tidak dapat dibaca. Cuba gambar lain.'};}
}
