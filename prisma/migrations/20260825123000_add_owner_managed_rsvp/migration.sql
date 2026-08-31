-- CreateEnum
CREATE TYPE "RsvpResponseSource" AS ENUM ('guest', 'owner');

-- AlterTable
ALTER TABLE "Invite"
ADD COLUMN "responseSource" "RsvpResponseSource",
ADD COLUMN "responseLockedAt" TIMESTAMP(3);
