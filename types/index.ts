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

export interface ScorePrediction {
  id: string;
  participant_id: string;
  match_id: string;
  predicted_argentina: number;
  predicted_opponent: number;
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
