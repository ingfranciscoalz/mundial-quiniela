"use client";

import { useState } from "react";
import type { ArgentinaMatch, ScorePrediction, MatchResult } from "@/types";
import { ARGENTINA } from "@/lib/worldcupData";
import { isMatchLocked } from "@/lib/worldcupData";
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
  const isLocked = isMatchLocked(match.lockTime);
  const hasPrediction = prediction != null;
  const hasResult = result?.is_final && result.argentina_score != null;

  const [argScore, setArgScore] = useState<string>(
    prediction?.predicted_argentina?.toString() ?? ""
  );
  const [oppScore, setOppScore] = useState<string>(
    prediction?.predicted_opponent?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

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
    const ok = await upsertScorePrediction(participantId, match.id, a, o);
    setSaving(false);
    if (ok) {
      onSaved();
    } else {
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    }
  }

  const badge =
    hasResult && hasPrediction
      ? getResultBadge(
          prediction!.predicted_argentina,
          prediction!.predicted_opponent,
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
          {hasResult && badge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeConfig[badge].cls}`}>
              {badgeConfig[badge].label}
            </span>
          )}
          {!hasResult && isLocked && (
            <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              🔒 Cerrado
            </span>
          )}
          {!hasResult && !isLocked && hasPrediction && (
            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              ✏️ Modificable
            </span>
          )}
          {!hasResult && !isLocked && !hasPrediction && (
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
          ) : isLocked ? (
            <>
              <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-xl text-2xl font-black text-blue-700 border border-blue-200">
                {hasPrediction ? prediction!.predicted_argentina : "—"}
              </div>
              <span className="text-xl font-bold text-stone-300">-</span>
              <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-xl text-2xl font-black text-blue-700 border border-blue-200">
                {hasPrediction ? prediction!.predicted_opponent : "—"}
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
                placeholder="0"
                className="score-input"
              />
              <span className="text-xl font-bold text-stone-300">-</span>
              <input
                type="number"
                min={0}
                max={20}
                value={oppScore}
                onChange={(e) => setOppScore(e.target.value)}
                placeholder="0"
                className="score-input"
              />
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-4xl">{match.opponent.flag}</span>
          <span className="text-sm font-semibold text-slate-700">{match.opponent.name}</span>
        </div>
      </div>

      {failed && (
        <p className="text-center text-xs text-red-500 mt-3">
          Error al guardar. Intentá de nuevo.
        </p>
      )}

      {!isLocked && !hasResult && (
        <button
          onClick={handleSave}
          disabled={saving || argScore === "" || oppScore === ""}
          className="btn-primary w-full mt-4 py-2.5 text-sm"
        >
          {saving ? "Guardando..." : hasPrediction ? "Actualizar predicción" : "Guardar predicción"}
        </button>
      )}
    </div>
  );
}
