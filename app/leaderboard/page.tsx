"use client";

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Tabla de posiciones 🏆
          </h1>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">
              Actualizado{" "}
              {lastUpdated.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · se actualiza cada 30s
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="btn-secondary text-sm py-2 px-4"
          disabled={loading}
        >
          {loading ? "..." : "↻ Actualizar"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Cargando ranking...
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">⚽</div>
          <p className="text-slate-500">
            Todavía no hay predicciones. ¡Sé el primero!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {entries.slice(0, 3).map((entry, i) => (
              <div
                key={entry.participant.id}
                className={`card text-center ${
                  i === 0 ? "ring-2 ring-argentina-gold ring-offset-2" : ""
                }`}
              >
                <div className="text-3xl mb-1">{MEDALS[i]}</div>
                <div className="font-bold text-slate-800 truncate">
                  {entry.participant.name}
                </div>
                <div className="text-2xl font-black text-argentina-blue mt-1">
                  {entry.totalPoints} pts
                </div>
              </div>
            ))}
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    Jugador
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">
                    🇦🇷 Partidos
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">
                    🌍 Grupos
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">
                    Exactos
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const storedUser =
                    typeof window !== "undefined"
                      ? localStorage.getItem("mundial_user")
                      : null;
                  const myId = storedUser
                    ? JSON.parse(storedUser).id
                    : null;
                  const isMe = myId === entry.participant.id;

                  return (
                    <tr
                      key={entry.participant.id}
                      className={`border-b border-slate-50 last:border-0 transition-colors ${
                        isMe ? "bg-argentina-blue/5" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-slate-400">
                        {MEDALS[i] ?? `${i + 1}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold text-sm ${
                            isMe ? "text-argentina-blue" : "text-slate-700"
                          }`}
                        >
                          {entry.participant.name}
                          {isMe && (
                            <span className="ml-1.5 text-xs font-normal text-slate-400">
                              (vos)
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-argentina-blue">
                          {entry.totalPoints}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500 hidden sm:table-cell">
                        {entry.matchPoints}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500 hidden sm:table-cell">
                        {entry.groupPoints}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500 hidden md:table-cell">
                        {entry.exactScores > 0 ? `🎯 ${entry.exactScores}` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-4 text-xs text-slate-400 justify-center">
            <span>🎯 Exacto = 3pts</span>
            <span>✅ Resultado = 1pt</span>
            <span>🌍 Clasificado = 1pt</span>
          </div>
        </>
      )}
    </div>
  );
}
