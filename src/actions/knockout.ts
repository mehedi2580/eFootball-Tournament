"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  buildBracket,
  firstStageFor,
  getQualifiers,
  stageLabel,
  type MatchStage,
} from "@/lib/knockout";
import { revalidatePath } from "next/cache";

async function assertOwnership(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error("Tournament not found.");
  if (tournament.organizerId !== userId) {
    throw new Error("You do not have permission to manage this tournament.");
  }
  return tournament;
}

async function loadBracketInputs(tournamentId: string) {
  const [groups, matches] = await Promise.all([
    prisma.group.findMany({
      where: { tournamentId },
      orderBy: { position: "asc" },
      include: { groupParticipants: { include: { participant: true } } },
    }),
    prisma.match.findMany({
      where: { tournamentId },
      orderBy: { matchNumber: "asc" },
    }),
  ]);
  return { groups, matches };
}

function revalidateTournament(tournamentId: string, uniqueCode: string) {
  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  revalidatePath(`/tournament/${uniqueCode}`);
  revalidatePath(`/tournament/${uniqueCode}/knockout`);
  revalidatePath(`/tournament/${uniqueCode}/fixtures`);
  revalidatePath(`/tournament/${uniqueCode}/results`);
}

/**
 * Creates the first knockout round from the group standings (top 2 per group).
 * Only the played matches are created — byes are derived, never stored.
 */
export async function generateKnockoutAction(tournamentId: string): Promise<{
  stage: MatchStage;
  matchesCreated: number;
  byes: number;
}> {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);

  if (tournament.status !== "GROUP_STAGE_COMPLETED") {
    throw new Error("Finish all group matches before generating the knockout stage.");
  }

  const { groups, matches } = await loadBracketInputs(tournamentId);
  if (matches.some((m) => m.stage !== "GROUP")) {
    throw new Error("The knockout stage has already been generated.");
  }

  const qualifiers = getQualifiers(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      participants: g.groupParticipants.map((gp) => gp.participant),
    })),
    matches.filter((m) => m.stage === "GROUP"),
    {
      win: tournament.pointsForWin,
      draw: tournament.pointsForDraw,
      loss: tournament.pointsForLoss,
    }
  );
  if (qualifiers.length < 2) {
    throw new Error("Not enough qualified participants to start the knockout stage.");
  }

  const firstStage = firstStageFor(qualifiers.length);
  const bracket = buildBracket(qualifiers, []);
  const round = bracket.rounds.find((r) => r.stage === firstStage);
  if (!round) throw new Error("Could not build the knockout bracket.");
  const pairs = round.pairs.filter((p) => !p.bye && p.p1 && p.p2);
  if (pairs.length === 0) throw new Error("Could not build the knockout bracket.");

  await prisma.$transaction(async (tx) => {
    const last = await tx.match.findFirst({
      where: { tournamentId },
      orderBy: { matchNumber: "desc" },
      select: { matchNumber: true },
    });
    let matchNumber = (last?.matchNumber ?? 0) + 1;
    for (const pair of pairs) {
      await tx.match.create({
        data: {
          tournamentId,
          groupId: null,
          stage: firstStage,
          matchNumber: matchNumber++,
          participant1Id: pair.p1!.id,
          participant2Id: pair.p2!.id,
          status: "UPCOMING",
        },
      });
    }
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "KNOCKOUT_STAGE" },
    });
  });

  revalidateTournament(tournamentId, tournament.uniqueCode);
  return { stage: firstStage, matchesCreated: pairs.length, byes: bracket.firstRoundByes };
}

/**
 * Creates the next knockout round from the winners of the current round.
 * Requires every match of the current round to be completed.
 */
export async function generateNextKnockoutRoundAction(tournamentId: string): Promise<{
  stage: MatchStage;
  matchesCreated: number;
}> {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);

  if (tournament.status !== "KNOCKOUT_STAGE") {
    throw new Error("The knockout stage has not started yet.");
  }

  const { groups, matches } = await loadBracketInputs(tournamentId);
  const qualifiers = getQualifiers(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      participants: g.groupParticipants.map((gp) => gp.participant),
    })),
    matches.filter((m) => m.stage === "GROUP"),
    {
      win: tournament.pointsForWin,
      draw: tournament.pointsForDraw,
      loss: tournament.pointsForLoss,
    }
  );
  const knockoutMatches = matches.filter((m) => m.stage !== "GROUP");
  const bracket = buildBracket(qualifiers, knockoutMatches);

  if (!bracket.canGenerateNext || !bracket.nextStageToGenerate) {
    if (bracket.currentStage === "FINAL") {
      throw new Error("The Final has already been generated.");
    }
    throw new Error(
      `Finish all ${bracket.currentStage ? stageLabel(bracket.currentStage) : "current round"} matches first.`
    );
  }

  const stage = bracket.nextStageToGenerate;
  const round = bracket.rounds.find((r) => r.stage === stage);
  if (!round) throw new Error("Could not build the next knockout round.");
  const pairs = round.pairs.filter((p) => !p.bye && p.p1 && p.p2);
  if (pairs.length === 0) throw new Error("Could not build the next knockout round.");

  await prisma.$transaction(async (tx) => {
    const last = await tx.match.findFirst({
      where: { tournamentId },
      orderBy: { matchNumber: "desc" },
      select: { matchNumber: true },
    });
    let matchNumber = (last?.matchNumber ?? 0) + 1;
    for (const pair of pairs) {
      await tx.match.create({
        data: {
          tournamentId,
          groupId: null,
          stage,
          matchNumber: matchNumber++,
          participant1Id: pair.p1!.id,
          participant2Id: pair.p2!.id,
          status: "UPCOMING",
        },
      });
    }
  });

  revalidateTournament(tournamentId, tournament.uniqueCode);
  return { stage, matchesCreated: pairs.length };
}
