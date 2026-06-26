import type { Gift, Purchase, Wishlist } from "@/generated/prisma/client";
import { mapDashboardGift } from "@/server/mappers/dashboard-gift.mapper";
import type { DashboardWishlistCardViewModel } from "@/server/mappers/view-models";

type GiftWithPurchases = Gift & { purchases: Purchase[] };
type WishlistWithGifts = Wishlist & { gifts: GiftWithPurchases[] };

function isVisibleAndNotDeleted(gift: Gift): boolean {
	return gift.deletedAt === null && gift.visibilityStatus !== "hidden";
}

export function mapDashboardWishlist(
	wishlist: WishlistWithGifts,
): DashboardWishlistCardViewModel {
	const visibleGiftCount = wishlist.gifts.filter(isVisibleAndNotDeleted).length;

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
		status: wishlist.status,
		visibleGiftCount,
		gifts: wishlist.gifts.map(mapDashboardGift),
		publishedAt: wishlist.publishedAt?.toISOString() ?? null,
		archivedAt: wishlist.archivedAt?.toISOString() ?? null,
		createdAt: wishlist.createdAt.toISOString(),
		updatedAt: wishlist.updatedAt.toISOString(),
	};
}
