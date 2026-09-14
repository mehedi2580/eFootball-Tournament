"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { distributeIntoGroups, generateRoundRobinPairs, groupLetterName } from "@/lib/fixtures";
import { revalidatePath } from "next/cache";

async function assertOwnership(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error("Tournament not found.");
  if (tournament.organizerId !== userId) {
    throw new Error("You do not have permission to manage this tournament.");
  }
  return tournament;
}

export async function randomizeGroupsAction(tournamentId: string) {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);

  if (tournament.groupsLocked) {
    throw new Error("Groups are locked. Reset the tournament before randomizing again.");
  }

  const participants = await prisma.participant.findMany({ where: { tournamentId } });
  if (participants.length < 2) {
    throw new Error("Add at least 2 participants before creating groups.");
  }
  if (participants.length < tournament.numGroups) {
    throw new Error("You have fewer participants than groups. Add more participants or reduce groups.");
  }

  const distributed = distributeIntoGroups(participants, tournament.numGroups);

  await prisma.$transaction(async (tx) => {
    // Clear any previous (unlocked) group assignment before re-randomizing.
    await tx.group.deleteMany({ where: { tournamentId } });

    for (let i = 0; i < distributed.length; i++) {
      const group = await tx.group.create({
        data: { tournamentId, name: groupLetterName(i), position: i },
      });
      if (distributed[i].length > 0) {
        await tx.groupParticipant.createMany({
          data: distributed[i].map((p) => ({ groupId: group.id, participantId: p.id })),
        });
      }
    }

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "GROUPS_CREATED" },
    });
  });

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}

export async function lockGroupsAndGenerateFixturesAction(tournamentId: string) {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);

  if (tournament.groupsLocked) {
    throw new Error("Groups are already locked.");
  }

  const groups = await prisma.group.findMany({
    where: { tournamentId },
    include: { groupParticipants: { include: { participant: true } } },
    orderBy: { position: "asc" },
  });

  if (groups.length === 0) {
    throw new Error("Randomize groups before locking.");
  }
  const emptyGroup = groups.find((g) => g.groupParticipants.length < 2);
  if (emptyGroup) {
    throw new Error(`${emptyGroup.name} needs at least 2 participants to generate fixtures.`);
  }

  await prisma.$transaction(async (tx) => {
    let matchNumber = 1;
    for (const group of groups) {
      const participants = group.groupParticipants.map((gp) => gp.participant);
      const pairs = generateRoundRobinPairs(participants);
      for (const pair of pairs) {
        await tx.match.create({
          data: {
            tournamentId,
            groupId: group.id,
            matchNumber: matchNumber++,
            participant1Id: pair.participant1.id,
            participant2Id: pair.participant2.id,
            status: "UPCOMING",
          },
        });
      }
    }

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { groupsLocked: true, status: "GROUP_STAGE_IN_PROGRESS" },
    });
  });

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}

/** Fully resets a tournament's groups, fixtures, and results back to registration. */
export async function resetTournamentAction(tournamentId: string) {
  const user = await requireUser();
  await assertOwnership(tournamentId, user.id);

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { tournamentId } });
    await tx.group.deleteMany({ where: { tournamentId } });
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { groupsLocked: false, status: "REGISTRATION" },
    });
  });

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}
