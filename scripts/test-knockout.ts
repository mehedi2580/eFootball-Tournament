/* Runtime test for src/lib/knockout.ts — run: npx tsx scripts/test-knockout.ts */
import {
  seedOrder,
  firstStageFor,
  bracketSizeFor,
  getQualifiers,
  buildBracket,
  type Qualifier,
  type KnockoutMatchInput,
} from "../src/lib/knockout";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    passed++;
    console.log(`  ok - ${name}`);
  } else {
    failed++;
    console.log(`  FAIL - ${name}`, extra !== undefined ? JSON.stringify(extra) : "");
  }
}
function eq(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Mimics the server actions: generate the next round's matches from buildBracket. */
let nextMatchNumber = 1;
function generateNextRound(
  qualifiers: Qualifier[],
  matches: KnockoutMatchInput[]
): KnockoutMatchInput[] {
  const b = buildBracket(qualifiers, matches);
  if (!b.canGenerateNext || !b.nextStageToGenerate) return matches;
  const round = b.rounds.find((r) => r.stage === b.nextStageToGenerate);
  if (!round) return matches;
  const created: KnockoutMatchInput[] = [];
  for (const pair of round.pairs) {
    if (pair.bye || !pair.p1 || !pair.p2) continue;
    created.push({
      id: `m${nextMatchNumber}`,
      stage: b.nextStageToGenerate,
      matchNumber: nextMatchNumber++,
      participant1Id: pair.p1.id,
      participant2Id: pair.p2.id,
      participant1Score: null,
      participant2Score: null,
      status: "UPCOMING",
    });
  }
  return [...matches, ...created];
}

function completeAll(matches: KnockoutMatchInput[], winner: "p1" | "p2" = "p1") {
  return matches.map((m) =>
    m.status === "COMPLETED"
      ? m
      : {
          ...m,
          status: "COMPLETED" as const,
          participant1Score: winner === "p1" ? 2 : 0,
          participant2Score: winner === "p1" ? 0 : 2,
        }
  );
}

function makeQualifiers(n: number): Qualifier[] {
  return Array.from({ length: n }, (_, i) => ({
    participantId: `p${i + 1}`,
    name: `Player ${i + 1}`,
    groupName: `Group ${String.fromCharCode(65 + Math.floor(i / 2))}`,
    groupPosition: ((i % 2) + 1) as 1 | 2,
    seed: i + 1,
  }));
}

/* 1. seedOrder */
console.log("seedOrder:");
check("order(2)", eq(seedOrder(2), [1, 2]), seedOrder(2));
check("order(4)", eq(seedOrder(4), [1, 4, 2, 3]), seedOrder(4));
check("order(8)", eq(seedOrder(8), [1, 8, 4, 5, 2, 7, 3, 6]), seedOrder(8));
check(
  "order(16)",
  eq(seedOrder(16), [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]),
  seedOrder(16)
);

/* 2. firstStageFor / bracketSizeFor */
console.log("firstStageFor:");
const stageCases: Array<[number, string, number]> = [
  [2, "FINAL", 2],
  [3, "SEMI_FINAL", 4],
  [4, "SEMI_FINAL", 4],
  [5, "QUARTER_FINAL", 8],
  [6, "QUARTER_FINAL", 8],
  [8, "QUARTER_FINAL", 8],
  [10, "ROUND_OF_16", 16],
  [12, "ROUND_OF_16", 16],
  [16, "ROUND_OF_16", 16],
  [20, "ROUND_OF_32", 32],
  [32, "ROUND_OF_32", 32],
  [64, "ROUND_OF_64", 64],
];
for (const [n, stage, size] of stageCases) {
  check(`${n} qualifiers -> ${stage} (bracket ${size})`, firstStageFor(n) === stage && bracketSizeFor(n) === size, {
    stage: firstStageFor(n),
    size: bracketSizeFor(n),
  });
}

/* 3. getQualifiers — top 2 per group, winners ranked across groups */
console.log("getQualifiers:");
{
  const groups = [
    { id: "gA", name: "Group A", participants: [{ id: "a1", name: "A1" }, { id: "a2", name: "A2" }, { id: "a3", name: "A3" }] },
    { id: "gB", name: "Group B", participants: [{ id: "b1", name: "B1" }, { id: "b2", name: "B2" }, { id: "b3", name: "B3" }] },
  ];
  // A1 beats everyone 3-0 (6 pts, GD +6). A2 beats A3 1-0 (3 pts). B1 beats B2 2-0, beats B3 1-0 (6 pts, GD +3). B2 beats B3 1-0 (3 pts).
  const matches = [
    { groupId: "gA", participant1Id: "a1", participant2Id: "a2", participant1Score: 3, participant2Score: 0, status: "COMPLETED" as const },
    { groupId: "gA", participant1Id: "a1", participant2Id: "a3", participant1Score: 3, participant2Score: 0, status: "COMPLETED" as const },
    { groupId: "gA", participant1Id: "a2", participant2Id: "a3", participant1Score: 1, participant2Score: 0, status: "COMPLETED" as const },
    { groupId: "gB", participant1Id: "b1", participant2Id: "b2", participant1Score: 2, participant2Score: 0, status: "COMPLETED" as const },
    { groupId: "gB", participant1Id: "b1", participant2Id: "b3", participant1Score: 1, participant2Score: 0, status: "COMPLETED" as const },
    { groupId: "gB", participant1Id: "b2", participant2Id: "b3", participant1Score: 1, participant2Score: 0, status: "COMPLETED" as const },
  ];
  const q = getQualifiers(groups, matches, { win: 3, draw: 1, loss: 0 });
  // Winners: A1 (GD +6) seed 1, B1 (GD +3) seed 2. Runners-up: A2 (GD -2) vs B2 (GD -1): B2 seed 3, A2 seed 4.
  check("4 qualifiers in seed order", eq(q.map((x) => x.participantId), ["a1", "b1", "b2", "a2"]), q.map((x) => `${x.seed}:${x.participantId}`));
  check("seeds 1-2 are group winners", q[0].groupPosition === 1 && q[1].groupPosition === 1);
  check("seeds 3-4 are runners-up", q[2].groupPosition === 2 && q[3].groupPosition === 2);
}

/* 4. Full bracket: 3 groups = 6 qualifiers (byes) */
console.log("bracket: 6 qualifiers (3 groups):");
{
  nextMatchNumber = 1;
  const q = makeQualifiers(6);
  let matches: KnockoutMatchInput[] = [];
  let b = buildBracket(q, matches);
  check("no matches -> next is QUARTER_FINAL, can generate", b.nextStageToGenerate === "QUARTER_FINAL" && b.canGenerateNext);
  check("first round byes = 2", b.firstRoundByes === 2, b.firstRoundByes);
  matches = generateNextRound(q, matches);
  check("QF creates 2 matches (2 byes)", matches.length === 2 && matches.every((m) => m.stage === "QUARTER_FINAL"), matches.map((m) => `${m.participant1Id}v${m.participant2Id}`));
  // Slot order for 8: [1,8,4,5,2,7,3,6] -> pairs (1,bye),(4v5),(2,bye),(3v6)
  check("QF pairings are 4v5 and 3v6", eq(matches.map((m) => [m.participant1Id, m.participant2Id]), [["p4", "p5"], ["p3", "p6"]]), matches);
  b = buildBracket(q, matches);
  check("QF incomplete -> cannot generate next", !b.canGenerateNext && b.nextStageToGenerate === null);
  matches = completeAll(matches, "p1"); // p4 and p3 win
  b = buildBracket(q, matches);
  check("QF complete -> next is SEMI_FINAL", b.nextStageToGenerate === "SEMI_FINAL" && b.canGenerateNext);
  matches = generateNextRound(q, matches);
  const sf = matches.filter((m) => m.stage === "SEMI_FINAL");
  // Advancers in slot order: p1 (bye), p4, p2 (bye), p3 -> SF: p1v p4, p2 v p3
  check("SF pairings are p1vp4 and p2vp3", eq(sf.map((m) => [m.participant1Id, m.participant2Id]), [["p1", "p4"], ["p2", "p3"]]), sf);
  matches = completeAll(matches, "p1"); // p1 and p2 win
  b = buildBracket(q, matches);
  check("SF complete -> next is FINAL", b.nextStageToGenerate === "FINAL" && b.canGenerateNext);
  matches = generateNextRound(q, matches);
  const f = matches.filter((m) => m.stage === "FINAL");
  check("Final is p1vp2", f.length === 1 && f[0].participant1Id === "p1" && f[0].participant2Id === "p2", f);
  matches = completeAll(matches, "p2"); // p2 wins the final
  b = buildBracket(q, matches);
  check("champion is p2", b.champion?.id === "p2", b.champion);
  check("after final, nothing to generate", !b.canGenerateNext && b.nextStageToGenerate === null);
}

/* 5. Full bracket: 4 groups = 8 qualifiers (no byes) */
console.log("bracket: 8 qualifiers (4 groups):");
{
  nextMatchNumber = 1;
  const q = makeQualifiers(8);
  let matches: KnockoutMatchInput[] = [];
  matches = generateNextRound(q, matches);
  check(
    "QF pairings 1v8,4v5,2v7,3v6",
    eq(matches.map((m) => [m.participant1Id, m.participant2Id]), [["p1", "p8"], ["p4", "p5"], ["p2", "p7"], ["p3", "p6"]]),
    matches
  );
  matches = completeAll(matches, "p1"); // p1,p4,p2,p3 win
  matches = generateNextRound(q, matches);
  const sf = matches.filter((m) => m.stage === "SEMI_FINAL");
  check("SF pairings p1vp4, p2vp3", eq(sf.map((m) => [m.participant1Id, m.participant2Id]), [["p1", "p4"], ["p2", "p3"]]), sf);
  matches = completeAll(matches, "p2"); // p4, p3 win
  matches = generateNextRound(q, matches);
  const f = matches.filter((m) => m.stage === "FINAL");
  check("Final is p4vp3", f.length === 1 && f[0].participant1Id === "p4" && f[0].participant2Id === "p3", f);
  matches = completeAll(matches, "p1");
  const b = buildBracket(q, matches);
  check("champion is p4", b.champion?.id === "p4", b.champion);
}

/* 6. 2 groups = 4 qualifiers -> SF directly; 1 group = 2 -> Final directly */
console.log("bracket: small fields:");
{
  nextMatchNumber = 1;
  const q4 = makeQualifiers(4);
  let m4: KnockoutMatchInput[] = [];
  m4 = generateNextRound(q4, m4);
  check("4 qualifiers -> SF first (1v4, 2v3)", eq(m4.map((m) => [m.participant1Id, m.participant2Id]), [["p1", "p4"], ["p2", "p3"]]), m4);

  nextMatchNumber = 1;
  const q2 = makeQualifiers(2);
  let m2: KnockoutMatchInput[] = [];
  m2 = generateNextRound(q2, m2);
  check("2 qualifiers -> FINAL directly (1v2)", m2.length === 1 && m2[0].stage === "FINAL" && m2[0].participant1Id === "p1" && m2[0].participant2Id === "p2", m2);
}

/* 7. 5 groups = 10 qualifiers -> R16 with 6 byes */
console.log("bracket: 10 qualifiers (5 groups):");
{
  nextMatchNumber = 1;
  const q = makeQualifiers(10);
  let matches: KnockoutMatchInput[] = [];
  let b = buildBracket(q, matches);
  check("first stage ROUND_OF_16, byes = 6", b.nextStageToGenerate === "ROUND_OF_16" && b.firstRoundByes === 6, { stage: b.nextStageToGenerate, byes: b.firstRoundByes });
  matches = generateNextRound(q, matches);
  check("R16 creates 2 matches", matches.length === 2, matches.map((m) => `${m.participant1Id}v${m.participant2Id}`));
  // Slot order 16: [1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11]; seeds 11-16 empty.
  // Pairs: (1,bye),(8v9),(4,bye),(5,bye),(2,bye),(7v10),(3,bye),(6,bye) -> played: 8v9, 7v10
  check("R16 pairings are 8v9 and 7v10", eq(matches.map((m) => [m.participant1Id, m.participant2Id]), [["p8", "p9"], ["p7", "p10"]]), matches);
  matches = completeAll(matches, "p1"); // p8, p7 win
  matches = generateNextRound(q, matches);
  const qf = matches.filter((m) => m.stage === "QUARTER_FINAL");
  // Advancers in slot order: p1, p8, p4, p5, p2, p7, p3, p6 -> QF: p1vp8, p4vp5, p2vp7, p3vp6
  check(
    "QF has 4 matches: p1vp8, p4vp5, p2vp7, p3vp6",
    eq(qf.map((m) => [m.participant1Id, m.participant2Id]), [["p1", "p8"], ["p4", "p5"], ["p2", "p7"], ["p3", "p6"]]),
    qf
  );
}

/* 8. Incomplete round blocks generation; empty inputs safe */
console.log("edge cases:");
{
  const q = makeQualifiers(8);
  const b0 = buildBracket([], []);
  check("0 qualifiers -> empty bracket", b0.rounds.length === 0 && !b0.canGenerateNext && b0.champion === null);
  const b1 = buildBracket([q[0]], []);
  check("1 qualifier -> empty bracket", b1.rounds.length === 0 && !b1.canGenerateNext);
  nextMatchNumber = 1;
  let matches: KnockoutMatchInput[] = [];
  matches = generateNextRound(q, matches);
  // Complete only 3 of 4 QF matches
  matches = matches.map((m, i) =>
    i < 3 ? { ...m, status: "COMPLETED" as const, participant1Score: 1, participant2Score: 0 } : m
  );
  const b = buildBracket(q, matches);
  check("3/4 QF complete -> cannot generate SF", !b.canGenerateNext && b.nextStageToGenerate === null);
}

console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
