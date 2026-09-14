export type StandingsMatch = {
  participant1Id: string;
  participant2Id: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
};

export type StandingsRow = {
  participantId: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

/**
 * Computes FIFA-style standings for a set of participants from their completed
 * matches. Match results are the single source of truth - nothing here is
 * manually entered.
 */
export function computeStandings(
  participants: Array<{ id: string; name: string }>,
  matches: StandingsMatch[],
  scoring: { win: number; draw: number; loss: number } = { win: 3, draw: 1, loss: 0 }
): StandingsRow[] {
  const rows = new Map<string, StandingsRow>();
  for (const p of participants) {
    rows.set(p.id, {
      participantId: p.id,
      name: p.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  const completed = matches.filter(
    (m) => m.status === "COMPLETED" && m.participant1Score !== null && m.participant2Score !== null
  );

  for (const m of completed) {
    const r1 = rows.get(m.participant1Id);
    const r2 = rows.get(m.participant2Id);
    if (!r1 || !r2) continue;
    const s1 = m.participant1Score as number;
    const s2 = m.participant2Score as number;

    r1.played += 1;
    r2.played += 1;
    r1.goalsFor += s1;
    r1.goalsAgainst += s2;
    r2.goalsFor += s2;
    r2.goalsAgainst += s1;

    if (s1 > s2) {
      r1.wins += 1;
      r1.points += scoring.win;
      r2.losses += 1;
      r2.points += scoring.loss;
    } else if (s2 > s1) {
      r2.wins += 1;
      r2.points += scoring.win;
      r1.losses += 1;
      r1.points += scoring.loss;
    } else {
      r1.draws += 1;
      r2.draws += 1;
      r1.points += scoring.draw;
      r2.points += scoring.draw;
    }
  }

  for (const r of rows.values()) {
    r.goalDifference = r.goalsFor - r.goalsAgainst;
  }

  // Head-to-head lookup for tie-breaking between exactly two tied teams.
  function headToHeadPoints(aId: string, bId: string) {
    const match = completed.find(
      (m) =>
        (m.participant1Id === aId && m.participant2Id === bId) ||
        (m.participant1Id === bId && m.participant2Id === aId)
    );
    if (!match) return 0;
    const aScore = match.participant1Id === aId ? match.participant1Score! : match.participant2Score!;
    const bScore = match.participant1Id === aId ? match.participant2Score! : match.participant1Score!;
    if (aScore > bScore) return 1;
    if (aScore < bScore) return -1;
    return 0;
  }

  const sorted = Array.from(rows.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    const h2h = headToHeadPoints(a.participantId, b.participantId);
    if (h2h !== 0) return -h2h;
    // Deterministic final tie-breaker: alphabetical by name, then id.
    if (a.name !== b.name) return a.name.localeCompare(b.name);
    return a.participantId.localeCompare(b.participantId);
  });

  return sorted;
}

export type GoalStats = {
  totalGoals: number;
  matchesPlayed: number;
  goalsPerMatch: number;
  highestScoringMatch: { matchId: string; total: number } | null;
  topScorers: Array<{ participantId: string; name: string; goals: number }>;
};

export function computeGoalStats(
  participants: Array<{ id: string; name: string }>,
  matches: Array<StandingsMatch & { id: string }>
): GoalStats {
  const completed = matches.filter(
    (m) => m.status === "COMPLETED" && m.participant1Score !== null && m.participant2Score !== null
  );

  let totalGoals = 0;
  let highestScoringMatch: { matchId: string; total: number } | null = null;
  const goalsByParticipant = new Map<string, number>();
  for (const p of participants) goalsByParticipant.set(p.id, 0);

  for (const m of completed) {
    const s1 = m.participant1Score as number;
    const s2 = m.participant2Score as number;
    const total = s1 + s2;
    totalGoals += total;
    if (!highestScoringMatch || total > highestScoringMatch.total) {
      highestScoringMatch = { matchId: m.id, total };
    }
    goalsByParticipant.set(m.participant1Id, (goalsByParticipant.get(m.participant1Id) ?? 0) + s1);
    goalsByParticipant.set(m.participant2Id, (goalsByParticipant.get(m.participant2Id) ?? 0) + s2);
  }

  const topScorers = participants
    .map((p) => ({ participantId: p.id, name: p.name, goals: goalsByParticipant.get(p.id) ?? 0 }))
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  return {
    totalGoals,
    matchesPlayed: completed.length,
    goalsPerMatch: completed.length > 0 ? Math.round((totalGoals / completed.length) * 100) / 100 : 0,
    highestScoringMatch,
    topScorers,
  };
}
