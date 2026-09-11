# HQ GempakWey

One admin, implemented in the existing `/admin` routes. The requested host `hq.gempakwey.com` redirects `/` to `/admin`; owner authorization and Supabase RLS remain required on every page and mutation. Existing storefront/admin routes are retained, with no second admin database.

Implemented: combined paginated orders, brand/payment filters, order details, existing guarded packing RPC, multi-brand product selection and atomic draft creation. Appearance editing remains explicitly Heritage-only. Preview stores are not yet connected to the order pipeline. Packing staff login UI remains future work; this UI currently requires owner access.

## Domain

Added `hq.gempakwey.com` to the existing Vercel `tsabteam/gempakwey` project on 2026-09-11. Vercel reported Invalid Configuration awaiting DNS.

DNS provider: ServerFreak (confirmed by user).

| Type | Name | Target |
| --- | --- | --- |
| CNAME | hq | 0b30995180fe4d28.vercel-dns-016.com. |

Obtain the current zone before changing anything. If a conflicting hq record exists, review it first. After DNS propagation, verify Vercel domain/SSL status. Reference: https://vercel.com/docs/domains/working-with-domains/add-a-domain

## Deployment prerequisites

Apply migration `supabase/migrations/202609110004_multi_brand_hq.sql` once to the correct database; it adds inactive brands and a security-invoker product RPC, retaining the original Heritage RPC for compatibility. Do not reset the database or republish any brand automatically.

Deploy the reviewed Next.js project to the existing Vercel project, retaining its environment settings and authentication. This checkout has earlier uncommitted admin/Heritage work; no automatic blanket commit or push has been made. Verify owner sign-in, cross-brand order filtering and packing before treating HQ as operational. No payment or checkout implementation is included in this change.

## Checks

Next.js production build, TypeScript, product-input validation and storefront-input validation passed. Domain routing and live HQ workflows still require deployed verification. New migration verification status is recorded in supabase/README.md.
