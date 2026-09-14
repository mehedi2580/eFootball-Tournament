import type { StandingsRow } from "@/lib/standings";
import { cn } from "@/lib/utils";

export function StandingsTable({ rows, highlightTop = 0 }: { rows: StandingsRow[]; highlightTop?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <th className="px-3 py-2 text-left font-medium">#</th>
            <th className="px-3 py-2 text-left font-medium">Player</th>
            <th className="px-2 py-2 text-center font-medium">P</th>
            <th className="px-2 py-2 text-center font-medium">W</th>
            <th className="px-2 py-2 text-center font-medium">D</th>
            <th className="px-2 py-2 text-center font-medium">L</th>
            <th className="px-2 py-2 text-center font-medium">GF</th>
            <th className="px-2 py-2 text-center font-medium">GA</th>
            <th className="px-2 py-2 text-center font-medium">GD</th>
            <th className="px-3 py-2 text-center font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={r.participantId}
              className={cn(
                "border-b border-border last:border-0",
                highlightTop > 0 && idx < highlightTop && "bg-primary/5"
              )}
            >
              <td className="px-3 py-2 font-medium text-muted-foreground">{idx + 1}</td>
              <td className="px-3 py-2 font-medium">{r.name}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.played}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.wins}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.draws}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.losses}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.goalsFor}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.goalsAgainst}</td>
              <td className="px-2 py-2 text-center tabular-nums">
                {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
              </td>
              <td className="px-3 py-2 text-center text-base font-bold tabular-nums">{r.points}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                No standings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
