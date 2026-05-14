-- migration_020: condição de parcelamento e detalhe de parcelamento
-- condicao_pagamento já existe como text (armazena a chave do enum)
alter table public.orcamentos
  add column if not exists condicao_parcelamento text,
  add column if not exists detalhe_parcelamento text;
