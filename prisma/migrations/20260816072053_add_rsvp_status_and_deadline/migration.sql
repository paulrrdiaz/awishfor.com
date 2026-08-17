-- AlterTable
ALTER TABLE "InviteExtraGuest" ADD COLUMN     "status" "RsvpStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "rsvpDeadline" TIMESTAMP(3);
