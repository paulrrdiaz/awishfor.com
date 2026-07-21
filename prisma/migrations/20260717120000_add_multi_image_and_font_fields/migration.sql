-- AlterTable
ALTER TABLE "Wishlist"
  ADD COLUMN "coverImageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "headingFont" TEXT,
  ADD COLUMN "bodyFont" TEXT;

-- Backfill coverImageUrls from the legacy single cover image
UPDATE "Wishlist"
SET "coverImageUrls" = ARRAY["coverImageUrl"]
WHERE "coverImageUrl" IS NOT NULL;

-- Backfill heading/body fonts from the legacy fontPairing mapping
UPDATE "Wishlist"
SET "headingFont" = 'lora', "bodyFont" = 'inter'
WHERE "fontPairing" = 'serif-soft';

UPDATE "Wishlist"
SET "headingFont" = 'inter', "bodyFont" = 'inter'
WHERE "fontPairing" = 'sans-modern';

UPDATE "Wishlist"
SET "headingFont" = 'nunito', "bodyFont" = 'nunito'
WHERE "fontPairing" = 'rounded-friendly';
