begin;
create table public.hq_settings (
 id boolean primary key default true check(id),
 shipping_west_cents integer not null default 1200 check(shipping_west_cents between 0 and 100000),
 shipping_east_cents integer not null default 1500 check(shipping_east_cents between 0 and 100000),
 updated_at timestamptz not null default now()
);
insert into public.hq_settings(id) values(true);
alter table public.hq_settings enable row level security;
revoke all on public.hq_settings from public,anon,authenticated;
grant select,update on public.hq_settings to authenticated;
grant all on public.hq_settings to service_role;
create policy hq_settings_owner on public.hq_settings for all to authenticated
 using((select gempakwey_private.staff_role())='owner') with check((select gempakwey_private.staff_role())='owner');

create table public.inventory_events (
 id uuid primary key default gen_random_uuid(),variant_id uuid not null references public.product_variants(id),
 actor_id uuid references auth.users(id),before_on_hand integer not null,after_on_hand integer not null,
 reason text not null check(length(trim(reason)) between 1 and 300),created_at timestamptz not null default now()
);
alter table public.inventory_events enable row level security;
revoke all on public.inventory_events from public,anon,authenticated;
grant select on public.inventory_events to authenticated;
grant all on public.inventory_events to service_role;
create policy inventory_events_owner on public.inventory_events for select to authenticated using((select gempakwey_private.staff_role())='owner');
create index on public.inventory_events(variant_id,created_at);

-- All variant operations lock the product first, then stock; edits cannot silently overwrite stock.
create function public.hq_save_variant(p_product_id uuid,p_variant_id uuid,p_sku text,p_size text,p_color text,p_price_cents bigint,p_on_hand integer,p_active boolean,p_expected_updated_at timestamptz,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; inv public.inventory; product_status text;
begin
 if coalesce(gempakwey_private.staff_role(),'')<>'owner' then raise exception 'Owner required' using errcode='42501'; end if;
 if p_sku is null or length(trim(p_sku)) not between 1 and 80 or p_size is null or length(trim(p_size)) not between 1 and 60 or p_color is null or length(trim(p_color)) not between 1 and 60 or p_price_cents is null or p_price_cents not between 0 and 999999999 or p_on_hand is null or p_on_hand not between 0 and 1000000 or p_active is null or p_reason is null or length(trim(p_reason)) not between 1 and 300 then raise exception 'Invalid variant' using errcode='22023'; end if;
 select status into product_status from public.products where id=p_product_id for update;
 if not found then raise exception 'Product missing'; end if;
 if p_variant_id is null then
  insert into public.product_variants(product_id,sku,size,color,price_cents,active) values(p_product_id,trim(p_sku),trim(p_size),trim(p_color),p_price_cents,p_active) returning id into v_id;
  insert into public.inventory(variant_id,on_hand) values(v_id,p_on_hand);
  insert into public.inventory_events(variant_id,actor_id,before_on_hand,after_on_hand,reason) values(v_id,auth.uid(),0,p_on_hand,trim(p_reason));
 else
  select id into v_id from public.product_variants where id=p_variant_id and product_id=p_product_id for update;
  if not found then raise exception 'Variant missing'; end if;
  select * into inv from public.inventory where variant_id=v_id for update;
  if not found then raise exception 'Inventory missing'; end if;
  if p_expected_updated_at is null or inv.updated_at<>p_expected_updated_at then raise exception 'Stock changed; reload' using errcode='40001'; end if;
  if p_on_hand<inv.reserved then raise exception 'Stock below reserved' using errcode='22023'; end if;
  if product_status='published' and not p_active and not exists(select 1 from public.product_variants where product_id=p_product_id and id<>v_id and active) then raise exception 'Published product needs active variant'; end if;
  update public.product_variants set sku=trim(p_sku),size=trim(p_size),color=trim(p_color),price_cents=p_price_cents,active=p_active where id=v_id;
  update public.inventory set on_hand=p_on_hand,updated_at=clock_timestamp() where variant_id=v_id;
  if inv.on_hand<>p_on_hand then insert into public.inventory_events(variant_id,actor_id,before_on_hand,after_on_hand,reason) values(v_id,auth.uid(),inv.on_hand,p_on_hand,trim(p_reason)); end if;
 end if;
 return v_id;
end $$;
revoke all on function public.hq_save_variant(uuid,uuid,text,text,text,bigint,integer,boolean,timestamptz,text) from public,anon;
grant execute on function public.hq_save_variant(uuid,uuid,text,text,text,bigint,integer,boolean,timestamptz,text) to authenticated;

alter table public.brand_banners drop constraint banner_storage_path,drop constraint banner_mobile_path,drop constraint banner_second_path;
alter table public.brand_banners add constraint banner_storage_path check(storage_path is null or storage_path ~ '^(heritage|asas|wariswatan|bajuorangmelayu)/[a-f0-9-]+\.webp$'),
 add constraint banner_mobile_path check(mobile_path is null or mobile_path ~ '^(heritage|asas|wariswatan|bajuorangmelayu)/[a-f0-9-]+\.webp$'),
 add constraint banner_second_path check(second_path is null or second_path ~ '^(heritage|asas|wariswatan|bajuorangmelayu)/[a-f0-9-]+\.webp$');
alter policy storefront_owner_upload on storage.objects with check(bucket_id='storefront-media' and name ~ '^(heritage|asas|wariswatan|bajuorangmelayu)/[a-f0-9-]+\.webp$' and (select gempakwey_private.staff_role())='owner');
commit;
