"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getParticipants, getOrCreateParticipant } from "@/lib/db";
import type { Participant } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getParticipants();
        setParticipants(data);
      } catch (err) {
        console.error(err);
        setError("Error de conexión. Verificá las variables de entorno en Vercel.");
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  function selectParticipant(p: Participant) {
    localStorage.setItem("mundial_user", JSON.stringify({ id: p.id, name: p.name }));
    router.push("/predict");
  }

  async function handleAddNew(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAddingNew(true);
    setError("");
    try {
      const participant = await getOrCreateParticipant(trimmed);
      if (!participant) {
        setError("No se pudo guardar el nombre. Intentá de nuevo.");
        return;
      }
      localStorage.setItem("mundial_user", JSON.stringify({ id: participant.id, name: participant.name }));
      router.push("/predict");
    } catch (err) {
      console.error(err);
      setError("Error de conexión con Supabase.");
    } finally {
      setAddingNew(false);
    }
  }

  return (
    <div
      className="page-bg flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundImage: "url('/bg1.jpg')" }}
    >
      <div className="page-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10" />

      <div className="relative z-20 w-full max-w-lg">
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
            Prode<br />
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

        {/* Lista de participantes */}
        <div className="glass-card mb-4">
          <h2 className="text-base font-semibold text-white/90 mb-4 text-center">
            ¿Quién sos?
          </h2>

          {loadingList ? (
            <div className="text-center text-white/50 py-4 animate-pulse">
              Cargando participantes...
            </div>
          ) : participants.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectParticipant(p)}
                  className="px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm hover:bg-white/30 hover:border-white/50 transition-all text-left truncate"
                >
                  👤 {p.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm text-center mb-4 py-2">
              Todavía no hay participantes. ¡Sé el primero!
            </p>
          )}

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/30 text-white/70 hover:border-white/50 hover:text-white transition-all text-sm font-medium"
            >
              + Agregar mi nombre
            </button>
          ) : (
            <form onSubmit={handleAddNew} className="space-y-2 mt-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Escribí tu nombre..."
                maxLength={40}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/50 focus:border-white/60 focus:outline-none text-base transition-colors"
              />
              {error && (
                <p className="text-red-300 text-xs text-center">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewName(""); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || addingNew}
                  className="btn-primary flex-1 text-sm"
                >
                  {addingNew ? "Creando..." : "Entrar →"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Puntos */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "🎯", label: "Marcador exacto", pts: "3 pts" },
            { icon: "✅", label: "Resultado correcto", pts: "1 pt" },
            { icon: "🌍", label: "Equipo clasificado", pts: "1 pt" },
          ].map((item) => (
            <div
              key={item.icon}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-white/70 leading-tight">{item.label}</div>
              <div className="text-lg font-black text-geo-light mt-1">{item.pts}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          Prode Geotellus · Mundial 2026 🇦🇷
        </p>
      </div>
    </div>
  );
}
