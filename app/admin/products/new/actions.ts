"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "../../../../lib/auth";
import { parseProduct } from "../../../../lib/product-input";

export async function saveProduct(_previous: { error: string }, form: FormData) {
  const { supabase } = await requireOwner();
  let input;
  try { input = parseProduct(form); }
  catch (error) { return { error: error instanceof Error ? error.message : "Semak maklumat produk." }; }
  const brandId=String(form.get("brand_id")??"");
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId))return {error:"Pilih kedai yang sah."};
  const { data, error } = await supabase.rpc("create_brand_product", {...input,p_brand_id:brandId});
  if (error) return { error: error.code === "23505" ? "Slug atau SKU sudah digunakan. Gunakan nilai lain." : "Produk belum disimpan. Semak sambungan dan persediaan database, kemudian cuba lagi." };
  revalidatePath("/admin");
  redirect(`/admin/products/${data}`);
}
