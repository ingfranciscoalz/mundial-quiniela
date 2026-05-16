"use client";

import { useState } from "react";
import type { Group, GroupPrediction, GroupResult } from "@/types";
import { upsertGroupPrediction } from "@/lib/db";

interface Props {
  group: Group;
  participantId: string;
  prediction: GroupPrediction | undefined;
  result: GroupResult | undefined;
}

export default function GroupPredictionCard({
  group,
  participantId,
  prediction,
  result,
}: Props) {
  const isLocked = result?.is_final === true;

  const [first, setFirst] = useState<string>(prediction?.first_team ?? "");
  const [second, setSecond] = useState<string>(prediction?.second_team ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!first || !second || first === second) return;
    setSaving(true);
    await upsertGroupPrediction(participantId, group.id, first, second);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function getTeamStatus(teamId: string) {
    if (!result?.is_final) return null;
    if (result.first_team === teamId) return "1°";
    if (result.second_team === teamId) return "2°";
    return null;
  }

  function getPredBadge(teamId: string) {
    if (!result?.is_final) return null;
    const advanced = [result.first_team, result.second_team];
    const predicted = [first, second];
    if (!predicted.includes(teamId)) return null;
    return advanced.includes(teamId) ? "correct" : "wrong";
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-700">Grupo {group.id}</h3>
        {isLocked ? (
          <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
            Finalizado
          </span>
        ) : prediction ? (
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
            ✅ Predicción guardada
          </span>
        ) : (
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            Sin predicción
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {group.teams.map((team) => {
          const status = getTeamStatus(team.id);
          const predBadge = getPredBadge(team.id);
          const isPredFirst = first === team.id;
          const isPredSecond = second === team.id;

          return (
            <div
              key={team.id}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                status
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{team.flag}</span>
                <span className="text-sm font-medium text-slate-700">
                  {team.name}
                </span>
                {status && (
                  <span className="text-xs bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    {status}
                  </span>
                )}
              </div>

              {!isLocked ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setFirst(team.id);
                      if (second === team.id) setSecond("");
                    }}
                    className={`px-2 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      isPredFirst
                        ? "bg-argentina-blue text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:border-argentina-blue"
                    }`}
                  >
                    1°
                  </button>
                  <button
                    onClick={() => {
                      setSecond(team.id);
                      if (first === team.id) setFirst("");
                    }}
                    className={`px-2 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      isPredSecond
                        ? "bg-argentina-blue text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:border-argentina-blue"
                    }`}
                  >
                    2°
                  </button>
                </div>
              ) : (
                predBadge && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      predBadge === "correct"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {predBadge === "correct" ? "+1pt" : "❌"}
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>

      {!isLocked && (
        <button
          onClick={handleSave}
          disabled={!first || !second || first === second || saving}
          className="btn-primary w-full py-2 text-sm"
        >
          {saved
            ? "✓ Guardado"
            : saving
            ? "Guardando..."
            : "Guardar clasificados"}
        </button>
      )}

      {isLocked && prediction && (
        <p className="text-center text-xs text-slate-400">
          Puntos obtenidos: <strong>{prediction.points ?? 0}</strong>/2
        </p>
      )}
    </div>
  );
}
