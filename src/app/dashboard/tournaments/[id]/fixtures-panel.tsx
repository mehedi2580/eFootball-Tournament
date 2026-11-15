"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { ListChecks } from "lucide-react";
import { MatchResultRow } from "@/components/match-result-row";
import { stageLabel } from "@/lib/knockout";

type Match = {
  id: string;
  matchNumber: number;
  groupId: string | null;
  groupName: string | null;
  stage: string;
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

  const hasKnockout = matches.some((m) => m.stage !== "GROUP");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (groupFilter === "knockout" && m.stage === "GROUP") return false;
      if (groupFilter !== "all" && groupFilter !== "knockout" && m.groupId !== groupFilter) return false;
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
        <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="w-full sm:w-40">
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
          {hasKnockout && <option value="knockout">Knockout</option>}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40">
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
            <MatchResultRow
              key={m.id}
              tournamentId={tournamentId}
              match={m}
              label={m.stage !== "GROUP" ? stageLabel(m.stage) : m.groupName ?? "Group Stage"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
