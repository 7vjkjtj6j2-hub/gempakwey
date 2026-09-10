import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key?.startsWith('sb_publishable_')) throw new Error('Missing public Supabase configuration');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await db.from('brands').select('slug').eq('slug', 'heritage');
if (error || data?.length !== 1) throw new Error(`Heritage brand read failed: ${error?.code ?? 'not found'}`);
console.log('PASS: anonymous visitor can read Heritage brand');
for (const table of ['staff_members', 'inventory', 'orders', 'order_items', 'fulfillments', 'order_events']) {
  const { error } = await db.from(table).select('*').limit(1);
  if (error?.code !== '42501') throw new Error(`Expected access denied for ${table}; received ${error?.code ?? 'success'}`);
  console.log(`PASS: anonymous visitor cannot read ${table}`);
}
