import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type { GiftPublicStatus } from "@/server/services/purchase.service";

const EVENT_TYPE_EYEBROWS: Record<string, string> = {
	baby_shower: "Baby Shower",
	wedding: "Boda",
	birthday: "Cumpleaños",
	housewarming: "Nuevo hogar",
	general: "Wishlist general",
};

export type MarketingWishlistPreviewGift = {
	id: string;
	name: string;
	imageUrl: string | null;
	priceAmount: string | null;
	priceCurrency: string | null;
	category: string | null;
	store: string | null;
	priority: string;
	status: GiftPublicStatus;
	remainingQuantity: number;
	quantityNeeded: number;
};

export type MarketingWishlistPreviewViewModel = {
	eyebrow: string;
	title: string;
	eventDate: string | null;
	coverImageUrls: string[];
	availableGiftCount: number;
	purchasedGiftCount: number;
	gifts: MarketingWishlistPreviewGift[];
};

/** Shared, server-safe title resolution for live and marketing wishlist heroes. */
export function getWishlistHeading(
	wishlist: Pick<PublicWishlistViewModel, "title">,
) {
	return wishlist.title;
}

/**
 * Narrows a production wishlist into the non-interactive presentation contract
 * used by the marketing example. Purchase state, category, store, availability
 * counts, countdown source date and cover collage cross this boundary as DATA
 * for static presentation only. That is not permission to import the layout
 * registry, purchase flows, modal code, or any client-side gift behaviour —
 * none of that crosses this boundary, and nothing on the other side of it may
 * mutate a gift's status.
 */
export function toMarketingWishlistPreview(
	wishlist: Pick<
		PublicWishlistViewModel,
		"title" | "eventType" | "eventDate" | "images" | "categories" | "gifts"
	>,
): MarketingWishlistPreviewViewModel {
	const categoryNameById = new Map(
		wishlist.categories.map((category) => [category.id, category.name]),
	);

	const gifts = wishlist.gifts.map((gift) => ({
		id: gift.id,
		name: gift.name,
		imageUrl: gift.imageUrl,
		priceAmount: gift.priceAmount,
		priceCurrency: gift.priceCurrency,
		category: gift.categoryId
			? (categoryNameById.get(gift.categoryId) ?? null)
			: null,
		store: gift.storeName,
		priority: gift.priority,
		status: gift.status,
		remainingQuantity: gift.remainingQuantity,
		quantityNeeded: gift.quantityNeeded,
	}));

	return {
		eyebrow: EVENT_TYPE_EYEBROWS[wishlist.eventType] ?? wishlist.eventType,
		title: getWishlistHeading(wishlist),
		eventDate: wishlist.eventDate,
		coverImageUrls: wishlist.images.map((image) => image.url),
		availableGiftCount: gifts.filter((gift) => gift.status !== "purchased")
			.length,
		purchasedGiftCount: gifts.filter((gift) => gift.status === "purchased")
			.length,
		gifts,
	};
}
