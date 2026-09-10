-- Run in SQL Editor as postgres after migration. All fixtures roll back.
begin;
create function pg_temp.assert_true(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; end $$;
create function pg_temp.expect_denied(command text) returns void language plpgsql as $$
begin
 begin execute command; exception when insufficient_privilege then return; end;
 raise exception 'FAIL: operation was not denied: %',command;
end $$;
select pg_temp.assert_true((select count(*)=11 and bool_and(rowsecurity) from pg_tables where schemaname='public' and tablename in ('staff_members','brands','products','product_variants','product_images','brand_banners','inventory','orders','order_items','fulfillments','order_events')),'all 11 tables have RLS');
insert into auth.users(id,email) values
 ('f0000000-0000-0000-0000-000000000001','owner@gempakwey-test.invalid'),
 ('f0000000-0000-0000-0000-000000000002','packing@gempakwey-test.invalid'),
 ('f0000000-0000-0000-0000-000000000003','customer@gempakwey-test.invalid');
insert into public.staff_members(user_id,role) values
 ('f0000000-0000-0000-0000-000000000001','owner'),('f0000000-0000-0000-0000-000000000002','packing');
insert into public.products(id,brand_id,slug,name,status)
 select 'f1000000-0000-0000-0000-000000000001',id,'test-draft','Test draft','draft' from public.brands where slug='heritage';
insert into public.products(id,brand_id,slug,name,status)
 select 'f1000000-0000-0000-0000-000000000002',id,'test-published','Test published','published' from public.brands where slug='heritage';
insert into public.product_variants(id,product_id,sku,price_cents) values
 ('f2000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000002','TEST-SKU',5000);
insert into public.inventory(variant_id,on_hand) values('f2000000-0000-0000-0000-000000000001',5);
insert into public.orders(id,customer_id,customer_name,customer_email,customer_phone,shipping_address,subtotal_cents,payment_status) values
 ('f3000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000003','Test Customer','customer@gempakwey-test.invalid','TEST','{}',5000,'paid'),
 ('f3000000-0000-0000-0000-000000000002',null,'Other Customer','other@gempakwey-test.invalid','TEST','{}',5000,'pending');
insert into public.order_items(order_id,variant_id,brand_name,product_name,sku,size,color,quantity,unit_price_cents) values
 ('f3000000-0000-0000-0000-000000000001','f2000000-0000-0000-0000-000000000001','Heritage','Test published','TEST-SKU','One size','Default',1,5000),
 ('f3000000-0000-0000-0000-000000000002','f2000000-0000-0000-0000-000000000001','Heritage','Test published','TEST-SKU','One size','Default',1,5000);
insert into public.fulfillments(order_id) values('f3000000-0000-0000-0000-000000000001'),('f3000000-0000-0000-0000-000000000002');
set local role anon;
select pg_temp.assert_true((select count(*)=1 from public.products),'anon only sees published products');
select pg_temp.expect_denied('select * from public.orders');
select pg_temp.expect_denied('select * from public.staff_members');
select pg_temp.expect_denied('select * from public.inventory');
select pg_temp.expect_denied('update public.products set name=''Hacked''');
select pg_temp.expect_denied('delete from public.products');
select pg_temp.expect_denied('select public.advance_fulfillment(''f3000000-0000-0000-0000-000000000001'',''packing'')');
reset role;
select set_config('request.jwt.claim.sub','f0000000-0000-0000-0000-000000000003',true);
set local role authenticated;
select pg_temp.assert_true((select count(*)=1 from public.orders),'customer only sees own order');
select pg_temp.assert_true((select count(*)=1 from public.order_items),'customer only sees own items');
select pg_temp.assert_true((select count(*)=0 from public.staff_members),'customer has no staff access');
select pg_temp.assert_true((select count(*)=0 from public.inventory),'customer has no internal stock access');
select pg_temp.expect_denied('insert into public.staff_members(user_id,role) values (''f0000000-0000-0000-0000-000000000003'',''owner'')');
select pg_temp.expect_denied('update public.orders set payment_status=''paid''');
select pg_temp.expect_denied('insert into public.brands(slug,name) values(''hacked'',''Hacked'')');
select pg_temp.expect_denied('select public.advance_fulfillment(''f3000000-0000-0000-0000-000000000001'',''packing'')');
reset role;
select set_config('request.jwt.claim.sub','f0000000-0000-0000-0000-000000000002',true);
set local role authenticated;
select pg_temp.assert_true((select count(*)=1 from public.orders),'packing only sees paid active orders');
select pg_temp.assert_true((select count(*)=1 from public.order_items),'packing cannot read unpaid items');
select pg_temp.expect_denied('insert into public.brands(slug,name) values(''staff-hacked'',''Hacked'')');
select pg_temp.expect_denied('update public.orders set payment_status=''paid''');
select public.advance_fulfillment('f3000000-0000-0000-0000-000000000001','packing');
select public.advance_fulfillment('f3000000-0000-0000-0000-000000000001','packed');
do $$ begin
 begin perform public.advance_fulfillment('f3000000-0000-0000-0000-000000000001','shipped');
 exception when raise_exception then if sqlerrm='Carrier and tracking required' then return; end if;raise; end;
 raise exception 'FAIL: shipment without tracking allowed';
end $$;
select public.advance_fulfillment('f3000000-0000-0000-0000-000000000001','shipped','Test courier','TEST-TRACKING');
select pg_temp.assert_true((select status='shipped' and packed_at is not null and shipped_at is not null from public.fulfillments where order_id='f3000000-0000-0000-0000-000000000001'),'packing flow with timestamps');
do $$ begin
 begin perform public.advance_fulfillment('f3000000-0000-0000-0000-000000000002','packing');
 exception when raise_exception then if sqlerrm='Order must be paid and active' then return; end if;raise; end;
 raise exception 'FAIL: unpaid order packed';
end $$;
reset role;
select set_config('request.jwt.claim.sub','f0000000-0000-0000-0000-000000000001',true);
set local role authenticated;
select pg_temp.assert_true((select count(*)=2 from public.products),'owner sees drafts');
select pg_temp.assert_true((select count(*)=2 from public.orders),'owner sees all orders');
select pg_temp.assert_true((select count(*)=3 from public.order_events),'packing actions audited');
update public.products set name='Owner edit' where id='f1000000-0000-0000-0000-000000000001';
select pg_temp.assert_true((select name='Owner edit' from public.products where id='f1000000-0000-0000-0000-000000000001'),'owner can edit draft');
do $$ begin
 begin update public.inventory set on_hand=-1; exception when check_violation then return;end;
 raise exception 'FAIL: negative stock allowed';
end $$;
do $$ begin
 begin update public.inventory set reserved=6; exception when check_violation then return;end;
 raise exception 'FAIL: over-reservation allowed';
end $$;
reset role;
rollback;
select 'PASS: RLS, public catalog, customer isolation, HQ roles, packing, audit and stock constraints; fixtures rolled back' as result;
