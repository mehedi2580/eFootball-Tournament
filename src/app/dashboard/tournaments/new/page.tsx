import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateTournamentForm } from "./create-tournament-form";

export const metadata: Metadata = { title: "Create Tournament" };

export default function NewTournamentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Tournament</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll get a unique tournament code to share once it&apos;s created.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
          <CardDescription>Fill in the basics — you can add participants next.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTournamentForm />
        </CardContent>
      </Card>
    </div>
  );
}
