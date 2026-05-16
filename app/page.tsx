"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-geo-bg to-white">
      <div className="w-full max-w-md">

        {/* Header Geotellus */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-5">
            <Image
              src="/geotellus-logo.png"
              alt="Geotellus"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-black text-slate-800 leading-tight">
            Fixture<br />Geotellus
          </h1>
          <p className="text-base font-semibold text-geo uppercase tracking-widest mt-2">
            Mundial 2026
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-2xl">🇦🇷</span>
            <span className="text-slate-500 font-medium">Argentina en el Mundial</span>
            <span className="text-2xl">⚽</span>
          </div>
        </div>

        {/* Login card */}
        <div className="card border-t-4 border-t-geo">
          <h2 className="text-base font-semibold text-slate-600 mb-4 text-center">
            ¿Cuál es tu nombre?
          </h2>
          <form onSubmit={handleEnter} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribí tu nombre..."
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-geo focus:outline-none text-lg transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary w-full text-base"
            >
              {loading ? "Cargando..." : "Entrar al fixture →"}
            </button>
          </form>
        </div>

        {/* Puntos info */}
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs font-medium text-slate-500 leading-tight">
              Marcador exacto
            </div>
            <div className="text-xl font-black text-geo mt-1">3 pts</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs font-medium text-slate-500 leading-tight">
              Resultado correcto
            </div>
            <div className="text-xl font-black text-geo mt-1">1 pt</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-xs font-medium text-slate-500 leading-tight">
              Equipo clasificado
            </div>
            <div className="text-xl font-black text-geo mt-1">1 pt</div>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Fixture Geotellus · Mundial 2026 🇦🇷
        </p>
      </div>
    </div>
  );
}
