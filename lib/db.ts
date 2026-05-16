import { supabase } from "./supabase";
import type {
  Participant,
  ScorePrediction,
  GroupPrediction,
  MatchResult,
  GroupResult,
} from "@/types";
import { calcMatchPoints, calcGroupPoints } from "./scoring";

export async function getOrCreateParticipant(
  name: string
): Promise<Participant | null> {
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

export async function getScorePredictions(
  participantId: string
): Promise<ScorePrediction[]> {
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
  predictedOpponent: number
): Promise<void> {
  await supabase.from("score_predictions").upsert(
    {
      participant_id: participantId,
      match_id: matchId,
      predicted_argentina: predictedArgentina,
      predicted_opponent: predictedOpponent,
      points: 0,
    },
    { onConflict: "participant_id,match_id" }
  );
}

export async function getGroupPredictions(
  participantId: string
): Promise<GroupPrediction[]> {
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
  secondTeam: string
): Promise<void> {
  await supabase.from("group_predictions").upsert(
    {
      participant_id: participantId,
      group_id: groupId,
      first_team: firstTeam,
      second_team: secondTeam,
      points: 0,
    },
    { onConflict: "participant_id,group_id" }
  );
}

export async function getMatchResults(): Promise<MatchResult[]> {
  const { data } = await supabase.from("match_results").select("*");
  return data ?? [];
}

export async function getGroupResults(): Promise<GroupResult[]> {
  const { data } = await supabase.from("group_results").select("*");
  return data ?? [];
}

export async function upsertMatchResult(
  matchId: string,
  argentinaScore: number,
  opponentScore: number,
  isFinal: boolean
): Promise<void> {
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
    await recalcMatchPoints(matchId, argentinaScore, opponentScore);
  }
}

export async function upsertGroupResult(
  groupId: string,
  firstTeam: string,
  secondTeam: string,
  isFinal: boolean
): Promise<void> {
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

async function recalcMatchPoints(
  matchId: string,
  actualArg: number,
  actualOpp: number
): Promise<void> {
  const { data: predictions } = await supabase
    .from("score_predictions")
    .select("*")
    .eq("match_id", matchId);

  if (!predictions) return;

  for (const pred of predictions) {
    const pts = calcMatchPoints(
      pred.predicted_argentina,
      pred.predicted_opponent,
      actualArg,
      actualOpp
    );
    await supabase
      .from("score_predictions")
      .update({ points: pts })
      .eq("id", pred.id);
  }
}

async function recalcGroupPoints(
  groupId: string,
  actualFirst: string,
  actualSecond: string
): Promise<void> {
  const { data: predictions } = await supabase
    .from("group_predictions")
    .select("*")
    .eq("group_id", groupId);

  if (!predictions) return;

  for (const pred of predictions) {
    const pts = calcGroupPoints(
      pred.first_team,
      pred.second_team,
      actualFirst,
      actualSecond
    );
    await supabase
      .from("group_predictions")
      .update({ points: pts })
      .eq("id", pred.id);
  }
}

export async function getLeaderboard() {
  const { data: participants } = await supabase
    .from("participants")
    .select("*");
  if (!participants) return [];

  const { data: scorePreds } = await supabase
    .from("score_predictions")
    .select("*");
  const { data: groupPreds } = await supabase
    .from("group_predictions")
    .select("*");

  return participants
    .map((p) => {
      const myMatchPreds = (scorePreds ?? []).filter(
        (s) => s.participant_id === p.id
      );
      const myGroupPreds = (groupPreds ?? []).filter(
        (g) => g.participant_id === p.id
      );

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
