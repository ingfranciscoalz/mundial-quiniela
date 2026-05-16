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
    exact: { label: "🎯 ¡Exacto! +3pts", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    correct: { label: "✅ Resultado correcto +1pt", cls: "bg-arg-light text-arg-blue border border-arg-blue/20" },
    wrong: { label: "❌ Sin puntos", cls: "bg-red-50 text-red-600 border border-red-200" },
  };

  return (
    <div className={`card relative overflow-hidden ${hasResult ? "border-l-4 border-l-geo" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
          {match.stageLabel}
        </span>
        <div>
          {isLocked && !hasResult && (
            <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              🔒 Cerrado
            </span>
          )}
          {hasResult && badge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeConfig[badge].cls}`}>
              {badgeConfig[badge].label}
            </span>
          )}
          {!isLocked && !hasResult && (
            <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Abierto
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-stone-400 mb-5">
        📅 {dateLabel} &nbsp;·&nbsp; 📍 {match.venue}
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-4xl">{ARGENTINA.flag}</span>
          <span className="text-sm font-semibold text-slate-700">{ARGENTINA.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasResult ? (
            <>
              <div className="w-16 h-16 flex items-center justify-center bg-stone-50 rounded-xl text-2xl font-black text-slate-700 border border-stone-200">
                {result!.argentina_score}
              </div>
              <span className="text-xl font-bold text-stone-300">-</span>
              <div className="w-16 h-16 flex items-center justify-center bg-stone-50 rounded-xl text-2xl font-black text-slate-700 border border-stone-200">
                {result!.opponent_score}
              </div>
            </>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={20}
                value={argScore}
                onChange={(e) => setArgScore(e.target.value)}
                disabled={isLocked}
                placeholder="0"
                className="score-input disabled:bg-stone-50 disabled:text-stone-300"
              />
              <span className="text-xl font-bold text-stone-300">-</span>
              <input
                type="number"
                min={0}
                max={20}
                value={oppScore}
                onChange={(e) => setOppScore(e.target.value)}
                disabled={isLocked}
                placeholder="0"
                className="score-input disabled:bg-stone-50 disabled:text-stone-300"
              />
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-4xl">{match.opponent.flag}</span>
          <span className="text-sm font-semibold text-slate-700">{match.opponent.name}</span>
        </div>
      </div>

      {prediction && !hasResult && (
        <p className="text-center text-xs text-stone-400 mt-3">
          Predicción guardada: {prediction.predicted_argentina} – {prediction.predicted_opponent}
        </p>
      )}

      {!isLocked && !hasResult && (
        <button
          onClick={handleSave}
          disabled={saving || argScore === "" || oppScore === ""}
          className="btn-primary w-full mt-4 py-2.5 text-sm"
        >
          {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar predicción"}
        </button>
      )}
    </div>
  );
}
