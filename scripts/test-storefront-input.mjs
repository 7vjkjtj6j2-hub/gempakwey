import assert from 'node:assert/strict';
import {parseBlock} from '../lib/storefront-content.ts';
function parse(extra={}){const f=new FormData();for(const [k,v] of Object.entries({kind:'hero',heading:'Heritage',position:'0',link:'#collection',...extra}))f.set(k,v);return parseBlock(f);}
assert.equal(parse().link,'#collection');
for(const link of ['javascript:alert(1)','//evil.com','https://evil.com','/\\evil.com'])assert.throws(()=>parse({link}));
for(const position of ['-1','1.5','10000'])assert.throws(()=>parse({position}));
assert.throws(()=>parse({storage_path:'../private.jpg'}));
assert.throws(()=>parse({kind:'unknown'}));
assert.equal(parse({storage_path:'heritage/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp'}).storage_path,'heritage/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp');
console.log('PASS: internal links, media paths, section format and ordering validation.');
