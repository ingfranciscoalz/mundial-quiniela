import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiniela Mundial 2026",
  description: "Predecí los partidos de Argentina en el Mundial 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NavBar />
        <main className="min-h-screen pb-16">{children}</main>
      </body>
    </html>
  );
}
