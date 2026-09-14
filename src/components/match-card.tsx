import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type MatchCardProps = {
  tournamentCode: string;
  matchId: string;
  matchNumber: number;
  groupName: string;
  participant1Name: string;
  participant2Name: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
  playedAt: Date | string | null;
};

export function MatchCard(props: MatchCardProps) {
  const {
    tournamentCode,
    matchId,
    matchNumber,
    groupName,
    participant1Name,
    participant2Name,
    participant1Score,
    participant2Score,
    status,
    playedAt,
  } = props;

  const isCompleted = status === "COMPLETED";

  return (
    <Link href={`/tournament/${tournamentCode}/match/${matchId}`}>
      <Card className="p-4 transition-colors hover:border-primary/40">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {groupName} · Match {String(matchNumber).padStart(2, "0")}
          </p>
          <StatusBadge status={isCompleted ? "COMPLETED" : "UPCOMING"} />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="truncate text-right text-sm font-semibold">{participant1Name}</p>
          <div className="flex items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-bold tabular-nums">
            <span>{isCompleted ? participant1Score : "—"}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {isCompleted ? "–" : "vs"}
            </span>
            <span>{isCompleted ? participant2Score : "—"}</span>
          </div>
          <p className="truncate text-sm font-semibold">{participant2Name}</p>
        </div>
        {isCompleted && playedAt && (
          <p className="mt-3 text-center text-xs text-muted-foreground">{formatDateTime(playedAt)}</p>
        )}
      </Card>
    </Link>
  );
}
