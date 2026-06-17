export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { recalcAllPoints } from "@/lib/db";

const ARGENTINA_ID = 762;

// Map UTC date → internal match ID (include +1 day for UTC offset coverage)
const DATE_TO_MATCH: Record<string, { id: string; isKnockout: boolean }> = {
  "2026-06-16": { id: "ARG-1",     isKnockout: false },
  "2026-06-17": { id: "ARG-1",     isKnockout: false },
  "2026-06-22": { id: "ARG-2",     isKnockout: false },
  "2026-06-23": { id: "ARG-2",     isKnockout: false },
  "2026-06-27": { id: "ARG-3",     isKnockout: false },
  "2026-06-28": { id: "ARG-3",     isKnockout: false },
  "2026-07-03": { id: "ARG-R32",   isKnockout: true  },
  "2026-07-04": { id: "ARG-R32",   isKnockout: true  },
  "2026-07-07": { id: "ARG-R16",   isKnockout: true  },
  "2026-07-08": { id: "ARG-R16",   isKnockout: true  },
  "2026-07-11": { id: "ARG-QF",    isKnockout: true  },
  "2026-07-12": { id: "ARG-QF",    isKnockout: true  },
  "2026-07-15": { id: "ARG-SF",    isKnockout: true  },
  "2026-07-16": { id: "ARG-SF",    isKnockout: true  },
  "2026-07-19": { id: "ARG-FINAL", isKnockout: true  },
  "2026-07-20": { id: "ARG-FINAL", isKnockout: true  },
};

// football-data.org uses "GROUP_A" or "Group A" → we use "A"
function apiGroupToId(apiGroup: string): string {
  return apiGroup.replace("GROUP_", "").replace("Group ", "");
}

async function syncMatches(apiKey: string) {
  const res = await fetch(
    `https://api.football-data.org/v4/teams/${ARGENTINA_ID}/matches?competitions=WC&status=FINISHED`,
    { headers: { "X-Auth-Token": apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Matches API ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const supabase = getSupabase();
  const synced: string[] = [];

  for (const match of data.matches ?? []) {
    if (match.status !== "FINISHED") continue;
    if (!match.score?.fullTime) continue;

    const utcDay = (match.utcDate as string).split("T")[0];
    const mapped = DATE_TO_MATCH[utcDay];
    if (!mapped) continue;

    const isHomeArg = match.homeTeam?.id === ARGENTINA_ID;
    const argScore: number = isHomeArg ? match.score.fullTime.home : match.score.fullTime.away;
    const oppScore: number = isHomeArg ? match.score.fullTime.away : match.score.fullTime.home;
    if (argScore == null || oppScore == null) continue;

    if (mapped.isKnockout) {
      const opp = isHomeArg ? match.awayTeam : match.homeTeam;
      await supabase.from("knockout_matches").upsert(
        {
          match_id: mapped.id,
          opponent_name: opp?.shortName ?? opp?.name ?? "Rival",
          opponent_flag: "🏳️",
          actual_opponent_team: opp?.tla ?? "",
          is_enabled: true,
          argentina_score: argScore,
          opponent_score: oppScore,
          is_final: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "match_id" }
      );
    } else {
      await supabase.from("match_results").upsert(
        {
          match_id: mapped.id,
          argentina_score: argScore,
          opponent_score: oppScore,
          is_final: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "match_id" }
      );
    }

    synced.push(`${mapped.id}: ${argScore}-${oppScore}`);
  }

  return synced;
}

async function syncGroups(apiKey: string) {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/standings",
    { headers: { "X-Auth-Token": apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Standings API ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const supabase = getSupabase();
  const synced: string[] = [];

  for (const standing of data.standings ?? []) {
    if (standing.type !== "TOTAL") continue;

    const groupId = apiGroupToId(standing.group ?? "");
    if (!groupId) continue;

    const table: { position: number; team: { tla: string }; playedGames: number }[] =
      standing.table ?? [];

    // Only mark as final when all 4 teams have played all 3 group matches
    const isFinal = table.length >= 4 && table.every((row) => row.playedGames >= 3);

    const first  = table.find((r) => r.position === 1)?.team?.tla ?? null;
    const second = table.find((r) => r.position === 2)?.team?.tla ?? null;
    const third  = table.find((r) => r.position === 3)?.team?.tla ?? null;

    if (!first || !second) continue;

    await supabase.from("group_results").upsert(
      {
        group_id: groupId,
        first_team: first,
        second_team: second,
        third_team: third,
        is_final: isFinal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "group_id" }
    );

    synced.push(`Grupo ${groupId}: 1°${first} 2°${second}${isFinal ? " ✓" : " (en curso)"}`);
  }

  return synced;
}

export async function GET(_req: NextRequest) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FOOTBALL_DATA_API_KEY not configured" }, { status: 500 });
  }

  try {
    const [matchesSynced, groupsSynced] = await Promise.all([
      syncMatches(apiKey),
      syncGroups(apiKey),
    ]);

    if (matchesSynced.length > 0 || groupsSynced.some((g) => g.includes("✓"))) {
      await recalcAllPoints();
    }

    return NextResponse.json({ ok: true, matches: matchesSynced, groups: groupsSynced });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
