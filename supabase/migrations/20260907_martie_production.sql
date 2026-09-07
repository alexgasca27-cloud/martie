
-- Martie production layer. Safe to run alongside the existing schema.
create extension if not exists pgcrypto;

create table if not exists public.martie_settings (
  id boolean primary key default true,
  store_name text not null default 'Martie',
  timezone text not null default 'America/Merida',
  opening_time time not null default '09:00',
  closing_time time not null default '19:00',
  prep_minutes integer not null default 40,
  slot_interval integer not null default 15,
  capacity_per_slot integer not null default 8,
  pickup_address text not null default '',
  whatsapp_number text not null default '',
  bank_name text not null default '',
  bank_account text not null default '',
  bank_clabe text not null default '',
  bank_holder text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.martie_settings(id) values(true) on conflict(id) do nothing;

create table if not exists public.martie_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.martie_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.martie_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  base_price numeric(12,2) not null check(base_price >= 0),
  image_url text not null default '/images/latte.jpg',
  is_available boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.martie_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.martie_products(id) on delete cascade,
  name text not null,
  selection_type text not null default 'single' check(selection_type in ('single','multi')),
  is_required boolean not null default false,
  max_selections integer not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.martie_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.martie_options(id) on delete cascade,
  name text not null,
  price_delta numeric(12,2) not null default 0,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.martie_delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  fee numeric(12,2) not null default 0,
  is_active boolean not null default true
);

create table if not exists public.martie_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff' check(role in ('admin','staff','barista','driver')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.martie_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  branch_id uuid,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_method text not null check(delivery_method in ('pickup','delivery')),
  address jsonb not null default '{}'::jsonb,
  scheduled_date date not null,
  scheduled_time time not null,
  payment_method text not null check(payment_method in ('CARD_TERMINAL','CASH','TRANSFER')),
  payment_status text not null default 'PENDING' check(payment_status in ('PENDING','PAID','WAITING_PROOF','PROOF_RECEIVED','REJECTED')),
  order_status text not null default 'PENDING_CONFIRMATION' check(order_status in ('PENDING_PAYMENT','PENDING_CONFIRMATION','CONFIRMED','PREPARING','READY','ON_THE_WAY','DELIVERED','CANCELLED')),
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text not null default '',
  whatsapp_status text not null default 'NOT_SENT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.martie_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.martie_orders(id) on delete cascade,
  product_id uuid references public.martie_products(id) on delete set null,
  product_name text not null,
  base_price numeric(12,2) not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check(quantity > 0),
  personalization jsonb not null default '{}'::jsonb,
  notes text not null default ''
);

create table if not exists public.martie_payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.martie_orders(id) on delete cascade,
  storage_path text,
  whatsapp_message_id text,
  status text not null default 'RECEIVED' check(status in ('RECEIVED','APPROVED','REJECTED')),
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.martie_loyalty_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 0,
  cycle_start date not null default current_date,
  cycle_end date not null default (current_date + interval '1 year')::date,
  birthday date,
  birthday_reward_year integer,
  created_at timestamptz not null default now()
);

create table if not exists public.martie_loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.martie_orders(id) on delete set null,
  points integer not null,
  type text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.martie_rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  points_cost integer not null,
  is_active boolean not null default true,
  expires_days integer not null default 30
);

create table if not exists public.martie_birthday_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_year integer not null,
  status text not null default 'AVAILABLE' check(status in ('AVAILABLE','REDEEMED','EXPIRED')),
  created_at timestamptz not null default now(),
  unique(user_id,reward_year)
);

create table if not exists public.martie_whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.martie_orders(id) on delete set null,
  phone text not null,
  direction text not null default 'OUTBOUND',
  message_type text not null default 'text',
  template_name text,
  body text not null default '',
  provider_message_id text,
  status text not null default 'QUEUED',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.martie_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists martie_orders_slot_idx on public.martie_orders(scheduled_date,scheduled_time) where order_status <> 'CANCELLED';
