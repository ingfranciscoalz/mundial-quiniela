"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LocalUser, ScorePrediction, GroupPrediction, MatchResult, GroupResult } from "@/types";
import { ARGENTINA_MATCHES, OTHER_GROUPS } from "@/lib/worldcupData";
import { getScorePredictions, getGroupPredictions, getMatchResults, getGroupResults } from "@/lib/db";
import ArgentinaMatchCard from "@/components/ArgentinaMatchCard";
import GroupPredictionCard from "@/components/GroupPredictionCard";

type Tab = "argentina" | "grupos";

export default function PredictPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [tab, setTab] = useState<Tab>("argentina");
  const [loading, setLoading] = useState(true);

  const [scorePreds, setScorePreds] = useState<ScorePrediction[]>([]);
  const [groupPreds, setGroupPreds] = useState<GroupPrediction[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("mundial_user");
    if (!stored) {
      router.replace("/");
      return;
    }
    const u: LocalUser = JSON.parse(stored);
    setUser(u);
    loadData(u.id);
  }, [router]);

  async function loadData(participantId: string) {
    setLoading(true);
    const [sp, gp, mr, gr] = await Promise.all([
      getScorePredictions(participantId),
      getGroupPredictions(participantId),
      getMatchResults(),
      getGroupResults(),
    ]);
    setScorePreds(sp);
    setGroupPreds(gp);
    setMatchResults(mr);
    setGroupResults(gr);
    setLoading(false);
  }

  if (!user) return null;

  const totalMatches = ARGENTINA_MATCHES.length;
  const filledMatches = ARGENTINA_MATCHES.filter((m) =>
    scorePreds.some((p) => p.match_id === m.id)
  ).length;
  const filledGroups = OTHER_GROUPS.filter((g) =>
    groupPreds.some((p) => p.group_id === g.id)
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">
          Tus predicciones, {user.name} 🎯
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Argentina: {filledMatches}/{totalMatches} partidos ·{" "}
          {filledGroups}/{OTHER_GROUPS.length} grupos
        </p>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("argentina")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "argentina"
              ? "bg-white shadow text-argentina-blue"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🇦🇷 Argentina
        </button>
        <button
          onClick={() => setTab("grupos")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "grupos"
              ? "bg-white shadow text-argentina-blue"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🌍 Otros Grupos
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Cargando...
        </div>
      ) : tab === "argentina" ? (
        <div className="space-y-4">
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
          <p className="text-center text-xs text-slate-400 pt-2">
            Las predicciones de los partidos eliminatorios se habilitarán
            cuando Argentina clasifique.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            Para cada grupo, seleccioná el equipo que creés que termina{" "}
            <strong>1°</strong> y <strong>2°</strong> (1 punto por cada
            acierto).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OTHER_GROUPS.map((group) => (
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
  );
}
