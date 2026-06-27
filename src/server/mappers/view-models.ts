import type { GiftPublicStatus } from "@/server/services/purchase.service";

export type PublicWishlistProgress = {
	availableGiftCount: number;
	purchasedUnits: number;
	totalUnits: number;
};

export type PublicGiftViewModel = {
	id: string;
	name: string;
	productUrl: string | null;
	imageUrl: string | null;
	storeName: string | null;
	priceAmount: string | null;
	priceCurrency: string | null;
	quantityNeeded: number;
	priority: string;
	publicNote: string | null;
	sortOrder: number;
	categoryId: string | null;
	status: GiftPublicStatus;
	remainingQuantity: number;
};

export type PublicCategoryViewModel = {
	id: string;
	name: string;
	sortOrder: number;
};

export type PublicWishlistViewModel = {
	id: string;
	slug: string;
	title: string;
	eventType: string;
	language: string;
	currency: string;
	heroTitle: string | null;
	welcomeMessage: string | null;
	thankYouMessage: string | null;
	displayName: string | null;
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	coverImageUrl: string | null;
	themeId: string | null;
	layoutId: string | null;
	buttonStyle: string | null;
	fontPairing: string | null;
	showHowItWorks: boolean;
	categories: PublicCategoryViewModel[];
	gifts: PublicGiftViewModel[];
	progress: PublicWishlistProgress;
};

export type DashboardGiftRowViewModel = {
	id: string;
	name: string;
	productUrl: string | null;
	imageUrl: string | null;
	storeName: string | null;
	priceAmount: string | null;
	priceCurrency: string | null;
	quantityNeeded: number;
	purchasedQuantity: number;
	remainingQuantity: number;
	priority: string;
	visibilityStatus: string;
	publicNote: string | null;
	hasInternalNote: boolean;
	sortOrder: number;
	categoryId: string | null;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type OwnerPurchaseRecordViewModel = {
	id: string;
	giftId: string;
	guestName: string;
	guestEmail: string | null;
	guestPhone: string | null;
	message: string | null;
	quantity: number;
	createdAt: string;
	updatedAt: string;
};

export type DashboardWishlistCardViewModel = {
	id: string;
	slug: string;
	title: string;
	eventType: string;
	language: string;
	currency: string;
	heroTitle: string | null;
	welcomeMessage: string | null;
	thankYouMessage: string | null;
	displayName: string | null;
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	coverImageUrl: string | null;
	themeId: string | null;
	layoutId: string | null;
	buttonStyle: string | null;
	fontPairing: string | null;
	showHowItWorks: boolean;
	status: string;
	visibleGiftCount: number;
	gifts: DashboardGiftRowViewModel[];
	publishedAt: string | null;
	archivedAt: string | null;
	createdAt: string;
	updatedAt: string;
};