create index if not exists martie_orders_user_idx on public.martie_orders(user_id,created_at desc);
create index if not exists martie_order_items_order_idx on public.martie_order_items(order_id);
create index if not exists martie_products_active_idx on public.martie_products(is_available,sort_order);

insert into public.martie_categories(name,sort_order) values
('Café',1),('Bebidas frías',2),('Comida',3),('Postres',4)
on conflict(name) do nothing;

insert into public.martie_products(name,description,base_price,image_url,sort_order,category_id)
select v.name,v.description,v.price,v.image_url,v.sort_order,c.id
from (values
('Latte','Espresso + leche cremosa.',49::numeric,'/images/latte.jpg',1,'Café'),
('Iced Latte','Café frío, mismo gran sabor.',55,'/images/iced-latte.jpg',2,'Bebidas frías'),
('Matcha Latte','Energía natural.',59,'/images/matcha.jpg',3,'Café'),
('Croissant','Hojaldre perfecto.',45,'/images/croissant.jpg',4,'Postres'),
('Bowl de Frutas','Frescura en cada bocado.',69,'/images/bowl.jpg',5,'Comida'),
('Smoothie Fresa','Natural y delicioso.',55,'/images/smoothie.jpg',6,'Bebidas frías')
) v(name,description,price,image_url,sort_order,category)
join public.martie_categories c on c.name=v.category
where not exists(select 1 from public.martie_products p where p.name=v.name);

-- Seed option groups only if the corresponding product has no options.
insert into public.martie_options(product_id,name,selection_type,is_required,sort_order)
select p.id,'Tamaño','single',true,1 from public.martie_products p
where p.name in ('Latte','Iced Latte','Matcha Latte')
and not exists(select 1 from public.martie_options o where o.product_id=p.id);

insert into public.martie_options(product_id,name,selection_type,is_required,sort_order)
select p.id,'Tipo de leche','single',true,2 from public.martie_products p
where p.name in ('Latte','Matcha Latte')
and not exists(select 1 from public.martie_options o where o.product_id=p.id and o.name='Tipo de leche');

insert into public.martie_options(product_id,name,selection_type,sort_order)
select p.id,'Extras','multi',3 from public.martie_products p
where p.name in ('Latte','Iced Latte')
and not exists(select 1 from public.martie_options o where o.product_id=p.id and o.name='Extras');

insert into public.martie_options(product_id,name,selection_type,sort_order)
select p.id,'Endulzante','single',3 from public.martie_products p
where p.name='Matcha Latte'
and not exists(select 1 from public.martie_options o where o.product_id=p.id and o.name='Endulzante');

insert into public.martie_options(product_id,name,selection_type,sort_order)
select p.id,'Relleno','single',1 from public.martie_products p
where p.name='Croissant'
and not exists(select 1 from public.martie_options o where o.product_id=p.id and o.name='Relleno');

insert into public.martie_options(product_id,name,selection_type,sort_order)
select p.id,'Extras','multi',1 from public.martie_products p
where p.name='Bowl de Frutas'
and not exists(select 1 from public.martie_options o where o.product_id=p.id and o.name='Extras');

