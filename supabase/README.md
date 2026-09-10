# HQ database foundation

Applied to development project `lfienfogcjpvjfoosqrz` on 2026-09-10 through the Supabase SQL Editor. Do not rerun the creation migration on this database. The dashboard's automatic RLS option may add redundant ENABLE RLS statements; all 11 tables are explicitly protected in the source migration.

SQL Editor execution does not populate Supabase CLI migration history. Before adopting `supabase db push`, reconcile the remote schema and mark `202609100001` applied using the CLI migration repair workflow. Do not reset the remote database.

## Tables

| Table | Purpose |
| --- | --- |
| brands | Shared brand identity; Heritage seeded |
| products | Brand-owned catalog, draft/published/archived |
| product_variants | SKU, size, color, price in MYR cents |
| product_images | Ordered image paths and alt text |
| brand_banners | Brand banner paths, heading and visibility |
| inventory | HQ stock and reservations, with nonnegative constraints |
| staff_members | Auth user linked to owner/packing role, active flag |
| orders | Customer/shipping snapshots, totals and payment state |
| order_items | Variant references with purchased name/price snapshots |
| fulfillments | One HQ shipment per order; packing and tracking |
| order_events | Append-only from clients; packing audit records |

## Access

- Visitors can read active brands and published catalog only. No order, inventory or staff access.
- Customers can read their own orders, items and fulfillment. They cannot create orders, mark payments, change stock or make themselves staff.
- Owners can manage catalog and inventory, and read all orders/audit events. Products/brands/variants are archived or deactivated rather than deleted from clients.
- Packing staff can read paid, non-cancelled orders and advance fulfillment via the guarded RPC. They cannot edit catalog, prices, payment state or staff membership.
- `advance_fulfillment` requires an active owner/packing role, locks the order and fulfillment rows, permits only the next status, requires carrier/tracking for shipment, and writes an audit event in the same transaction.
- Staff membership has no client write grant. No real owner was assigned and no account created. Bootstrap the first verified owner explicitly during admin setup. Do not derive roles from user-editable metadata.
- Service-role access bypasses RLS and is reserved for trusted backend operations; no service-role key is configured in the website.

## Verification completed

`tests/hq_foundation.sql` passed in the development SQL Editor as postgres: all 11 tables have RLS; draft visibility; customer isolation; staff self-escalation denied; unauthorized mutations denied; packing transitions, tracking requirements, timestamps and audit; unpaid packing denied; owner edits; negative stock and excessive reservation rejected. Test users, products and orders were rolled back. These tests assume the development catalog/order tables are otherwise empty and must not be run as-is against a live store.

`scripts/check-database-access.mjs` passed against the real Data API using the publishable key: Heritage readable, six internal tables denied with PostgreSQL code 42501.

## Not implemented by this migration

Admin pages/login and real staff accounts; image storage buckets/policies and upload limits; checkout and server price validation; atomic stock reservation/release; order-total reconciliation with line items; signed payment webhooks/idempotency; refunds; courier integration; split shipments; email notifications; Vercel Supabase settings and a separate production database.

The tables establish storage and permissions, not a complete commerce engine. Before accepting payments, implement the trusted checkout transaction, stock concurrency tests, payment webhook checks and separate production configuration. Image paths alone do not create Storage permissions.
