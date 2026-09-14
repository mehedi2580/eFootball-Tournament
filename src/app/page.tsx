import Link from "next/link";
import { Trophy, Users, ShieldCheck, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container-app flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            Run eFootball tournaments without the spreadsheets
          </h1>
          <p className="max-w-xl text-muted-foreground sm:text-lg">
            Create FIFA-style group stages, generate fixtures automatically, and let standings and goal
            stats update themselves as results come in. Share a code and anyone can follow along.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Create a Tournament</Button>
            </Link>
            <Link href="/tournaments">
              <Button size="lg" variant="outline">
                Find a Tournament
              </Button>
            </Link>
          </div>
        </section>

        <section className="container-app grid gap-4 pb-20 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-5 w-5 text-primary" />
              <CardTitle>Random FIFA-style groups</CardTitle>
              <CardDescription>
                Add participants, randomize into groups, and lock them in when you&apos;re ready.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="mb-2 h-5 w-5 text-primary" />
              <CardTitle>Automatic standings &amp; goals</CardTitle>
              <CardDescription>
                Enter a score and standings, points, and top scorers recalculate instantly.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
              <CardTitle>Share with a code</CardTitle>
              <CardDescription>
                Every tournament gets a short code like EFO-8K4P2 — no account needed to follow it.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
