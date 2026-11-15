-- eFootball Tournament — knockout stage migration (run ONCE in the Neon SQL Editor)
-- Matches the schema change in prisma/schema.prisma (MatchStage enum, nullable
-- Match.groupId, Match.stage, stage-scoped unique index).
-- Safe to run BEFORE the new code deploys: the old code ignores the extra
-- column, and every existing match already has a groupId and is a GROUP match.

-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('GROUP', 'ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');

-- AlterTable: knockout matches belong to no group
ALTER TABLE "Match" ALTER COLUMN "groupId" DROP NOT NULL;

-- AddColumn: all existing matches are group-stage matches
ALTER TABLE "Match" ADD COLUMN "stage" "MatchStage" NOT NULL DEFAULT 'GROUP';

-- Re-scope the unique index so a pair can meet again in a knockout round
DROP INDEX "Match_tournamentId_participant1Id_participant2Id_key";
CREATE UNIQUE INDEX "Match_tournamentId_stage_participant1Id_participant2Id_key" ON "Match"("tournamentId", "stage", "participant1Id", "participant2Id");

-- Verify (run separately):
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'Match' ORDER BY ordinal_position;
-- SELECT indexname FROM pg_indexes WHERE tablename = 'Match';
