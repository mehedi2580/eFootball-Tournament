import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { Users, LayoutGrid, ExternalLink, Settings } from "lucide-react";

export function TournamentCard({
  tournament,
  participantCount,
  groupCount,
  progressPercent,
  manageHref,
  showManage = true,
}: {
  tournament: {
    id: string;
    name: string;
    uniqueCode: string;
    status: string;
    createdAt: Date | string;
    organizerName?: string;
  };
  participantCount: number;
  groupCount: number;
  progressPercent: number;
  manageHref?: string;
  showManage?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{tournament.name}</h3>
          <StatusBadge status={tournament.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{tournament.uniqueCode}</span>
          {tournament.organizerName && <span>by {tournament.organizerName}</span>}
          <span>{formatDate(tournament.createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {participantCount}
          </span>
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" /> {groupCount} groups
          </span>
        </div>
        <Progress value={progressPercent} />
      </CardContent>
      <CardFooter className="flex-wrap gap-2 pt-0">
        {showManage && manageHref && (
          <Link href={manageHref}>
            <Button size="sm" variant="secondary" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Manage
            </Button>
          </Link>
        )}
        <Link href={`/tournament/${tournament.uniqueCode}`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" /> View Public Page
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
