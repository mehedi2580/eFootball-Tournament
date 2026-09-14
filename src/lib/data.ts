import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/tournamentCode";

export const getTournamentByCode = cache(async (code: string) => {
  const uniqueCode = normalizeCode(code);
  return prisma.tournament.findUnique({
    where: { uniqueCode },
    include: {
      groups: {
        orderBy: { position: "asc" },
        include: {
          groupParticipants: { include: { participant: true } },
        },
      },
      matches: {
        orderBy: { matchNumber: "asc" },
        include: { participant1: true, participant2: true, group: true },
      },
      participants: true,
      organizer: { select: { name: true } },
    },
  });
});

export async function getOwnedTournament(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      groups: {
        orderBy: { position: "asc" },
        include: { groupParticipants: { include: { participant: true } } },
      },
      matches: {
        orderBy: { matchNumber: "asc" },
        include: { participant1: true, participant2: true, group: true },
      },
      participants: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!tournament) return null;
  if (tournament.organizerId !== userId) return "forbidden" as const;
  return tournament;
}

export function computeProgress(totalMatches: number, completedMatches: number) {
  const percent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  return {
    totalMatches,
    completedMatches,
    remainingMatches: totalMatches - completedMatches,
    percent,
  };
}

export async function getDashboardData(userId: string) {
  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      participants: true,
      matches: true,
      groups: true,
    },
  });

  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter(
    (t) => t.status !== "COMPLETED" && t.status !== "REGISTRATION"
  ).length;
  const completedTournaments = tournaments.filter((t) => t.status === "COMPLETED" || t.status === "GROUP_STAGE_COMPLETED").length;
  const totalParticipants = tournaments.reduce((sum, t) => sum + t.participants.length, 0);

  return {
    tournaments,
    stats: { totalTournaments, activeTournaments, completedTournaments, totalParticipants },
  };
}

export async function searchPublicTournaments(query?: string) {
  const trimmed = query?.trim();
  return prisma.tournament.findMany({
    where: {
      isPublic: true,
      ...(trimmed
        ? {
            OR: [
              { uniqueCode: { equals: normalizeCode(trimmed) } },
              { name: { contains: trimmed, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { participants: true, matches: true, groups: true },
  });
}
