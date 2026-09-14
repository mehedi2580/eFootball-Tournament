import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { searchPublicTournaments } from "@/lib/data";
import { TournamentCard } from "@/components/tournament-card";
import { EmptyState } from "@/components/ui/empty-state";
import { TournamentSearchBar } from "./search-bar";
import { Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Find a Tournament" };
export const dynamic = "force-dynamic";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const tournaments = await searchPublicTournaments(searchParams.q);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-app space-y-8 py-8">
          <div className="mx-auto max-w-xl space-y-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Find Your Tournament</h1>
            <p className="text-sm text-muted-foreground">
              Enter a tournament code (e.g. EFO-8K4P2) or search by name.
            </p>
            <TournamentSearchBar defaultValue={searchParams.q ?? ""} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {searchParams.q ? `Results for "${searchParams.q}"` : "Public Tournaments"}
            </h2>
            {tournaments.length === 0 ? (
              <EmptyState
                icon={<Trophy className="h-8 w-8" />}
                title="No tournaments found"
                description="Try a different code or name, or check back later."
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
                      showManage={false}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
