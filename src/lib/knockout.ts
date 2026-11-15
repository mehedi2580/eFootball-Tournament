import { computeStandings, type StandingsRow } from "./standings";

/**
 * Single-elimination knockout bracket logic (pure functions, no DB access).
 *
 * Seeding: the top 2 participants from each group qualify. Group winners are
 * ranked against each other (points, goal difference, goals for, name) and
 * take seeds 1..G; runners-up take seeds G+1..2G. Pairings follow standard
 * bracket seeding (1vN, 4v5, 2v7, 3v6, ...). When the qualifier count is not
 * a power of two, the top seeds receive byes into the next round.
 *
 * The bracket is a pure function of (seeding, completed knockout results):
 * group results are frozen once the knockout stage starts, so rounds can be
 * recomputed deterministically at any time — no extra bracket state is stored.
 */

export type MatchStage =
  | "GROUP"
  | "ROUND_OF_64"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "FINAL";

export const STAGE_ORDER: MatchStage[] = [
  "GROUP",
  "ROUND_OF_64",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "FINAL",
];

export const KNOCKOUT_STAGES: MatchStage[] = [
  "ROUND_OF_64",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "FINAL",
];

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: "Group Stage",
  ROUND_OF_64: "Round of 64",
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINAL: "Quarter-Final",
  SEMI_FINAL: "Semi-Final",
  FINAL: "Final",
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage as MatchStage] ?? stage;
}

/** Next knockout stage after the given one, or null for the Final (and for GROUP). */
export function nextStage(stage: MatchStage): MatchStage | null {
  const idx = KNOCKOUT_STAGES.indexOf(stage);
  if (idx === -1 || idx === KNOCKOUT_STAGES.length - 1) return null;
  return KNOCKOUT_STAGES[idx + 1];
}

/** Smallest power of two >= count (minimum 2). */
export function bracketSizeFor(qualifierCount: number): number {
  let size = 2;
  while (size < qualifierCount) size *= 2;
  return size;
}

/** Stage of the first knockout round for a given qualifier count. */
export function firstStageFor(qualifierCount: number): MatchStage {
  const size = bracketSizeFor(qualifierCount);
  switch (size) {
    case 2:
      return "FINAL";
    case 4:
      return "SEMI_FINAL";
    case 8:
      return "QUARTER_FINAL";
    case 16:
      return "ROUND_OF_16";
    case 32:
      return "ROUND_OF_32";
    default:
      return "ROUND_OF_64";
  }
}

/**
 * Standard seeding order: slot i holds seed order[i]; consecutive slot pairs
 * (0,1), (2,3), ... are the matches. order(2) = [1,2], order(4) = [1,4,2,3],
 * order(8) = [1,8,4,5,2,7,3,6], order(16) = [1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11].
 * Each first-round pair sums to bracketSize + 1, and top seeds cannot meet
 * until the late rounds (1v2 only in the Final, 1-4 only from the Semi-Finals).
 */
export function seedOrder(bracketSize: number): number[] {
  let order = [1, 2];
  let size = 2;
  while (size < bracketSize) {
    const next: number[] = [];
    const doubled = size * 2;
    for (const seed of order) {
      next.push(seed, doubled + 1 - seed);
    }
    order = next;
    size = doubled;
  }
  return order;
}

export type Qualifier = {
  participantId: string;
  name: string;
  groupName: string;
  /** 1 = group winner, 2 = group runner-up */
  groupPosition: 1 | 2;
  seed: number;
};

export type QualifierGroupInput = {
  id: string;
  name: string;
  participants: Array<{ id: string; name: string }>;
};

export type QualifierMatchInput = {
  groupId: string | null;
  participant1Id: string;
  participant2Id: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
};

/** Cross-group ranking for winners / runners-up: points, GD, GF, then name. */
function compareAcrossGroups(a: StandingsRow, b: StandingsRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.name.localeCompare(b.name);
}

/**
 * Top 2 from each group qualify. Winners (ranked across groups) take seeds
 * 1..G, runners-up take seeds G+1..2G. Returns qualifiers in seed order.
 */
