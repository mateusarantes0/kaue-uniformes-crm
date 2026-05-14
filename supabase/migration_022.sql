-- migration_022: data de saída para intervalo de entrega
alter table public.orcamentos
  add column if not exists data_saida date;
