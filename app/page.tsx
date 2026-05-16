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
        setError("No se pudo guardar tu nombre. Verificá que el proyecto de Supabase esté activo.");
        return;
      }
      localStorage.setItem(
        "mundial_user",
        JSON.stringify({ id: participant.id, name: participant.name })
      );
      router.push("/predict");
    } catch (err) {
      console.error("Login error:", err);
      setError("Error de conexión con Supabase. Verificá las variables de entorno en Vercel y que el proyecto no esté pausado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="page-bg flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: "url('/bg1.jpg')" }}
    >
      {/* Overlay oscuro */}
      <div className="page-overlay" />

      {/* Degradado inferior para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10" />

      <div className="relative z-20 w-full max-w-md">

        {/* Logo + título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
              <Image
                src="/geotellus-logo.png"
                alt="Geotellus"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight drop-shadow-lg">
            Fixture<br />
            <span className="text-geo-light">Geotellus</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-2xl">🇦🇷</span>
            <span className="text-white/80 font-semibold tracking-wide">Mundial 2026</span>
            <span className="text-2xl">⚽</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-yellow-400 text-lg">★★★</span>
          </div>
        </div>

        {/* Card glassmorphism */}
        <div className="glass-card">
          <h2 className="text-base font-semibold text-white/90 mb-4 text-center">
            ¿Cuál es tu nombre?
          </h2>
          <form onSubmit={handleEnter} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribí tu nombre..."
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/50 focus:border-white/60 focus:outline-none text-lg transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
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

        {/* Puntos */}
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "🎯", label: "Marcador exacto", pts: "3 pts" },
            { icon: "✅", label: "Resultado correcto", pts: "1 pt" },
            { icon: "🌍", label: "Equipo clasificado", pts: "1 pt" },
          ].map((item) => (
            <div
              key={item.pts + item.icon}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-white/70 leading-tight">{item.label}</div>
              <div className="text-lg font-black text-geo-light mt-1">{item.pts}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          Fixture Geotellus · Mundial 2026 🇦🇷
        </p>
      </div>
    </div>
  );
}
