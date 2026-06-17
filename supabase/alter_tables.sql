-- =============================================
-- MIGRATIONS - Pegar en SQL Editor de Supabase
-- =============================================

-- Agregar columna para el rival predicho en partidos eliminatorios
ALTER TABLE score_predictions
  ADD COLUMN IF NOT EXISTS predicted_opponent_team TEXT;

-- Agregar columna para el rival real en partidos eliminatorios
ALTER TABLE knockout_matches
  ADD COLUMN IF NOT EXISTS actual_opponent_team TEXT;

-- Agregar tercero predicho en predicciones de grupos
ALTER TABLE group_predictions
  ADD COLUMN IF NOT EXISTS third_team TEXT;

-- Constraints para upsert limpio (ejecutar una sola vez)
ALTER TABLE score_predictions
  DROP CONSTRAINT IF EXISTS score_predictions_unique;
ALTER TABLE score_predictions
  ADD CONSTRAINT score_predictions_unique UNIQUE (participant_id, match_id);

ALTER TABLE group_predictions
  DROP CONSTRAINT IF EXISTS group_predictions_unique;
ALTER TABLE group_predictions
  ADD CONSTRAINT group_predictions_unique UNIQUE (participant_id, group_id);

-- Agregar tercero real en resultados de grupos (para sync API)
ALTER TABLE group_results
  ADD COLUMN IF NOT EXISTS third_team TEXT;

-- Borrar todos los usuarios y predicciones
-- TRUNCATE TABLE bracket_predictions, score_predictions, group_predictions, participants RESTART IDENTITY CASCADE;
