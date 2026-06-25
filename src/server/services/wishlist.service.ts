import type { Prisma, Wishlist } from "@/generated/prisma/client";
import { WishlistStatus } from "@/generated/prisma/client";
import type { WishlistRestoreTargetStatus } from "@/server/validators/wishlist.schema";

type WishlistRecordLookup = Pick<Wishlist, "publishedAt">;

type WishlistDelegate = {
	create(args: Prisma.WishlistCreateArgs): Promise<Wishlist>;
	findUniqueOrThrow(
		args: Prisma.WishlistFindUniqueOrThrowArgs,
	): Promise<WishlistRecordLookup>;
	update(args: Prisma.WishlistUpdateArgs): Promise<Wishlist>;
};

export type WishlistDatabase = {
	wishlist: WishlistDelegate;
};

export const createWishlist = async (db: WishlistDatabase) =>
	db.wishlist.create({
		data: {
			status: WishlistStatus.draft,
			publishedAt: null,
			archivedAt: null,
		},
	});

export const publishWishlist = async (
	db: WishlistDatabase,
	{ wishlistId, now = new Date() }: { wishlistId: string; now?: Date },
) =>
	db.wishlist.update({
		where: { id: wishlistId },
		data: {
			status: WishlistStatus.published,
			publishedAt: now,
			archivedAt: null,
		},
	});

export const archiveWishlist = async (
	db: WishlistDatabase,
	{ wishlistId, now = new Date() }: { wishlistId: string; now?: Date },
) =>
	db.wishlist.update({
		where: { id: wishlistId },
		data: {
			status: WishlistStatus.archived,
			archivedAt: now,
		},
	});

export const restoreWishlist = async (
	db: WishlistDatabase,
	{
		wishlistId,
		targetStatus,
		now = new Date(),
	}: {
		wishlistId: string;
		targetStatus: WishlistRestoreTargetStatus;
		now?: Date;
	},
) => {
	const existingWishlist = await db.wishlist.findUniqueOrThrow({
		where: { id: wishlistId },
		select: { publishedAt: true },
	});

	return db.wishlist.update({
		where: { id: wishlistId },
		data: {
			status: targetStatus,
			archivedAt: null,
			publishedAt:
				targetStatus === WishlistStatus.published
					? (existingWishlist.publishedAt ?? now)
					: existingWishlist.publishedAt,
		},
	});
};
