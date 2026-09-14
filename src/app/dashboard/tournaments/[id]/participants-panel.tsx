"use client";

import { useFormState } from "react-dom";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Lock, X, Check } from "lucide-react";
import { addParticipantAction, editParticipantAction, removeParticipantAction } from "@/actions/participant";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Users } from "lucide-react";

type Participant = { id: string; name: string };

export function ParticipantsPanel({
  tournamentId,
  participants,
  locked,
  maxParticipants,
}: {
  tournamentId: string;
  participants: Participant[];
  locked: boolean;
  maxParticipants: number;
}) {
  const addAction = addParticipantAction.bind(null, tournamentId);
  const [state, formAction] = useFormState(addAction, initialActionState);

  return (
    <div className="space-y-4">
      {locked && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" /> Groups are locked. Reset the tournament from Settings to edit participants.
        </p>
      )}

      {!locked && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add Participant</CardTitle>
            <CardDescription>
              {participants.length} / {maxParticipants} added
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Label htmlFor="participant-name" className="sr-only">
                  Participant name
                </Label>
                <Input id="participant-name" name="name" placeholder="e.g. Messi" required />
                <FieldError messages={state.fieldErrors?.name} />
              </div>
              <SubmitButton pendingText="Adding...">Add</SubmitButton>
            </form>
            {state.message && !state.success && !state.fieldErrors && (
              <p className="mt-2 text-sm text-destructive">{state.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {participants.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="No participants yet" description="Add players above to get started." />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {participants.map((p) => (
            <ParticipantRow key={p.id} tournamentId={tournamentId} participant={p} locked={locked} />
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  tournamentId,
  participant,
  locked,
}: {
  tournamentId: string;
  participant: Participant;
  locked: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const editAction = editParticipantAction.bind(null, tournamentId);
  const [editState, editFormAction] = useFormState(editAction, initialActionState);

  if (editState.success && editing) {
    setEditing(false);
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeParticipantAction(tournamentId, participant.id);
        toast("Participant removed.", "success");
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not remove participant.", "error");
      }
    });
  }

  if (editing) {
    return (
      <form action={editFormAction} className="flex items-center gap-2 p-3">
        <input type="hidden" name="participantId" value={participant.id} />
        <Input name="name" defaultValue={participant.name} autoFocus className="flex-1" />
        <SubmitButton size="icon" variant="ghost" pendingText="">
          <Check className="h-4 w-4" />
        </SubmitButton>
        <Button type="button" size="icon" variant="ghost" onClick={() => setEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 p-3">
      <span className="text-sm font-medium">{participant.name}</span>
      {!locked && (
        <div className="flex items-center gap-1">
          <Button type="button" size="icon" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={handleRemove} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
