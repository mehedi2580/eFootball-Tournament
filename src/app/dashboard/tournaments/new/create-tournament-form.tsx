"use client";

import { useFormState } from "react-dom";
import { createTournamentAction } from "@/actions/tournament";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { SubmitButton } from "@/components/ui/submit-button";

export function CreateTournamentForm() {
  const [state, formAction] = useFormState(createTournamentAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="name">Tournament Name</Label>
        <Input id="name" name="name" required className="mt-1.5" placeholder="eFootball Champions League" />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          className="mt-1.5"
          placeholder="A friendly group-stage tournament for the squad."
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div>
        <Label htmlFor="organizerName">Organizer Name</Label>
        <Input id="organizerName" name="organizerName" required className="mt-1.5" placeholder="Your name" />
        <FieldError messages={state.fieldErrors?.organizerName} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numParticipants">Number of Participants</Label>
          <Input
            id="numParticipants"
            name="numParticipants"
            type="number"
            min={4}
            max={128}
            defaultValue={8}
            required
            className="mt-1.5"
          />
          <FieldError messages={state.fieldErrors?.numParticipants} />
        </div>
        <div>
          <Label htmlFor="numGroups">Number of Groups</Label>
          <Input
            id="numGroups"
            name="numGroups"
            type="number"
            min={1}
            max={32}
            defaultValue={2}
            required
            className="mt-1.5"
          />
          <FieldError messages={state.fieldErrors?.numGroups} />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Participants per group is calculated automatically once groups are randomized.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" className="mt-1.5" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublic"
          name="isPublic"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <Label htmlFor="isPublic" className="font-normal">
          Make this tournament public (visible on the search page and by code)
        </Label>
      </div>

      {state.message && !state.success && <p className="text-sm text-destructive">{state.message}</p>}

      <SubmitButton className="w-full" pendingText="Creating tournament...">
        Create Tournament
      </SubmitButton>
    </form>
  );
}
