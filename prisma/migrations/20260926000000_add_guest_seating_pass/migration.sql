-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "seatingPassShowMap" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seatingPassShowMates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seatingPassVariant" TEXT NOT NULL DEFAULT 'pass';
