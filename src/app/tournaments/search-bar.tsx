"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeCode } from "@/lib/tournamentCode";

export function TournamentSearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    // If it looks like a tournament code, jump straight to the tournament page.
    if (/^EFO-[A-Z0-9]{4,8}$/i.test(trimmed)) {
      router.push(`/tournament/${normalizeCode(trimmed)}`);
      return;
    }

    router.push(`/tournaments?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter Tournament Code or Name"
        className="text-center sm:text-left"
      />
      <Button type="submit" className="shrink-0 gap-1.5">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
