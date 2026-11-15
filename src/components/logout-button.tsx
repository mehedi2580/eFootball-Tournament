"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  className = "gap-1.5 text-white/80 hover:bg-white/10 hover:text-white",
  labelClassName = "hidden sm:inline",
}: {
  className?: string;
  labelClassName?: string;
} = {}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className={labelClassName}>Log Out</span>
    </Button>
  );
}
