-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_wishlistId_idx" ON "Category"("wishlistId");

-- CreateIndex
CREATE INDEX "Category_wishlistId_sortOrder_idx" ON "Category"("wishlistId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
