-- Tabela de notificações por usuário
create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensagem text,
  orcamento_id text references orcamentos(id) on delete cascade,
  lida boolean default false,
  criada_em timestamptz default now()
);

create index notificacoes_user_idx on public.notificacoes(user_id, lida, criada_em desc);

alter table public.notificacoes enable row level security;

create policy "notificacoes_select_own" on public.notificacoes
  for select using (auth.uid() = user_id);

create policy "notificacoes_update_own" on public.notificacoes
  for update using (auth.uid() = user_id);

create policy "notificacoes_delete_own" on public.notificacoes
  for delete using (auth.uid() = user_id);
