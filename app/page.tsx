"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateParticipant } from "@/lib/db";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const participant = await getOrCreateParticipant(trimmed);
      if (!participant) {
        setError("Hubo un error. Intentá de nuevo.");
        return;
      }
      localStorage.setItem(
        "mundial_user",
        JSON.stringify({ id: participant.id, name: participant.name })
      );
      router.push("/predict");
    } catch {
      setError("Hubo un error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-argentina-blue/10 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            Quiniela Mundial
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-argentina-blue">
            <span>🇦🇷</span>
            <span>Argentina 2026</span>
            <span>⚽</span>
          </div>
          <p className="mt-3 text-slate-500 text-sm">
            Predecí los partidos, sumate al ranking de la oficina
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 text-center">
            ¿Cuál es tu nombre?
          </h2>
          <form onSubmit={handleEnter} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribí tu nombre..."
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-argentina-blue focus:outline-none text-lg transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? "Cargando..." : "Entrar al fixture →"}
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs font-medium text-slate-600">
              Resultado exacto
            </div>
            <div className="text-lg font-black text-argentina-blue">3 pts</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs font-medium text-slate-600">
              Resultado correcto
            </div>
            <div className="text-lg font-black text-argentina-blue">1 pt</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-xs font-medium text-slate-600">
              Clasificado de grupo
            </div>
            <div className="text-lg font-black text-argentina-blue">1 pt</div>
          </div>
        </div>
      </div>
    </div>
  );
}
