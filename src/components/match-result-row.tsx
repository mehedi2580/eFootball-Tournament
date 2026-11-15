"use client";

import { useFormState } from "react-dom";
import { saveMatchResultAction } from "@/actions/match";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent } from "@/components/ui/card";

export type MatchResultRowMatch = {
  id: string;
  matchNumber: number;
  participant1Name: string;
  participant2Name: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
};

/**
 * One match with an editable score (organizer only). Used by both the
 * Fixtures panel (group matches) and the Knockout panel (knockout matches).
 * On mobile the names flex and the save button goes full-width below.
 */
export function MatchResultRow({
  tournamentId,
  match,
  label,
}: {
  tournamentId: string;
  match: MatchResultRowMatch;
  /** e.g. "Group A" or "Quarter-Final" */
  label: string;
}) {
  const action = saveMatchResultAction.bind(null, tournamentId);
  const [state, formAction] = useFormState(action, initialActionState);

  return (
    <Card>
      <CardContent className="p-4">
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input type="hidden" name="matchId" value={match.id} />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label} · Match {String(match.matchNumber).padStart(2, "0")}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={match.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-right text-sm font-medium sm:w-32 sm:flex-none">
              {match.participant1Name}
            </span>
            <Input
              type="number"
              name="participant1Score"
              min={0}
              max={999}
              defaultValue={match.participant1Score ?? ""}
              className="w-14 shrink-0 text-center sm:w-16"
              required
            />
            <span className="shrink-0 text-sm text-muted-foreground">–</span>
            <Input
              type="number"
              name="participant2Score"
              min={0}
              max={999}
              defaultValue={match.participant2Score ?? ""}
              className="w-14 shrink-0 text-center sm:w-16"
              required
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium sm:w-32 sm:flex-none">
              {match.participant2Name}
            </span>
          </div>
          <SubmitButton size="sm" pendingText="Saving..." className="w-full sm:w-auto">
            {match.status === "COMPLETED" ? "Update" : "Save"}
          </SubmitButton>
        </form>
        {state.message && !state.success && <p className="mt-2 text-sm text-destructive">{state.message}</p>}
        {(state.fieldErrors?.participant1Score || state.fieldErrors?.participant2Score) && (
          <p className="mt-2 text-sm text-destructive">Scores must be valid non-negative numbers.</p>
        )}
      </CardContent>
    </Card>
  );
}
