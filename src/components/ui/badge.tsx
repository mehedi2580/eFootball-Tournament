import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "muted" | "destructive" | "outline" | "gold";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-amber-500/10 text-amber-700",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
  gold: "bg-gold text-[#1A1200]",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
