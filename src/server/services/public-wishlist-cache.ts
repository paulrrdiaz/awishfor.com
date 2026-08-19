import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import type { Prisma, Wishlist } from "@/generated/prisma/client";

type PublicWishlistInvalidationTarget = Pick<Wishlist, "id" | "slug">;

export type PublicWishlistInvalidationDatabase = {
	wishlist: {
		findUnique(
			args: Prisma.WishlistFindUniqueArgs,
		): Promise<PublicWishlistInvalidationTarget | null>;
	};
};

export type PublicGiftInvalidationDatabase =
	PublicWishlistInvalidationDatabase & {
		gift: {
			findUnique(
				args: Prisma.GiftFindUniqueArgs,
			): Promise<{ wishlistId: string } | null>;
		};
	};

export const publicWishlistIdTag = (wishlistId: string) =>
	`public-wishlist:${wishlistId}`;
export const publicWishlistSlugTag = (slug: string) =>
	`public-wishlist-slug:${slug}`;

/** Call strictly after a successful persistence operation. */
export function invalidatePublicWishlist({
	wishlistId,
	slug,
	previousSlug,
}: {
	wishlistId: string;
	slug: string;
	previousSlug?: string | null;
}) {
	const slugs = new Set(
		[slug, previousSlug].filter((value): value is string => Boolean(value)),
	);
	revalidateTag(publicWishlistIdTag(wishlistId), "immediate");
	for (const publicSlug of slugs) {
		revalidateTag(publicWishlistSlugTag(publicSlug), "immediate");
		revalidatePath(`/w/${publicSlug}`);
		revalidatePath(`/w/${publicSlug}/opengraph-image`);
	}
}

/** Resolve the canonical slug only after a successful related mutation. */
export async function invalidatePublicWishlistById(
	db: PublicWishlistInvalidationDatabase,
	wishlistId: string,
): Promise<void> {
	const wishlist = await db.wishlist.findUnique({
		where: { id: wishlistId },
		select: { id: true, slug: true },
	});
	if (wishlist) {
		invalidatePublicWishlist({ wishlistId: wishlist.id, slug: wishlist.slug });
	}
}

/** Resolve a purchase's owning wishlist after the purchase commit succeeds. */
export async function invalidatePublicWishlistByGiftId(
	db: PublicGiftInvalidationDatabase,
	giftId: string,
): Promise<void> {
	const gift = await db.gift.findUnique({
		where: { id: giftId },
		select: { wishlistId: true },
	});
	if (gift) {
		await invalidatePublicWishlistById(db, gift.wishlistId);
	}
}
