import Link from "next/link";
import { requireOwner } from "../../../../lib/auth";
import { ProductForm } from "./form";
export default async function NewProduct({searchParams}:{searchParams:Promise<{brand?:string}>}) {
  const {supabase}=await requireOwner();
  const {data:brands,error}=await supabase.from("brands").select("id,name").order("name");
  if(error)throw new Error("Senarai kedai tidak dapat dimuatkan.");
  const {brand}=await searchParams;
  return <><Link href="/admin">← Kembali ke katalog</Link><h1>Tambah produk</h1><p>Pilih kedai untuk produk ini.</p><section className="card"><ProductForm brands={brands??[]} selectedBrand={brand}/></section></>;
}
