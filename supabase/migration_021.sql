-- migration_021: valor do sinal e data de despacho
alter table public.orcamentos
  add column if not exists valor_sinal numeric,
  add column if not exists despachado_em timestamptz;
