"use client";

import { useState } from "react";
import type {
  KnockoutMatchConfig,
  KnockoutMatchDB,
  ScorePrediction,
  GroupPrediction,
} from "@/types";
import { ARGENTINA, GROUPS } from "@/lib/worldcupData";
import { upsertScorePrediction } from "@/lib/db";
import { getResultBadge } from "@/lib/scoring";

interface Props {
  config: KnockoutMatchConfig;
  dbMatch: KnockoutMatchDB | undefined;
  prediction: ScorePrediction | undefined;
  participantId: string;
  // Para auto-fill del rival
  scorePreds: ScorePrediction[];
  groupPreds: GroupPrediction[];
  onSaved: () => void;
}

function predictArgentinaPosition(scorePreds: ScorePrediction[]): "first" | "second" {
  const matchIds = ["ARG-1", "ARG-2", "ARG-3"];
  let points = 0;
  for (const id of matchIds) {
    const pred = scorePreds.find((p) => p.match_id === id);
    if (!pred) continue;
    const diff = pred.predicted_argentina - pred.predicted_opponent;
    if (diff > 0) points += 3;
    else if (diff === 0) points += 1;
  }
  return points >= 5 ? "first" : "second";
}

function getAutoFillOpponent(
  config: KnockoutMatchConfig,
  scorePreds: ScorePrediction[],
  groupPreds: GroupPrediction[]
) {
  const position = predictArgentinaPosition(scorePreds);
  const groupId =
    position === "first"
      ? config.autoFillGroupIfFirst
      : config.autoFillGroupIfSecond;
  const teamPosition =
    position === "first"
      ? config.autoFillPositionIfFirst
      : config.autoFillPositionIfSecond;

  if (!groupId) return null;

  const groupPred = groupPreds.find((p) => p.group_id === groupId);
  if (!groupPred) return null;

  const teamId =
    teamPosition === "first" ? groupPred.first_team : groupPred.second_team;

  const group = GROUPS.find((g) => g.id === groupId);
  const team = group?.teams.find((t) => t.id === teamId);
  return team ?? null;
}

export default function KnockoutMatchCard({
  config,
  dbMatch,
  prediction,
  participantId,
  scorePreds,
  groupPreds,
  onSaved,
}: Props) {
  const isEnabled = dbMatch?.is_enabled === true;
  const isLocked = isEnabled && new Date() >= new Date(config.lockTime);
  const hasResult =
    dbMatch?.is_final === true && dbMatch.argentina_score != null;

  const [argScore, setArgScore] = useState<string>(
    prediction?.predicted_argentina?.toString() ?? ""
  );
  const [oppScore, setOppScore] = useState<string>(
    prediction?.predicted_opponent?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const matchDate = new Date(config.date + "T12:00:00");
  const dateLabel = matchDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const autoOpponent = getAutoFillOpponent(config, scorePreds, groupPreds);

  const opponent = dbMatch?.opponent_name
    ? { name: dbMatch.opponent_name, flag: dbMatch.opponent_flag ?? "🏳️" }
    : autoOpponent
    ? { name: autoOpponent.name, flag: autoOpponent.flag }
    : null;

  const argPosition = predictArgentinaPosition(scorePreds);

  async function handleSave() {
    const a = parseInt(argScore);
    const o = parseInt(oppScore);
    if (isNaN(a) || isNaN(o) || a < 0 || o < 0) return;
    setSaving(true);
    await upsertScorePrediction(participantId, config.id, a, o);
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
          dbMatch!.argentina_score!,
          dbMatch!.opponent_score!
        )
      : null;

  const badgeConfig = {
    exact: { label: "🎯 ¡Exacto! +3pts", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    correct: { label: "✅ Resultado correcto +1pt", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    wrong: { label: "❌ Sin puntos", cls: "bg-red-50 text-red-600 border border-red-200" },
  };

  // Partido no habilitado aún
  if (!isEnabled) {
    return (
      <div className="card border border-dashed border-stone-200 bg-stone-50/50 opacity-80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-geo uppercase tracking-wider">
            {config.stageLabel}
          </span>
          <span className="text-xs bg-stone-100 text-stone-400 font-semibold px-2 py-0.5 rounded-full">
            Por habilitar
          </span>
        </div>
        <p className="text-xs text-stone-400 mb-4">
          📅 {dateLabel} · 📍 {config.venue}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-3xl">{ARGENTINA.flag}</span>
            <span className="text-sm font-semibold text-slate-600">{ARGENTINA.name}</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            {opponent ? (
              <>
                <span className="text-3xl">{opponent.flag}</span>
                <span className="text-sm font-semibold text-slate-600 text-center">
                  {opponent.name}
                </span>
                <span className="text-xs text-stone-400 italic">
                  (basado en tus predicciones)
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl">🏳️</span>
                <span className="text-sm text-stone-400 text-center">Por definir</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-4 bg-stone-100 rounded-xl p-3 text-center">
          <p className="text-xs text-stone-500">
            🔒 <strong>Bracket:</strong> {config.bracketDescription}
          </p>
          {config.autoFillGroupIfFirst && (
            <p className="text-xs text-stone-400 mt-1">
              Basado en tus predicciones: Argentina terminaría{" "}
              <strong>{argPosition === "first" ? "1°" : "2°"}</strong> en el Grupo J
            </p>
          )}
        </div>
      </div>
    );
  }

  // Partido habilitado
  return (
    <div className={`card ${hasResult ? "border-l-4 border-l-geo" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-geo uppercase tracking-wider">
          {config.stageLabel}
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
        📅 {dateLabel} &nbsp;·&nbsp; 📍 {config.venue}
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
                {dbMatch!.argentina_score}
              </div>
              <span className="text-xl font-bold text-stone-300">-</span>
              <div className="w-16 h-16 flex items-center justify-center bg-stone-50 rounded-xl text-2xl font-black text-slate-700 border border-stone-200">
                {dbMatch!.opponent_score}
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
          <span className="text-4xl">{opponent?.flag ?? "🏳️"}</span>
          <span className="text-sm font-semibold text-slate-700 text-center">
            {opponent?.name ?? "Por definir"}
          </span>
          {!dbMatch?.opponent_name && opponent && (
            <span className="text-xs text-stone-400 italic text-center">
              según tus predicciones
            </span>
          )}
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
