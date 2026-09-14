import { Progress } from "@/components/ui/progress";

export function ProgressSummary({
  totalMatches,
  completedMatches,
  percent,
}: {
  totalMatches: number;
  completedMatches: number;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">
          {completedMatches} / {totalMatches} Matches Completed
        </span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
