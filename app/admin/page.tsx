"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  getMatchResults,
  getGroupResults,
  getKnockoutMatches,
  upsertMatchResult,
  upsertGroupResult,
  upsertKnockoutMatch,
  upsertKnockoutResult,
  recalcAllPoints,
} from "@/lib/db";
import { ARGENTINA_MATCHES, GROUPS, KNOCKOUT_MATCHES } from "@/lib/worldcupData";
import type { MatchResult, GroupResult, KnockoutMatchDB } from "@/types";

type AdminTab = "matches" | "knockout" | "groups";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("matches");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatchDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [recalcMsg, setRecalcMsg] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  // IDs being manually edited (overriding a final result)
  const [editing, setEditing] = useState<Set<string>>(new Set());

  const [matchInputs, setMatchInputs] = useState<
    Record<string, { arg: string; opp: string; final: boolean }>
  >({});
  const [groupInputs, setGroupInputs] = useState<
    Record<string, { first: string; second: string; final: boolean }>
  >({});
  const [knockoutInputs, setKnockoutInputs] = useState<
    Record<string, { name: string; flag: string; actualTeam: string; enabled: boolean; arg: string; opp: string; final: boolean }>
  >({});

  async function load() {
    setLoading(true);
    const [mr, gr, km] = await Promise.all([getMatchResults(), getGroupResults(), getKnockoutMatches()]);
    setMatchResults(mr);
    setGroupResults(gr);
    setKnockoutMatches(km);

    const mi: typeof matchInputs = {};
    for (const m of ARGENTINA_MATCHES) {
      const r = mr.find((r) => r.match_id === m.id);
      mi[m.id] = { arg: r?.argentina_score?.toString() ?? "", opp: r?.opponent_score?.toString() ?? "", final: r?.is_final ?? false };
    }
    setMatchInputs(mi);

    const gi: typeof groupInputs = {};
    for (const g of GROUPS) {
      const r = gr.find((r) => r.group_id === g.id);
      gi[g.id] = { first: r?.first_team ?? "", second: r?.second_team ?? "", final: r?.is_final ?? false };
    }
    setGroupInputs(gi);

    const ki: typeof knockoutInputs = {};
    for (const m of KNOCKOUT_MATCHES) {
      const db = km.find((k) => k.match_id === m.id);
      ki[m.id] = {
        name: db?.opponent_name ?? "",
        flag: db?.opponent_flag ?? "",
        actualTeam: db?.actual_opponent_team ?? "",
        enabled: db?.is_enabled ?? false,
        arg: db?.argentina_score?.toString() ?? "",
        opp: db?.opponent_score?.toString() ?? "",
        final: db?.is_final ?? false,
      };
    }
    setKnockoutInputs(ki);
    setEditing(new Set());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggleEditing(id: string) {
    setEditing((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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

  async function saveKnockoutConfig(matchId: string) {
    const inp = knockoutInputs[matchId];
    setSaving(matchId + "-cfg");
    await upsertKnockoutMatch(matchId, inp.name, inp.flag, inp.actualTeam, inp.enabled);
    await load();
    setSaving(null);
  }

  async function saveKnockoutResult(matchId: string) {
    const inp = knockoutInputs[matchId];
    const arg = parseInt(inp.arg);
    const opp = parseInt(inp.opp);
    if (isNaN(arg) || isNaN(opp)) return;
    setSaving(matchId + "-res");
    await upsertKnockoutResult(matchId, arg, opp, inp.actualTeam, inp.final);
    await load();
    setSaving(null);
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "matches", label: "🇦🇷 Partidos Argentina" },
    { id: "knockout", label: "⚡ Eliminatorias" },
    { id: "groups", label: "🌍 Grupos" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow">Panel de Admin ⚙️</h1>
          <p className="text-white/60 text-sm mt-1">Los resultados se sincronizan automáticamente cada 15 min.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={async () => {
                setSaving("sync");
                setSyncMsg(null);
                const res = await fetch("/api/sync-results");
                const json = await res.json();
                setSaving(null);
                if (json.error) {
                  setSyncMsg(`❌ ${json.error}`);
                } else {
                  const parts = [];
                  if (json.matches?.length) parts.push(`${json.matches.length} partido(s)`);
                  if (json.groups?.length) parts.push(`${json.groups.length} grupo(s)`);
                  setSyncMsg(parts.length ? `✅ ${parts.join(" · ")} sincronizados` : "ℹ️ Sin novedades");
                  await load();
                }
                setTimeout(() => setSyncMsg(null), 6000);
              }}
              disabled={saving === "sync"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {saving === "sync" ? "Sincronizando..." : "⚡ Sync API"}
            </button>
            <button
              onClick={async () => {
                setSaving("recalc");
                const r = await recalcAllPoints();
                setSaving(null);
                setRecalcMsg(`✅ ${r.matches} partidos · ${r.groups} grupos · ${r.knockout} elim.`);
                setTimeout(() => setRecalcMsg(null), 5000);
              }}
              disabled={saving === "recalc"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {saving === "recalc" ? "Recalculando..." : "🔄 Recalcular puntos"}
            </button>
          </div>
          {syncMsg && <p className="text-blue-300 text-xs text-right">{syncMsg}</p>}
          {recalcMsg && <p className="text-emerald-300 text-xs text-right">{recalcMsg}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 bg-black/30 backdrop-blur-sm p-1 rounded-xl border border-white/10">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              tab === t.id ? "bg-white shadow text-geo font-semibold" : "text-white/70 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/50 text-center py-12 animate-pulse">Cargando...</div>

      ) : tab === "matches" ? (
        <div className="space-y-3">
          {ARGENTINA_MATCHES.map((match) => {
            const inp = matchInputs[match.id] ?? { arg: "", opp: "", final: false };
            const isEditing = editing.has(match.id);

            if (inp.final && !isEditing) {
              return (
                <div key={match.id} className="card flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">{match.stageLabel} · {match.date}</p>
                    <p className="font-bold text-slate-700">
                      🇦🇷 Argentina <span className="text-geo font-black">{inp.arg} – {inp.opp}</span> {match.opponent.flag} {match.opponent.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Final</span>
                    <button onClick={() => toggleEditing(match.id)} className="text-xs text-slate-400 hover:text-slate-600 underline">Editar</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={match.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-700">🇦🇷 Argentina vs {match.opponent.flag} {match.opponent.name}</h3>
                    <p className="text-xs text-slate-400">{match.date} · {match.venue}</p>
                  </div>
                  {isEditing && (
                    <button onClick={() => toggleEditing(match.id)} className="text-xs text-slate-400 hover:text-slate-600 underline">Cancelar</button>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">ARG</div>
                      <input type="number" min={0} max={20} value={inp.arg}
                        onChange={(e) => setMatchInputs((p) => ({ ...p, [match.id]: { ...p[match.id], arg: e.target.value } }))}
                        className="score-input" placeholder="0" />
                    </div>
                    <span className="text-xl font-bold text-slate-300 mt-4">-</span>
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">{match.opponent.name.split(" ")[0]}</div>
                      <input type="number" min={0} max={20} value={inp.opp}
                        onChange={(e) => setMatchInputs((p) => ({ ...p, [match.id]: { ...p[match.id], opp: e.target.value } }))}
                        className="score-input" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={inp.final}
                        onChange={(e) => setMatchInputs((p) => ({ ...p, [match.id]: { ...p[match.id], final: e.target.checked } }))}
                        className="w-4 h-4 accent-geo" />
                      <span className="text-slate-600 font-medium">Resultado final</span>
                    </label>
                    <button onClick={() => saveMatch(match.id)} disabled={saving === match.id || inp.arg === "" || inp.opp === ""} className="btn-primary py-2 px-4 text-sm">
                      {saving === match.id ? "..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : tab === "knockout" ? (
        <div className="space-y-4">
          {KNOCKOUT_MATCHES.map((config) => {
            const inp = knockoutInputs[config.id] ?? { name: "", flag: "", enabled: false, arg: "", opp: "", final: false };
            const isEditing = editing.has(config.id);

            if (inp.final && !isEditing) {
              return (
                <div key={config.id} className="card flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-geo font-bold uppercase tracking-wide mb-0.5">{config.stageLabel}</p>
                    <p className="font-bold text-slate-700">
                      🇦🇷 Argentina <span className="text-geo font-black">{inp.arg} – {inp.opp}</span> {inp.flag} {inp.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Final</span>
                    <button onClick={() => toggleEditing(config.id)} className="text-xs text-slate-400 hover:text-slate-600 underline">Editar</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={config.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-700">{config.stageLabel}</h3>
                    <p className="text-xs text-slate-400">{config.date} · {config.venue}</p>
                    <p className="text-xs text-slate-400 mt-0.5 italic">{config.bracketDescription}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={inp.enabled}
                        onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], enabled: e.target.checked } }))}
                        className="w-5 h-5 accent-geo" />
                      <span className={`text-sm font-bold ${inp.enabled ? "text-emerald-600" : "text-slate-400"}`}>
                        {inp.enabled ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </label>
                    {isEditing && <button onClick={() => toggleEditing(config.id)} className="text-xs text-slate-400 underline">Cancelar</button>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Rival</p>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={inp.flag} placeholder="🏳️ Flag emoji"
                        onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], flag: e.target.value } }))}
                        className="w-20 border border-stone-200 rounded-lg px-2 py-1.5 text-sm text-center" />
                      <input type="text" value={inp.name} placeholder="Nombre del equipo"
                        onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], name: e.target.value } }))}
                        className="flex-1 border border-stone-200 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <input type="text" value={inp.actualTeam} placeholder="ID del equipo (ej: ESP, BRA)"
                      onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], actualTeam: e.target.value } }))}
                      className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm mb-2" />
                    <button onClick={() => saveKnockoutConfig(config.id)} disabled={saving === config.id + "-cfg"} className="btn-primary w-full py-1.5 text-sm">
                      {saving === config.id + "-cfg" ? "..." : "Guardar rival"}
                    </button>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Resultado</p>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="number" min={0} max={20} value={inp.arg} placeholder="ARG"
                        onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], arg: e.target.value } }))}
                        className="score-input !w-14 !h-12 !text-xl" />
                      <span className="font-bold text-slate-300">-</span>
                      <input type="number" min={0} max={20} value={inp.opp} placeholder="RIV"
                        onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], opp: e.target.value } }))}
                        className="score-input !w-14 !h-12 !text-xl" />
                      <label className="flex items-center gap-1 text-xs cursor-pointer ml-1">
                        <input type="checkbox" checked={inp.final}
                          onChange={(e) => setKnockoutInputs((p) => ({ ...p, [config.id]: { ...p[config.id], final: e.target.checked } }))}
                          className="accent-geo" />
                        Final
                      </label>
                    </div>
                    <button onClick={() => saveKnockoutResult(config.id)} disabled={saving === config.id + "-res" || inp.arg === "" || inp.opp === ""} className="btn-primary w-full py-1.5 text-sm">
                      {saving === config.id + "-res" ? "..." : "Guardar resultado"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GROUPS.map((group) => {
            const inp = groupInputs[group.id] ?? { first: "", second: "", final: false };
            const result = groupResults.find((r) => r.group_id === group.id);
            const isEditing = editing.has(group.id);

            if (inp.final && !isEditing) {
              const t = (id: string | null) => group.teams.find((t) => t.id === id);
              const f = t(result?.first_team ?? null);
              const s = t(result?.second_team ?? null);
              const th = t(result?.third_team ?? null);
              return (
                <div key={group.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-700">Grupo {group.id}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Final</span>
                      <button onClick={() => toggleEditing(group.id)} className="text-xs text-slate-400 hover:text-slate-600 underline">Editar</button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    {f && <p className="text-slate-700"><span className="text-slate-400 text-xs w-5 inline-block">1°</span> {f.flag} {f.name}</p>}
                    {s && <p className="text-slate-700"><span className="text-slate-400 text-xs w-5 inline-block">2°</span> {s.flag} {s.name}</p>}
                    {th && <p className="text-slate-500"><span className="text-slate-400 text-xs w-5 inline-block">3°</span> {th.flag} {th.name}</p>}
                  </div>
                </div>
              );
            }

            return (
              <div key={group.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-700">Grupo {group.id}</h3>
                  {isEditing && <button onClick={() => toggleEditing(group.id)} className="text-xs text-slate-400 underline">Cancelar</button>}
                </div>
                <div className="space-y-2 mb-3">
                  {(["first", "second"] as const).map((pos) => (
                    <div key={pos} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 w-5">{pos === "first" ? "1°" : "2°"}</span>
                      <select value={inp[pos]}
                        onChange={(e) => setGroupInputs((p) => ({ ...p, [group.id]: { ...p[group.id], [pos]: e.target.value } }))}
                        className="flex-1 text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:border-geo focus:outline-none">
                        <option value="">— Seleccionar —</option>
                        {group.teams.map((t) => (
                          <option key={t.id} value={t.id} disabled={pos === "first" ? inp.second === t.id : inp.first === t.id}>
                            {t.flag} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={inp.final}
                      onChange={(e) => setGroupInputs((p) => ({ ...p, [group.id]: { ...p[group.id], final: e.target.checked } }))}
                      className="w-4 h-4 accent-geo" />
                    <span className="text-slate-600 text-xs">Final</span>
                  </label>
                  <button onClick={() => saveGroup(group.id)} disabled={saving === group.id || !inp.first || !inp.second} className="btn-primary py-1.5 px-3 text-sm">
                    {saving === group.id ? "..." : "Guardar"}
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
