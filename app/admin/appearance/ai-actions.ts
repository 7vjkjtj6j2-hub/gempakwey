'use server';
import sharp from 'sharp';
import {requireOwner} from '../../../lib/auth';
import {selectedBrand} from '../../../lib/hq';
export async function generateStoreImage(input:{brand:string;slot:string;prompt:string}){
 const {supabase}=await requireOwner();
 const brand=selectedBrand(input.brand),prompt=typeof input.prompt==='string'?input.prompt.trim():'';
 if(!brand||prompt.length<5||prompt.length>2000||!['Gambar utama / desktop','Gambar mobile (pilihan)','Gambar kedua'].includes(input.slot))return {error:'Semak kedai dan arahan gambar.'};
 if(!process.env.OPENAI_API_KEY)return {error:'AI belum disambungkan. Owner perlu menetapkan OPENAI_API_KEY dalam Vercel terlebih dahulu. Upload gambar masih boleh digunakan.'};
 try{
  const response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-2.5-flare',prompt:`Create one storefront marketing image for ${brand}, placement: ${input.slot}. ${brand==='asas'?'ASAS uses minimal black and white styling.':''} Do not add text unless requested. User brief: ${prompt}`,n:1,size:input.slot.includes('mobile')?'1024x1536':'1536x1024',quality:'medium'}),signal:AbortSignal.timeout(240000)});
  if(!response.ok)return {error:response.status===429?'Kuota AI penuh atau had penggunaan dicapai. Cuba semula kemudian.':response.status===401?'Sambungan AI tidak sah. Semak API key dalam Vercel.':'Penjanaan tidak berjaya. Semak akses model dan akaun API.'};
  const data=await response.json();const encoded=data.data?.[0]?.b64_json;
  if(typeof encoded!=='string'||encoded.length>30000000)throw new Error('Invalid image');
  const output=await sharp(Buffer.from(encoded,'base64'),{limitInputPixels:40000000}).resize({width:2400,height:3000,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
  if(output.length>3*1024*1024)return {error:'Hasil terlalu besar. Cuba arahan yang lebih ringkas.'};
  const path=`${brand}/${crypto.randomUUID()}.webp`;
  const {error}=await supabase.storage.from('storefront-media').upload(path,output,{contentType:'image/webp',upsert:false});
  if(error)return {error:'Gambar dijana tetapi gagal disimpan. Semak storan sebelum menjana lagi.'};
  return {path};
 }catch{return {error:'Penjanaan terhenti atau sambungan gagal. Semak penggunaan API sebelum cuba lagi.'};}
}
