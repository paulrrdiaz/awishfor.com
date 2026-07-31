import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

export type MarketingWishlistPreviewViewModel = {
	title: string;
	displayName: string | null;
	coverImageUrl: string | null;
	gifts: Array<{
		id: string;
		name: string;
		imageUrl: string | null;
		priceAmount: string | null;
	}>;
};

/** Shared, server-safe title resolution for live and marketing wishlist heroes. */
export function getWishlistHeading(
	wishlist: Pick<PublicWishlistViewModel, "heroTitle" | "title">,
) {
	return wishlist.heroTitle ?? wishlist.title;
}

/**
 * Narrows a production wishlist into the non-interactive presentation contract
 * used by the marketing example. No layout registry or purchase state crosses
 * this boundary.
 */
export function toMarketingWishlistPreview(
	wishlist: Pick<
		PublicWishlistViewModel,
		"heroTitle" | "title" | "displayName" | "coverImageUrl" | "gifts"
	>,
): MarketingWishlistPreviewViewModel {
	return {
		title: getWishlistHeading(wishlist),
		displayName: wishlist.displayName,
		coverImageUrl: wishlist.coverImageUrl,
		gifts: wishlist.gifts.slice(0, 3).map((gift) => ({
			id: gift.id,
			name: gift.name,
			imageUrl: gift.imageUrl,
			priceAmount: gift.priceAmount,
		})),
	};
}
