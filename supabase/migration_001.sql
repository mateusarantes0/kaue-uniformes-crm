-- Migration 001: campanhas_ofertadas (text[] array) → campanha_ofertada (text nullable)
-- Preserve first element of existing arrays

ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS campanha_ofertada text;

UPDATE orcamentos
SET campanha_ofertada = campanhas_ofertadas[1]
WHERE campanhas_ofertadas IS NOT NULL
  AND array_length(campanhas_ofertadas, 1) > 0;

ALTER TABLE orcamentos
  DROP COLUMN IF EXISTS campanhas_ofertadas;
