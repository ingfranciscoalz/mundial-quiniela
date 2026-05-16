-- =============================================
-- MIGRATIONS - Pegar en SQL Editor de Supabase
-- =============================================

-- Agregar columna para el rival predicho en partidos eliminatorios
ALTER TABLE score_predictions
  ADD COLUMN IF NOT EXISTS predicted_opponent_team TEXT;

-- Agregar columna para el rival real en partidos eliminatorios
ALTER TABLE knockout_matches
  ADD COLUMN IF NOT EXISTS actual_opponent_team TEXT;
