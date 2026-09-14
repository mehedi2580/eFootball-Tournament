import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { getTournamentByCode } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { code: string; matchId: string };
}): Promise<Metadata> {
  const tournament = await getTournamentByCode(params.code);
  const match = tournament?.matches.find((m) => m.id === params.matchId);
  if (!tournament || !match) return { title: "Match Not Found" };
  return {
    title: `${match.participant1.name} vs ${match.participant2.name} — ${tournament.name}`,
  };
}

export default async function MatchDetailsPage({
  params,
}: {
  params: { code: string; matchId: string };
}) {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament || !tournament.isPublic) notFound();

  const match = tournament.matches.find((m) => m.id === params.matchId);
  if (!match) notFound();

  const isCompleted = match.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href={`/tournament/${tournament.uniqueCode}/fixtures`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to fixtures
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {match.group.name} · Match {String(match.matchNumber).padStart(2, "0")}
            </p>
            <StatusBadge status={match.status} />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <p className="truncate text-right text-lg font-semibold">{match.participant1.name}</p>
            <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-2xl font-bold tabular-nums">
              <span>{isCompleted ? match.participant1Score : "—"}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {isCompleted ? "–" : "vs"}
              </span>
              <span>{isCompleted ? match.participant2Score : "—"}</span>
            </div>
            <p className="truncate text-lg font-semibold">{match.participant2.name}</p>
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Group</span>
              <span className="font-medium">{match.group.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Match Number</span>
              <span className="font-medium">{match.matchNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date / Time</span>
              <span className="font-medium">{isCompleted ? formatDateTime(match.playedAt) : "Not played yet"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{isCompleted ? "Completed" : "Upcoming"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
