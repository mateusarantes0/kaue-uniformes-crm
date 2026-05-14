-- Tabela de comentários por orçamento (chat)
create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  orcamento_id text not null references orcamentos(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  texto text not null,
  mencionados uuid[] default '{}',
  anexos jsonb default '[]'::jsonb,
  criado_em timestamptz default now(),
  editado_em timestamptz
);

create index comentarios_orc_idx on public.comentarios(orcamento_id, criado_em desc);

alter table public.comentarios enable row level security;

create policy "comentarios_select" on public.comentarios
  for select using (
    exists (
      select 1 from orcamentos o where o.id = comentarios.orcamento_id
        and (o.owner_id = auth.uid()
          or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "comentarios_insert" on public.comentarios
  for insert with check (auth.uid() = user_id);

create policy "comentarios_update_own" on public.comentarios
  for update using (auth.uid() = user_id);

create policy "comentarios_delete_own" on public.comentarios
  for delete using (auth.uid() = user_id);
