import { Badge } from "@/components/ui/badge";
import { statusLabel, statusVariant } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>;
}
