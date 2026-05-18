"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LocalUser, GroupPrediction } from "@/types";
import { getGroupPredictions, getBracketPredictions, upsertBracketPrediction } from "@/lib/db";
import { buildBracketState } from "@/lib/bracketData";
import BracketTree from "@/components/BracketTree";

export default function BracketPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [groupPreds, setGroupPreds] = useState<GroupPrediction[]>([]);
  const [predMap, setPredMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mundial_user");
    if (!stored) { router.replace("/"); return; }
    const u: LocalUser = JSON.parse(stored);
    setUser(u);
    load(u.id);
  }, [router]);

  async function load(participantId: string) {
    setLoading(true);
    const [gp, bp] = await Promise.all([
      getGroupPredictions(participantId),
      getBracketPredictions(participantId),
    ]);
    setGroupPreds(gp);
    setPredMap(Object.fromEntries(bp.map((p) => [p.match_id, p.winner_id])));
    setLoading(false);
  }

  async function handlePick(matchId: string, winnerId: string) {
    if (!user || saving) return;
    setSaving(true);
    await upsertBracketPrediction(user.id, matchId, winnerId);
    setSaving(false);
    // Update local state immediately
    setPredMap((prev) => ({ ...prev, [matchId]: winnerId }));
  }

  if (!user) return null;

  const { teams, winners } = buildBracketState(groupPreds, predMap);

  const totalPicks = Object.keys(predMap).length;
  const groupsCompleted = groupPreds.length;

  return (
    <div
      className="page-bg"
      style={{ backgroundImage: "url('/bg2.jpg')", backgroundAttachment: "fixed" }}
    >
      <div className="page-overlay" />
      <div className="page-content max-w-full px-4 py-6">

        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-white drop-shadow">
                Cuadro Eliminatorio 🏆
              </h1>
              <p className="text-white/60 text-sm mt-0.5">{user.name}</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/15 text-center">
                <div className="text-lg font-black text-white">{totalPicks}</div>
                <div className="text-xs text-white/60">predicciones</div>
              </div>
              <div className={`bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border text-center ${
                groupsCompleted < 11 ? "border-amber-400/40" : "border-white/15"
              }`}>
                <div className={`text-lg font-black ${groupsCompleted < 11 ? "text-amber-300" : "text-white"}`}>
                  {groupsCompleted}/11
                </div>
                <div className="text-xs text-white/60">grupos</div>
              </div>
            </div>
          </div>

          {groupsCompleted < 11 && (
            <div className="mt-3 bg-amber-400/15 border border-amber-400/30 rounded-xl px-4 py-2.5">
              <p className="text-amber-200 text-sm">
                ⚠️ Completá los <strong>{11 - groupsCompleted} grupos pendientes</strong> en la pestaña "Grupos" para que los equipos aparezcan en el cuadro.
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/60 animate-pulse">
            Cargando cuadro...
          </div>
        ) : (
          <BracketTree
            teams={teams}
            winners={winners}
            predictions={predMap}
            onPick={handlePick}
          />
        )}

        {saving && (
          <div className="fixed bottom-4 right-4 bg-geo text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
            Guardando...
          </div>
        )}
      </div>
    </div>
  );
}
