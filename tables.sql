-- Extensão para gerar UUIDs
create extension if not exists "uuid-ossp";

-- Perfis (baseado no exemplo fornecido)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  company_name text,
  role text,
  constraint username_length check (char_length(username) >= 3)
);

-- Produtos
create table products (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users not null,
  name text not null,
  description text,
  category text not null,
  sku text unique not null,
  status text not null default 'active',
  metadata jsonb -- Para dados adicionais flexíveis
);

-- Locais (armazéns, centros de distribuição, etc)
create table locations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  name text not null,
  address text not null,
  type text not null, -- 'warehouse', 'distribution_center', 'retail', etc
  coordinates point, -- Latitude e longitude
  metadata jsonb
);

-- Transações da cadeia de suprimentos (on-chain references)
create table supply_chain_transactions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users not null,
  product_id uuid references products not null,
  transaction_type text not null, -- 'production', 'transport', 'storage', 'delivery'
  from_location_id uuid references locations,
  to_location_id uuid references locations,
  blockchain_hash text not null, -- Hash da transação no blockchain
  previous_transaction_id uuid references supply_chain_transactions,
  status text not null,
  metadata jsonb
);

-- Detalhes logísticos (off-chain data)
create table logistics_details (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references supply_chain_transactions not null,
  temperature numeric,
  humidity numeric,
  transport_vehicle text,
  transport_duration interval,
  storage_conditions text,
  quality_checks jsonb,
  additional_data jsonb
);

-- Configurar RLS (Row Level Security)

-- Profiles
alter table profiles enable row level security;

create policy "Profiles são visíveis publicamente" on profiles
  for select using (true);

create policy "Usuários podem atualizar próprio perfil" on profiles
  for update using (auth.uid() = id);

-- Products
alter table products enable row level security;

create policy "Produtos são visíveis publicamente" on products
  for select using (true);

create policy "Apenas usuários autenticados podem criar produtos" on products
  for insert with check (auth.role() = 'authenticated');

create policy "Apenas criador pode atualizar produto" on products
  for update using (auth.uid() = created_by);

-- Locations
alter table locations enable row level security;

create policy "Locais são visíveis publicamente" on locations
  for select using (true);

create policy "Apenas usuários autenticados podem criar locais" on locations
  for insert with check (auth.role() = 'authenticated');

-- Supply Chain Transactions
alter table supply_chain_transactions enable row level security;

create policy "Transações são visíveis publicamente" on supply_chain_transactions
  for select using (true);

create policy "Apenas usuários autenticados podem criar transações" on supply_chain_transactions
  for insert with check (auth.role() = 'authenticated');

-- Logistics Details
alter table logistics_details enable row level security;

create policy "Detalhes logísticos são visíveis publicamente" on logistics_details
  for select using (true);

create policy "Apenas usuários autenticados podem criar detalhes logísticos" on logistics_details
  for insert with check (auth.role() = 'authenticated');

-- Trigger para criar perfil automático para novos usuários
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Função para validar transação na cadeia
create or replace function validate_supply_chain_transaction()
returns trigger as $$
begin
  -- Verificar se é a primeira transação do produto
  if new.transaction_type = 'production' then
    if new.previous_transaction_id is not null then
      raise exception 'Transação de produção não pode ter transação anterior';
    end if;
  else
    -- Para outros tipos, deve haver uma transação anterior
    if new.previous_transaction_id is null then
      raise exception 'Transações não-produção devem ter uma transação anterior';
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger validate_transaction
  before insert on supply_chain_transactions
  for each row execute procedure validate_supply_chain_transaction();

-- Tabela de relatórios
create table reports (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('supply_chain', 'logistics', 'inventory', 'performance')),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'custom')),
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  status text not null default 'active' check (status in ('active', 'paused', 'failed')),
  metadata jsonb
);

-- Políticas RLS
alter table reports enable row level security;

create policy "Relatórios são visíveis publicamente"
  on reports for select
  using (true);

create policy "Apenas usuários autenticados podem criar relatórios"
  on reports for insert
  with check (auth.role() = 'authenticated');

create policy "Apenas criador pode atualizar relatório"
  on reports for update
  using (auth.uid() = created_by);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  status text not null check (status in ('read', 'unread')),
  user_id uuid references auth.users not null
);