-- ============================================================
-- TABELA DE PERFIS (estende auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- EMPRESAS
-- ============================================================
create table public.empresas (
  id text primary key,
  nome text not null,
  responsaveis_ids text[] default '{}',
  razao_social text,
  cnpj text,
  segmento text,
  tipo_cliente text,
  grupo_estrategico text,
  frequencia text,
  status_cliente text,
  porte_empresa text,
  site text,
  email text,
  instagram text,
  linkedin text,
  endereco text,
  cidade text,
  uf text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  criado_por uuid not null references auth.users(id),
  atualizado_por uuid not null references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index empresas_owner_idx on public.empresas(owner_id);

alter table public.empresas enable row level security;

create policy "empresas_select" on public.empresas
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "empresas_insert" on public.empresas
  for insert with check (auth.uid() = owner_id);

create policy "empresas_update" on public.empresas
  for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "empresas_delete" on public.empresas
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- PESSOAS
-- ============================================================
create table public.pessoas (
  id text primary key,
  nome text not null,
  responsaveis_ids text[] default '{}',
  telefone text,
  empresas_ids text[] default '{}',
  tipo_contato text,
  cargo text,
  grau_influencia text,
  email text,
  instagram text,
  cpf text,
  data_nascimento date,
  sexo text,
  endereco text,
  cidade text,
  uf text,
  avaliou_no_google text,
  pedimos_indicacao text,
  indicacoes text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  criado_por uuid not null references auth.users(id),
  atualizado_por uuid not null references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index pessoas_owner_idx on public.pessoas(owner_id);

alter table public.pessoas enable row level security;

create policy "pessoas_select" on public.pessoas
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "pessoas_insert" on public.pessoas
  for insert with check (auth.uid() = owner_id);

create policy "pessoas_update" on public.pessoas
  for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "pessoas_delete" on public.pessoas
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ORCAMENTOS
-- ============================================================
create table public.orcamentos (
  id text primary key,
  nome text not null,
  responsavel_id uuid references auth.users(id),
  valor numeric,
  empresa_id text references empresas(id) on delete set null,
  contatos_ids text[] default '{}',
  coluna text not null default 'lead',
  probabilidade numeric,
  ultimo_contato_em timestamptz,
  orcamento_enviado_em timestamptz,
  data_fechamento_esperada date,
  proxima_atividade timestamptz,
  vendido_em timestamptz,
  data_perda timestamptz,
  data_entrega date,
  origem text,
  campanhas_ofertadas text[] default '{}',
  fechou_pela text,
  tipo_objecao text,
  observacao_objecao text,
  cenario_atual text,
  itens_acao jsonb default '[]'::jsonb,
  historico jsonb default '[]'::jsonb,
  owner_id uuid not null references auth.users(id) on delete cascade,
  criado_por uuid not null references auth.users(id),
  atualizado_por uuid not null references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index orcamentos_owner_idx on public.orcamentos(owner_id);
create index orcamentos_empresa_idx on public.orcamentos(empresa_id);
create index orcamentos_coluna_idx on public.orcamentos(coluna);

alter table public.orcamentos enable row level security;

create policy "orcamentos_select" on public.orcamentos
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "orcamentos_insert" on public.orcamentos
  for insert with check (auth.uid() = owner_id);

create policy "orcamentos_update" on public.orcamentos
  for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "orcamentos_delete" on public.orcamentos
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- TRIGGER: criar profile automaticamente ao registrar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
