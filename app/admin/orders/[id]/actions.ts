'use server';
import {revalidatePath} from 'next/cache';
import {requireOwner} from '../../../../lib/auth';
export async function advancePacking(_previous:{error:string},form:FormData){
 const {supabase}=await requireOwner();const id=String(form.get('order_id')??''),status=String(form.get('status')??'');
 if(!/^[0-9a-f-]{36}$/i.test(id)||!['packing','packed','shipped','delivered'].includes(status))return {error:'Tindakan tidak sah.'};
 const carrier=String(form.get('carrier')??'').trim(),tracking=String(form.get('tracking')??'').trim();
 if(status==='shipped'&&(!carrier||!tracking||carrier.length>100||tracking.length>150))return {error:'Isi kurier dan nombor tracking yang sah.'};
 const {error}=await supabase.rpc('advance_fulfillment',{p_order_id:id,p_status:status,p_carrier:carrier||null,p_tracking_number:tracking||null});
 if(error)return {error:'Status belum dikemas kini. Pastikan order dibayar dan status masih sesuai, kemudian muat semula.'};
 revalidatePath(`/admin/orders/${id}`);revalidatePath('/admin');return {error:''};
}
