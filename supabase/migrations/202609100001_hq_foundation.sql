-- HQ foundation. Run once on gempakwey-dev. No customer checkout enabled yet.
begin;
create schema if not exists gempakwey_private;
revoke all on schema gempakwey_private from public;
grant usage on schema gempakwey_private to authenticated;

create table public.staff_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','packing')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create function gempakwey_private.staff_role() returns text
language sql stable security definer set search_path = '' as $$
 select role from public.staff_members where user_id = (select auth.uid()) and active
$$;
revoke all on function gempakwey_private.staff_role() from public, anon;
grant execute on function gempakwey_private.staff_role() to authenticated;

create table public.brands (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(trim(name)) > 0),
 description text not null default '', logo_path text,
 active boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(),
 brand_id uuid not null references public.brands(id),
 slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(trim(name)) > 0),
 description text not null default '', category text not null default 'clothing',
 status text not null default 'draft' check(status in ('draft','published','archived')),
 created_at timestamptz not null default now(),
 unique(brand_id,slug)
);
create table public.product_variants (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id),
 sku text not null unique check(length(trim(sku)) > 0),
 size text not null default 'One size', color text not null default 'Default',
 price_cents bigint not null check(price_cents >= 0),
 active boolean not null default true,
 unique(product_id,size,color)
);
create table public.product_images (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id),
 storage_path text not null check(length(trim(storage_path)) > 0),
 alt_text text not null default '', position integer not null default 0 check(position >= 0)
);
create table public.brand_banners (
 id uuid primary key default gen_random_uuid(),
 brand_id uuid not null references public.brands(id),
 storage_path text not null check(length(trim(storage_path)) > 0),
 alt_text text not null default '', heading text not null default '',
 active boolean not null default false, position integer not null default 0 check(position >= 0)
);
create table public.inventory (
 variant_id uuid primary key references public.product_variants(id),
 on_hand integer not null default 0 check(on_hand >= 0),
 reserved integer not null default 0 check(reserved >= 0 and reserved <= on_hand),
 updated_at timestamptz not null default now()
);
create table public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number bigint generated always as identity unique,
 customer_id uuid references auth.users(id) on delete set null,
 customer_name text not null, customer_email text not null, customer_phone text not null,
 shipping_address jsonb not null check(jsonb_typeof(shipping_address) = 'object'),
 currency text not null default 'MYR' check(currency = 'MYR'),
 subtotal_cents bigint not null check(subtotal_cents >= 0),
 shipping_cents bigint not null default 0 check(shipping_cents >= 0),
 discount_cents bigint not null default 0 check(discount_cents >= 0 and discount_cents <= subtotal_cents),
 total_cents bigint generated always as (subtotal_cents + shipping_cents - discount_cents) stored,
 payment_status text not null default 'pending' check(payment_status in ('pending','paid','failed','refunded','partially_refunded')),
 order_status text not null default 'open' check(order_status in ('open','cancelled','completed')),
 payment_reference text unique,
 created_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id),
 variant_id uuid not null references public.product_variants(id),
 brand_name text not null, product_name text not null, sku text not null,
 size text not null, color text not null,
 quantity integer not null check(quantity > 0),
 unit_price_cents bigint not null check(unit_price_cents >= 0),
 line_total_cents bigint generated always as (quantity::bigint * unit_price_cents) stored
);
create table public.fulfillments (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null unique references public.orders(id),
 status text not null default 'unfulfilled' check(status in ('unfulfilled','packing','packed','shipped','delivered')),
 carrier text, tracking_number text, packed_at timestamptz, shipped_at timestamptz,
 updated_at timestamptz not null default now(),
 check(status not in ('shipped','delivered') or (length(trim(carrier)) > 0 and length(trim(tracking_number)) > 0 and carrier is not null and tracking_number is not null))
);
create table public.order_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id),
 actor_id uuid references auth.users(id) on delete set null,
 event_type text not null, details jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create index on public.products(brand_id,status);
create index on public.product_variants(product_id);
create index on public.product_images(product_id);
create index on public.brand_banners(brand_id);
create index on public.orders(customer_id);
create index on public.orders(payment_status,order_status,created_at);
create index on public.order_items(order_id);
create index on public.order_items(variant_id);
create index on public.order_events(order_id);
create index on public.order_events(actor_id);

