"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { addParticipantSchema, editParticipantSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/action-types";
import { revalidatePath } from "next/cache";

async function assertOwnership(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error("Tournament not found.");
  if (tournament.organizerId !== userId) {
    throw new Error("You do not have permission to manage this tournament.");
  }
  return tournament;
}

export async function addParticipantAction(
  tournamentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);

  if (tournament.groupsLocked) {
    return { success: false, message: "Groups are locked. Reset the tournament to add participants." };
  }

  const parsed = addParticipantSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const name = parsed.data.name.trim();

  const duplicate = await prisma.participant.findFirst({
    where: { tournamentId, name: { equals: name, mode: "insensitive" } },
  });
  if (duplicate) {
    return { success: false, fieldErrors: { name: ["This participant is already in the tournament."] } };
  }

  const count = await prisma.participant.count({ where: { tournamentId } });
  if (count >= tournament.numParticipants) {
    return {
      success: false,
      message: `This tournament is set for ${tournament.numParticipants} participants. Increase the limit or remove someone first.`,
    };
  }

  await prisma.participant.create({ data: { tournamentId, name } });
  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  return { success: true, message: "Participant added." };
}

export async function editParticipantAction(
  tournamentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  await assertOwnership(tournamentId, user.id);

  const parsed = editParticipantSchema.safeParse({
    participantId: formData.get("participantId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const name = parsed.data.name.trim();
  const duplicate = await prisma.participant.findFirst({
    where: {
      tournamentId,
      name: { equals: name, mode: "insensitive" },
      NOT: { id: parsed.data.participantId },
    },
  });
  if (duplicate) {
    return { success: false, fieldErrors: { name: ["This participant is already in the tournament."] } };
  }

  await prisma.participant.update({
    where: { id: parsed.data.participantId },
    data: { name },
  });
  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  return { success: true, message: "Participant updated." };
}

export async function removeParticipantAction(tournamentId: string, participantId: string) {
  const user = await requireUser();
  const tournament = await assertOwnership(tournamentId, user.id);

  if (tournament.groupsLocked) {
    throw new Error("Groups are locked. Reset the tournament to remove participants.");
  }

  await prisma.participant.delete({ where: { id: participantId } });
  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}
