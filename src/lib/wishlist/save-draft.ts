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
	heroTitle: draft.heroTitle,
	welcomeMessage: draft.welcomeMessage,
	thankYouMessage: draft.thankYouMessage,
	displayName: draft.displayName,
	eventDate: draft.eventDate,
	eventTime: draft.eventTime,
	eventLocation: draft.eventLocation,
	coverImageUrl: draft.coverImageUrl,
	themeId: draft.themeId,
	layoutId: draft.layoutId,
	buttonStyle: draft.buttonStyle,
	fontPairing: draft.fontPairing,
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
		displayName: serverDraft.displayName ?? "",
		eventDate: serverDraft.eventDate ?? null,
		eventTime: serverDraft.eventTime ?? null,
		eventLocation: serverDraft.eventLocation ?? "",
		coverImageUrl: serverDraft.coverImageUrl ?? null,
		heroTitle: serverDraft.heroTitle ?? "",
		welcomeMessage: serverDraft.welcomeMessage ?? "",
		thankYouMessage: serverDraft.thankYouMessage ?? "",
		categories: [...serverDraft.categories],
		themeId: serverDraft.themeId ?? null,
		layoutId: serverDraft.layoutId ?? null,
		buttonStyle: serverDraft.buttonStyle ?? null,
		fontPairing: serverDraft.fontPairing ?? null,
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
