import { getImageOrientation } from "@/lib/wishlist/image-orientation";
import type {
	SaveDraftServerDraft,
	SaveDraftWishlistInput,
} from "@/server/validators/wishlist-save-draft.schema";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";

type SaveDraftMetadata = Partial<
	Pick<SaveDraftWishlistInput, "savedWishlistId" | "lastSavedAt" | "force">
>;

const sortDraftGifts = <T extends { sortOrder: number }>(gifts: T[]) =>
	[...gifts].sort((a, b) => a.sortOrder - b.sortOrder);

export const draftToSaveDraftInput = (
	draft: WishlistDraft,
	metadata: SaveDraftMetadata = {},
): SaveDraftWishlistInput => ({
	title: draft.title,
	slug: draft.slug,
	eventType: draft.eventType ?? "general",
	language: "es",
	currency: "PEN",
	welcomeMessage: draft.welcomeMessage,
	thankYouMessage: draft.thankYouMessage,
	eventDate: draft.eventDate,
	eventTime: draft.eventTime,
	eventLocation: draft.eventLocation,
	dressCode: draft.dressCode,
	coverImages: draft.images.map(({ url, width, height }) => ({
		url,
		width,
		height,
	})),
	themeId: draft.themeId,
	layoutId: draft.layoutId,
	buttonStyle: draft.buttonStyle,
	headingFont: draft.headingFont,
	bodyFont: draft.bodyFont,
	showHowItWorks: draft.showHowItWorks,
	categories: [...draft.categories],
	gifts: sortDraftGifts(draft.gifts).map((gift) => ({
		name: gift.name,
		productUrl: gift.productUrl,
		imageUrl: gift.imageUrl,
		priceAmount: gift.priceAmount,
		category: gift.category,
		quantityNeeded: gift.quantityNeeded,
		priority: gift.priority,
		publicNote: gift.publicNote,
		internalNote: gift.internalNote,
		hidden: gift.hidden,
		sortOrder: gift.sortOrder,
	})),
	savedWishlistId: metadata.savedWishlistId ?? null,
	lastSavedAt: metadata.lastSavedAt ?? null,
	force: metadata.force ?? false,
});

export const serverDraftToLocalDraft = (
	serverDraft: SaveDraftServerDraft,
	{
		createGiftId = () => crypto.randomUUID(),
	}: {
		createGiftId?: () => string;
	} = {},
) => ({
	draft: {
		eventType: serverDraft.eventType,
		title: serverDraft.title,
		slug: serverDraft.slug,
		eventDate: serverDraft.eventDate ?? null,
		eventTime: serverDraft.eventTime ?? null,
		eventLocation: serverDraft.eventLocation ?? "",
		dressCode: serverDraft.dressCode ?? "",
		images: (serverDraft.coverImages ?? []).map(({ url, width, height }) => ({
			url,
			width,
			height,
			orientation: getImageOrientation(width, height) ?? "square",
		})),
		welcomeMessage: serverDraft.welcomeMessage ?? "",
		thankYouMessage: serverDraft.thankYouMessage ?? "",
		categories: [...serverDraft.categories],
		themeId: serverDraft.themeId ?? null,
		layoutId: serverDraft.layoutId ?? null,
		buttonStyle: serverDraft.buttonStyle ?? null,
		headingFont: serverDraft.headingFont ?? null,
		bodyFont: serverDraft.bodyFont ?? null,
		countdownVariant: serverDraft.countdownVariant ?? null,
		welcomeMessageVariant: serverDraft.welcomeMessageVariant ?? null,
		thankYouMessageVariant: serverDraft.thankYouMessageVariant ?? null,
		showHowItWorks: serverDraft.showHowItWorks,
		gifts: sortDraftGifts(serverDraft.gifts).map((gift) => ({
			id: createGiftId(),
			name: gift.name,
			productUrl: gift.productUrl ?? null,
			imageUrl: gift.imageUrl ?? null,
			priceAmount: gift.priceAmount ?? null,
			category: gift.category ?? "",
			quantityNeeded: gift.quantityNeeded,
			priority: gift.priority,
			publicNote: gift.publicNote ?? "",
			internalNote: gift.internalNote ?? "",
			hidden: gift.hidden,
			sortOrder: gift.sortOrder,
		})),
	} satisfies WishlistDraft,
	savedWishlistId: serverDraft.savedWishlistId,
	lastSavedAt: serverDraft.lastSavedAt,
});
