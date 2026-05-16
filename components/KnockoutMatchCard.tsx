"use client";

import { useState } from "react";
import type {
  KnockoutMatchConfig,
  KnockoutMatchDB,
  ScorePrediction,
  GroupPrediction,
} from "@/types";
import { ARGENTINA, GROUPS } from "@/lib/worldcupData";
import { insertScorePrediction } from "@/lib/db";
import { calcKnockoutPoints } from "@/lib/scoring";

interface Props {
  config: KnockoutMatchConfig;
  dbMatch: KnockoutMatchDB | undefined;
  prediction: ScorePrediction | undefined;
  participantId: string;
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
    position === "first" ? config.autoFillGroupIfFirst : config.autoFillGroupIfSecond;
  const teamPosition =
    position === "first" ? config.autoFillPositionIfFirst : config.autoFillPositionIfSecond;
  if (!groupId) return null;
  const groupPred = groupPreds.find((p) => p.group_id === groupId);
  if (!groupPred) return null;
  const teamId =
    teamPosition === "first" ? groupPred.first_team : groupPred.second_team;
  const group = GROUPS.find((g) => g.id === groupId);
  return group?.teams.find((t) => t.id === teamId) ?? null;
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
  const isLocked = new Date() >= new Date(config.lockTime);
  const hasPrediction = prediction != null;
  const hasResult = dbMatch?.is_final === true && dbMatch.argentina_score != null;
  const isR32 = config.stage === "r32";

  const autoOpponent = getAutoFillOpponent(config, scorePreds, groupPreds);
  const argPosition = predictArgentinaPosition(scorePreds);

  const potentialTeams = config.potentialOpponentGroups.flatMap((gId) => {
    const g = GROUPS.find((g) => g.id === gId);
    return g?.teams ?? [];
  });

  const [argScore, setArgScore] = useState<string>("");
  const [oppScore, setOppScore] = useState<string>("");
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const resolvedOpponentId = isR32
    ? (autoOpponent?.id ?? "")
    : selectedOpponentId;

  async function handleSave() {
    const a = parseInt(argScore);
    const o = parseInt(oppScore);
    if (isNaN(a) || isNaN(o) || a < 0 || o < 0 || !resolvedOpponentId) return;
    setSaving(true);
    const ok = await insertScorePrediction(participantId, config.id, a, o, resolvedOpponentId);
    setSaving(false);
    if (ok) onSaved();
  }

  // Resolve displayed opponent
  const displayedOpponent = (() => {
    if (dbMatch?.opponent_name) {
      return { id: dbMatch.actual_opponent_team ?? "", name: dbMatch.opponent_name, flag: dbMatch.opponent_flag ?? "🏳️" };
    }
    if (hasPrediction && prediction!.predicted_opponent_team) {
      for (const g of GROUPS) {
        const t = g.teams.find((t) => t.id === prediction!.predicted_opponent_team);
        if (t) return t;
      }
    }
    if (isR32 && autoOpponent) return autoOpponent;
    if (!isR32 && selectedOpponentId) {
      return potentialTeams.find((t) => t.id === selectedOpponentId) ?? null;
    }
    return null;
  })();

  // Points badge
  let knockoutPoints: number | null = null;
  if (hasResult && hasPrediction) {
    knockoutPoints = calcKnockoutPoints(
      prediction!.predicted_argentina,
      prediction!.predicted_opponent,
      prediction!.predicted_opponent_team,
      dbMatch!.argentina_score!,
      dbMatch!.opponent_score!,
      dbMatch!.actual_opponent_team ?? null
    );
  }

