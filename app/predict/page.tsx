"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  LocalUser,
  ScorePrediction,
  GroupPrediction,
  MatchResult,
  GroupResult,
  KnockoutMatchDB,
} from "@/types";
import { ARGENTINA_MATCHES, GROUPS, KNOCKOUT_MATCHES } from "@/lib/worldcupData";
import {
  getScorePredictions,
  getGroupPredictions,
  getMatchResults,
  getGroupResults,
  getKnockoutMatches,
} from "@/lib/db";
import ArgentinaMatchCard from "@/components/ArgentinaMatchCard";
import GroupPredictionCard from "@/components/GroupPredictionCard";
import KnockoutMatchCard from "@/components/KnockoutMatchCard";

type Tab = "argentina" | "eliminatorias" | "grupos";

export default function PredictPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [tab, setTab] = useState<Tab>("argentina");
  const [loading, setLoading] = useState(true);

  const [scorePreds, setScorePreds] = useState<ScorePrediction[]>([]);
  const [groupPreds, setGroupPreds] = useState<GroupPrediction[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatchDB[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("mundial_user");
    if (!stored) { router.replace("/"); return; }
    const u: LocalUser = JSON.parse(stored);
    setUser(u);
    loadData(u.id);
  }, [router]);

  async function loadData(participantId: string) {
    setLoading(true);
    const [sp, gp, mr, gr, km] = await Promise.all([
      getScorePredictions(participantId),
      getGroupPredictions(participantId),
      getMatchResults(),
      getGroupResults(),
      getKnockoutMatches(),
    ]);
    setScorePreds(sp);
    setGroupPreds(gp);
    setMatchResults(mr);
    setGroupResults(gr);
    setKnockoutMatches(km);
    setLoading(false);
  }

  if (!user) return null;

  const filledMatches = ARGENTINA_MATCHES.filter((m) =>
    scorePreds.some((p) => p.match_id === m.id)
  ).length;
  const filledKnockout = KNOCKOUT_MATCHES.filter((m) =>
    scorePreds.some((p) => p.match_id === m.id)
  ).length;
  const enabledKnockout = knockoutMatches.filter((m) => m.is_enabled).length;
  const filledGroups = GROUPS.filter((g) =>
    groupPreds.some((p) => p.group_id === g.id)
  ).length;

  const tabs = [
    { id: "argentina" as Tab, label: "🇦🇷 Grupos", badge: `${filledMatches}/${ARGENTINA_MATCHES.length}` },
    { id: "eliminatorias" as Tab, label: "⚡ Eliminatorias", badge: enabledKnockout > 0 ? `${filledKnockout}/${enabledKnockout}` : `${KNOCKOUT_MATCHES.length} partidos` },
    { id: "grupos" as Tab, label: "🌍 Grupos", badge: `${filledGroups}/${GROUPS.length}` },
  ];

  return (
    <div
      className="page-bg"
      style={{ backgroundImage: "url('/bg2.jpg')", backgroundAttachment: "fixed" }}
    >
      <div className="page-overlay" />
      <div className="page-content max-w-4xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white drop-shadow">
            Tus predicciones 🎯
          </h1>
          <p className="text-white/60 text-sm mt-1">{user.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-black/30 backdrop-blur-sm p-1 rounded-xl border border-white/10 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "bg-white shadow text-geo font-semibold"
                  : "text-white/70 hover:text-white font-medium"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? "bg-geo/10 text-geo" : "bg-white/10 text-white/50"
              }`}>
                {t.badge}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/60 animate-pulse">
            Cargando...
          </div>
        ) : tab === "argentina" ? (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 mb-2">
              <p className="text-white/70 text-sm">
                ⚽ Predecí el marcador exacto de los partidos de Argentina en la fase de grupos.
                <span className="text-white/50 ml-1">(3 pts exacto · 1 pt resultado)</span>
              </p>
            </div>
            {ARGENTINA_MATCHES.map((match) => (
              <ArgentinaMatchCard
                key={match.id}
                match={match}
                participantId={user.id}
                prediction={scorePreds.find((p) => p.match_id === match.id)}
                result={matchResults.find((r) => r.match_id === match.id)}
                onSaved={() => loadData(user.id)}
              />
            ))}
          </div>
        ) : tab === "eliminatorias" ? (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 mb-2">
              <p className="text-white/70 text-sm">
                ⚡ El rival de cada partido se calcula <strong className="text-white">automáticamente</strong> según tus predicciones anteriores.
                Los partidos se habilitan a medida que Argentina avanza.
              </p>
            </div>
            {KNOCKOUT_MATCHES.map((config) => (
              <KnockoutMatchCard
                key={config.id}
                config={config}
                dbMatch={knockoutMatches.find((m) => m.match_id === config.id)}
                prediction={scorePreds.find((p) => p.match_id === config.id)}
                participantId={user.id}
                scorePreds={scorePreds}
                groupPreds={groupPreds}
                onSaved={() => loadData(user.id)}
              />
            ))}
          </div>
        ) : (
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 mb-4">
              <p className="text-white/70 text-sm">
                Elegí el equipo que termina <strong className="text-white">1°</strong>,{" "}
                <strong className="text-white">2°</strong> y <strong className="text-white">3°</strong> en cada grupo.
                1 punto por cada acierto. El 3° se usa para completar el cuadro.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GROUPS.map((group) => (
                <GroupPredictionCard
                  key={group.id}
                  group={group}
                  participantId={user.id}
                  prediction={groupPreds.find((p) => p.group_id === group.id)}
                  result={groupResults.find((r) => r.group_id === group.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
