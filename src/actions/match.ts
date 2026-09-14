"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { matchResultSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/action-types";
import { revalidatePath } from "next/cache";

export async function saveMatchResultAction(
  tournamentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return { success: false, message: "Tournament not found." };
  if (tournament.organizerId !== user.id) {
    return { success: false, message: "You do not have permission to manage this tournament." };
  }
  if (!tournament.groupsLocked) {
    return { success: false, message: "Lock groups and generate fixtures before entering results." };
  }

  const parsed = matchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    participant1Score: formData.get("participant1Score"),
    participant2Score: formData.get("participant2Score"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const match = await prisma.match.findUnique({ where: { id: parsed.data.matchId } });
  if (!match || match.tournamentId !== tournamentId) {
    return { success: false, message: "Match not found." };
  }

  await prisma.match.update({
    where: { id: match.id },
    data: {
      participant1Score: parsed.data.participant1Score,
      participant2Score: parsed.data.participant2Score,
      status: "COMPLETED",
      playedAt: match.playedAt ?? new Date(),
    },
  });

  // Recompute overall tournament progress/status from match results (source of truth).
  const [totalMatches, completedMatches] = await Promise.all([
    prisma.match.count({ where: { tournamentId } }),
    prisma.match.count({ where: { tournamentId, status: "COMPLETED" } }),
  ]);

  let status = tournament.status;
  if (totalMatches > 0 && completedMatches === totalMatches) {
    status = "GROUP_STAGE_COMPLETED";
  } else if (completedMatches > 0) {
    status = "GROUP_STAGE_IN_PROGRESS";
  }
  if (status !== tournament.status) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status } });
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  revalidatePath(`/tournament/${tournament.uniqueCode}`);
  return { success: true, message: "Result saved." };
}
