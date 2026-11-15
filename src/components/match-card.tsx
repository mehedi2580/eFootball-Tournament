import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type MatchCardProps = {
  tournamentCode: string;
  matchId: string;
  matchNumber: number;
  groupName: string | null;
  /** Shown instead of the group name for knockout matches. */
  stageLabel?: string | null;
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
    stageLabel,
    participant1Name,
    participant2Name,
    participant1Score,
    participant2Score,
    status,
    playedAt,
  } = props;

  const isCompleted = status === "COMPLETED";
  const p1Won = isCompleted && (participant1Score ?? 0) > (participant2Score ?? 0);
  const p2Won = isCompleted && (participant2Score ?? 0) > (participant1Score ?? 0);

  return (
    <Link href={`/tournament/${tournamentCode}/match/${matchId}`}>
      <Card className="card-hover bg-[#F9F9FE] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stageLabel ?? groupName ?? "Match"} · Match {String(matchNumber).padStart(2, "0")}
          </p>
          <StatusBadge status={isCompleted ? "COMPLETED" : "UPCOMING"} />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          <p className="truncate text-right text-[13px] font-semibold sm:text-sm">{participant1Name}</p>
          <div className="flex items-center justify-center gap-2 rounded-md bg-white px-2 py-1 text-sm font-bold tabular-nums shadow-sm sm:px-3 sm:py-1.5">
            <span className={p1Won ? "text-emerald-600" : undefined}>
              {isCompleted ? participant1Score : "—"}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {isCompleted ? "–" : "vs"}
            </span>
            <span className={p2Won ? "text-emerald-600" : undefined}>
              {isCompleted ? participant2Score : "—"}
            </span>
          </div>
          <p className="truncate text-[13px] font-semibold sm:text-sm">{participant2Name}</p>
        </div>
        {isCompleted && playedAt && (
          <p className="mt-3 text-center text-xs text-muted-foreground">{formatDateTime(playedAt)}</p>
        )}
      </Card>
    </Link>
  );
}
