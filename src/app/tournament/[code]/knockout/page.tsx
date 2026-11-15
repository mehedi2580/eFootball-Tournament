import { notFound } from "next/navigation";
import { Trophy, Swords } from "lucide-react";
import { getTournamentByCode } from "@/lib/data";
import { buildBracket, getQualifiers, stageLabel } from "@/lib/knockout";
import { MatchCard } from "@/components/match-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TournamentKnockoutPage({ params }: { params: { code: string } }) {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament || !tournament.isPublic) notFound();

  const knockoutMatches = tournament.matches.filter((m) => m.stage !== "GROUP");

  if (knockoutMatches.length === 0) {
    return (
      <EmptyState
        icon={<Swords className="h-8 w-8" />}
        title="Knockout stage hasn't started yet"
        description="The top 2 from each group will qualify once all group matches are complete."
      />
    );
  }

  const qualifiers = getQualifiers(
    tournament.groups.map((g) => ({
      id: g.id,
      name: g.name,
      participants: g.groupParticipants.map((gp) => gp.participant),
    })),
    tournament.matches.filter((m) => m.stage === "GROUP"),
    {
      win: tournament.pointsForWin,
      draw: tournament.pointsForDraw,
      loss: tournament.pointsForLoss,
    }
  );
  const bracket = buildBracket(qualifiers, knockoutMatches);
  const matchById = new Map(tournament.matches.map((m) => [m.id, m]));

  return (
    <div className="space-y-8">
      {bracket.champion && (
        <Card className="border-gold/50 bg-gold-soft p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-[#1A1200]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Champion</p>
              <p className="text-lg font-bold">{bracket.champion.name}</p>
            </div>
          </div>
        </Card>
      )}

      {bracket.rounds.map((round) => (
        <div key={round.stage}>
          <h2 className="mb-2 text-lg font-semibold">{stageLabel(round.stage)}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {round.pairs.map((pair, idx) => {
              if (pair.bye && pair.p1) {
                return (
                  <Card key={`bye-${idx}`} className="p-4">
                    <p className="truncate text-sm font-medium">{pair.p1.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Bye — advances to the next round
                    </p>
                  </Card>
                );
              }
              if (pair.matchId) {
                const m = matchById.get(pair.matchId);
                if (!m) return null;
                return (
                  <MatchCard
                    key={pair.matchId}
                    tournamentCode={tournament.uniqueCode}
                    matchId={m.id}
                    matchNumber={m.matchNumber}
                    groupName={null}
                    stageLabel={stageLabel(round.stage)}
                    participant1Name={m.participant1.name}
                    participant2Name={m.participant2.name}
                    participant1Score={m.participant1Score}
                    participant2Score={m.participant2Score}
                    status={m.status}
                    playedAt={m.playedAt}
                  />
                );
              }
              if (pair.p1 && pair.p2) {
                return (
                  <Card key={`pending-${idx}`} className="p-4">
                    <p className="text-center text-sm font-medium">
                      {pair.p1.name} <span className="text-muted-foreground">vs</span> {pair.p2.name}
                    </p>
                    <p className="mt-1 text-center text-xs text-muted-foreground">
                      Match to be scheduled
                    </p>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
