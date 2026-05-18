import type { GroupPrediction } from "@/types";
import { GROUPS } from "./worldcupData";

export type TeamSource =
  | { type: "group"; group: string; pos: "first" | "second" | "third" }
  | { type: "match"; matchId: string };

export type BracketRound = "r32" | "r16" | "qf" | "sf" | "final";
export type BracketSide = "left" | "right" | "center";

export interface BracketMatch {
  id: string;
  round: BracketRound;
  side: BracketSide;
  sideIndex: number;
  teamA: TeamSource;
  teamB: TeamSource;
  label: string;
}

export interface ResolvedTeam {
  id: string;
  name: string;
  flag: string;
}

export const BRACKET: BracketMatch[] = [
  // LEFT R32 — Grupos A/B/C/D/E/F/G/I
  { id: "R32-L1", round: "r32", side: "left",  sideIndex: 0, label: "1°A vs 2°B", teamA: { type: "group", group: "A", pos: "first"  }, teamB: { type: "group", group: "B", pos: "second" } },
  { id: "R32-L2", round: "r32", side: "left",  sideIndex: 1, label: "1°C vs 2°D", teamA: { type: "group", group: "C", pos: "first"  }, teamB: { type: "group", group: "D", pos: "second" } },
  { id: "R32-L3", round: "r32", side: "left",  sideIndex: 2, label: "1°B vs 2°A", teamA: { type: "group", group: "B", pos: "first"  }, teamB: { type: "group", group: "A", pos: "second" } },
  { id: "R32-L4", round: "r32", side: "left",  sideIndex: 3, label: "1°D vs 2°C", teamA: { type: "group", group: "D", pos: "first"  }, teamB: { type: "group", group: "C", pos: "second" } },
  { id: "R32-L5", round: "r32", side: "left",  sideIndex: 4, label: "1°E vs 2°F", teamA: { type: "group", group: "E", pos: "first"  }, teamB: { type: "group", group: "F", pos: "second" } },
  { id: "R32-L6", round: "r32", side: "left",  sideIndex: 5, label: "1°G vs 2°I", teamA: { type: "group", group: "G", pos: "first"  }, teamB: { type: "group", group: "I", pos: "second" } },
  { id: "R32-L7", round: "r32", side: "left",  sideIndex: 6, label: "1°F vs 2°E", teamA: { type: "group", group: "F", pos: "first"  }, teamB: { type: "group", group: "E", pos: "second" } },
  { id: "R32-L8", round: "r32", side: "left",  sideIndex: 7, label: "1°I vs 2°G", teamA: { type: "group", group: "I", pos: "first"  }, teamB: { type: "group", group: "G", pos: "second" } },

  // RIGHT R32 — Grupos H/J/K/L + mejores 3ros 🇦🇷
  { id: "R32-R1", round: "r32", side: "right", sideIndex: 0, label: "1°J vs 2°H 🇦🇷", teamA: { type: "group", group: "J", pos: "first"  }, teamB: { type: "group", group: "H", pos: "second" } },
  { id: "R32-R2", round: "r32", side: "right", sideIndex: 1, label: "1°K vs 2°L",    teamA: { type: "group", group: "K", pos: "first"  }, teamB: { type: "group", group: "L", pos: "second" } },
  { id: "R32-R3", round: "r32", side: "right", sideIndex: 2, label: "1°H vs 2°J 🇦🇷", teamA: { type: "group", group: "H", pos: "first"  }, teamB: { type: "group", group: "J", pos: "second" } },
  { id: "R32-R4", round: "r32", side: "right", sideIndex: 3, label: "1°L vs 2°K",    teamA: { type: "group", group: "L", pos: "first"  }, teamB: { type: "group", group: "K", pos: "second" } },
  { id: "R32-R5", round: "r32", side: "right", sideIndex: 4, label: "3°A vs 3°B", teamA: { type: "group", group: "A", pos: "third" }, teamB: { type: "group", group: "B", pos: "third" } },
  { id: "R32-R6", round: "r32", side: "right", sideIndex: 5, label: "3°C vs 3°D", teamA: { type: "group", group: "C", pos: "third" }, teamB: { type: "group", group: "D", pos: "third" } },
  { id: "R32-R7", round: "r32", side: "right", sideIndex: 6, label: "3°E vs 3°F", teamA: { type: "group", group: "E", pos: "third" }, teamB: { type: "group", group: "F", pos: "third" } },
  { id: "R32-R8", round: "r32", side: "right", sideIndex: 7, label: "3°G vs 3°I", teamA: { type: "group", group: "G", pos: "third" }, teamB: { type: "group", group: "I", pos: "third" } },

  // LEFT R16
  { id: "R16-L1", round: "r16", side: "left",  sideIndex: 0, label: "Octavos", teamA: { type: "match", matchId: "R32-L1" }, teamB: { type: "match", matchId: "R32-L2" } },
  { id: "R16-L2", round: "r16", side: "left",  sideIndex: 1, label: "Octavos", teamA: { type: "match", matchId: "R32-L3" }, teamB: { type: "match", matchId: "R32-L4" } },
  { id: "R16-L3", round: "r16", side: "left",  sideIndex: 2, label: "Octavos", teamA: { type: "match", matchId: "R32-L5" }, teamB: { type: "match", matchId: "R32-L6" } },
  { id: "R16-L4", round: "r16", side: "left",  sideIndex: 3, label: "Octavos", teamA: { type: "match", matchId: "R32-L7" }, teamB: { type: "match", matchId: "R32-L8" } },

  // RIGHT R16
  { id: "R16-R1", round: "r16", side: "right", sideIndex: 0, label: "Octavos", teamA: { type: "match", matchId: "R32-R1" }, teamB: { type: "match", matchId: "R32-R2" } },
  { id: "R16-R2", round: "r16", side: "right", sideIndex: 1, label: "Octavos", teamA: { type: "match", matchId: "R32-R3" }, teamB: { type: "match", matchId: "R32-R4" } },
  { id: "R16-R3", round: "r16", side: "right", sideIndex: 2, label: "Octavos", teamA: { type: "match", matchId: "R32-R5" }, teamB: { type: "match", matchId: "R32-R6" } },
  { id: "R16-R4", round: "r16", side: "right", sideIndex: 3, label: "Octavos", teamA: { type: "match", matchId: "R32-R7" }, teamB: { type: "match", matchId: "R32-R8" } },

  // LEFT QF
  { id: "QF-L1", round: "qf", side: "left",  sideIndex: 0, label: "Cuartos", teamA: { type: "match", matchId: "R16-L1" }, teamB: { type: "match", matchId: "R16-L2" } },
  { id: "QF-L2", round: "qf", side: "left",  sideIndex: 1, label: "Cuartos", teamA: { type: "match", matchId: "R16-L3" }, teamB: { type: "match", matchId: "R16-L4" } },

  // RIGHT QF
  { id: "QF-R1", round: "qf", side: "right", sideIndex: 0, label: "Cuartos", teamA: { type: "match", matchId: "R16-R1" }, teamB: { type: "match", matchId: "R16-R2" } },
  { id: "QF-R2", round: "qf", side: "right", sideIndex: 1, label: "Cuartos", teamA: { type: "match", matchId: "R16-R3" }, teamB: { type: "match", matchId: "R16-R4" } },

  // SF
  { id: "SF-L1", round: "sf", side: "left",  sideIndex: 0, label: "Semifinal", teamA: { type: "match", matchId: "QF-L1" }, teamB: { type: "match", matchId: "QF-L2" } },
  { id: "SF-R1", round: "sf", side: "right", sideIndex: 0, label: "Semifinal", teamA: { type: "match", matchId: "QF-R1" }, teamB: { type: "match", matchId: "QF-R2" } },

  // FINAL
  { id: "FINAL", round: "final", side: "center", sideIndex: 0, label: "Final 🏆", teamA: { type: "match", matchId: "SF-L1" }, teamB: { type: "match", matchId: "SF-R1" } },
];

