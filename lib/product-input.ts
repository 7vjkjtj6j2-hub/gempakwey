export function parseProduct(form: FormData) {
  const field = (key: string, max: number) => {
    const value = String(form.get(key) ?? "").trim();
    if (!value || value.length > max) throw new Error(`Semak medan ${key}.`);
    return value;
  };
  const name = field("name", 160);
  const slug = field("slug", 100);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug hanya boleh mengandungi huruf kecil, nombor dan tanda sempang.");
  const price = field("price", 12);
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(price)) throw new Error("Masukkan harga RM yang sah, contohnya 89.90.");
  const [ringgit, cents = ""] = price.split(".");
  const priceCents = Number(ringgit) * 100 + Number(cents.padEnd(2, "0"));
  const stock = field("stock", 7);
  if (!/^\d+$/.test(stock) || Number(stock) > 1000000) throw new Error("Stok mesti nombor bulat antara 0 dan 1,000,000.");
  const description = String(form.get("description") ?? "").trim();
  if (description.length > 10000) throw new Error("Penerangan terlalu panjang.");
  const category = field("category", 20);
  if (!["clothing", "headwear", "accessories"].includes(category)) throw new Error("Kategori tidak sah.");
  return { p_name: name, p_slug: slug, p_description: description, p_category: category,
    p_sku: field("sku", 80), p_size: field("size", 60), p_color: field("color", 60),
    p_price_cents: priceCents, p_stock: Number(stock) };
}
