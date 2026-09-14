"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Log Out</span>
    </Button>
  );
}
