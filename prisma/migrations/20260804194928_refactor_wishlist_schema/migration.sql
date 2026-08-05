-- CreateEnum
CREATE TYPE "ImageOrientation" AS ENUM ('landscape', 'portrait', 'square');

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "coverImageUrl",
DROP COLUMN "coverImageUrls",
DROP COLUMN "displayName",
DROP COLUMN "fontPairing",
DROP COLUMN "heroTitle";

-- CreateTable
CREATE TABLE "WishlistImage" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "orientation" "ImageOrientation" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistImage_wishlistId_idx" ON "WishlistImage"("wishlistId");

-- CreateIndex
CREATE INDEX "WishlistImage_wishlistId_sortOrder_idx" ON "WishlistImage"("wishlistId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WishlistImage" ADD CONSTRAINT "WishlistImage_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
