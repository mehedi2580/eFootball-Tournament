import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "muted" | "destructive" | "outline";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-amber-500/10 text-amber-700",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
