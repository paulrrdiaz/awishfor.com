-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "buttonStyle" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'PEN',
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "eventLocation" TEXT,
ADD COLUMN     "eventTime" TEXT,
ADD COLUMN     "eventType" "EventType" NOT NULL,
ADD COLUMN     "fontPairing" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "language" "Locale" NOT NULL DEFAULT 'es',
ADD COLUMN     "layoutId" TEXT,
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "showHowItWorks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thankYouMessage" TEXT,
ADD COLUMN     "themeId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "welcomeMessage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_slug_key" ON "Wishlist"("slug");

-- CreateIndex
CREATE INDEX "Wishlist_ownerId_idx" ON "Wishlist"("ownerId");

-- CreateIndex
CREATE INDEX "Wishlist_ownerId_status_idx" ON "Wishlist"("ownerId", "status");

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
