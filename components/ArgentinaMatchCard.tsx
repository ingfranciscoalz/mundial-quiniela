"use client";

import { useState } from "react";
import type { ArgentinaMatch, ScorePrediction, MatchResult } from "@/types";
import { ARGENTINA } from "@/lib/worldcupData";
import { upsertScorePrediction } from "@/lib/db";
import { getResultBadge } from "@/lib/scoring";

interface Props {
  match: ArgentinaMatch;
  participantId: string;
  prediction: ScorePrediction | undefined;
  result: MatchResult | undefined;
  onSaved: () => void;
}

export default function ArgentinaMatchCard({
  match,
  participantId,
  prediction,
  result,
  onSaved,
}: Props) {
  const isLocked = new Date() >= new Date(match.lockTime);
  const hasResult = result?.is_final && result.argentina_score != null;

  const [argScore, setArgScore] = useState<string>(
    prediction?.predicted_argentina?.toString() ?? ""
  );
  const [oppScore, setOppScore] = useState<string>(
    prediction?.predicted_opponent?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const matchDate = new Date(match.date + "T12:00:00");
  const dateLabel = matchDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  async function handleSave() {
    const a = parseInt(argScore);
    const o = parseInt(oppScore);
    if (isNaN(a) || isNaN(o) || a < 0 || o < 0) return;

    setSaving(true);
    await upsertScorePrediction(participantId, match.id, a, o);
    setSaving(false);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2000);
  }

  const badge =
    hasResult && prediction
      ? getResultBadge(
          prediction.predicted_argentina,
          prediction.predicted_opponent,
          result!.argentina_score!,
          result!.opponent_score!
        )
      : null;

  const badgeConfig = {
    exact: { label: "¡Exacto! +3pts", cls: "bg-emerald-100 text-emerald-700" },
    correct: {
      label: "Resultado correcto +1pt",
      cls: "bg-blue-100 text-blue-700",
    },
    wrong: { label: "Sin puntos", cls: "bg-red-100 text-red-600" },
  };

  return (
    <div
      className={`card relative overflow-hidden ${
        hasResult ? "border-l-4 border-argentina-blue" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {match.stageLabel}
        </span>
        {isLocked && !hasResult && (
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            🔒 Cerrado
          </span>
        )}
        {hasResult && badge && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeConfig[badge].cls}`}
          >
            {badgeConfig[badge].label}
          </span>
        )}
        {!isLocked && !hasResult && (
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
            ✅ Abierto
          </span>
        )}
      </div>

      <div className="text-xs text-slate-400 mb-4">
        📅 {dateLabel} · 📍 {match.venue}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl">{ARGENTINA.flag}</span>
          <span className="text-sm font-semibold text-slate-700">
            {ARGENTINA.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasResult ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-xl text-2xl font-black text-slate-700">
                {result!.argentina_score}
              </div>
              <span className="text-xl font-bold text-slate-400">-</span>
              <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-xl text-2xl font-black text-slate-700">
                {result!.opponent_score}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={argScore}
                onChange={(e) => setArgScore(e.target.value)}
                disabled={isLocked}
                placeholder="0"
                className="score-input disabled:bg-slate-50 disabled:text-slate-400"
              />
              <span className="text-xl font-bold text-slate-400">-</span>
              <input
                type="number"
                min={0}
                max={20}
                value={oppScore}
                onChange={(e) => setOppScore(e.target.value)}
                disabled={isLocked}
                placeholder="0"
                className="score-input disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl">{match.opponent.flag}</span>
          <span className="text-sm font-semibold text-slate-700">
            {match.opponent.name}
          </span>
        </div>
      </div>

      {prediction && !hasResult && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Tu predicción actual: {prediction.predicted_argentina} -{" "}
          {prediction.predicted_opponent}
        </p>
      )}

      {!isLocked && !hasResult && (
        <button
          onClick={handleSave}
          disabled={saving || argScore === "" || oppScore === ""}
          className="btn-primary w-full mt-4 py-2 text-sm"
        >
          {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar predicción"}
        </button>
      )}
    </div>
  );
}
