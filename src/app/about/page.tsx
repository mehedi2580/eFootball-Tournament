import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Trophy, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { GitHubIcon, XIcon, TelegramIcon } from "@/components/social-icons";

export const metadata: Metadata = { title: "About Us" };

const socials = [
  {
    name: "GitHub",
    handle: "@mehedi2580",
    href: "https://github.com/mehedi2580",
    Icon: GitHubIcon,
  },
  {
    name: "X",
    handle: "@0xZeroBit",
    href: "https://x.com/0xZeroBit",
    Icon: XIcon,
  },
  {
    name: "Telegram",
    handle: "@Mehedi322",
    href: "https://t.me/Mehedi322",
    Icon: TelegramIcon,
  },
];

const stack = ["Solidity", "Ethereum", "DeFi", "TypeScript", "JavaScript", "React", "Node.js"];

const projects = [
  {
    icon: Trophy,
    title: "eFootball Hub",
    description:
      "This site — run FIFA-style eFootball tournaments with group stages and knockout brackets, no spreadsheets needed.",
    href: "/",
    linkText: "Visit the site",
  },
  {
    icon: Users,
    title: "Shelby-Hub",
    description: "A community hub project — one of the things I'm building alongside eFootball Hub.",
    href: "https://github.com/mehedi2580/Shelby-Hub",
    linkText: "View on GitHub",
  },
  {
    icon: Code2,
    title: "ARC-Community",
    description:
      "A Web3 community project in the works — built around DeFi research and shared learning.",
    href: null,
    linkText: "",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="container-app pt-6 sm:pt-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-12 sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              {/* Profile photo served from X's CDN (the @0xZeroBit avatar).
                  Plain <img>: the repo's push route only accepts UTF-8 text
                  files, so the photo can't live in public/ — and a remote
                  next/image would need extra config for no real gain at 400px. */}
              <img
                src="https://pbs.twimg.com/profile_images/1962848607146848256/ZmtqZxa1_400x400.jpg"
                alt="Mehedi Hasan (0xZeroBit)"
                width={400}
                height={400}
                className="animate-fade-up h-36 w-36 rounded-full object-cover ring-4 ring-gold/70 sm:h-44 sm:w-44"
              />
              <h1
                className="animate-fade-up mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
                style={{ animationDelay: "80ms" }}
              >
                Mehedi Hasan
              </h1>
              <p
                className="animate-fade-up mt-2 text-lg font-bold text-gold-light"
                style={{ animationDelay: "160ms" }}
              >
                @0xZeroBit
              </p>
              <p
                className="animate-fade-up mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
                style={{ animationDelay: "240ms" }}
              >
                Web3 Enthusiast · Crypto Researcher · Open Source Builder
              </p>
              <div
                className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
                style={{ animationDelay: "320ms" }}
              >
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-white/20"
                  >
                    <s.Icon className="h-4 w-4" />
                    {s.name} · {s.handle}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="container-app py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">About Me</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Web3 builder, on and off the pitch
            </h2>
            <div className="mt-5 space-y-4 text-left text-base leading-relaxed text-muted-foreground">
              <p>
                I&apos;m a Web3 builder passionate about{" "}
                <span className="font-semibold text-foreground">blockchain</span>,{" "}
                <span className="font-semibold text-foreground">DeFi</span>, and decentralized
                ecosystems. I spend my time researching protocols, exploring testnets, and building
                tools and communities around them.
              </p>
              <p>
                Right now I&apos;m building{" "}
                <span className="font-semibold text-foreground">Shelby-Hub</span> and{" "}
                <span className="font-semibold text-foreground">ARC-Community</span>, learning{" "}
                <span className="font-semibold text-foreground">Solidity</span> and smart contract
                security — and I&apos;m always open to collaborating on Web3 tools and DeFi
                research. Ask me about testnets, airdrops, and crypto research: every airdrop is a
                lesson in protocol design.
              </p>
              <p>
                When I&apos;m not on-chain, I&apos;m running eFootball tournaments —{" "}
                <span className="font-semibold text-foreground">eFootball Hub</span> is my project
                for doing exactly that, with proper group stages and knockout brackets.
              </p>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal className="mx-auto mt-10 max-w-2xl" delay={120}>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {[
                { value: "2018", label: "On GitHub since" },
                { value: "22", label: "Public repos" },
                { value: "Solidity", label: "Currently learning" },
              ].map((s) => (
                <div key={s.label} className="bg-card px-3 py-4 text-center">
                  <p className="text-xl font-extrabold tabular-nums sm:text-2xl">{s.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Tech stack */}
          <Reveal className="mx-auto mt-10 max-w-2xl text-center" delay={180}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tech Stack</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Projects */}
        <section className="container-app pb-20">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              What I&apos;m Building
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Projects & communities
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} className="h-full">
                <div className="card-hover flex h-full flex-col rounded-[1.25rem] border border-border bg-card p-6">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                  {p.href && (
                    <Link
                      href={p.href}
                      {...(p.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="mt-4 text-sm font-semibold text-primary hover:underline"
                    >
                      {p.linkText} →
                    </Link>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
