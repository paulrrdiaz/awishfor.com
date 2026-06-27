import type {
	PublicGiftViewModel,
	PublicWishlistProgress,
	PublicWishlistViewModel,
} from "@/server/mappers/view-models";

export const sampleGift: PublicGiftViewModel = {
	id: "gift-1",
	name: "Cojín de lactancia",
	productUrl: "https://example.com",
	imageUrl: null,
	storeName: "Tienda Baby",
	priceAmount: "149.90",
	priceCurrency: "PEN",
	quantityNeeded: 1,
	priority: "high",
	publicNote: "Color neutro o verde suave.",
	sortOrder: 1,
	categoryId: "cat-1",
	status: "available",
	remainingQuantity: 1,
};

export const sampleGifts: PublicGiftViewModel[] = [
	sampleGift,
	{
		...sampleGift,
		id: "gift-2",
		name: "Pack de pañales RN",
		priceAmount: "89.90",
		priority: "medium",
		status: "partial",
		quantityNeeded: 3,
		remainingQuantity: 1,
		sortOrder: 2,
	},
	{
		...sampleGift,
		id: "gift-3",
		name: "Mameluco de algodón",
		priceAmount: "59.90",
		priority: "low",
		status: "purchased",
		remainingQuantity: 0,
		sortOrder: 3,
	},
];

export const sampleProgress: PublicWishlistProgress = {
	availableGiftCount: 2,
	purchasedUnits: 3,
	totalUnits: 6,
};

export const sampleWishlist: Pick<
	PublicWishlistViewModel,
	| "heroTitle"
	| "title"
	| "displayName"
	| "coverImageUrl"
	| "eventDate"
	| "eventTime"
	| "eventLocation"
> = {
	heroTitle: "Baby shower de Emilia",
	title: "Wishlist de Emilia",
	displayName: "Ana y Paulo",
	coverImageUrl: null,
	eventDate: "2026-09-12",
	eventTime: "16:00",
	eventLocation: "Miraflores, Lima",
};