export function getQualifiers(
  groups: QualifierGroupInput[],
  matches: QualifierMatchInput[],
  scoring: { win: number; draw: number; loss: number }
): Qualifier[] {
  const winners: Array<{ row: StandingsRow; groupName: string }> = [];
  const runnersUp: Array<{ row: StandingsRow; groupName: string }> = [];

  for (const group of groups) {
    const groupMatches = matches.filter((m) => m.groupId === group.id);
    const rows = computeStandings(group.participants, groupMatches, scoring);
    if (rows[0]) winners.push({ row: rows[0], groupName: group.name });
    if (rows[1]) runnersUp.push({ row: rows[1], groupName: group.name });
  }

  winners.sort((a, b) => compareAcrossGroups(a.row, b.row));
  runnersUp.sort((a, b) => compareAcrossGroups(a.row, b.row));

  const qualifiers: Qualifier[] = [];
  winners.forEach(({ row, groupName }, i) => {
    qualifiers.push({
      participantId: row.participantId,
      name: row.name,
      groupName,
      groupPosition: 1,
      seed: i + 1,
    });
  });
  runnersUp.forEach(({ row, groupName }, i) => {
    qualifiers.push({
      participantId: row.participantId,
      name: row.name,
      groupName,
      groupPosition: 2,
      seed: winners.length + i + 1,
    });
  });
  return qualifiers;
}

export type KnockoutMatchInput = {
  id: string;
  stage: string;
  matchNumber: number;
  participant1Id: string;
  participant2Id: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
};

export type BracketPair = {
  p1: { id: string; name: string } | null;
  p2: { id: string; name: string } | null;
  matchId: string | null;
  status: "UPCOMING" | "COMPLETED" | "PENDING";
  participant1Score: number | null;
  participant2Score: number | null;
  /** True when p1 advanced on a bye (no match was played). */
  bye: boolean;
};

export type BracketRound = {
  stage: MatchStage;
  pairs: BracketPair[];
};

export type Bracket = {
  rounds: BracketRound[];
  /** Latest stage that has at least one match row, or null if none generated. */
  currentStage: MatchStage | null;
  /** Next stage that can be generated, or null if blocked / finished. */
  nextStageToGenerate: MatchStage | null;
  canGenerateNext: boolean;
  champion: { id: string; name: string } | null;
  /** Number of byes in the first round (0 when the bracket is full). */
  firstRoundByes: number;
};

function winnerIdOf(m: KnockoutMatchInput): string | null {
  if (
    m.status !== "COMPLETED" ||
    m.participant1Score === null ||
    m.participant2Score === null
  ) {
    return null;
  }
  if (m.participant1Score === m.participant2Score) return null; // draws are rejected for knockout
  return m.participant1Score > m.participant2Score ? m.participant1Id : m.participant2Id;
}

/**
 * Rebuilds the whole bracket from seeding + knockout match rows.
 * Match rows of a stage are matched to played pairs by creation order
 * (matchNumber ascending) — generation always creates them in slot order.
 */
