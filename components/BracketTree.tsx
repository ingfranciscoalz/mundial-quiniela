"use client";

import { BRACKET, ROUND_LABELS, type BracketRound, type ResolvedTeam } from "@/lib/bracketData";

// Layout constants
const SLOT = 80;      // height per R32 slot (px)
const CARD_H = 60;    // match card height (px)
const CARD_W = 152;   // match card width (px)
const CONN_W = 24;    // connector gap width (px)
const TOTAL_H = 8 * SLOT; // 640px total bracket height

// Vertical center of match N in a given round (within TOTAL_H)
function getCenter(round: BracketRound, n: number): number {
  const U = SLOT;
  switch (round) {
    case "r32":   return n * U + U / 2;
    case "r16":   return (2 * n + 1) * U;
    case "qf":    return (4 * n + 2) * U;
    case "sf":    return 4 * U;
    case "final": return 4 * U;
  }
}

// SVG lines connecting two adjacent rounds
function ConnectorLines({
  fromRound,
  toCount,
  dir,
}: {
  fromRound: BracketRound;
  toCount: number; // number of matches in the TO round
  dir: "ltr" | "rtl";
}) {
  const mid = CONN_W / 2;
  const stroke = "rgba(255,255,255,0.3)";
  const sw = 1.5;
  const lines: React.ReactElement[] = [];

  // SF→Final is a simple horizontal pass-through
  if (fromRound === "sf") {
    const cy = getCenter("sf", 0);
    lines.push(<line key="sf" x1="0" y1={cy} x2={CONN_W} y2={cy} stroke={stroke} strokeWidth={sw} />);
  } else {
    for (let N = 0; N < toCount; N++) {
      const cTop = getCenter(fromRound, 2 * N);
      const cBot = getCenter(fromRound, 2 * N + 1);
      const cMid = (cTop + cBot) / 2;

      if (dir === "ltr") {
        lines.push(
          <line key={`${N}a`} x1="0"      y1={cTop} x2={mid}    y2={cTop} stroke={stroke} strokeWidth={sw} />,
          <line key={`${N}b`} x1="0"      y1={cBot} x2={mid}    y2={cBot} stroke={stroke} strokeWidth={sw} />,
          <line key={`${N}c`} x1={mid}    y1={cTop} x2={mid}    y2={cBot} stroke={stroke} strokeWidth={sw} />,
          <line key={`${N}d`} x1={mid}    y1={cMid} x2={CONN_W} y2={cMid} stroke={stroke} strokeWidth={sw} />,
        );
      } else {
        lines.push(
          <line key={`${N}a`} x1={CONN_W} y1={cTop} x2={mid}   y2={cTop} stroke={stroke} strokeWidth={sw} />,
          <line key={`${N}b`} x1={CONN_W} y1={cBot} x2={mid}   y2={cBot} stroke={stroke} strokeWidth={sw} />,
          <line key={`${N}c`} x1={mid}    y1={cTop} x2={mid}   y2={cBot} stroke={stroke} strokeWidth={sw} />,
          <line key={`${N}d`} x1={mid}    y1={cMid} x2="0"     y2={cMid} stroke={stroke} strokeWidth={sw} />,
        );
      }
    }
  }

  return (
    <svg
      width={CONN_W}
      height={TOTAL_H}
      style={{ flexShrink: 0, display: "block" }}
    >
      {lines}
    </svg>
  );
}

