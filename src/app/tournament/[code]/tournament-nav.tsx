"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TournamentNav({ code }: { code: string }) {
  const pathname = usePathname();
  const base = `/tournament/${code}`;

  const items = [
    { href: base, label: "Overview" },
    { href: `${base}/groups`, label: "Groups" },
    { href: `${base}/fixtures`, label: "Fixtures" },
    { href: `${base}/results`, label: "Results" },
    { href: `${base}/standings`, label: "Standings" },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 scrollbar-thin">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
