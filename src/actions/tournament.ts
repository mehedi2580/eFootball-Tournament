"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createTournamentSchema } from "@/lib/validations";
import { generateUniqueTournamentCode } from "@/lib/tournamentCode";
import type { ActionState } from "@/lib/action-types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTournamentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    organizerName: formData.get("organizerName"),
    numParticipants: formData.get("numParticipants"),
    numGroups: formData.get("numGroups"),
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    isPublic: formData.get("isPublic") === "on",
  };

  const parsed = createTournamentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const participantsPerGroup = Math.ceil(parsed.data.numParticipants / parsed.data.numGroups);
  const uniqueCode = await generateUniqueTournamentCode();

  const tournament = await prisma.tournament.create({
    data: {
      uniqueCode,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      organizerName: parsed.data.organizerName.trim(),
      organizerId: user.id,
      numParticipants: parsed.data.numParticipants,
      numGroups: parsed.data.numGroups,
      participantsPerGroup,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      isPublic: parsed.data.isPublic,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/tournaments/${tournament.id}`);
}

async function assertOwnership(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error("Tournament not found.");
  if (tournament.organizerId !== userId) throw new Error("You do not have permission to manage this tournament.");
  return tournament;
}

export async function deleteTournamentAction(tournamentId: string) {
  const user = await requireUser();
  await assertOwnership(tournamentId, user.id);
  await prisma.tournament.delete({ where: { id: tournamentId } });
  revalidatePath("/dashboard");
}

export async function toggleVisibilityAction(tournamentId: string) {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { isPublic: !tournament.isPublic },
  });
  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}