// Compact match card for bracket
function BracketCell({
  matchId,
  label,
  teamA,
  teamB,
  winnerId,
  onPick,
}: {
  matchId: string;
  label: string;
  teamA: ResolvedTeam | null;
  teamB: ResolvedTeam | null;
  winnerId: string | null;
  onPick: (matchId: string, winnerId: string) => void;
}) {
  const canPick = !!teamA && !!teamB && teamA.id !== "__third__" && teamB.id !== "__third__";

  return (
    <div
      style={{ width: CARD_W, height: CARD_H }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden flex flex-col"
      title={label}
    >
      {([teamA, teamB] as const).map((team, i) => {
        const isWinner = !!winnerId && team?.id === winnerId;
        const isPicked = !!winnerId && team?.id !== winnerId;
        return (
          <button
            key={i}
            onClick={() => canPick && team && onPick(matchId, team.id)}
            disabled={!canPick || !team}
            className={`flex-1 flex items-center gap-1 px-2 transition-all ${
              isWinner
                ? "bg-geo text-white font-bold"
                : isPicked
                ? "text-white/25 line-through"
                : team && canPick
                ? "text-white hover:bg-white/20 cursor-pointer"
                : "text-white/35"
            }`}
          >
            <span className="text-xs leading-none shrink-0">{team?.flag ?? "🏳"}</span>
            <span className="text-[11px] truncate leading-tight">{team?.name ?? "—"}</span>
          </button>
        );
      })}
    </div>
  );
}

// A column of matches for a given round + side
function BracketColumn({
  round,
  side,
  teams,
  winners,
  predictions,
  onPick,
}: {
  round: BracketRound;
  side: "left" | "right" | "center";
  teams: Record<string, [ResolvedTeam | null, ResolvedTeam | null]>;
  winners: Record<string, ResolvedTeam | null>;
  predictions: Record<string, string>;
  onPick: (matchId: string, winnerId: string) => void;
}) {
  const matches = BRACKET.filter((m) => m.round === round && m.side === side);
  const depth = { r32: 0, r16: 1, qf: 2, sf: 3, final: 3 }[round];
  const blockH = Math.pow(2, depth) * SLOT;
  const padV = (blockH - CARD_H) / 2;

  return (
    <div style={{ height: TOTAL_H, width: CARD_W, flexShrink: 0 }}>
      {matches.map((m) => {
        const [teamA, teamB] = teams[m.id] ?? [null, null];
        const winnerId = predictions[m.id] ?? null;
        return (
          <div key={m.id} style={{ height: blockH, paddingTop: padV, paddingBottom: padV }}>
            <BracketCell
              matchId={m.id}
              label={m.label}
              teamA={teamA}
              teamB={teamB}
              winnerId={winnerId}
              onPick={onPick}
            />
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  teams: Record<string, [ResolvedTeam | null, ResolvedTeam | null]>;
  winners: Record<string, ResolvedTeam | null>;
  predictions: Record<string, string>;
  onPick: (matchId: string, winnerId: string) => void;
}

export default function BracketTree({ teams, winners, predictions, onPick }: Props) {
  const champion = winners["FINAL"];

  return (
    <div className="space-y-4">
      {/* Round labels */}
      <div className="flex items-center justify-center gap-1 text-white/70 text-xs font-semibold">
        {(["r32", "r16", "qf", "sf"] as BracketRound[]).map((r) => (
          <span key={r} style={{ width: CARD_W + CONN_W, textAlign: "center" }} className="shrink-0">
            {ROUND_LABELS[r]}
          </span>
        ))}
        <span style={{ width: CARD_W, textAlign: "center" }} className="shrink-0 text-yellow-300 font-black">
          🏆 {ROUND_LABELS.final}
        </span>
        {(["sf", "qf", "r16", "r32"] as BracketRound[]).map((r) => (
          <span key={r + "r"} style={{ width: CARD_W + CONN_W, textAlign: "center" }} className="shrink-0">
            {ROUND_LABELS[r]}
          </span>
        ))}
      </div>

      {/* Bracket tree */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start" style={{ height: TOTAL_H, width: "fit-content" }}>
          {/* LEFT SIDE: R32 → R16 → QF → SF */}
          <BracketColumn round="r32" side="left" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="r32" toCount={4} dir="ltr" />
          <BracketColumn round="r16" side="left" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="r16" toCount={2} dir="ltr" />
          <BracketColumn round="qf" side="left" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="qf" toCount={1} dir="ltr" />
          <BracketColumn round="sf" side="left" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="sf" toCount={1} dir="ltr" />

          {/* FINAL */}
          <BracketColumn round="final" side="center" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />

          {/* RIGHT SIDE: SF → QF → R16 → R32 */}
          <ConnectorLines fromRound="sf" toCount={1} dir="ltr" />
          <BracketColumn round="sf" side="right" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="qf" toCount={1} dir="rtl" />
          <BracketColumn round="qf" side="right" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="r16" toCount={2} dir="rtl" />
          <BracketColumn round="r16" side="right" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
          <ConnectorLines fromRound="r32" toCount={4} dir="rtl" />
          <BracketColumn round="r32" side="right" teams={teams} winners={winners} predictions={predictions} onPick={onPick} />
        </div>
      </div>

      {/* Champion banner */}
      {champion && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-3 bg-yellow-400/20 border border-yellow-400/40 backdrop-blur-sm rounded-2xl px-6 py-3">
            <span className="text-3xl">{champion.flag}</span>
            <div>
              <div className="text-xs text-yellow-300 font-semibold uppercase tracking-wide">Tu campeón</div>
              <div className="text-lg font-black text-white">{champion.name}</div>
            </div>
            <span className="text-3xl">🏆</span>
          </div>
        </div>
      )}

      <p className="text-white/40 text-xs text-center">
        Hacé click en un equipo para predecir que avanza. El rival se completa automáticamente con tus predicciones de grupos.
      </p>
    </div>
  );
}
