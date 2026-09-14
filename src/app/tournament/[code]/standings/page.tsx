import { notFound } from "next/navigation";
import { getTournamentByCode } from "@/lib/data";
import { computeStandings, computeGoalStats } from "@/lib/standings";
import { StandingsTable } from "@/components/standings-table";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export default async function TournamentStandingsPage({ params }: { params: { code: string } }) {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament || !tournament.isPublic) notFound();

  if (tournament.groups.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-8 w-8" />}
        title="Standings aren't available yet"
        description="Standings will appear once groups are created and matches are played."
      />
    );
  }

  const goalStats = computeGoalStats(tournament.participants, tournament.matches);
  const scoring = { win: tournament.pointsForWin, draw: tournament.pointsForDraw, loss: tournament.pointsForLoss };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-lg font-semibold">Goal Statistics</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Goals</p>
              <p className="mt-1 text-xl font-bold">{goalStats.totalGoals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Goals / Match</p>
              <p className="mt-1 text-xl font-bold">{goalStats.goalsPerMatch}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Matches Played</p>
              <p className="mt-1 text-xl font-bold">{goalStats.matchesPlayed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Highest Scoring Match</p>
              <p className="mt-1 text-xl font-bold">{goalStats.highestScoringMatch?.total ?? "—"}</p>
            </CardContent>
          </Card>
        </div>
        {goalStats.topScorers.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-sm font-medium">Top Scorers</p>
            <div className="overflow-hidden rounded-lg border border-border">
              {goalStats.topScorers.map((s, idx) => (
                <div
                  key={s.participantId}
                  className="flex items-center justify-between border-b border-border px-3 py-2 text-sm last:border-0"
                >
                  <span>
                    <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                    {s.name}
                  </span>
                  <span className="font-semibold tabular-nums">{s.goals}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {tournament.groups.map((g) => {
          const groupParticipants = g.groupParticipants.map((gp) => gp.participant);
          const groupMatches = tournament.matches.filter((m) => m.groupId === g.id);
          const rows = computeStandings(groupParticipants, groupMatches, scoring);
          return (
            <div key={g.id}>
              <h3 className="mb-2 font-semibold">{g.name}</h3>
              <StandingsTable rows={rows} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