-- Values: insert by matching product + option group.
insert into public.martie_option_values(option_id,name,price_delta,sort_order)
select o.id,v.name,v.delta,v.ord
from public.martie_options o join public.martie_products p on p.id=o.product_id
join (values
('Latte','Tamaño','Chico',0,1),('Latte','Tamaño','Mediano',6,2),('Latte','Tamaño','Grande',12,3),
('Iced Latte','Tamaño','Chico',0,1),('Iced Latte','Tamaño','Mediano',6,2),('Iced Latte','Tamaño','Grande',12,3),
('Matcha Latte','Tamaño','Chico',0,1),('Matcha Latte','Tamaño','Mediano',6,2),('Matcha Latte','Tamaño','Grande',12,3),
('Latte','Tipo de leche','Entera',0,1),('Latte','Tipo de leche','Deslactosada',0,2),('Latte','Tipo de leche','Almendra',0,3),('Latte','Tipo de leche','Avena',0,4),
('Matcha Latte','Tipo de leche','Entera',0,1),('Matcha Latte','Tipo de leche','Deslactosada',0,2),('Matcha Latte','Tipo de leche','Almendra',0,3),('Matcha Latte','Tipo de leche','Avena',0,4),
('Latte','Extras','Shot extra',12,1),('Latte','Extras','Vainilla',8,2),('Latte','Extras','Caramelo',8,3),('Latte','Extras','Canela',8,4),
('Iced Latte','Extras','Vainilla',8,1),('Iced Latte','Extras','Caramelo',8,2),('Iced Latte','Extras','Shot extra',12,3),
('Matcha Latte','Endulzante','Sin azúcar',0,1),('Matcha Latte','Endulzante','Miel',5,2),('Matcha Latte','Endulzante','Stevia',0,3),
('Croissant','Relleno','Natural',0,1),('Croissant','Relleno','Chocolate',8,2),('Croissant','Relleno','Almendra',10,3),
('Bowl de Frutas','Extras','Granola',6,1),('Bowl de Frutas','Extras','Yogurt',8,2),('Bowl de Frutas','Extras','Frutos rojos',10,3)
) v(prod,opt,name,delta,ord) on v.prod=p.name and v.opt=o.name
where not exists(select 1 from public.martie_option_values x where x.option_id=o.id and x.name=v.name);

insert into public.martie_delivery_zones(name,fee) values ('Zona local',0) on conflict(name) do nothing;

create or replace function public.martie_is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.martie_staff s where s.user_id=auth.uid() and s.role='admin' and s.is_active);
$$;

alter table public.martie_categories enable row level security;
alter table public.martie_products enable row level security;
alter table public.martie_options enable row level security;
alter table public.martie_option_values enable row level security;
alter table public.martie_delivery_zones enable row level security;
alter table public.martie_orders enable row level security;
alter table public.martie_order_items enable row level security;
alter table public.martie_payment_proofs enable row level security;
alter table public.martie_loyalty_members enable row level security;
alter table public.martie_loyalty_transactions enable row level security;
alter table public.martie_rewards enable row level security;
alter table public.martie_birthday_rewards enable row level security;
alter table public.martie_whatsapp_messages enable row level security;
alter table public.martie_audit_logs enable row level security;
alter table public.martie_settings enable row level security;
alter table public.martie_staff enable row level security;

drop policy if exists "public read active categories" on public.martie_categories;
create policy "public read active categories" on public.martie_categories for select using(is_active or public.martie_is_admin());

drop policy if exists "public read active products" on public.martie_products;
create policy "public read active products" on public.martie_products for select using(is_available or public.martie_is_admin());

drop policy if exists "public read options" on public.martie_options;
create policy "public read options" on public.martie_options for select using(true);

drop policy if exists "public read option values" on public.martie_option_values;
create policy "public read option values" on public.martie_option_values for select using(is_available or public.martie_is_admin());

drop policy if exists "public read zones" on public.martie_delivery_zones;
create policy "public read zones" on public.martie_delivery_zones for select using(is_active or public.martie_is_admin());

