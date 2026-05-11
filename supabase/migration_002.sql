-- Migration 002: proxima_atividade (text) → proxima_atividade_titulo (text) + proxima_atividade_data (date)
-- Existing text value is preserved in the titulo column

ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS proxima_atividade_titulo text,
  ADD COLUMN IF NOT EXISTS proxima_atividade_data   date;

UPDATE orcamentos
SET proxima_atividade_titulo = proxima_atividade
WHERE proxima_atividade IS NOT NULL;

ALTER TABLE orcamentos
  DROP COLUMN IF EXISTS proxima_atividade;
