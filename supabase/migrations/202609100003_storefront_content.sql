begin;
alter table public.brands add column slider_auto boolean not null default false,
 add column slider_seconds integer not null default 6 check(slider_seconds between 3 and 15);
alter table public.brand_banners alter column storage_path drop not null;
alter table public.brand_banners add column kind text not null default 'hero' check(kind in ('hero','wide','split','pair')),
 add column mobile_path text, add column second_path text,
 add column body text not null default '' check(length(body)<=2000),
 add column button_label text not null default '' check(length(button_label)<=60),
 add column link text not null default '#collection' check(link ~ '^#[A-Za-z][A-Za-z0-9_-]*$' or link ~ '^/[A-Za-z0-9/_-]*$'),
 add column archived boolean not null default false;
alter table public.brand_banners add constraint banner_heading_length check(length(heading)<=160),
 add constraint banner_alt_length check(length(alt_text)<=300),
 add constraint banner_storage_path check(storage_path is null or storage_path ~ '^heritage/[a-f0-9-]+\.webp$'),
 add constraint banner_mobile_path check(mobile_path is null or mobile_path ~ '^heritage/[a-f0-9-]+\.webp$'),
 add constraint banner_second_path check(second_path is null or second_path ~ '^heritage/[a-f0-9-]+\.webp$');
create index on public.brand_banners(brand_id,archived,kind,position);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('storefront-media','storefront-media',true,3145728,array['image/webp']);
create policy storefront_owner_upload on storage.objects for insert to authenticated
with check(bucket_id='storefront-media' and name ~ '^heritage/[a-f0-9-]+\.webp$'
 and (select gempakwey_private.staff_role())='owner');
create policy storefront_owner_read on storage.objects for select to authenticated
using(bucket_id='storefront-media' and (select gempakwey_private.staff_role())='owner');
-- Images are public marketing assets. No client overwrite or delete permissions.
insert into public.brand_banners(brand_id,heading,body,button_label,link,active,kind,position)
select id,'Gaya sendiri. Cerita kita.','Kenali koleksi pertama Heritage. Bermula dengan sesuatu yang istimewa.','Terokai koleksi','#collection',true,'hero',0
from public.brands where slug='heritage';
commit;
