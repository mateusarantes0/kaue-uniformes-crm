alter table public.orcamentos
  add column produto text,
  add column quantidade integer,
  add column data_entrega_desejada date,
  add column condicao_pagamento text,
  add column justificativa_quantidade_minima text,
  add column motivo_descarte text,
  add column probabilidade_editada_manualmente boolean default false;
