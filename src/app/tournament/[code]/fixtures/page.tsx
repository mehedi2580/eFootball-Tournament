import { notFound } from "next/navigation";
import { getTournamentByCode } from "@/lib/data";
import { FixturesList } from "./fixtures-list";

export default async function TournamentFixturesPage({ params }: { params: { code: string } }) {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament || !tournament.isPublic) notFound();

  const matches = tournament.matches.map((m) => ({
    id: m.id,
    matchNumber: m.matchNumber,
    groupId: m.groupId,
    groupName: m.group.name,
    participant1Name: m.participant1.name,
    participant2Name: m.participant2.name,
    participant1Score: m.participant1Score,
    participant2Score: m.participant2Score,
    status: m.status,
    playedAt: m.playedAt,
  }));

  const groups = tournament.groups.map((g) => ({ id: g.id, name: g.name }));

  return <FixturesList tournamentCode={tournament.uniqueCode} groups={groups} matches={matches} />;
}
