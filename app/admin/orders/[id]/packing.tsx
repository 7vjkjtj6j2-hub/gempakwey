'use client';
import {useActionState} from 'react';
import {advancePacking} from './actions';
import {Submit} from '../../submit';
const next:Record<string,{value:string;label:string}>={unfulfilled:{value:'packing',label:'Mula packing'},packing:{value:'packed',label:'Tandakan siap packing'},packed:{value:'shipped',label:'Tandakan dihantar'},shipped:{value:'delivered',label:'Tandakan diterima'}};
export function PackingForm({orderId,status}:{orderId:string;status:string}){const [state,action]=useActionState(advancePacking,{error:''});const step=next[status];if(!step)return null;return <form action={action}><input type="hidden" name="order_id" value={orderId}/><input type="hidden" name="status" value={step.value}/>{state.error&&<p role="alert" className="notice error">{state.error}</p>}{step.value==='shipped'&&<><label>Kurier<input name="carrier" maxLength={100} required/></label><label>Nombor tracking<input name="tracking" maxLength={150} required/></label></>}<Submit>{step.label}</Submit></form>}
