-- =============================================
-- AGREGAR TABLA DE PARTIDOS ELIMINATORIOS
-- Pegar en SQL Editor de Supabase
-- =============================================

CREATE TABLE knockout_matches (
  match_id TEXT PRIMARY KEY,       -- 'ARG-R32', 'ARG-R16', 'ARG-QF', 'ARG-SF', 'ARG-FINAL'
  opponent_name TEXT,
  opponent_flag TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  argentina_score INTEGER CHECK (argentina_score >= 0),
  opponent_score INTEGER CHECK (opponent_score >= 0),
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE knockout_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knockout_select" ON knockout_matches FOR SELECT USING (true);
CREATE POLICY "knockout_all"    ON knockout_matches FOR ALL   USING (true);
