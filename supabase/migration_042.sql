-- Tabela de atividades agendadas por orçamento
create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  orcamento_id text not null references orcamentos(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  titulo text not null,
  data date not null,
  hora time,
  concluida boolean default false,
  concluida_em timestamptz,
  criada_em timestamptz default now()
);

create index atividades_orc_idx on public.atividades(orcamento_id, data);

alter table public.atividades enable row level security;

create policy "atividades_select" on public.atividades
  for select using (
    exists (
      select 1 from orcamentos o where o.id = atividades.orcamento_id
        and (o.owner_id = auth.uid()
          or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "atividades_crud" on public.atividades
  for all using (auth.uid() = user_id);

-- View auxiliar para badge no card do kanban
create view public.orcamentos_proxima_atividade as
select
  orcamento_id,
  min(data)::text as proxima_data,
  count(*) filter (where not concluida) as pendentes
from public.atividades
where not concluida
group by orcamento_id;
