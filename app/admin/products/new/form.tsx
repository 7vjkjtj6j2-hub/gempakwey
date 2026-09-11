"use client";
import { useActionState } from "react";
import { saveProduct } from "./actions";
import { Submit } from "../../submit";
export function ProductForm({brands,selectedBrand}:{brands:{id:string;name:string}[];selectedBrand?:string}) {
  const [state, action] = useActionState(saveProduct, { error: "" });
  return <form action={action}>
    {state.error && <p className="notice error" role="alert">{state.error}</p>}
    <label>Kedai<select name="brand_id" required defaultValue={selectedBrand??''}><option value="">Pilih kedai</option>{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
    <label>Nama produk<input name="name" maxLength={160} required placeholder="Contoh: Everyday Tee"/></label>
    <label>Slug produk<input name="slug" maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" required placeholder="everyday-tee"/><small>Nama unik untuk pautan produk. Gunakan huruf kecil dan tanda sempang.</small></label>
    <label>Penerangan<textarea name="description" maxLength={10000}/></label>
    <label>Kategori<select name="category"><option value="clothing">Baju</option><option value="headwear">Topi</option><option value="accessories">Aksesori</option></select></label>
    <h2>Varian pertama</h2><div className="grid">
    <label>SKU<input name="sku" maxLength={80} required placeholder="HRT-TEE-BLK-M"/><small>Kod unik untuk kenal pasti stok ini.</small></label>
    <label>Harga (RM)<input name="price" type="number" step="0.01" min="0" max="9999999.99" required placeholder="89.90"/></label>
    <label>Saiz<input name="size" maxLength={60} required placeholder="M / One size"/></label>
    <label>Warna<input name="color" maxLength={60} required placeholder="Hitam"/></label>
    <label>Stok awal<input name="stock" type="number" min="0" max="1000000" step="1" required defaultValue="0"/></label></div>
    <p><small>Produk disimpan sebagai draf. Selepas simpan, tambah gambar dan varian lain sebelum paparkan dalam katalog.</small></p><Submit>Simpan draf produk</Submit>
  </form>;
}
