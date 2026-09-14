-- CreateEnum
CREATE TYPE "SeatingTableShape" AS ENUM ('round', 'rectangular');

-- CreateTable
CREATE TABLE "SeatingTable" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "name" TEXT,
    "shape" "SeatingTableShape" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingAssignment" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "extraGuestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeatingTable_wishlistId_idx" ON "SeatingTable"("wishlistId");

-- CreateIndex
CREATE INDEX "SeatingAssignment_inviteId_extraGuestId_idx" ON "SeatingAssignment"("inviteId", "extraGuestId");

-- CreateIndex
CREATE INDEX "SeatingAssignment_wishlistId_idx" ON "SeatingAssignment"("wishlistId");

-- CreateIndex
CREATE INDEX "SeatingAssignment_tableId_idx" ON "SeatingAssignment"("tableId");

-- AddForeignKey
ALTER TABLE "SeatingTable" ADD CONSTRAINT "SeatingTable_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "SeatingTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_extraGuestId_fkey" FOREIGN KEY ("extraGuestId") REFERENCES "InviteExtraGuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One person, one table — enforced in the database, not only in the service.
--
-- These two partial unique indexes are hand-written and have no counterpart in
-- schema.prisma. A plain @@unique([inviteId, extraGuestId]) does NOT enforce the
-- invariant on Postgres: NULLs compare as distinct in a unique index, so two rows
-- with the same "inviteId" and "extraGuestId" IS NULL would both insert — meaning
-- the primary guest (the most common case) could be seated at two tables at once.
-- Prisma 7.8 does not support `nulls: "not distinct"` on @@unique (verified: the
-- argument does not parse), so the invariant is split into a partial index per case.
--
-- A later `prisma migrate dev` will not regenerate these. If this migration is ever
-- squashed or the model is reshaped, carry them forward by hand.
CREATE UNIQUE INDEX "SeatingAssignment_primary_key"
  ON "SeatingAssignment" ("inviteId")
  WHERE "extraGuestId" IS NULL;

CREATE UNIQUE INDEX "SeatingAssignment_extra_key"
  ON "SeatingAssignment" ("inviteId", "extraGuestId")
  WHERE "extraGuestId" IS NOT NULL;
