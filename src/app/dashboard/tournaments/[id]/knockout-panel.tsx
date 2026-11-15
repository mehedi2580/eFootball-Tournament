"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Swords } from "lucide-react";
import {
  generateKnockoutAction,
  generateNextKnockoutRoundAction,
} from "@/actions/knockout";
import { buildBracket, getQualifiers, stageLabel } from "@/lib/knockout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { MatchResultRow } from "@/components/match-result-row";

type PanelMatch = {
  id: string;
  matchNumber: number;
  groupId: string | null;
  stage: string;
  participant1Id: string;
  participant1Name: string;
  participant2Id: string;
  participant2Name: string;
  participant1Score: number | null;
  participant2Score: number | null;
  status: "UPCOMING" | "COMPLETED";
};

type PanelGroup = {
  id: string;
  name: string;
  participants: { id: string; name: string }[];
};

export function KnockoutPanel({
  tournamentId,
  status,
  groups,
  matches,
  scoring,
}: {
  tournamentId: string;
  status: string;
  groups: PanelGroup[];
  matches: PanelMatch[];
  scoring: { win: number; draw: number; loss: number };
}) {
  const [confirmGenerate, setConfirmGenerate] = useState(false);
  const [confirmNext, setConfirmNext] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const groupMatches = useMemo(() => matches.filter((m) => m.stage === "GROUP"), [matches]);
  const knockoutMatches = useMemo(() => matches.filter((m) => m.stage !== "GROUP"), [matches]);

  const qualifiers = useMemo(
    () => getQualifiers(groups, groupMatches, scoring),
    [groups, groupMatches, scoring]
  );
  const bracket = useMemo(
    () => buildBracket(qualifiers, knockoutMatches),
    [qualifiers, knockoutMatches]
  );

  const matchById = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);

  const hasKnockout = knockoutMatches.length > 0;
  const remainingInRound = bracket.currentStage
    ? knockoutMatches.filter((m) => m.stage === bracket.currentStage && m.status !== "COMPLETED").length
    : 0;

  function handleGenerate() {
    setConfirmGenerate(false);
    startTransition(async () => {
      try {
        const result = await generateKnockoutAction(tournamentId);
        toast(
          `${stageLabel(result.stage)} generated: ${result.matchesCreated} ${result.matchesCreated === 1 ? "match" : "matches"}${
            result.byes > 0 ? `, ${result.byes} ${result.byes === 1 ? "bye" : "byes"}` : ""
          }.`,
          "success"
        );
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not generate the knockout stage.", "error");
      }
    });
  }

  function handleGenerateNext() {
    setConfirmNext(false);
    startTransition(async () => {
      try {
        const result = await generateNextKnockoutRoundAction(tournamentId);
        toast(
          `${stageLabel(result.stage)} generated: ${result.matchesCreated} ${result.matchesCreated === 1 ? "match" : "matches"}.`,
          "success"
        );
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Could not generate the next round.", "error");
      }
    });
  }

  // Knockout unlocks only after every group match is complete.
  if (!hasKnockout && status !== "GROUP_STAGE_COMPLETED" && status !== "KNOCKOUT_STAGE" && status !== "COMPLETED") {
    return (
      <EmptyState
        icon={<Swords className="h-8 w-8" />}
        title="Knockout stage hasn't started yet"
        description="Finish all group matches first. The top 2 from each group will qualify for the knockout bracket."
      />
    );
  }

  return (
    <div className="space-y-6">
      {bracket.champion && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Champion</p>
              <p className="text-lg font-bold">{bracket.champion.name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasKnockout && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Generate the knockout stage</p>
              <p className="text-sm text-muted-foreground">
                {qualifiers.length} qualified — top 2 from each group.{" "}
                {bracket.nextStageToGenerate
                  ? `First round: ${stageLabel(bracket.nextStageToGenerate)}${bracket.firstRoundByes > 0 ? ` (${bracket.firstRoundByes} ${bracket.firstRoundByes === 1 ? "bye" : "byes"} for the top seeds)` : ""}.`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              className="w-full gap-1.5 sm:w-auto"
              disabled={qualifiers.length < 2 || isPending}
              onClick={() => setConfirmGenerate(true)}
            >
              <Swords className="h-4 w-4" />
              Generate Knockout Stage
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasKnockout && qualifiers.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Qualified participants</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {qualifiers.map((q) => (
              <Card key={q.participantId}>
                <CardContent className="flex items-center justify-between gap-2 p-3">
                  <span className="truncate text-sm font-medium">
                    <span className="mr-2 text-muted-foreground">#{q.seed}</span>
                    {q.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {q.groupName} · {q.groupPosition === 1 ? "Winner" : "Runner-up"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {hasKnockout && bracket.canGenerateNext && bracket.nextStageToGenerate && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Next round ready</p>
              <p className="text-sm text-muted-foreground">
                All {bracket.currentStage ? stageLabel(bracket.currentStage) : ""} matches are complete.
                Generate the {stageLabel(bracket.nextStageToGenerate)}.
              </p>
            </div>
            <Button
              type="button"
              className="w-full gap-1.5 sm:w-auto"
              disabled={isPending}
              onClick={() => setConfirmNext(true)}
            >
              <Swords className="h-4 w-4" />
              Generate {stageLabel(bracket.nextStageToGenerate)}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasKnockout && !bracket.canGenerateNext && bracket.currentStage && bracket.currentStage !== "FINAL" && (
        <p className="text-sm text-muted-foreground">
          {remainingInRound} {remainingInRound === 1 ? "match" : "matches"} left in the{" "}
          {stageLabel(bracket.currentStage)}. Enter the remaining results to unlock the next round.
        </p>
      )}

      {bracket.rounds.map((round) => (
        <div key={round.stage}>
          <h3 className="mb-2 font-semibold">{stageLabel(round.stage)}</h3>
          <div className="space-y-2">
            {round.pairs.map((pair, idx) => {
              if (pair.bye && pair.p1) {
                return (
                  <Card key={`bye-${idx}`}>
                    <CardContent className="flex items-center justify-between gap-2 p-4">
                      <span className="truncate text-sm font-medium">{pair.p1.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Bye — advances to the next round
                      </span>
                    </CardContent>
                  </Card>
                );
              }
              if (pair.matchId) {
                const full = matchById.get(pair.matchId);
                if (!full) return null;
                return (
                  <MatchResultRow
                    key={pair.matchId}
                    tournamentId={tournamentId}
                    match={full}
                    label={stageLabel(round.stage)}
                  />
                );
              }
              if (pair.p1 && pair.p2) {
                return (
                  <Card key={`pending-${idx}`}>
                    <CardContent className="p-4">
                      <p className="text-center text-sm font-medium">
                        {pair.p1.name} <span className="text-muted-foreground">vs</span> {pair.p2.name}
                      </p>
                      <p className="mt-1 text-center text-xs text-muted-foreground">
                        Generate the {stageLabel(round.stage)} to create this match.
                      </p>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}

      <Dialog
        open={confirmGenerate}
        onClose={() => setConfirmGenerate(false)}
        title="Generate knockout stage?"
        description={`The top 2 from each group qualify (${qualifiers.length} participants). Group results will be locked from now on.`}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setConfirmGenerate(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} loading={isPending}>
            Generate
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={confirmNext}
        onClose={() => setConfirmNext(false)}
        title={`Generate ${bracket.nextStageToGenerate ? stageLabel(bracket.nextStageToGenerate) : "next round"}?`}
        description="Matches will be created from the winners of the current round."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setConfirmNext(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateNext} loading={isPending}>
            Generate
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
