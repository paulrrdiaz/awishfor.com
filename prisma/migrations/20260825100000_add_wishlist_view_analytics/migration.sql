-- Preserve historical first-open timestamps while initializing new invite
-- aggregates to a safe, explicit empty state.
ALTER TABLE "Invite"
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastViewedAt" TIMESTAMP(3);

CREATE TABLE "WishlistView" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "inviteId" TEXT,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WishlistView_wishlistId_createdAt_idx"
ON "WishlistView"("wishlistId", "createdAt");

CREATE INDEX "WishlistView_inviteId_createdAt_idx"
ON "WishlistView"("inviteId", "createdAt");

CREATE INDEX "WishlistView_wishlistId_visitorHash_idx"
ON "WishlistView"("wishlistId", "visitorHash");

ALTER TABLE "WishlistView"
ADD CONSTRAINT "WishlistView_wishlistId_fkey"
FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WishlistView"
ADD CONSTRAINT "WishlistView_inviteId_fkey"
FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