drop policy if exists "admin categories write" on public.martie_categories;
create policy "admin categories write" on public.martie_categories for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "admin products write" on public.martie_products;
create policy "admin products write" on public.martie_products for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "admin options write" on public.martie_options;
create policy "admin options write" on public.martie_options for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "admin values write" on public.martie_option_values;
create policy "admin values write" on public.martie_option_values for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "admin zones write" on public.martie_delivery_zones;
create policy "admin zones write" on public.martie_delivery_zones for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "public settings read" on public.martie_settings;
create policy "public settings read" on public.martie_settings for select using(true);
drop policy if exists "admin settings write" on public.martie_settings;
create policy "admin settings write" on public.martie_settings for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "users own orders" on public.martie_orders;
create policy "users own orders" on public.martie_orders for select using(user_id=auth.uid() or public.martie_is_admin());
drop policy if exists "admin order update" on public.martie_orders;
create policy "admin order update" on public.martie_orders for update using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "users own items" on public.martie_order_items;
create policy "users own items" on public.martie_order_items for select using(exists(select 1 from public.martie_orders o where o.id=order_id and (o.user_id=auth.uid() or public.martie_is_admin())));
drop policy if exists "admin items" on public.martie_order_items;
create policy "admin items" on public.martie_order_items for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "users own loyalty" on public.martie_loyalty_members;
create policy "users own loyalty" on public.martie_loyalty_members for select using(user_id=auth.uid() or public.martie_is_admin());
drop policy if exists "admin loyalty" on public.martie_loyalty_members;
create policy "admin loyalty" on public.martie_loyalty_members for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "users own loyalty tx" on public.martie_loyalty_transactions;
create policy "users own loyalty tx" on public.martie_loyalty_transactions for select using(user_id=auth.uid() or public.martie_is_admin());
drop policy if exists "admin loyalty tx" on public.martie_loyalty_transactions;
create policy "admin loyalty tx" on public.martie_loyalty_transactions for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "public rewards" on public.martie_rewards;
create policy "public rewards" on public.martie_rewards for select using(is_active or public.martie_is_admin());
drop policy if exists "admin rewards" on public.martie_rewards;
create policy "admin rewards" on public.martie_rewards for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "own birthday" on public.martie_birthday_rewards;
create policy "own birthday" on public.martie_birthday_rewards for select using(user_id=auth.uid() or public.martie_is_admin());
drop policy if exists "admin birthday" on public.martie_birthday_rewards;
create policy "admin birthday" on public.martie_birthday_rewards for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "admin whatsapp" on public.martie_whatsapp_messages;
create policy "admin whatsapp" on public.martie_whatsapp_messages for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "admin audit" on public.martie_audit_logs;
create policy "admin audit" on public.martie_audit_logs for all using(public.martie_is_admin()) with check(public.martie_is_admin());

drop policy if exists "admin staff" on public.martie_staff;
create policy "admin staff" on public.martie_staff for all using(public.martie_is_admin()) with check(public.martie_is_admin());

-- Storage for transfer proofs. The bucket is private.
insert into storage.buckets(id,name,public) values ('martie-transfer-proofs','martie-transfer-proofs',false)
on conflict(id) do update set public=false;

drop policy if exists "proof upload own folder" on storage.objects;
create policy "proof upload own folder" on storage.objects for insert to authenticated
with check(bucket_id='martie-transfer-proofs' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "proof read own or admin" on storage.objects;
create policy "proof read own or admin" on storage.objects for select to authenticated
using(bucket_id='martie-transfer-proofs' and ((storage.foldername(name))[1]=auth.uid()::text or public.martie_is_admin()));

-- Admin bootstrap: after creating your account, replace YOUR_AUTH_USER_UUID below with your Auth user id.
-- insert into public.martie_staff(user_id,role) values ('YOUR_AUTH_USER_UUID','admin')
-- on conflict(user_id) do update set role='admin',is_active=true;

drop policy if exists "users own payment proofs" on public.martie_payment_proofs;
create policy "users own payment proofs" on public.martie_payment_proofs for select using(exists(select 1 from public.martie_orders o where o.id=order_id and (o.user_id=auth.uid() or public.martie_is_admin())));
drop policy if exists "admin payment proofs" on public.martie_payment_proofs;
create policy "admin payment proofs" on public.martie_payment_proofs for all using(public.martie_is_admin()) with check(public.martie_is_admin());
drop policy if exists "staff self read" on public.martie_staff;
create policy "staff self read" on public.martie_staff for select using(user_id=auth.uid() or public.martie_is_admin());

create or replace function public.martie_promote_admin(admin_email text)
returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email)=lower(admin_email) limit 1;
  if uid is null then raise exception 'No existe un usuario Auth con ese correo'; end if;
  insert into public.martie_staff(user_id,role,is_active) values(uid,'admin',true)
  on conflict(user_id) do update set role='admin',is_active=true;
  return uid;
end $$;
