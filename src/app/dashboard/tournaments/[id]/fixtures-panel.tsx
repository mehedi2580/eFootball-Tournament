"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { saveMatchResultAction } from "@/actions/match";
import { initialActionState } from "@/lib/action-types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListChecks } from "lucide-react";

type Match = {
  id: string;
  matchNumber: number;
  groupId: string;
  groupName: string;
  participant1Id: string;
  participant1Name: string;
  participant2Id: string;
  participant2Name: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
};

export function FixturesPanel({
  tournamentId,
  locked,
  groups,
  matches,
}: {
  tournamentId: string;
  locked: boolean;
  groups: { id: string; name: string }[];
  matches: Match[];
}) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (groupFilter !== "all" && m.groupId !== groupFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return true;
    });
  }, [matches, groupFilter, statusFilter]);

  if (!locked) {
    return (
      <EmptyState
        icon={<ListChecks className="h-8 w-8" />}
        title="Fixtures haven't been generated yet"
        description="Randomize and lock groups in the Groups tab to automatically generate fixtures."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="w-40">
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="all">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-8 w-8" />} title="No matches match this filter" />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MatchResultRow key={m.id} tournamentId={tournamentId} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchResultRow({ tournamentId, match }: { tournamentId: string; match: Match }) {
  const action = saveMatchResultAction.bind(null, tournamentId);
  const [state, formAction] = useFormState(action, initialActionState);

  return (
    <Card>
      <CardContent className="p-4">
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input type="hidden" name="matchId" value={match.id} />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {match.groupName} · Match {String(match.matchNumber).padStart(2, "0")}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={match.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 truncate text-right text-sm font-medium sm:w-32">{match.participant1Name}</span>
            <Input
              type="number"
              name="participant1Score"
              min={0}
              max={999}
              defaultValue={match.participant1Score ?? ""}
              className="w-16 text-center"
              required
            />
            <span className="text-sm text-muted-foreground">–</span>
            <Input
              type="number"
              name="participant2Score"
              min={0}
              max={999}
              defaultValue={match.participant2Score ?? ""}
              className="w-16 text-center"
              required
            />
            <span className="w-28 truncate text-sm font-medium sm:w-32">{match.participant2Name}</span>
          </div>
          <SubmitButton size="sm" pendingText="Saving...">
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
