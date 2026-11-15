import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournamentByCode } from "@/lib/data";
import { computeStandings, computeGoalStats } from "@/lib/standings";
import { buildBracket, getQualifiers, stageLabel } from "@/lib/knockout";
import { StandingsTable } from "@/components/standings-table";
import { MatchCard } from "@/components/match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default async function TournamentOverviewPage({ params }: { params: { code: string } }) {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament || !tournament.isPublic) notFound();

  const groupMatches = tournament.matches.filter((m) => m.stage === "GROUP");
  const standings = computeStandings(tournament.participants, groupMatches, {
    win: tournament.pointsForWin,
    draw: tournament.pointsForDraw,
    loss: tournament.pointsForLoss,
  });
  const goalStats = computeGoalStats(tournament.participants, tournament.matches);
  const knockoutMatches = tournament.matches.filter((m) => m.stage !== "GROUP");
  const champion =
    knockoutMatches.length > 0
      ? buildBracket(
          getQualifiers(
            tournament.groups.map((g) => ({
              id: g.id,
              name: g.name,
              participants: g.groupParticipants.map((gp) => gp.participant),
            })),
            groupMatches,
            {
              win: tournament.pointsForWin,
              draw: tournament.pointsForDraw,
              loss: tournament.pointsForLoss,
            }
          ),
          knockoutMatches
        ).champion
      : null;
  const recentResults = tournament.matches
    .filter((m) => m.status === "COMPLETED")
    .sort((a, b) => (b.playedAt?.getTime() ?? 0) - (a.playedAt?.getTime() ?? 0))
    .slice(0, 4);
  const upcoming = tournament.matches.filter((m) => m.status === "UPCOMING").slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Goals</p>
            <p className="mt-1 text-2xl font-bold">{goalStats.totalGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Goals / Match</p>
            <p className="mt-1 text-2xl font-bold">{goalStats.goalsPerMatch}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top Scorer</p>
            <p className="mt-1 text-2xl font-bold">
              {goalStats.topScorers[0] ? `${goalStats.topScorers[0].name} (${goalStats.topScorers[0].goals})` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {champion && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Champion</p>
              <p className="text-lg font-bold">{champion.name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {tournament.groups.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Standings</h2>
            <Link href={`/tournament/${tournament.uniqueCode}/standings`}>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <StandingsTable rows={standings.slice(0, 5)} highlightTop={Math.min(1, standings.length)} />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Results</h2>
            <Link href={`/tournament/${tournament.uniqueCode}/results`}>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          {recentResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results yet.</p>
          ) : (
            <div className="space-y-2">
              {recentResults.map((m) => (
                <MatchCard
                  key={m.id}
                  tournamentCode={tournament.uniqueCode}
                  matchId={m.id}
                  matchNumber={m.matchNumber}
                  groupName={m.group?.name ?? null}
                  stageLabel={m.stage !== "GROUP" ? stageLabel(m.stage) : null}
                  participant1Name={m.participant1.name}
                  participant2Name={m.participant2.name}
                  participant1Score={m.participant1Score}
                  participant2Score={m.participant2Score}
                  status={m.status}
                  playedAt={m.playedAt}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Fixtures</h2>
            <Link href={`/tournament/${tournament.uniqueCode}/fixtures`}>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming fixtures.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((m) => (
                <MatchCard
                  key={m.id}
                  tournamentCode={tournament.uniqueCode}
                  matchId={m.id}
                  matchNumber={m.matchNumber}
                  groupName={m.group?.name ?? null}
                  stageLabel={m.stage !== "GROUP" ? stageLabel(m.stage) : null}
                  participant1Name={m.participant1.name}
                  participant2Name={m.participant2.name}
                  participant1Score={m.participant1Score}
                  participant2Score={m.participant2Score}
                  status={m.status}
                  playedAt={m.playedAt}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
