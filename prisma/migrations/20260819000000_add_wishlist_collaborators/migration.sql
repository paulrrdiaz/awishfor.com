-- CreateTable
CREATE TABLE "WishlistMember" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "invitedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistMemberInvitation" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistMemberInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistMember_userId_idx" ON "WishlistMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistMember_wishlistId_userId_key" ON "WishlistMember"("wishlistId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistMemberInvitation_tokenHash_key" ON "WishlistMemberInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "WishlistMemberInvitation_email_idx" ON "WishlistMemberInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistMemberInvitation_wishlistId_email_key" ON "WishlistMemberInvitation"("wishlistId", "email");

-- AddForeignKey
ALTER TABLE "WishlistMember" ADD CONSTRAINT "WishlistMember_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistMember" ADD CONSTRAINT "WishlistMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistMember" ADD CONSTRAINT "WishlistMember_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistMemberInvitation" ADD CONSTRAINT "WishlistMemberInvitation_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistMemberInvitation" ADD CONSTRAINT "WishlistMemberInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

