import { useId } from "react";
import { cn } from "@/lib/utils";

/** The eFootball Hub mark: a football on an indigo-to-navy tile with a gold orbit arc. */
export function LogoMark({ className, size = 34 }: { className?: string; size?: number }) {
  // useId contains ":" characters, which break url(#...) references.
  const gradientId = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="2"
          y1="2"
          x2="46"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4D46E8" />
          <stop offset="1" stopColor="#0B1020" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradientId})`} />
      <circle
        cx="24"
        cy="24"
        r="16.5"
        fill="none"
        stroke="#FBBF24"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="26 78"
        transform="rotate(-115 24 24)"
      />
      <circle cx="24" cy="24" r="13" fill="#FFFFFF" />
      <g stroke="#4D46E8" strokeWidth="1.3" opacity="0.5">
        <line x1="24" y1="18.5" x2="24" y2="11.5" />
        <line x1="29.2" y1="22.3" x2="36" y2="20.2" />
        <line x1="27.2" y1="28.5" x2="31.4" y2="34.2" />
        <line x1="20.8" y1="28.5" x2="16.6" y2="34.2" />
        <line x1="18.8" y1="22.3" x2="12" y2="20.2" />
      </g>
      <polygon points="24,18.5 29.2,22.3 27.2,28.5 20.8,28.5 18.8,22.3" fill="#4D46E8" />
    </svg>
  );
}

export function Logo({
  variant = "light",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={34} />
      <span
        className={cn(
          "text-[17px] font-extrabold leading-none tracking-tight",
          variant === "dark" ? "text-white" : "text-foreground"
        )}
      >
        eFootball{" "}
        <span className={variant === "dark" ? "text-gold-light" : "text-primary"}>Hub</span>
      </span>
    </span>
  );
}