export function resolveTeamSource(
  source: TeamSource,
  groupPreds: GroupPrediction[],
  bracketWinners: Record<string, ResolvedTeam | null>
): ResolvedTeam | null {
  if (source.type === "group") {
    const pred = groupPreds.find((p) => p.group_id === source.group);
    if (!pred) return null;
    const teamId =
      source.pos === "first" ? pred.first_team :
      source.pos === "second" ? pred.second_team :
      pred.third_team;
    if (!teamId) return null;
    for (const g of GROUPS) {
      const t = g.teams.find((t) => t.id === teamId);
      if (t) return t;
    }
    return null;
  }
  if (source.type === "match") {
    return bracketWinners[source.matchId] ?? null;
  }
  return null;
}

export function buildBracketState(
  groupPreds: GroupPrediction[],
  bracketPredMap: Record<string, string> // matchId → winnerId
): { teams: Record<string, [ResolvedTeam | null, ResolvedTeam | null]>; winners: Record<string, ResolvedTeam | null> } {
  const winners: Record<string, ResolvedTeam | null> = {};
  const teams: Record<string, [ResolvedTeam | null, ResolvedTeam | null]> = {};

  for (const match of BRACKET) {
    const teamA = resolveTeamSource(match.teamA, groupPreds, winners);
    const teamB = resolveTeamSource(match.teamB, groupPreds, winners);
    teams[match.id] = [teamA, teamB];

    const winnerId = bracketPredMap[match.id];
    if (winnerId) {
      if (teamA?.id === winnerId) winners[match.id] = teamA;
      else if (teamB?.id === winnerId) winners[match.id] = teamB;
      else winners[match.id] = null;
    } else {
      winners[match.id] = null;
    }
  }

  return { teams, winners };
}

export const ROUND_LABELS: Record<BracketRound, string> = {
  r32: "16avos",
  r16: "Octavos",
  qf: "Cuartos",
  sf: "Semis",
  final: "Final",
};
