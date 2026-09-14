"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Eye, EyeOff } from "lucide-react";
import { toggleVisibilityAction, deleteTournamentAction } from "@/actions/tournament";
import { resetTournamentAction } from "@/actions/group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function SettingsPanel({
  tournamentId,
  isPublic,
  groupsLocked,
}: {
  tournamentId: string;
  isPublic: boolean;
  groupsLocked: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function handleToggleVisibility() {
    startTransition(async () => {
      try {
        await toggleVisibilityAction(tournamentId);
        toast(isPublic ? "Tournament is now private." : "Tournament is now public.", "success");
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not update visibility.", "error");
      }
    });
  }

  function handleReset() {
    setConfirmReset(false);
    startTransition(async () => {
      try {
        await resetTournamentAction(tournamentId);
        toast("Tournament reset to registration.", "success");
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not reset tournament.", "error");
      }
    });
  }

  function handleDelete() {
    setConfirmDelete(false);
    startTransition(async () => {
      try {
        await deleteTournamentAction(tournamentId);
        toast("Tournament deleted.", "success");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not delete tournament.", "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Visibility</CardTitle>
          <CardDescription>
            {isPublic
              ? "Anyone with the code or link can view this tournament."
              : "Only you can view this tournament's page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-1.5" onClick={handleToggleVisibility} disabled={isPending}>
            {isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Make {isPublic ? "Private" : "Public"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Reset Tournament</CardTitle>
          <CardDescription>
            Removes all groups, fixtures, and results, and returns the tournament to Registration. Participants
            are kept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => setConfirmReset(true)}
            disabled={isPending || (!groupsLocked && false)}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Groups &amp; Fixtures
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this tournament and all of its data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="gap-1.5" onClick={() => setConfirmDelete(true)} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            Delete Tournament
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset this tournament?"
        description="All groups, fixtures, and match results will be permanently deleted. This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReset} loading={isPending}>
            Reset
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this tournament?"
        description="This will permanently delete the tournament, its participants, groups, and match results. This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={isPending}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
