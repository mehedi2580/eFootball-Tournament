import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    REGISTRATION: "Registration",
    GROUPS_CREATED: "Groups Created",
    GROUP_STAGE_IN_PROGRESS: "Group Stage In Progress",
    GROUP_STAGE_COMPLETED: "Group Stage Completed",
    KNOCKOUT_STAGE: "Knockout Stage",
    COMPLETED: "Completed",
  };
  return map[status] ?? status;
}

export function statusVariant(
  status: string
): "default" | "success" | "warning" | "muted" {
  switch (status) {
    case "REGISTRATION":
    case "GROUPS_CREATED":
      return "muted";
    case "GROUP_STAGE_IN_PROGRESS":
    case "KNOCKOUT_STAGE":
      return "warning";
    case "GROUP_STAGE_COMPLETED":
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
}
