import type {
	Gift,
	Purchase,
	Wishlist,
	WishlistImage,
} from "@/generated/prisma/client";
import type { PublishReadinessResult } from "@/lib/wishlist/publish-readiness";
import { mapDashboardGift } from "@/server/mappers/dashboard-gift.mapper";
import type {
	DashboardWishlistCardViewModel,
	DashboardWishlistOverviewViewModel,
	DashboardWishlistSummaryViewModel,
	RecentPurchaseViewModel,
	WishlistImageViewModel,
} from "@/server/mappers/view-models";

type GiftWithPurchases = Gift & { purchases: Purchase[] };
type WishlistWithGifts = Wishlist & {
	gifts: GiftWithPurchases[];
	images?: WishlistImage[];
};

function mapImages(images: WishlistImage[] = []): WishlistImageViewModel[] {
	return images.map((image) => ({
		url: image.url,
		width: image.width,
		height: image.height,
		orientation: image.orientation,
	}));
}
type PurchaseWithGiftName = Purchase & { gift: Pick<Gift, "id" | "name"> };

type DashboardWishlistOverviewOptions = {
	publicUrlPath: string;
	publicUrl: string;
	whatsAppUrl: string;
	readiness: PublishReadinessResult;
	recentPurchases: PurchaseWithGiftName[];
};

function isVisibleAndNotDeleted(gift: Gift): boolean {
	return gift.deletedAt === null && gift.visibilityStatus !== "hidden";
}

function sumPurchasedQuantity(purchases: Purchase[]): number {
	return purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
}

function getVisibleGiftAggregates(gifts: GiftWithPurchases[]) {
	const visibleGifts = gifts.filter(isVisibleAndNotDeleted);
	const totalUnits = visibleGifts.reduce(
		(sum, gift) => sum + gift.quantityNeeded,
		0,
	);
	const purchasedUnits = visibleGifts.reduce(
		(sum, gift) =>
			sum + Math.min(gift.quantityNeeded, sumPurchasedQuantity(gift.purchases)),
		0,
	);
	const purchasedGifts = visibleGifts.filter(
		(gift) => sumPurchasedQuantity(gift.purchases) >= gift.quantityNeeded,
	).length;

	return {
		visibleGifts,
		totalGiftCount: visibleGifts.length,
		availableGiftCount: visibleGifts.length - purchasedGifts,
		purchasedGifts,
		totalUnits,
		purchasedUnits,
	};
}

function mapRecentPurchase(
	purchase: PurchaseWithGiftName,
): RecentPurchaseViewModel {
	const now = new Date();
	const canUndo =
		purchase.undoTokenHash !== null &&
		purchase.undoExpiresAt !== null &&
		purchase.undoExpiresAt > now;

	return {
		id: purchase.id,
		guestName: purchase.guestName,
		giftId: purchase.gift.id,
		giftName: purchase.gift.name,
		quantity: purchase.quantity,
		status: canUndo ? "pending" : "confirmed",
		createdAt: purchase.createdAt.toISOString(),
	};
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

export function mapDashboardWishlistSummary(
	wishlist: WishlistWithGifts,
): DashboardWishlistSummaryViewModel {
	const aggregates = getVisibleGiftAggregates(wishlist.gifts);

	return {
		id: wishlist.id,
		slug: wishlist.slug,
		title: wishlist.title,
		eventType: wishlist.eventType,
		status: wishlist.status,
		eventDate: wishlist.eventDate?.toISOString() ?? null,
		totalUnits: aggregates.totalUnits,
		purchasedUnits: aggregates.purchasedUnits,
		availableGiftCount: aggregates.availableGiftCount,
		totalGiftCount: aggregates.totalGiftCount,
		createdAt: wishlist.createdAt.toISOString(),
	};
}

export function mapDashboardWishlistOverview(
	wishlist: WishlistWithGifts,
	{
		publicUrlPath,
		publicUrl,
		whatsAppUrl,
		readiness,
		recentPurchases,
	}: DashboardWishlistOverviewOptions,
): DashboardWishlistOverviewViewModel {
	const aggregates = getVisibleGiftAggregates(wishlist.gifts);

	return {
		id: wishlist.id,
		slug: wishlist.slug,
		title: wishlist.title,
		eventType: wishlist.eventType,
		language: wishlist.language,
		status: wishlist.status,
		publicUrlPath,
		publicUrl,
		whatsAppUrl,
		metrics: {
			totalGifts: aggregates.totalGiftCount,
			availableGifts: aggregates.availableGiftCount,
			purchasedGifts: aggregates.purchasedGifts,
			totalUnits: aggregates.totalUnits,
			purchasedUnits: aggregates.purchasedUnits,
		},
		readiness,
		recentPurchases: recentPurchases.map(mapRecentPurchase),
	};
}
