-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('pending', 'confirmed', 'declined');

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "primaryName" TEXT NOT NULL,
    "primaryEmail" TEXT,
    "primaryPhone" TEXT,
    "slug" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL DEFAULT 'pending',
    "openedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteExtraGuest" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "name" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InviteExtraGuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invite_wishlistId_idx" ON "Invite"("wishlistId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_wishlistId_slug_key" ON "Invite"("wishlistId", "slug");

-- CreateIndex
CREATE INDEX "InviteExtraGuest_inviteId_idx" ON "InviteExtraGuest"("inviteId");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteExtraGuest" ADD CONSTRAINT "InviteExtraGuest_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

