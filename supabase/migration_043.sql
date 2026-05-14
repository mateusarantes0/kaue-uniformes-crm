-- Passo 1: migrar dados existentes de proxima_atividade → atividades
insert into public.atividades (orcamento_id, user_id, titulo, data)
select
  id,
  owner_id,
  proxima_atividade_titulo,
  proxima_atividade_data
from public.orcamentos
where proxima_atividade_titulo is not null
  and trim(proxima_atividade_titulo) != ''
  and proxima_atividade_data is not null;

-- Passo 2: remover colunas antigas
alter table public.orcamentos
  drop column if exists proxima_atividade_titulo,
  drop column if exists proxima_atividade_data;
