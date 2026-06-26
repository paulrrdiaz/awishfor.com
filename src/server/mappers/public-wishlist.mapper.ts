import type {
	Category,
	Gift,
	Purchase,
	Wishlist,
} from "@/generated/prisma/client";
import type {
	PublicCategoryViewModel,
	PublicGiftViewModel,
	PublicWishlistProgress,
	PublicWishlistViewModel,
} from "@/server/mappers/view-models";
import { deriveGiftPublicStatus } from "@/server/services/purchase.service";

type GiftWithPurchases = Gift & { purchases: Purchase[] };
type CategoryWithGifts = Category & { gifts: GiftWithPurchases[] };
type WishlistWithRelations = Wishlist & {
	categories: CategoryWithGifts[];
	gifts: GiftWithPurchases[];
};

function getPurchasedQuantityFromLoaded(purchases: Purchase[]): number {
	return purchases.reduce((sum, p) => sum + p.quantity, 0);
}

function isGiftVisible(gift: Gift): boolean {
	return gift.deletedAt === null && gift.visibilityStatus !== "hidden";
}

function mapPublicGift(gift: GiftWithPurchases): PublicGiftViewModel {
	const purchasedQuantity = getPurchasedQuantityFromLoaded(gift.purchases);
	return {
		id: gift.id,
		name: gift.name,
		productUrl: gift.productUrl,
		imageUrl: gift.imageUrl,
		storeName: gift.storeName,
		priceAmount: gift.priceAmount?.toString() ?? null,
		priceCurrency: gift.priceCurrency,
		quantityNeeded: gift.quantityNeeded,
		priority: gift.priority,
		publicNote: gift.publicNote,
		sortOrder: gift.sortOrder,
		categoryId: gift.categoryId,
		status: deriveGiftPublicStatus(gift.quantityNeeded, purchasedQuantity),
	};
}

function computeProgress(gifts: GiftWithPurchases[]): PublicWishlistProgress {
	let availableGiftCount = 0;
	let purchasedUnits = 0;
	let totalUnits = 0;

	for (const gift of gifts) {
		const purchased = getPurchasedQuantityFromLoaded(gift.purchases);
		const status = deriveGiftPublicStatus(gift.quantityNeeded, purchased);
		totalUnits += gift.quantityNeeded;
		purchasedUnits += Math.min(purchased, gift.quantityNeeded);
		if (status === "available" || status === "partial") {
			availableGiftCount += 1;
		}
	}

	return { availableGiftCount, purchasedUnits, totalUnits };
}

export function mapPublicWishlist(
	wishlist: WishlistWithRelations,
): PublicWishlistViewModel {
	const visibleGifts = wishlist.gifts.filter(isGiftVisible);

	const categories: PublicCategoryViewModel[] = wishlist.categories.map(
		(cat) => ({
			id: cat.id,
			name: cat.name,
			sortOrder: cat.sortOrder,
		}),
	);

	return {
		id: wishlist.id,
		slug: wishlist.slug,
		title: wishlist.title,
		eventType: wishlist.eventType,
		language: wishlist.language,
		currency: wishlist.currency,
		heroTitle: wishlist.heroTitle,
		welcomeMessage: wishlist.welcomeMessage,
		thankYouMessage: wishlist.thankYouMessage,
		displayName: wishlist.displayName,
		eventDate: wishlist.eventDate?.toISOString() ?? null,
		eventTime: wishlist.eventTime,
		eventLocation: wishlist.eventLocation,
		coverImageUrl: wishlist.coverImageUrl,
		themeId: wishlist.themeId,
		layoutId: wishlist.layoutId,
		buttonStyle: wishlist.buttonStyle,
		fontPairing: wishlist.fontPairing,
		showHowItWorks: wishlist.showHowItWorks,
		categories,
		gifts: visibleGifts.map(mapPublicGift),
		progress: computeProgress(visibleGifts),
	};
}
