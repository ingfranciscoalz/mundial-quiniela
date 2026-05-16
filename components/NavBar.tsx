"use client";

import Link from "next/link";
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
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-slate-800"
        >
          <span>🏆</span>
          <span className="hidden sm:inline">Mundial 2026</span>
          <span className="sm:hidden">M26</span>
        </Link>

        <div className="flex items-center gap-1">
          {user &&
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-argentina-blue text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}

          {user && (
            <span className="ml-2 text-sm text-slate-500 hidden sm:block">
              👋 {user.name}
            </span>
          )}

          {!user && (
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-argentina-blue text-white"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
