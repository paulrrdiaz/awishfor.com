-- AddRelation: Wishlist.gifts
-- AddRelation: Category.gifts
-- CreateTable: Gift
-- CreateTable: Purchase

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "productUrl" TEXT,
    "imageUrl" TEXT,
    "storeName" TEXT,
    "priceAmount" DECIMAL(10,2),
    "priceCurrency" "Currency",
    "quantityNeeded" INTEGER NOT NULL DEFAULT 1,
    "priority" "GiftPriority" NOT NULL DEFAULT 'medium',
    "visibilityStatus" "GiftVisibilityStatus" NOT NULL DEFAULT 'available',
    "publicNote" TEXT,
    "internalNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "message" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "undoTokenHash" TEXT,
    "undoExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gift_wishlistId_idx" ON "Gift"("wishlistId");

-- CreateIndex
CREATE INDEX "Gift_wishlistId_sortOrder_idx" ON "Gift"("wishlistId", "sortOrder");

-- CreateIndex
CREATE INDEX "Gift_categoryId_idx" ON "Gift"("categoryId");

-- CreateIndex
CREATE INDEX "Purchase_giftId_idx" ON "Purchase"("giftId");

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
