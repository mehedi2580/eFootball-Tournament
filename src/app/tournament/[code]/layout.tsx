import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getTournamentByCode } from "@/lib/data";
import { normalizeCode } from "@/lib/tournamentCode";
import { StatusBadge } from "@/components/status-badge";
import { ShareTournament } from "@/components/share-tournament";
import { ProgressSummary } from "@/components/progress-summary";
import { computeProgress } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { TournamentNav } from "./tournament-nav";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament) {
    return { title: "Tournament Not Found" };
  }
  const title = `${tournament.name} — ${tournament.uniqueCode}`;
  const description =
    tournament.description ||
    `Follow ${tournament.name}, an eFootball tournament with ${tournament.numParticipants} participants across ${tournament.numGroups} groups.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicTournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { code: string };
}) {
  const tournament = await getTournamentByCode(params.code);

  if (!tournament) {
    notFound();
  }

  if (!tournament.isPublic) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container-app flex flex-1 flex-col items-center justify-center py-24 text-center">
          <h1 className="text-xl font-semibold">This tournament is private</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The organizer has not made this tournament publicly visible.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const totalMatches = tournament.matches.length;
  const completedMatches = tournament.matches.filter((m) => m.status === "COMPLETED").length;
  const progress = computeProgress(totalMatches, completedMatches);
  const code = normalizeCode(params.code);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30">
          <div className="container-app space-y-4 py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{tournament.name}</h1>
                  <StatusBadge status={tournament.status} />
                </div>
                {tournament.description && (
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{tournament.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-mono font-medium text-foreground">{tournament.uniqueCode}</span>
                  <span>Organized by {tournament.organizerName}</span>
                  {(tournament.startDate || tournament.endDate) && (
                    <span>
                      {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                    </span>
                  )}
                  <span>{tournament.participants.length} participants</span>
                  <span>{tournament.groups.length} groups</span>
                </div>
              </div>
              <ShareTournament code={code} name={tournament.name} />
            </div>
            <ProgressSummary
              totalMatches={progress.totalMatches}
              completedMatches={progress.completedMatches}
              percent={progress.percent}
            />
            <TournamentNav code={code} />
          </div>
        </div>
        <div className="container-app py-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