export function buildBracket(
  qualifiers: Qualifier[],
  knockoutMatches: KnockoutMatchInput[]
): Bracket {
  const empty: Bracket = {
    rounds: [],
    currentStage: null,
    nextStageToGenerate: null,
    canGenerateNext: false,
    champion: null,
    firstRoundByes: 0,
  };
  if (qualifiers.length < 2) return empty;

  const sorted = [...knockoutMatches].sort((a, b) => a.matchNumber - b.matchNumber);
  const byStage = new Map<string, KnockoutMatchInput[]>();
  for (const m of sorted) {
    const list = byStage.get(m.stage) ?? [];
    list.push(m);
    byStage.set(m.stage, list);
  }

  const bracketSize = bracketSizeFor(qualifiers.length);
  const order = seedOrder(bracketSize);
  const firstStage = firstStageFor(qualifiers.length);
  const stages = KNOCKOUT_STAGES.slice(KNOCKOUT_STAGES.indexOf(firstStage));

  const bySeed = new Map(qualifiers.map((q) => [q.seed, q]));
  const byId = new Map(qualifiers.map((q) => [q.participantId, q]));

  // Round-1 slots: slot i holds the qualifier seeded order[i], or nobody (bye slot).
  let advancers: Array<Qualifier | null> = order.map((seed) =>
    seed <= qualifiers.length ? bySeed.get(seed)! : null
  );
  const firstRoundByes = bracketSize - qualifiers.length;

  const rounds: BracketRound[] = [];
  let currentStage: MatchStage | null = null;
  let champion: { id: string; name: string } | null = null;

  for (const stage of stages) {
    const rows = byStage.get(stage) ?? [];
    if (rows.length > 0) currentStage = stage;

    const pairs: BracketPair[] = [];
    const nextAdvancers: Array<Qualifier | null> = [];
    let rowIdx = 0;
    let blocked = false;

    for (let i = 0; i < advancers.length; i += 2) {
      const a = advancers[i];
      const b = advancers[i + 1] ?? null;

      if (a && !b) {
        // Bye: a advances without playing.
        pairs.push({
          p1: { id: a.participantId, name: a.name },
          p2: null,
          matchId: null,
          status: "COMPLETED",
          participant1Score: null,
          participant2Score: null,
          bye: true,
        });
        nextAdvancers.push(a);
        continue;
      }
      if (!a && b) {
        pairs.push({
          p1: { id: b.participantId, name: b.name },
          p2: null,
          matchId: null,
          status: "COMPLETED",
          participant1Score: null,
          participant2Score: null,
          bye: true,
        });
        nextAdvancers.push(b);
        continue;
      }
      if (!a || !b) {
        // Advancer unknown (previous match unplayed) — bracket stops here.
        blocked = true;
        break;
      }

      const row = rows[rowIdx++];
      if (!row) {
        // Round not generated yet — pairing known, match pending.
        pairs.push({
          p1: { id: a.participantId, name: a.name },
          p2: { id: b.participantId, name: b.name },
          matchId: null,
          status: "PENDING",
          participant1Score: null,
          participant2Score: null,
          bye: false,
        });
        nextAdvancers.push(null);
        blocked = true;
        continue;
      }

      const winnerId = winnerIdOf(row);
      pairs.push({
        p1: { id: a.participantId, name: a.name },
        p2: { id: b.participantId, name: b.name },
        matchId: row.id,
        status: row.status,
        participant1Score: row.participant1Score,
        participant2Score: row.participant2Score,
        bye: false,
      });
      if (winnerId) {
        const winner = byId.get(winnerId);
        nextAdvancers.push(winner ?? null);
        if (!winner) blocked = true;
        if (stage === "FINAL") {
          champion = winner ? { id: winner.participantId, name: winner.name } : null;
        }
      } else {
        nextAdvancers.push(null);
        blocked = true;
      }
    }

    rounds.push({ stage, pairs });
    if (blocked) break;
    advancers = nextAdvancers;
    if (advancers.length <= 1) break;
  }

  // What can be generated next?
  let nextStageToGenerate: MatchStage | null = null;
  let canGenerateNext = false;
  if (!currentStage) {
    nextStageToGenerate = firstStage;
    canGenerateNext = true;
  } else if (currentStage === "FINAL") {
    nextStageToGenerate = null;
    canGenerateNext = false;
  } else {
    const rows = byStage.get(currentStage) ?? [];
    const allComplete = rows.length > 0 && rows.every((m) => m.status === "COMPLETED");
    if (allComplete) {
      nextStageToGenerate = nextStage(currentStage);
      canGenerateNext = nextStageToGenerate !== null;
    }
  }

  return { rounds, currentStage, nextStageToGenerate, canGenerateNext, champion, firstRoundByes };
}

/** Winner of the Final match, if it has been played. */
export function getChampion(
  qualifiers: Qualifier[],
  knockoutMatches: KnockoutMatchInput[]
): { id: string; name: string } | null {
  return buildBracket(qualifiers, knockoutMatches).champion;
}
