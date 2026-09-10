# Gempakwey

Platform kedai berbilang brand, bermula dengan Heritage. HQ akan mengurus katalog, stok, order dan packing secara berpusat.

## Status

Projek asas Next.js dan TypeScript dengan halaman Heritage akan datang, diterbitkan di https://gempakwey.vercel.app. Supabase development mempunyai 11 jadual dengan RLS, brand Heritage dan fungsi packing terkawal. Migration serta ujian akses telah dijalankan. Belum ada login admin, produk sebenar, checkout atau pemprosesan bayaran. Halaman awal meminta enjin carian tidak mengindeksnya.

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
npm run check:supabase
node --env-file=.env.local scripts/check-database-access.mjs
```

## Vercel

Import repository `7vjkjtj6j2-hub/gempakwey`, pilih framework Next.js dan kekalkan Root Directory pada akar repository. Tiada environment variable diperlukan untuk halaman awal ini. Sambungkan domain hanya selepas preview disemak.

## Fasa berikutnya

1. Tetapan Supabase di Vercel Preview/Development.
2. Akaun owner HQ dan login admin dengan semakan kebenaran server.
3. Katalog Heritage, admin produk dan pengurusan kandungan.
4. Checkout percubaan, pengesahan bayaran pada server dan flow packing.
5. Environment production berasingan dan domain Heritage.

Simpan rahsia dalam fail environment tempatan atau tetapan hosting; jangan commit ke Git. Fail `.env*` diabaikan secara lalai.

## Supabase development

Projek: `gempakwey-dev` (`lfienfogcjpvjfoosqrz`), region Sydney. Salin `.env.example` kepada `.env.local` dan isi URL serta publishable key projek. Fail `.env.local` tidak dimuat naik ke GitHub. Jangan letakkan secret key atau service-role key dalam variable `NEXT_PUBLIC_*`.

`lib/supabase/public.ts` menyediakan client tanpa sesi untuk akses anonymous sahaja. Ia belum digunakan oleh halaman akan datang. Client dengan cookies dan semakan kebenaran HQ perlu dibina sebelum login admin ditambah.

`npm run check:supabase` mengesahkan sambungan Auth API. `scripts/check-database-access.mjs` menguji bacaan brand awam dan penolakan akses tanpa login kepada enam jadual dalaman melalui API sebenar. Ujian SQL dalam `supabase/tests/hq_foundation.sql` menguji RLS dan flow packing menggunakan fixture yang di-rollback. Lihat `supabase/README.md` untuk butiran dan had pelaksanaan.

Database ini untuk data percubaan. Production kedai sebenar memerlukan projek Supabase berasingan. Dashboard organization memaparkan amaran kuota pada 10 September 2026; semak Usage/Billing sebelum pelancaran.
