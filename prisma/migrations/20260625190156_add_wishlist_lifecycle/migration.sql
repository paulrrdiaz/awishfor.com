-- CreateEnum
CREATE TYPE "WishlistStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('baby_shower', 'birthday', 'wedding', 'housewarming', 'general');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('es', 'en');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('PEN', 'USD', 'EUR', 'MXN', 'COP', 'CLP', 'ARS');

-- CreateEnum
CREATE TYPE "GiftPriority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "GiftVisibilityStatus" AS ENUM ('available', 'hidden');

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "status" "WishlistStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);
