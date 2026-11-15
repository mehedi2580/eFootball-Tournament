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

  // Group results are frozen once the knockout stage starts — the bracket is
  // built from the group standings, so changing them would invalidate it.
  if (
    match.stage === "GROUP" &&
    (tournament.status === "KNOCKOUT_STAGE" || tournament.status === "COMPLETED")
  ) {
    return {
      success: false,
      message: "Group results are locked once the knockout stage has started.",
    };
  }

  // Knockout matches must produce a winner — no draws.
  if (
    match.stage !== "GROUP" &&
    parsed.data.participant1Score === parsed.data.participant2Score
  ) {
    return {
      success: false,
      message: "Knockout matches cannot end in a draw. Enter a decisive score.",
    };
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
  const knockoutCount = await prisma.match.count({
    where: { tournamentId, stage: { not: "GROUP" } },
  });

  let status = tournament.status;
  if (knockoutCount > 0) {
    const final = await prisma.match.findFirst({
      where: { tournamentId, stage: "FINAL" },
    });
    status = final && final.status === "COMPLETED" ? "COMPLETED" : "KNOCKOUT_STAGE";
  } else {
    const [totalMatches, completedMatches] = await Promise.all([
      prisma.match.count({ where: { tournamentId } }),
      prisma.match.count({ where: { tournamentId, status: "COMPLETED" } }),
    ]);
    if (totalMatches > 0 && completedMatches === totalMatches) {
      status = "GROUP_STAGE_COMPLETED";
    } else if (completedMatches > 0) {
      status = "GROUP_STAGE_IN_PROGRESS";
    }
  }
  if (status !== tournament.status) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status } });
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  revalidatePath(`/tournament/${tournament.uniqueCode}`);
  revalidatePath(`/tournament/${tournament.uniqueCode}/knockout`);
  return { success: true, message: "Result saved." };
}
