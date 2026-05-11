-- Migration 001: campanhas_ofertadas (jsonb array) → campanha_ofertada (text nullable)
-- Preserve first element of existing arrays

ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS campanha_ofertada text;

UPDATE orcamentos
SET campanha_ofertada = (campanhas_ofertadas ->> 0)
WHERE campanhas_ofertadas IS NOT NULL
  AND jsonb_array_length(campanhas_ofertadas) > 0;

ALTER TABLE orcamentos
  DROP COLUMN IF EXISTS campanhas_ofertadas;
