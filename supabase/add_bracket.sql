-- Predicciones del cuadro eliminatorio completo
CREATE TABLE IF NOT EXISTS bracket_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  winner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, match_id)
);

ALTER TABLE bracket_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all bracket operations" ON bracket_predictions
  FOR ALL USING (true) WITH CHECK (true);
