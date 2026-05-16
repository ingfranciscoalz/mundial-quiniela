export interface Participant {
  id: string;
  name: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  flag: string;
}

export interface Group {
  id: string;
  teams: Team[];
}

export interface ArgentinaMatch {
  id: string;
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "final";
  stageLabel: string;
  opponent: Team;
  date: string;
  venue: string;
  lockTime: string;
}

export interface KnockoutMatchConfig {
  id: string;
  stage: "r32" | "r16" | "qf" | "sf" | "final";
  stageLabel: string;
  date: string;
  venue: string;
  lockTime: string;
  bracketDescription: string;
  // Auto-fill rival según predicciones de grupos
  autoFillGroupIfFirst: string | null;
  autoFillPositionIfFirst: "first" | "second";
  autoFillGroupIfSecond: string | null;
  autoFillPositionIfSecond: "first" | "second";
  // Grupos con posibles rivales para el dropdown
  potentialOpponentGroups: string[];
}

export interface KnockoutMatchDB {
  match_id: string;
  opponent_name: string | null;
  opponent_flag: string | null;
  actual_opponent_team: string | null;
  is_enabled: boolean;
  argentina_score: number | null;
  opponent_score: number | null;
  is_final: boolean;
}

export interface ScorePrediction {
  id: string;
  participant_id: string;
  match_id: string;
  predicted_argentina: number;
  predicted_opponent: number;
  predicted_opponent_team: string | null;
  points: number;
}

export interface GroupPrediction {
  id: string;
  participant_id: string;
  group_id: string;
  first_team: string;
  second_team: string;
  points: number;
}

export interface MatchResult {
  match_id: string;
  argentina_score: number | null;
  opponent_score: number | null;
  is_final: boolean;
}

export interface GroupResult {
  group_id: string;
  first_team: string | null;
  second_team: string | null;
  is_final: boolean;
}

export interface LeaderboardEntry {
  participant: Participant;
  totalPoints: number;
  matchPoints: number;
  groupPoints: number;
  exactScores: number;
  correctResults: number;
}

export interface LocalUser {
  id: string;
  name: string;
}
