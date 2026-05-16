"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/db";
import type { LeaderboardEntry } from "@/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    const data = await getLeaderboard();
    setEntries(data);
    setLastUpdated(new Date());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="page-bg"
      style={{ backgroundImage: "url('/bg3.jpg')", backgroundAttachment: "fixed" }}
    >
      <div className="page-overlay" />
      <div className="page-content max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white drop-shadow">
              Tabla de posiciones 🏆
            </h1>
            {lastUpdated && (
              <p className="text-xs text-white/50 mt-1">
                Actualizado {lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} · se refresca cada 30s
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20 transition-colors"
          >
            {loading ? "..." : "↻ Actualizar"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/50 animate-pulse">
            Cargando ranking...
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-card text-center py-16">
            <div className="text-5xl mb-3">⚽</div>
            <p className="text-white/70 font-medium">
              Todavía no hay predicciones. ¡Sé el primero!
            </p>
          </div>
        ) : (
          <>
            {/* Podio top 3 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {entries.slice(0, 3).map((entry, i) => (
                <div
                  key={entry.participant.id}
                  className={`glass-card text-center py-5 ${i === 0 ? "border-t-4 border-t-geo" : ""}`}
                >
                  <div className="text-3xl mb-2">{MEDALS[i]}</div>
                  <div className="font-bold text-white truncate text-sm">
                    {entry.participant.name}
                  </div>
                  <div className="text-2xl font-black text-geo-light mt-1.5">
                    {entry.totalPoints}
                    <span className="text-sm font-semibold text-white/50 ml-1">pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase">Jugador</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase">Total</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden sm:table-cell">🇦🇷 Partidos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden sm:table-cell">🌍 Grupos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden md:table-cell">🎯 Exactos</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => {
                    const storedUser = typeof window !== "undefined" ? localStorage.getItem("mundial_user") : null;
                    const myId = storedUser ? JSON.parse(storedUser).id : null;
                    const isMe = myId === entry.participant.id;

                    return (
                      <tr
                        key={entry.participant.id}
                        className={`border-b border-white/5 last:border-0 transition-colors ${
                          isMe ? "bg-geo/20" : "hover:bg-white/5"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-bold text-white/40">
                          {MEDALS[i] ?? `${i + 1}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold text-sm ${isMe ? "text-geo-light" : "text-white"}`}>
                            {entry.participant.name}
                            {isMe && <span className="ml-1.5 text-xs font-normal text-white/40">(vos)</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-black text-geo-light text-base">{entry.totalPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-white/60 hidden sm:table-cell">{entry.matchPoints}</td>
                        <td className="px-4 py-3 text-right text-sm text-white/60 hidden sm:table-cell">{entry.groupPoints}</td>
                        <td className="px-4 py-3 text-right text-sm text-white/60 hidden md:table-cell">
                          {entry.exactScores > 0 ? `🎯 ${entry.exactScores}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-4 text-xs text-white/40 justify-center">
              <span>🎯 Exacto = 3pts</span>
              <span>✅ Resultado = 1pt</span>
              <span>🌍 Clasificado = 1pt</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
