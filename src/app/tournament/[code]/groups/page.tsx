import { notFound } from "next/navigation";
import { getTournamentByCode } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutGrid } from "lucide-react";

export default async function TournamentGroupsPage({ params }: { params: { code: string } }) {
  const tournament = await getTournamentByCode(params.code);
  if (!tournament || !tournament.isPublic) notFound();

  if (tournament.groups.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="h-8 w-8" />}
        title="Groups haven't been created yet"
        description="Check back once the organizer randomizes and locks the groups."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tournament.groups.map((g) => (
        <Card key={g.id}>
          <CardContent className="p-4">
            <p className="mb-2 font-semibold">{g.name}</p>
            <ul className="space-y-1">
              {g.groupParticipants.map((gp) => (
                <li key={gp.id} className="text-sm text-muted-foreground">
                  {gp.participant.name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
