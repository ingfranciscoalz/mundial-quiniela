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

export async function GET(req: NextRequest) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FOOTBALL_DATA_API_KEY not configured" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.football-data.org/v4/teams/${ARGENTINA_ID}/matches?competitions=WC&status=FINISHED`,
    {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Football API error ${res.status}`, detail: text }, { status: 502 });
  }

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

  if (synced.length > 0) {
    await recalcAllPoints();
  }

  return NextResponse.json({ ok: true, synced });
}
