-- Campo para arquivamento de orçamentos (sucesso/perdido de meses anteriores)
alter table public.orcamentos add column if not exists arquivado_em timestamptz;

create index if not exists orcamentos_arquivado_idx on public.orcamentos(arquivado_em);
