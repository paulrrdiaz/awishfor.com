import type { Prisma, Wishlist } from "@/generated/prisma/client";
import { Currency, Locale, WishlistStatus } from "@/generated/prisma/client";
import type {
	CreateWishlistInput,
	WishlistRestoreTargetStatus,
} from "@/server/validators/wishlist.schema";

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

export const createWishlist = async (
	db: WishlistDatabase,
	input: CreateWishlistInput,
) =>
	db.wishlist.create({
		data: {
			owner: {
				connect: {
					id: input.ownerId,
				},
			},
			title: input.title,
			slug: input.slug,
			eventType: input.eventType,
			language: input.language ?? Locale.es,
			currency: input.currency ?? Currency.PEN,
			heroTitle: input.heroTitle ?? null,
			welcomeMessage: input.welcomeMessage ?? null,
			thankYouMessage: input.thankYouMessage ?? null,
			displayName: input.displayName ?? null,
			eventDate: input.eventDate ?? null,
			eventTime: input.eventTime ?? null,
			eventLocation: input.eventLocation ?? null,
			coverImageUrl: input.coverImageUrl ?? null,
			themeId: input.themeId ?? null,
			layoutId: input.layoutId ?? null,
			buttonStyle: input.buttonStyle ?? null,
			fontPairing: input.fontPairing ?? null,
			showHowItWorks: input.showHowItWorks ?? true,
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
