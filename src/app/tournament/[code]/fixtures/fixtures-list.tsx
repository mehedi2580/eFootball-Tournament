"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import { MatchCard } from "@/components/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListChecks } from "lucide-react";

type Match = {
  id: string;
  matchNumber: number;
  groupId: string;
  groupName: string;
  participant1Name: string;
  participant2Name: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
  playedAt: Date | string | null;
};

export function FixturesList({
  tournamentCode,
  groups,
  matches,
  statusLock,
}: {
  tournamentCode: string;
  groups: { id: string; name: string }[];
  matches: Match[];
  /** When set, the status filter is hidden and matches are pre-filtered to this status (used by the Results page). */
  statusLock?: "COMPLETED" | "UPCOMING";
}) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>(statusLock ?? "all");

  const participants = useMemo(() => {
    const names = new Set<string>();
    matches.forEach((m) => {
      names.add(m.participant1Name);
      names.add(m.participant2Name);
    });
    return Array.from(names).sort();
  }, [matches]);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (groupFilter !== "all" && m.groupId !== groupFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (
        participantFilter !== "all" &&
        m.participant1Name !== participantFilter &&
        m.participant2Name !== participantFilter
      )
        return false;
      return true;
    });
  }, [matches, groupFilter, statusFilter, participantFilter]);

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
        <Select value={participantFilter} onChange={(e) => setParticipantFilter(e.target.value)} className="w-44">
          <option value="all">All Participants</option>
          {participants.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        {!statusLock && (
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="all">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-8 w-8" />} title="No matches found" description="Try a different filter." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((m) => (
            <MatchCard
              key={m.id}
              tournamentCode={tournamentCode}
              matchId={m.id}
              matchNumber={m.matchNumber}
              groupName={m.groupName}
              participant1Name={m.participant1Name}
              participant2Name={m.participant2Name}
              participant1Score={m.participant1Score}
              participant2Score={m.participant2Score}
              status={m.status}
              playedAt={m.playedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
