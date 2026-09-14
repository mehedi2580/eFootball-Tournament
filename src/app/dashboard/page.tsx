import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Trophy, Activity, CheckCircle2, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getDashboardData } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/components/tournament-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { tournaments, stats } = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user.name}.</p>
        </div>
        <Link href="/dashboard/tournaments/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" /> Create Tournament
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Total Tournaments" value={stats.totalTournaments} />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Active Tournaments" value={stats.activeTournaments} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={stats.completedTournaments} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Total Participants" value={stats.totalParticipants} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Your Tournaments</h2>
        {tournaments.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="No tournaments yet"
            description="Create your first tournament to start adding participants and generating fixtures."
            action={
              <Link href="/dashboard/tournaments/new">
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create Tournament
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const totalMatches = t.matches.length;
              const completedMatches = t.matches.filter((m) => m.status === "COMPLETED").length;
              const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
              return (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  participantCount={t.participants.length}
                  groupCount={t.groups.length}
                  progressPercent={progressPercent}
                  manageHref={`/dashboard/tournaments/${t.id}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
