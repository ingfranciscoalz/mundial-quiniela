"use client";

import { useEffect, useState } from "react";
import {
  getMatchResults,
  getGroupResults,
  upsertMatchResult,
  upsertGroupResult,
} from "@/lib/db";
import { ARGENTINA_MATCHES, OTHER_GROUPS } from "@/lib/worldcupData";
import type { MatchResult, GroupResult } from "@/types";

type AdminTab = "matches" | "groups";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("matches");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [matchInputs, setMatchInputs] = useState<
    Record<string, { arg: string; opp: string; final: boolean }>
  >({});
  const [groupInputs, setGroupInputs] = useState<
    Record<string, { first: string; second: string; final: boolean }>
  >({});

  async function load() {
    setLoading(true);
    const [mr, gr] = await Promise.all([getMatchResults(), getGroupResults()]);
    setMatchResults(mr);
    setGroupResults(gr);

    const mi: typeof matchInputs = {};
    for (const m of ARGENTINA_MATCHES) {
      const r = mr.find((r) => r.match_id === m.id);
      mi[m.id] = {
        arg: r?.argentina_score?.toString() ?? "",
        opp: r?.opponent_score?.toString() ?? "",
        final: r?.is_final ?? false,
      };
    }
    setMatchInputs(mi);

    const gi: typeof groupInputs = {};
    for (const g of OTHER_GROUPS) {
      const r = gr.find((r) => r.group_id === g.id);
      gi[g.id] = {
        first: r?.first_team ?? "",
        second: r?.second_team ?? "",
        final: r?.is_final ?? false,
      };
    }
    setGroupInputs(gi);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveMatch(matchId: string) {
    const inp = matchInputs[matchId];
    const arg = parseInt(inp.arg);
    const opp = parseInt(inp.opp);
    if (isNaN(arg) || isNaN(opp)) return;

    setSaving(matchId);
    await upsertMatchResult(matchId, arg, opp, inp.final);
    await load();
    setSaving(null);
  }

  async function saveGroup(groupId: string) {
    const inp = groupInputs[groupId];
    if (!inp.first || !inp.second || inp.first === inp.second) return;

    setSaving(groupId);
    await upsertGroupResult(groupId, inp.first, inp.second, inp.final);
    await load();
    setSaving(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">
          Panel de Administración ⚙️
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ingresá los resultados para calcular los puntos automáticamente.
          Marcá como <strong>Final</strong> cuando el resultado sea oficial.
        </p>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("matches")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "matches"
              ? "bg-white shadow text-argentina-blue"
              : "text-slate-500"
          }`}
        >
          🇦🇷 Partidos Argentina
        </button>
        <button
          onClick={() => setTab("groups")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "groups"
              ? "bg-white shadow text-argentina-blue"
              : "text-slate-500"
          }`}
        >
          🌍 Otros Grupos
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Cargando...</div>
      ) : tab === "matches" ? (
        <div className="space-y-4">
          {ARGENTINA_MATCHES.map((match) => {
            const inp = matchInputs[match.id] ?? {
              arg: "",
              opp: "",
              final: false,
            };
            const isSaving = saving === match.id;
            const matchDate = new Date(match.date + "T12:00:00");

            return (
              <div key={match.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-700">
                      Argentina 🇦🇷 vs {match.opponent.flag}{" "}
                      {match.opponent.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {matchDate.toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      · {match.venue}
                    </p>
                  </div>
                  {inp.final && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      ✓ Final
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">ARG</div>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={inp.arg}
                        onChange={(e) =>
                          setMatchInputs((prev) => ({
                            ...prev,
                            [match.id]: { ...prev[match.id], arg: e.target.value },
                          }))
                        }
                        className="score-input"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-xl font-bold text-slate-400 mt-4">
                      -
                    </span>
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">
                        {match.opponent.name.split(" ")[0]}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={inp.opp}
                        onChange={(e) =>
                          setMatchInputs((prev) => ({
                            ...prev,
                            [match.id]: {
                              ...prev[match.id],
                              opp: e.target.value,
                            },
                          }))
                        }
                        className="score-input"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inp.final}
                        onChange={(e) =>
                          setMatchInputs((prev) => ({
                            ...prev,
                            [match.id]: {
                              ...prev[match.id],
                              final: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 accent-argentina-blue"
                      />
                      <span className="text-slate-600 font-medium">
                        Resultado final
                      </span>
                    </label>

                    <button
                      onClick={() => saveMatch(match.id)}
                      disabled={isSaving || inp.arg === "" || inp.opp === ""}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      {isSaving ? "..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OTHER_GROUPS.map((group) => {
            const inp = groupInputs[group.id] ?? {
              first: "",
              second: "",
              final: false,
            };
            const isSaving = saving === group.id;

            return (
              <div key={group.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-700">
                    Grupo {group.id}
                  </h3>
                  {inp.final && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      ✓ Final
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  {(["first", "second"] as const).map((pos) => (
                    <div key={pos} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 w-6">
                        {pos === "first" ? "1°" : "2°"}
                      </span>
                      <select
                        value={inp[pos]}
                        onChange={(e) =>
                          setGroupInputs((prev) => ({
                            ...prev,
                            [group.id]: {
                              ...prev[group.id],
                              [pos]: e.target.value,
                            },
                          }))
                        }
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:border-argentina-blue focus:outline-none"
                      >
                        <option value="">— Seleccionar —</option>
                        {group.teams.map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={
                              pos === "first"
                                ? inp.second === t.id
                                : inp.first === t.id
                            }
                          >
                            {t.flag} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inp.final}
                      onChange={(e) =>
                        setGroupInputs((prev) => ({
                          ...prev,
                          [group.id]: {
                            ...prev[group.id],
                            final: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 accent-argentina-blue"
                    />
                    <span className="text-slate-600 text-xs">Final</span>
                  </label>

                  <button
                    onClick={() => saveGroup(group.id)}
                    disabled={
                      isSaving ||
                      !inp.first ||
                      !inp.second ||
                      inp.first === inp.second
                    }
                    className="btn-primary py-1.5 px-3 text-sm"
                  >
                    {isSaving ? "..." : "Guardar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
