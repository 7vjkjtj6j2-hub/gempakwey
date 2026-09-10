# Gempakwey

Platform kedai berbilang brand, bermula dengan Heritage. HQ akan mengurus katalog, stok, order dan packing secara berpusat.

## Status

Projek asas Next.js dan TypeScript dengan halaman Heritage akan datang. Belum ada pangkalan data, login admin, produk sebenar, checkout atau pemprosesan bayaran. Halaman awal meminta enjin carian tidak mengindeksnya.

## Pembangunan

Gunakan Node.js 24 LTS dan npm.

```sh
npm ci
npm run dev
```

## Semakan

```sh
npm run build
npm run typecheck
```

## Vercel

Import repository `7vjkjtj6j2-hub/gempakwey`, pilih framework Next.js dan kekalkan Root Directory pada akar repository. Tiada environment variable diperlukan untuk halaman awal ini. Sambungkan domain hanya selepas preview disemak.

## Fasa berikutnya

1. Sambungan Vercel dan preview.
2. Supabase development, schema brand/produk/varian/stok/order, dan polisi akses HQ.
3. Katalog Heritage, admin produk dan pengurusan kandungan.
4. Checkout percubaan, pengesahan bayaran pada server dan flow packing.
5. Environment production berasingan dan domain Heritage.

Simpan rahsia dalam fail environment tempatan atau tetapan hosting; jangan commit ke Git. Fail `.env*` diabaikan secara lalai.
