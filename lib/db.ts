import { getSupabase } from "./supabase";
import type {
  Participant,
  ScorePrediction,
  GroupPrediction,
  MatchResult,
  GroupResult,
  KnockoutMatchDB,
} from "@/types";
import { calcMatchPoints, calcGroupPoints, calcKnockoutPoints } from "./scoring";

const KNOCKOUT_IDS = new Set(["ARG-R32", "ARG-R16", "ARG-QF", "ARG-SF", "ARG-FINAL"]);

export async function getParticipants(): Promise<Participant[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getOrCreateParticipant(
  name: string
): Promise<Participant | null> {
  const supabase = getSupabase();
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("participants")
    .select("*")
    .ilike("name", trimmed)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("participants")
    .insert({ name: trimmed })
    .select()
    .single();

  if (error) {
    console.error("Error creating participant:", error);
    return null;
  }
  return created;
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function getScorePredictions(
  participantId: string
): Promise<ScorePrediction[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("score_predictions")
    .select("*")
    .eq("participant_id", participantId);
  return data ?? [];
}

export async function upsertScorePrediction(
  participantId: string,
  matchId: string,
  predictedArgentina: number,
  predictedOpponent: number,
  predictedOpponentTeam: string | null = null
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("score_predictions").upsert(
    {
      participant_id: participantId,
      match_id: matchId,
      predicted_argentina: predictedArgentina,
      predicted_opponent: predictedOpponent,
      predicted_opponent_team: predictedOpponentTeam,
      points: 0,
    },
    { onConflict: "participant_id,match_id" }
  );
  return !error;
}

export async function getGroupPredictions(
  participantId: string
): Promise<GroupPrediction[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("group_predictions")
    .select("*")
    .eq("participant_id", participantId);
  return data ?? [];
}

export async function upsertGroupPrediction(
  participantId: string,
  groupId: string,
  firstTeam: string,
  secondTeam: string,
  thirdTeam: string | null = null
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("group_predictions").upsert(
    {
      participant_id: participantId,
      group_id: groupId,
      first_team: firstTeam,
      second_team: secondTeam,
      third_team: thirdTeam,
      points: 0,
    },
    { onConflict: "participant_id,group_id" }
  );
  return !error;
}

export async function getMatchResults(): Promise<MatchResult[]> {
  const supabase = getSupabase();
  const { data } = await supabase.from("match_results").select("*");
  return data ?? [];
}

export async function getGroupResults(): Promise<GroupResult[]> {
  const supabase = getSupabase();
  const { data } = await supabase.from("group_results").select("*");
  return data ?? [];
}

export async function upsertMatchResult(
  matchId: string,
  argentinaScore: number,
  opponentScore: number,
  isFinal: boolean
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("match_results").upsert(
    {
      match_id: matchId,
      argentina_score: argentinaScore,
      opponent_score: opponentScore,
      is_final: isFinal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" }
  );

  if (isFinal) {
    await recalcGroupMatchPoints(matchId, argentinaScore, opponentScore);
  }
}

export async function upsertGroupResult(
  groupId: string,
  firstTeam: string,
  secondTeam: string,
  isFinal: boolean
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("group_results").upsert(
    {
      group_id: groupId,
      first_team: firstTeam,
      second_team: secondTeam,
      is_final: isFinal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "group_id" }
  );

  if (isFinal) {
    await recalcGroupPoints(groupId, firstTeam, secondTeam);
  }
}

export async function getKnockoutMatches(): Promise<KnockoutMatchDB[]> {
  const supabase = getSupabase();
  const { data } = await supabase.from("knockout_matches").select("*");
  return data ?? [];
}

export async function upsertKnockoutMatch(
  matchId: string,
  opponentName: string,
  opponentFlag: string,
  actualOpponentTeam: string,
  isEnabled: boolean
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("knockout_matches").upsert(
    {
      match_id: matchId,
      opponent_name: opponentName,
      opponent_flag: opponentFlag,
      actual_opponent_team: actualOpponentTeam,
      is_enabled: isEnabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" }
  );
}

export async function upsertKnockoutResult(
  matchId: string,
  argentinaScore: number,
  opponentScore: number,
  actualOpponentTeam: string,
  isFinal: boolean
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("knockout_matches").upsert(
    {
      match_id: matchId,
      argentina_score: argentinaScore,
      opponent_score: opponentScore,
      actual_opponent_team: actualOpponentTeam,
      is_final: isFinal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" }
  );

  if (isFinal) {
    await recalcKnockoutMatchPoints(matchId, argentinaScore, opponentScore, actualOpponentTeam);
  }
}

async function recalcGroupMatchPoints(
  matchId: string,
  actualArg: number,
  actualOpp: number
): Promise<void> {
  const supabase = getSupabase();
  const { data: predictions } = await supabase
    .from("score_predictions")
    .select("*")
    .eq("match_id", matchId);

  if (!predictions) return;

  for (const pred of predictions) {
    const pts = calcMatchPoints(pred.predicted_argentina, pred.predicted_opponent, actualArg, actualOpp);
    await supabase.from("score_predictions").update({ points: pts }).eq("id", pred.id);
  }
}

async function recalcKnockoutMatchPoints(
  matchId: string,
  actualArg: number,
  actualOpp: number,
  actualOpponentTeam: string
): Promise<void> {
  const supabase = getSupabase();
  const { data: predictions } = await supabase
    .from("score_predictions")
    .select("*")
    .eq("match_id", matchId);

  if (!predictions) return;

  for (const pred of predictions) {
    const pts = calcKnockoutPoints(
      pred.predicted_argentina,
      pred.predicted_opponent,
      pred.predicted_opponent_team,
      actualArg,
      actualOpp,
      actualOpponentTeam
    );
    await supabase.from("score_predictions").update({ points: pts }).eq("id", pred.id);
  }
}

async function recalcGroupPoints(
  groupId: string,
  actualFirst: string,
  actualSecond: string
): Promise<void> {
  const supabase = getSupabase();
  const { data: predictions } = await supabase
    .from("group_predictions")
    .select("*")
    .eq("group_id", groupId);

  if (!predictions) return;

  for (const pred of predictions) {
    const pts = calcGroupPoints(pred.first_team, pred.second_team, actualFirst, actualSecond);
    await supabase.from("group_predictions").update({ points: pts }).eq("id", pred.id);
  }
}

export async function getBracketPredictions(
  participantId: string
): Promise<{ match_id: string; winner_id: string }[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("bracket_predictions")
    .select("match_id, winner_id")
    .eq("participant_id", participantId);
  return data ?? [];
}

export async function upsertBracketPrediction(
  participantId: string,
  matchId: string,
  winnerId: string
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("bracket_predictions").upsert(
    { participant_id: participantId, match_id: matchId, winner_id: winnerId },
    { onConflict: "participant_id,match_id" }
  );
  return !error;
}

export async function getLeaderboard() {
  const supabase = getSupabase();
  const { data: participants } = await supabase.from("participants").select("*");
  if (!participants) return [];

  const { data: scorePreds } = await supabase.from("score_predictions").select("*");
  const { data: groupPreds } = await supabase.from("group_predictions").select("*");

  return participants
    .map((p) => {
      const myMatchPreds = (scorePreds ?? []).filter((s) => s.participant_id === p.id);
      const myGroupPreds = (groupPreds ?? []).filter((g) => g.participant_id === p.id);

      const matchPoints = myMatchPreds.reduce((s, x) => s + (x.points ?? 0), 0);
      const groupPoints = myGroupPreds.reduce((s, x) => s + (x.points ?? 0), 0);
      const exactScores = myMatchPreds.filter((x) => x.points === 3).length;
      const correctResults = myMatchPreds.filter((x) => x.points >= 1).length;

      return {
        participant: p as Participant,
        totalPoints: matchPoints + groupPoints,
        matchPoints,
        groupPoints,
        exactScores,
        correctResults,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
