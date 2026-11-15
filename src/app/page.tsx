import Link from "next/link";
import { Trophy, Users, BarChart3, ShieldCheck, Swords, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

async function getStats() {
  try {
    const [tournaments, players, matches, goals] = await Promise.all([
      prisma.tournament.count(),
      prisma.participant.count(),
      prisma.match.count({ where: { status: "COMPLETED" } }),
      prisma.match.aggregate({
        _sum: { participant1Score: true, participant2Score: true },
        where: { status: "COMPLETED" },
      }),
    ]);
    return {
      tournaments,
      players,
      matches,
      goals: (goals._sum.participant1Score ?? 0) + (goals._sum.participant2Score ?? 0),
    };
  } catch {
    return null;
  }
}

const marqueeItems = [
  "Group Stage",
  "Knockout Bracket",
  "Quarter-Final",
  "Semi-Final",
  "The Final",
  "Champion",
  "Top Scorer",
  "Live Standings",
];

const features = [
  {
    icon: Users,
    title: "Random FIFA-style groups",
    description: "Add participants, randomize into groups, and lock them in when you're ready.",
  },
  {
    icon: BarChart3,
    title: "Automatic standings & goals",
    description: "Enter a score and standings, points, and top scorers recalculate instantly.",
  },
  {
    icon: Swords,
    title: "Knockout brackets",
    description:
      "Top two from each group qualify with proper seeding and byes — all the way to the final.",
  },
  {
    icon: ShieldCheck,
    title: "Share with a code",
    description: "Every tournament gets a short code like EFO-8K4P2 — no account needed to follow it.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your tournament",
    description: "Name it, set the player count and group size — your code is ready in seconds.",
  },
  {
    number: "02",
    title: "Play the group stage",
    description: "Randomize groups, lock them in, and enter scores as matches are played.",
  },
  {
    number: "03",
    title: "Crown the champion",
    description: "Generate the knockout bracket round by round until one player lifts the trophy.",
  },
];

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="container-app pt-6 sm:pt-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-12 sm:px-12 sm:py-16">
            {/* Pitch-line decoration */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.05]"
              viewBox="0 0 800 500"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <rect x="10" y="10" width="780" height="480" rx="4" stroke="currentColor" strokeWidth="2" />
              <line x1="400" y1="10" x2="400" y2="490" stroke="currentColor" strokeWidth="2" />
              <circle cx="400" cy="250" r="70" stroke="currentColor" strokeWidth="2" />
              <circle cx="400" cy="250" r="4" fill="currentColor" />
              <rect x="10" y="150" width="110" height="200" stroke="currentColor" strokeWidth="2" />
              <rect x="680" y="150" width="110" height="200" stroke="currentColor" strokeWidth="2" />
            </svg>
            {/* Glows */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-light to-gold px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1A1200] shadow-lg">
                <Trophy className="h-3.5 w-3.5" /> Knockout brackets are live
              </span>
              <h1
                className="animate-fade-up mt-6 max-w-3xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                Run <span className="text-gold-light">eFootball</span> tournaments like a pro
              </h1>
              <p
                className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
                style={{ animationDelay: "160ms" }}
              >
                Create FIFA-style group stages, generate fixtures automatically, and let standings
                and goal stats update themselves — then run the knockout bracket through to a
                champion.
              </p>
              <div
                className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Link href="/signup">
                  <Button size="lg">Create a Tournament</Button>
                </Link>
                <Link href="/tournaments">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    Find a Tournament
                  </Button>
                </Link>
              </div>

              {stats && (
                <div
                  className="animate-fade-up mt-10 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4"
                  style={{ animationDelay: "320ms" }}
                >
                  {[
                    { value: stats.tournaments, label: "Tournaments" },
                    { value: stats.players, label: "Players" },
                    { value: stats.matches, label: "Matches played" },
                    { value: stats.goals, label: "Goals scored" },
                  ].map((s) => (
                    <div key={s.label} className="bg-navy/80 px-4 py-4">
                      <p className="text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
                        {s.value}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section
          className="mt-8 overflow-hidden border-y border-border bg-primary/[0.04] py-3"
          aria-hidden="true"
        >
          <div className="animate-marquee flex w-max">
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-8 pr-8">
                {marqueeItems.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-primary/80"
                  >
                    {item}
                    <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container-app py-16 sm:py-20">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Everything in one place
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              From first whistle to champion
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 90} className="h-full">
                <Card className="card-hover h-full">
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="container-app pb-20">
          <Reveal>
            <div className="rounded-[2rem] bg-muted/60 px-6 py-10 sm:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Three steps to kick off
              </h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-3">
                {steps.map((s) => (
                  <div key={s.number}>
                    <p className="text-3xl font-extrabold text-gold">{s.number}</p>
                    <h3 className="mt-2 font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
