"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Lock } from "lucide-react";
import { randomizeGroupsAction, lockGroupsAndGenerateFixturesAction } from "@/actions/group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { LayoutGrid } from "lucide-react";

type Group = { id: string; name: string; participants: { id: string; name: string }[] };

export function GroupsPanel({
  tournamentId,
  locked,
  numGroups,
  participantCount,
  groups,
}: {
  tournamentId: string;
  locked: boolean;
  numGroups: number;
  participantCount: number;
  groups: Group[];
}) {
  const [confirmRandomize, setConfirmRandomize] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const canRandomize = !locked && participantCount >= numGroups && participantCount >= 2;

  function handleRandomize() {
    setConfirmRandomize(false);
    startTransition(async () => {
      try {
        await randomizeGroupsAction(tournamentId);
        toast("Groups randomized.", "success");
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not randomize groups.", "error");
      }
    });
  }

  function handleLock() {
    setConfirmLock(false);
    startTransition(async () => {
      try {
        await lockGroupsAndGenerateFixturesAction(tournamentId);
        toast("Groups locked and fixtures generated.", "success");
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not lock groups.", "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      {!locked && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Set up groups</p>
              <p className="text-sm text-muted-foreground">
                Randomly distribute {participantCount} participants into {numGroups}{" "}
                {numGroups === 1 ? "group" : "groups"}, then lock them in to generate fixtures.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                disabled={!canRandomize || isPending}
                onClick={() => setConfirmRandomize(true)}
              >
                <Shuffle className="h-4 w-4" />
                {groups.length > 0 ? "Re-randomize" : "Randomize Groups"}
              </Button>
              <Button
                type="button"
                className="gap-1.5"
                disabled={groups.length === 0 || isPending}
                onClick={() => setConfirmLock(true)}
              >
                <Lock className="h-4 w-4" />
                Lock &amp; Generate Fixtures
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-8 w-8" />}
          title="No groups yet"
          description={
            participantCount < numGroups
              ? `Add at least ${numGroups} participants before randomizing groups.`
              : "Click \"Randomize Groups\" to assign participants."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4">
                <p className="mb-2 font-semibold">{g.name}</p>
                <ul className="space-y-1">
                  {g.participants.map((p) => (
                    <li key={p.id} className="text-sm text-muted-foreground">
                      {p.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={confirmRandomize}
        onClose={() => setConfirmRandomize(false)}
        title="Randomize groups?"
        description="Participants will be randomly assigned to groups. Continue?"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmRandomize(false)}>
            Cancel
          </Button>
          <Button onClick={handleRandomize} loading={isPending}>
            Randomize
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={confirmLock}
        onClose={() => setConfirmLock(false)}
        title="Lock groups & generate fixtures?"
        description="Once locked, participants can't be randomly rearranged unless you reset the tournament."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmLock(false)}>
            Cancel
          </Button>
          <Button onClick={handleLock} loading={isPending}>
            Lock &amp; Generate
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
