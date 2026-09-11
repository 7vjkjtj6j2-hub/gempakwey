# HQ operations update — 11 September 2026

Prepared locally; application release not yet published.

- Responsive navigation: orders/packing, products/stock, store appearance, settings.
- Product detail editing, images, variants and stock adjustment reasons.
- Stock edits use an owner-only transaction with optimistic concurrency and reserved-stock floor. Inventory events record changes made through this operation.
- Search orders by number/customer; filter brand, payment and fulfillment.
- Store appearance edits and image uploads are scoped to each brand.
- Printable order details.
- Shipping settings: RM12 Peninsular Malaysia; RM15 Sabah/Sarawak.

Migration 202609110005_hq_operations.sql applied successfully to Supabase project lfienfogcjpvjfoosqrz on 11 September 2026. This is the existing development database used by HQ.

Validation: Next production build passed; TypeScript passed; product/storefront/HQ input checks passed. A database transaction tested shipping defaults, owner create/edit, inventory audit, stale timestamp rejection, reserved-stock floor and non-owner rejection, and rolled back its fixtures. No real orders or payments created.

Remaining launch work: configure CHIP credentials securely; implement and verify checkout/order creation/payment callbacks; connect each storefront. Existing ASAS preview is not yet consuming HQ catalog. Catalog publish/image minimum checks are application-level, not a database invariant.

This release does not assert that all storefront orders already flow into HQ or that online checkout is active.
