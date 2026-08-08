import type {
	Category,
	Gift,
	Purchase,
	Wishlist,
	WishlistImage,
} from "@/generated/prisma/client";
import type {
	PublicCategoryViewModel,
	PublicContributorsViewModel,
	PublicGiftViewModel,
	PublicWishlistProgress,
	PublicWishlistViewModel,
	WishlistImageViewModel,
} from "@/server/mappers/view-models";
import {
	deriveGiftPublicStatus,
	OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
} from "@/server/services/purchase.service";

const CONTRIBUTOR_INITIALS_CAP = 4;

function normalizeGuestName(name: string): string {
	return name.trim().toLocaleLowerCase();
}

/** Whitespace-based initials for one guest's own name — distinct from the
 * owner signature's conjunction-only splitting in `lib/format/signature.ts`. */
function guestInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

function computeContributors(
	gifts: GiftWithPurchases[],
): PublicContributorsViewModel {
	const excludedKey = normalizeGuestName(OWNER_MANUAL_PURCHASE_DEFAULT_NAME);
	const seenByKey = new Map<string, string>();

	for (const gift of gifts) {
		for (const purchase of gift.purchases) {
			const key = normalizeGuestName(purchase.guestName);
			if (key === excludedKey || key === "") {
				continue;
			}
			if (!seenByKey.has(key)) {
				seenByKey.set(key, purchase.guestName.trim());
			}
		}
	}

	const names = [...seenByKey.values()];

	return {
		count: names.length,
		initials: names.slice(0, CONTRIBUTOR_INITIALS_CAP).map(guestInitials),
	};
}

type GiftWithPurchases = Gift & { purchases: Purchase[] };
type CategoryWithGifts = Category & { gifts: GiftWithPurchases[] };
type WishlistWithRelations = Wishlist & {
	categories: CategoryWithGifts[];
	gifts: GiftWithPurchases[];
	images: WishlistImage[];
};

function mapImages(images: WishlistImage[]): WishlistImageViewModel[] {
	return images.map((image) => ({
		url: image.url,
		width: image.width,
		height: image.height,
		orientation: image.orientation,
	}));
}

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
		remainingQuantity: Math.max(0, gift.quantityNeeded - purchasedQuantity),
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
		welcomeMessage: wishlist.welcomeMessage,
		welcomeMessageAttribution: wishlist.welcomeMessageAttribution,
		thankYouMessage: wishlist.thankYouMessage,
		eventDate: wishlist.eventDate?.toISOString() ?? null,
		eventTime: wishlist.eventTime,
		eventLocation: wishlist.eventLocation,
		dressCode: wishlist.dressCode,
		images: mapImages(wishlist.images),
		themeId: wishlist.themeId,
		layoutId: wishlist.layoutId,
		buttonStyle: wishlist.buttonStyle,
		headingFont: wishlist.headingFont,
		bodyFont: wishlist.bodyFont,
		countdownVariant: wishlist.countdownVariant,
		welcomeMessageVariant: wishlist.welcomeMessageVariant,
		thankYouMessageVariant: wishlist.thankYouMessageVariant,
		showHowItWorks: wishlist.showHowItWorks,
		categories,
		gifts: visibleGifts.map(mapPublicGift),
		progress: computeProgress(visibleGifts),
		// Contributors are scoped to visible gifts, matching every other public
		// aggregate on this wishlist (progress, gift list).
		contributors: computeContributors(visibleGifts),
		createdAt: wishlist.createdAt.toISOString(),
	};
}
