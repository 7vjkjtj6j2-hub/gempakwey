import assert from 'node:assert/strict';
import { parseProduct } from '../lib/product-input.ts';
const valid = {name:'Heritage Tee',slug:'heritage-tee',description:'',category:'clothing',sku:'HT-M',size:'M',color:'Black',price:'89.90',stock:'10'};
function parse(overrides={}) { const form=new FormData(); for(const [k,v] of Object.entries({...valid,...overrides})) form.set(k,v); return parseProduct(form); }
assert.equal(parse().p_price_cents,8990);
assert.equal(parse({price:'0.29'}).p_price_cents,29);
assert.equal(parse({price:'89.9'}).p_price_cents,8990);
for(const price of ['-1','1.001','1e3','NaN','99999999']) assert.throws(()=>parse({price}));
for(const stock of ['-1','1.5','1e3','1000001']) assert.throws(()=>parse({stock}));
for(const slug of ['../x','Hello','hello world','-x']) assert.throws(()=>parse({slug}));
assert.throws(()=>parse({category:'unknown'}));
assert.throws(()=>parse({name:' '}));
console.log('PASS: exact currency conversion and invalid price, stock, slug, category and name rejected.');
