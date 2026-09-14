import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOwnedTournament, computeProgress } from "@/lib/data";
import { computeStandings, computeGoalStats } from "@/lib/standings";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ProgressSummary } from "@/components/progress-summary";
import { ShareTournament } from "@/components/share-tournament";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ParticipantsPanel } from "./participants-panel";
import { GroupsPanel } from "./groups-panel";
import { FixturesPanel } from "./fixtures-panel";
import { SettingsPanel } from "./settings-panel";
import { StandingsTable } from "@/components/standings-table";

export const metadata: Metadata = { title: "Manage Tournament" };
export const dynamic = "force-dynamic";

export default async function ManageTournamentPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const tournament = await getOwnedTournament(params.id, user.id);

  if (!tournament || tournament === "forbidden") {
    notFound();
  }

  const totalMatches = tournament.matches.length;
  const completedMatches = tournament.matches.filter((m) => m.status === "COMPLETED").length;
  const progress = computeProgress(totalMatches, completedMatches);

  const goalStats = computeGoalStats(tournament.participants, tournament.matches);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{tournament.name}</h1>
            <StatusBadge status={tournament.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{tournament.uniqueCode}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <ShareTournament code={tournament.uniqueCode} name={tournament.name} />
          <Link href={`/tournament/${tournament.uniqueCode}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> View Public Page
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <ProgressSummary
          totalMatches={progress.totalMatches}
          completedMatches={progress.completedMatches}
          percent={progress.percent}
        />
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
          <span>{tournament.participants.length} participants</span>
          <span>{tournament.groups.length} groups</span>
          <span>{goalStats.totalGoals} total goals</span>
          <span>{progress.remainingMatches} matches remaining</span>
        </div>
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures &amp; Results</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <ParticipantsPanel
            tournamentId={tournament.id}
            participants={tournament.participants.map((p) => ({ id: p.id, name: p.name }))}
            locked={tournament.groupsLocked}
            maxParticipants={tournament.numParticipants}
          />
        </TabsContent>

        <TabsContent value="groups">
          <GroupsPanel
            tournamentId={tournament.id}
            locked={tournament.groupsLocked}
            numGroups={tournament.numGroups}
            participantCount={tournament.participants.length}
            groups={tournament.groups.map((g) => ({
              id: g.id,
              name: g.name,
              participants: g.groupParticipants.map((gp) => ({ id: gp.participant.id, name: gp.participant.name })),
            }))}
          />
        </TabsContent>

        <TabsContent value="fixtures">
          <FixturesPanel
            tournamentId={tournament.id}
            locked={tournament.groupsLocked}
            groups={tournament.groups.map((g) => ({ id: g.id, name: g.name }))}
            matches={tournament.matches.map((m) => ({
              id: m.id,
              matchNumber: m.matchNumber,
              groupId: m.groupId,
              groupName: m.group.name,
              participant1Id: m.participant1Id,
              participant1Name: m.participant1.name,
              participant2Id: m.participant2Id,
              participant2Name: m.participant2.name,
              participant1Score: m.participant1Score,
              participant2Score: m.participant2Score,
              status: m.status,
            }))}
          />
        </TabsContent>

        <TabsContent value="standings">
          {tournament.groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Standings will appear once groups are created.</p>
          ) : (
            <div className="space-y-6">
              {tournament.groups.map((g) => {
                const groupParticipants = g.groupParticipants.map((gp) => gp.participant);
                const groupMatches = tournament.matches.filter((m) => m.groupId === g.id);
                const rows = computeStandings(groupParticipants, groupMatches, {
                  win: tournament.pointsForWin,
                  draw: tournament.pointsForDraw,
                  loss: tournament.pointsForLoss,
                });
                return (
                  <div key={g.id}>
                    <h3 className="mb-2 font-semibold">{g.name}</h3>
                    <StandingsTable rows={rows} />
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel
            tournamentId={tournament.id}
            isPublic={tournament.isPublic}
            groupsLocked={tournament.groupsLocked}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