-- Explicit grants AND RLS: no automatic sign-up can grant HQ privileges.
alter table public.staff_members enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.brand_banners enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.fulfillments enable row level security;
alter table public.order_events enable row level security;
do $$ declare t text; begin
 foreach t in array array['staff_members','brands','products','product_variants','product_images','brand_banners','inventory','orders','order_items','fulfillments','order_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public, anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select on public.brands,public.products,public.product_variants,public.product_images,public.brand_banners to anon,authenticated;
grant insert,update on public.brands,public.products,public.product_variants,public.product_images,public.brand_banners to authenticated;
grant delete on public.product_images,public.brand_banners to authenticated;
grant select on public.staff_members,public.inventory,public.orders,public.order_items,public.fulfillments,public.order_events to authenticated;
grant insert,update on public.inventory to authenticated;
revoke all on sequence public.orders_order_number_seq from public,anon,authenticated;
grant usage,select on sequence public.orders_order_number_seq to service_role;

create policy staff_read on public.staff_members for select to authenticated
 using(user_id=(select auth.uid()) or (select gempakwey_private.staff_role())='owner');
create policy brands_public on public.brands for select to anon,authenticated using(active);
create policy products_public on public.products for select to anon,authenticated
 using(status='published' and exists(select 1 from public.brands b where b.id=brand_id and b.active));
create policy variants_public on public.product_variants for select to anon,authenticated
 using(active and exists(select 1 from public.products p join public.brands b on b.id=p.brand_id where p.id=product_id and p.status='published' and b.active));
create policy images_public on public.product_images for select to anon,authenticated
 using(exists(select 1 from public.products p join public.brands b on b.id=p.brand_id where p.id=product_id and p.status='published' and b.active));
create policy banners_public on public.brand_banners for select to anon,authenticated
 using(active and exists(select 1 from public.brands b where b.id=brand_id and b.active));
do $$ declare t text; begin
 foreach t in array array['brands','products','product_variants','product_images','brand_banners','inventory'] loop
  execute format('create policy owner_manage on public.%I for all to authenticated using ((select gempakwey_private.staff_role())=''owner'') with check ((select gempakwey_private.staff_role())=''owner'')',t);
 end loop;
end $$;
create policy orders_read on public.orders for select to authenticated using(
 customer_id=(select auth.uid()) or (select gempakwey_private.staff_role())='owner'
 or ((select gempakwey_private.staff_role())='packing' and payment_status='paid' and order_status <> 'cancelled'));
create policy items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
create policy fulfillments_read on public.fulfillments for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
create policy events_owner on public.order_events for select to authenticated using((select gempakwey_private.staff_role())='owner');

-- Controlled packing operation. No direct client writes to orders or payments.
create function public.advance_fulfillment(p_order_id uuid,p_status text,p_carrier text default null,p_tracking_number text default null)
returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; f public.fulfillments; begin
 if coalesce(gempakwey_private.staff_role(),'') not in ('owner','packing') then raise exception 'HQ access required' using errcode='42501'; end if;
 select * into o from public.orders where id=p_order_id for update;
 if not found or o.payment_status <> 'paid' or o.order_status='cancelled' then raise exception 'Order must be paid and active'; end if;
 select * into f from public.fulfillments where order_id=p_order_id for update;
 if not found then raise exception 'Fulfillment missing'; end if;
 if not ((f.status='unfulfilled' and p_status='packing') or (f.status='packing' and p_status='packed') or (f.status='packed' and p_status='shipped') or (f.status='shipped' and p_status='delivered')) then raise exception 'Invalid fulfillment transition'; end if;
 if p_status='shipped' and (nullif(trim(p_carrier),'') is null or nullif(trim(p_tracking_number),'') is null) then raise exception 'Carrier and tracking required'; end if;
 update public.fulfillments set status=p_status,
 carrier=case when p_status='shipped' then trim(p_carrier) else carrier end,
 tracking_number=case when p_status='shipped' then trim(p_tracking_number) else tracking_number end,
 packed_at=case when p_status='packed' then now() else packed_at end,
 shipped_at=case when p_status='shipped' then now() else shipped_at end,
 updated_at=now() where id=f.id;
 insert into public.order_events(order_id,actor_id,event_type,details) values(p_order_id,auth.uid(),'fulfillment_changed',jsonb_build_object('from',f.status,'to',p_status));
end $$;
revoke all on function public.advance_fulfillment(uuid,text,text,text) from public,anon;
grant execute on function public.advance_fulfillment(uuid,text,text,text) to authenticated;
insert into public.brands(slug,name,description,active) values('heritage','Heritage','Kedai pertama dalam keluarga Gempakwey.',true);
comment on table public.orders is 'Checkout must create orders/items/reservations atomically in a trusted server transaction; not implemented by this foundation.';
commit;