  const pointsBadge =
    knockoutPoints !== null
      ? knockoutPoints === 3
        ? { label: "🎯 ¡Exacto! +3pts", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
        : knockoutPoints === 2
        ? { label: "✅ Resultado correcto +2pts", cls: "bg-blue-50 text-blue-700 border border-blue-200" }
        : knockoutPoints === 1
        ? { label: "👍 Rival correcto +1pt", cls: "bg-amber-50 text-amber-600 border border-amber-200" }
        : { label: "❌ Sin puntos", cls: "bg-red-50 text-red-600 border border-red-200" }
      : null;

  const matchDate = new Date(config.date + "T12:00:00");
  const dateLabel = matchDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={`card ${hasResult ? "border-l-4 border-l-geo" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-geo uppercase tracking-wider">
          {config.stageLabel}
        </span>
        <div>
          {hasResult && pointsBadge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pointsBadge.cls}`}>
              {pointsBadge.label}
            </span>
          )}
          {!hasResult && isLocked && (
            <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              🔒 Cerrado
            </span>
          )}
          {!hasResult && !isLocked && hasPrediction && (
            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              ✅ Predicción enviada
            </span>
          )}
          {!hasResult && !isLocked && !hasPrediction && (
            <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Abierto
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-stone-400 mb-4">
        📅 {dateLabel} &nbsp;·&nbsp; 📍 {config.venue}
      </p>

      {/* Dropdown rival (solo R16+ cuando no hay predicción y no está cerrado) */}
      {!isR32 && !hasPrediction && !isLocked && (
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
            Tu rival predicho
          </label>
          <select
            value={selectedOpponentId}
            onChange={(e) => setSelectedOpponentId(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-geo focus:outline-none bg-white"
          >
            <option value="">— Seleccioná el rival —</option>
            {potentialTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-400 mt-1 italic">{config.bracketDescription}</p>
        </div>
      )}

      {/* Teams + score */}
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
          ) : hasPrediction ? (
            <>
              <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-xl text-2xl font-black text-blue-700 border border-blue-200">
                {prediction!.predicted_argentina}
              </div>
              <span className="text-xl font-bold text-stone-300">-</span>
              <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-xl text-2xl font-black text-blue-700 border border-blue-200">
                {prediction!.predicted_opponent}
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
          {displayedOpponent ? (
            <>
              <span className="text-4xl">{displayedOpponent.flag}</span>
              <span className="text-sm font-semibold text-slate-700 text-center">
                {displayedOpponent.name}
              </span>
              {!hasPrediction && isR32 && autoOpponent && (
                <span className="text-xs text-stone-400 italic text-center">
                  según tus predicciones
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-4xl">🏳️</span>
              <span className="text-sm text-stone-400 text-center">Por definir</span>
            </>
          )}
        </div>
      </div>

      {/* Info para R32 cuando no hay predicción */}
      {isR32 && !hasPrediction && (
        <div className="mt-3 bg-stone-50 rounded-xl p-2.5 text-center">
          <p className="text-xs text-stone-500 italic">{config.bracketDescription}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Según tus predicciones, Argentina terminaría{" "}
            <strong>{argPosition === "first" ? "1°" : "2°"}</strong> en el Grupo J
          </p>
        </div>
      )}

      {hasPrediction && !hasResult && (
        <p className="text-center text-xs text-blue-400 mt-3 font-medium">
          🔒 Tu predicción es definitiva y no puede modificarse
        </p>
      )}

      {!isLocked && !hasResult && !hasPrediction && (
        <>
          <button
            onClick={handleSave}
            disabled={
              saving ||
              argScore === "" ||
              oppScore === "" ||
              (!isR32 && !selectedOpponentId) ||
              (isR32 && !autoOpponent)
            }
            className="btn-primary w-full mt-4 py-2.5 text-sm"
          >
            {saving ? "Guardando..." : "Guardar predicción"}
          </button>

          {/* Scoring info */}
          <div className="mt-3 flex gap-2 text-center">
            <div className="flex-1 bg-amber-50 rounded-lg p-1.5">
              <div className="text-xs font-bold text-amber-700">+1pt</div>
              <div className="text-xs text-amber-600">Rival correcto</div>
            </div>
            <div className="flex-1 bg-blue-50 rounded-lg p-1.5">
              <div className="text-xs font-bold text-blue-700">+2pts</div>
              <div className="text-xs text-blue-600">Resultado correcto</div>
            </div>
            <div className="flex-1 bg-emerald-50 rounded-lg p-1.5">
              <div className="text-xs font-bold text-emerald-700">+3pts</div>
              <div className="text-xs text-emerald-600">Marcador exacto</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
