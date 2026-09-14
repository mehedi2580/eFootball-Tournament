import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function TournamentNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container-app flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Tournament not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Double-check the tournament code, or search for it below.
        </p>
        <Link href="/tournaments">
          <Button>Find a Tournament</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
