import type {
	DraftCoverImage,
	DraftGift,
	WishlistDraft,
} from "@/stores/wishlist-wizard.store";

export type PersistedWishlistDesign = Pick<
	WishlistDraft,
	"themeId" | "layoutId" | "headingFont" | "bodyFont" | "buttonStyle" | "images"
>;

export type PersistedWishlistPreviewSource = {
	eventType: WishlistDraft["eventType"];
	title: string;
	slug: string;
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	dressCode: string | null;
	images: DraftCoverImage[];
	welcomeMessage: string | null;
	thankYouMessage: string | null;
	categories: Array<{ name: string }>;
	gifts: Array<
		Omit<
			DraftGift,
			"priceAmount" | "category" | "publicNote" | "internalNote"
		> & {
			priceAmount: string | number | null;
			category: string | null;
			publicNote: string | null;
			internalNote: string | null;
		}
	>;
	themeId: string | null;
	layoutId: string | null;
	buttonStyle: string | null;
	headingFont: string | null;
	bodyFont: string | null;
	countdownVariant: string | null;
	welcomeMessageVariant: string | null;
	thankYouMessageVariant: string | null;
	showHowItWorks: boolean;
};

function toDraftPriceAmount(value: string | number | null): number | null {
	if (value === null) {
		return null;
	}

	const numeric = typeof value === "number" ? value : Number(value);
	return Number.isFinite(numeric) ? numeric : null;
}

export function persistedWishlistToPreviewDraft(
	wishlist: PersistedWishlistPreviewSource,
	design: Partial<PersistedWishlistDesign> = {},
): WishlistDraft {
	const designValue = <
		Key extends Exclude<keyof PersistedWishlistDesign, "images">,
	>(
		key: Key,
	): PersistedWishlistDesign[Key] =>
		key in design ? (design[key] ?? null) : wishlist[key];

	return {
		eventType: wishlist.eventType,
		title: wishlist.title,
		slug: wishlist.slug,
		eventDate: wishlist.eventDate,
		eventTime: wishlist.eventTime,
		eventLocation: wishlist.eventLocation ?? "",
		dressCode: wishlist.dressCode ?? "",
		images: design.images ?? wishlist.images,
		welcomeMessage: wishlist.welcomeMessage ?? "",
		thankYouMessage: wishlist.thankYouMessage ?? "",
		categories: wishlist.categories.map((category) => category.name),
		themeId: designValue("themeId"),
		layoutId: designValue("layoutId"),
		buttonStyle: designValue("buttonStyle"),
		headingFont: designValue("headingFont"),
		bodyFont: designValue("bodyFont"),
		countdownVariant: wishlist.countdownVariant,
		welcomeMessageVariant: wishlist.welcomeMessageVariant,
		thankYouMessageVariant: wishlist.thankYouMessageVariant,
		showHowItWorks: wishlist.showHowItWorks,
		gifts: wishlist.gifts.map((gift) => ({
			id: gift.id,
			name: gift.name,
			productUrl: gift.productUrl,
			imageUrl: gift.imageUrl,
			priceAmount: toDraftPriceAmount(gift.priceAmount),
			category: gift.category ?? "",
			quantityNeeded: gift.quantityNeeded,
			priority: gift.priority,
			publicNote: gift.publicNote ?? "",
			internalNote: gift.internalNote ?? "",
			hidden: gift.hidden,
			sortOrder: gift.sortOrder,
		})),
	};
}
