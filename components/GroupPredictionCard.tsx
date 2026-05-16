"use client";

import { useState } from "react";
import type { Group, GroupPrediction, GroupResult } from "@/types";
import { insertGroupPrediction } from "@/lib/db";

interface Props {
  group: Group;
  participantId: string;
  prediction: GroupPrediction | undefined;
  result: GroupResult | undefined;
}

export default function GroupPredictionCard({ group, participantId, prediction, result }: Props) {
  const isFinalized = result?.is_final === true;
  const hasPrediction = prediction != null;

  const [first, setFirst] = useState<string>(prediction?.first_team ?? "");
  const [second, setSecond] = useState<string>(prediction?.second_team ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!first || !second || first === second) return;
    setSaving(true);
    const ok = await insertGroupPrediction(participantId, group.id, first, second);
    setSaving(false);
    if (ok) setSaved(true);
  }

  function getTeamStatus(teamId: string) {
    if (!result?.is_final) return null;
    if (result.first_team === teamId) return "1°";
    if (result.second_team === teamId) return "2°";
    return null;
  }

  function getPredBadge(teamId: string) {
    if (!result?.is_final || !hasPrediction) return null;
    const advanced = [result.first_team, result.second_team];
    const predicted = [first, second];
    if (!predicted.includes(teamId)) return null;
    return advanced.includes(teamId) ? "correct" : "wrong";
  }

  const isReadOnly = hasPrediction || saved;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-700 text-sm">Grupo {group.id}</h3>
        {isFinalized ? (
          <span className="text-xs bg-stone-100 text-stone-500 font-semibold px-2 py-0.5 rounded-full">
            Finalizado · {prediction?.points ?? 0}/2 pts
          </span>
        ) : isReadOnly ? (
          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
            ✅ Enviado
          </span>
        ) : (
          <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
            Sin completar
          </span>
        )}
      </div>

      <div className="space-y-1.5 mb-3">
        {group.teams.map((team) => {
          const status = getTeamStatus(team.id);
          const predBadge = getPredBadge(team.id);
          const isPredFirst = first === team.id;
          const isPredSecond = second === team.id;

          return (
            <div
              key={team.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                status ? "bg-emerald-50 border border-emerald-100" : "bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{team.flag}</span>
                <span className="text-sm font-medium text-slate-600">{team.name}</span>
                {status && (
                  <span className="text-xs bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    {status}
                  </span>
                )}
              </div>

              {isFinalized ? (
                predBadge && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      predBadge === "correct"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {predBadge === "correct" ? "+1pt" : "❌"}
                  </span>
                )
              ) : isReadOnly ? (
                (isPredFirst || isPredSecond) && (
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {isPredFirst ? "1°" : "2°"}
                  </span>
                )
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => { setFirst(team.id); if (second === team.id) setSecond(""); }}
                    className={`px-2 py-0.5 text-xs rounded-lg font-bold transition-colors ${
                      isPredFirst
                        ? "bg-geo text-white"
                        : "bg-white border border-stone-200 text-stone-400 hover:border-geo hover:text-geo"
                    }`}
                  >
                    1°
                  </button>
                  <button
                    onClick={() => { setSecond(team.id); if (first === team.id) setFirst(""); }}
                    className={`px-2 py-0.5 text-xs rounded-lg font-bold transition-colors ${
                      isPredSecond
                        ? "bg-geo text-white"
                        : "bg-white border border-stone-200 text-stone-400 hover:border-geo hover:text-geo"
                    }`}
                  >
                    2°
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isReadOnly && !isFinalized && (
        <p className="text-center text-xs text-blue-400 font-medium">
          🔒 Tu predicción es definitiva
        </p>
      )}

      {!isReadOnly && !isFinalized && (
        <button
          onClick={handleSave}
          disabled={!first || !second || first === second || saving}
          className="btn-primary w-full py-2 text-sm"
        >
          {saving ? "Guardando..." : "Guardar clasificados"}
        </button>
      )}
    </div>
  );
}
