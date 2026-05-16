"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LocalUser } from "@/types";

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mundial_user");
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const links = [
    { href: "/predict", label: "Mis Predicciones" },
    { href: "/leaderboard", label: "Tabla" },
  ];

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/geotellus-logo.png"
            alt="Geotellus"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="font-bold text-slate-800 hidden sm:inline">
            Fixture Geotellus
          </span>
          <span className="text-stone-300 hidden sm:inline">·</span>
          <span className="font-semibold text-geo hidden sm:inline text-sm">
            Mundial 2026
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {user &&
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === l.href
                    ? "bg-geo text-white font-semibold"
                    : "text-slate-600 hover:bg-stone-100 font-medium"
                }`}
              >
                {l.label}
              </Link>
            ))}

          {user && (
            <span className="ml-2 text-sm text-slate-400 hidden sm:block border-l border-stone-100 pl-3">
              👋 {user.name}
            </span>
          )}

          {!user && (
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-geo text-white"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
