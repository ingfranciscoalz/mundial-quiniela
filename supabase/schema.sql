-- =============================================
-- QUINIELA MUNDIAL 2026 - Schema de Supabase
-- Pegar este SQL en el SQL Editor de Supabase
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLAS
-- =============================================

-- Participantes de la quiniela
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda por nombre (case-insensitive)
CREATE INDEX idx_participants_name ON participants (lower(name));

-- Predicciones de marcador para partidos de Argentina
CREATE TABLE score_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,         -- 'ARG-1', 'ARG-2', 'ARG-3', etc.
  predicted_argentina INTEGER NOT NULL CHECK (predicted_argentina >= 0),
  predicted_opponent INTEGER NOT NULL CHECK (predicted_opponent >= 0),
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, match_id)
);

-- Predicciones de clasificación para otros grupos
CREATE TABLE group_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,          -- 'A', 'B', ..., 'L' (sin 'J')
  first_team TEXT NOT NULL,        -- ID del equipo que predice 1°
  second_team TEXT NOT NULL,       -- ID del equipo que predice 2°
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, group_id)
);

-- Resultados reales de partidos de Argentina (cargados por el admin)
CREATE TABLE match_results (
  match_id TEXT PRIMARY KEY,
  argentina_score INTEGER CHECK (argentina_score >= 0),
  opponent_score INTEGER CHECK (opponent_score >= 0),
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resultados reales de grupos (cargados por el admin)
CREATE TABLE group_results (
  group_id TEXT PRIMARY KEY,
  first_team TEXT,
  second_team TEXT,
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_results ENABLE ROW LEVEL SECURITY;

-- Participantes: todos pueden leer e insertar
CREATE POLICY "participants_select" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_insert" ON participants FOR INSERT WITH CHECK (true);

-- Score predictions: todos pueden leer, insertar y actualizar
CREATE POLICY "score_pred_select" ON score_predictions FOR SELECT USING (true);
CREATE POLICY "score_pred_insert" ON score_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "score_pred_update" ON score_predictions FOR UPDATE USING (true);

-- Group predictions: todos pueden leer, insertar y actualizar
CREATE POLICY "group_pred_select" ON group_predictions FOR SELECT USING (true);
CREATE POLICY "group_pred_insert" ON group_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "group_pred_update" ON group_predictions FOR UPDATE USING (true);

-- Resultados: todos pueden leer; insertar y actualizar desde el frontend admin
CREATE POLICY "match_results_select" ON match_results FOR SELECT USING (true);
CREATE POLICY "match_results_all" ON match_results FOR ALL USING (true);

CREATE POLICY "group_results_select" ON group_results FOR SELECT USING (true);
CREATE POLICY "group_results_all" ON group_results FOR ALL USING (true);
