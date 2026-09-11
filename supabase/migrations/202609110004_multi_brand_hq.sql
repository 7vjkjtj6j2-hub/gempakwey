-- Additive migration. A single transaction prevents partial product/stock records.
begin;
create function public.create_brand_product(
 p_brand_id uuid, p_name text, p_slug text, p_description text, p_category text,
 p_sku text, p_size text, p_color text, p_price_cents bigint, p_stock integer
) returns uuid language plpgsql security invoker set search_path='' as $$
declare brand uuid; product uuid; variant uuid;
begin
 if coalesce(gempakwey_private.staff_role(),'') <> 'owner' then
  raise exception 'Owner required' using errcode='42501';
 end if;
 if p_name is null or length(trim(p_name)) not between 1 and 160
  or p_slug is null or length(p_slug) > 100 or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  or p_description is null or length(p_description) > 10000
  or p_category is null or p_category not in ('clothing','headwear','accessories')
  or p_sku is null or length(trim(p_sku)) not between 1 and 80
  or p_size is null or length(trim(p_size)) not between 1 and 60
  or p_color is null or length(trim(p_color)) not between 1 and 60
  or p_price_cents is null or p_price_cents not between 0 and 999999999
  or p_stock is null or p_stock not between 0 and 1000000 then
  raise exception 'Invalid product input' using errcode='22023';
 end if;
 select id into brand from public.brands where id=p_brand_id;
 if brand is null then raise exception 'Brand missing'; end if;
 insert into public.products(brand_id,name,slug,description,category,status)
 values(brand,trim(p_name),p_slug,p_description,p_category,'draft') returning id into product;
 insert into public.product_variants(product_id,sku,size,color,price_cents)
 values(product,trim(p_sku),trim(p_size),trim(p_color),p_price_cents) returning id into variant;
 insert into public.inventory(variant_id,on_hand) values(variant,p_stock);
 return product;
end $$;
revoke all on function public.create_brand_product(uuid,text,text,text,text,text,text,text,bigint,integer) from public,anon;
grant execute on function public.create_brand_product(uuid,text,text,text,text,text,text,text,bigint,integer) to authenticated;
insert into public.brands(slug,name,active) values ('asas','ASAS',false),('wariswatan','Waris Watan',false),('bajuorangmelayu','Baju Orang Melayu',false) on conflict(slug) do nothing;
commit;
