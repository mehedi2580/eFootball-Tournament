import type { StandingsRow } from "@/lib/standings";
import { cn } from "@/lib/utils";

export function StandingsTable({ rows, highlightTop = 0 }: { rows: StandingsRow[]; highlightTop?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[400px] text-sm sm:min-w-[560px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <th className="px-2 py-2 text-left font-medium sm:px-3">#</th>
            <th className="px-2 py-2 text-left font-medium sm:px-3">Player</th>
            <th className="px-1 py-2 text-center font-medium sm:px-2">P</th>
            <th className="px-1 py-2 text-center font-medium sm:px-2">W</th>
            <th className="px-1 py-2 text-center font-medium sm:px-2">D</th>
            <th className="px-1 py-2 text-center font-medium sm:px-2">L</th>
            <th className="hidden px-2 py-2 text-center font-medium sm:table-cell">GF</th>
            <th className="hidden px-2 py-2 text-center font-medium sm:table-cell">GA</th>
            <th className="px-1 py-2 text-center font-medium sm:px-2">GD</th>
            <th className="px-2 py-2 text-center font-medium sm:px-3">Pts</th>
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
              <td className="px-2 py-2 font-medium text-muted-foreground sm:px-3">{idx + 1}</td>
              <td className="max-w-[120px] truncate px-2 py-2 font-medium sm:max-w-none sm:px-3">{r.name}</td>
              <td className="px-1 py-2 text-center tabular-nums sm:px-2">{r.played}</td>
              <td className="px-1 py-2 text-center tabular-nums sm:px-2">{r.wins}</td>
              <td className="px-1 py-2 text-center tabular-nums sm:px-2">{r.draws}</td>
              <td className="px-1 py-2 text-center tabular-nums sm:px-2">{r.losses}</td>
              <td className="hidden px-2 py-2 text-center tabular-nums sm:table-cell">{r.goalsFor}</td>
              <td className="hidden px-2 py-2 text-center tabular-nums sm:table-cell">{r.goalsAgainst}</td>
              <td className="px-1 py-2 text-center tabular-nums sm:px-2">
                {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
              </td>
              <td className="px-2 py-2 text-center text-base font-bold tabular-nums sm:px-3">{r.points}</td>
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
