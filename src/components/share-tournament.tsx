"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/ui/toast";

export function ShareTournament({ code, name }: { code: string; name: string }) {
  const { toast } = useToast();
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${siteUrl}/tournament/${code}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `Follow ${name} — code ${code}`, url: shareUrl });
      } catch {
        // user cancelled - no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast("Link copied to clipboard.", "success");
      } catch {
        toast("Could not copy link.", "error");
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={code} label="Copy Code" />
      <CopyButton value={shareUrl} label="Copy Link" />
      <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={handleNativeShare}>
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
    </div>
  );
}
