import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type {
	PublicCategoryViewModel,
	PublicGiftViewModel,
	PublicWishlistViewModel,
} from "@/server/mappers/view-models";
import type { DraftGift, WishlistDraft } from "@/stores/wishlist-wizard.store";

function sampleGiftToViewModel(
	gift: { name: string; imageUrl?: string; price?: number },
	index: number,
	categoryId: string,
): PublicGiftViewModel {
	return {
		id: `sample-${index}`,
		name: gift.name,
		productUrl: null,
		imageUrl: gift.imageUrl ?? null,
		storeName: null,
		priceAmount: gift.price != null ? String(gift.price) : null,
		priceCurrency: "PEN",
		quantityNeeded: 1,
		priority: "medium",
		publicNote: null,
		sortOrder: index,
		categoryId,
		status: "available",
		remainingQuantity: 1,
	};
}

function draftGiftToViewModel(gift: DraftGift): PublicGiftViewModel {
	return {
		id: gift.id,
		name: gift.name,
		productUrl: gift.productUrl,
		imageUrl: gift.imageUrl,
		storeName: null,
		priceAmount: gift.priceAmount != null ? String(gift.priceAmount) : null,
		priceCurrency: "PEN",
		quantityNeeded: gift.quantityNeeded,
		priority: gift.priority,
		publicNote: gift.publicNote || null,
		sortOrder: gift.sortOrder,
		categoryId: gift.category || null,
		status: "available",
		remainingQuantity: gift.quantityNeeded,
	};
}

export function draftToPreview(draft: WishlistDraft): PublicWishlistViewModel {
	const visibleGifts = draft.gifts.filter((g) => !g.hidden);
	const useSamples = visibleGifts.length === 0;

	let categories: PublicCategoryViewModel[];
	let gifts: PublicGiftViewModel[];

	if (useSamples && draft.eventType) {
		const preset = EVENT_TYPE_PRESETS[draft.eventType];
		const sampleCategoryId = "sample";
		categories = [{ id: sampleCategoryId, name: "Muestra", sortOrder: 0 }];
		gifts = preset.sampleGifts.map((sg, i) =>
			sampleGiftToViewModel(sg, i, sampleCategoryId),
		);
	} else if (useSamples) {
		categories = [];
		gifts = [];
	} else {
		categories = draft.categories.map((name, i) => ({
			id: name,
			name,
			sortOrder: i,
		}));
		gifts = visibleGifts.map(draftGiftToViewModel);
	}

	const totalUnits = gifts.reduce((sum, g) => sum + g.quantityNeeded, 0);

	return {
		id: "preview",
		slug: draft.slug || "preview",
		title: draft.title || "Mi wishlist",
		eventType: draft.eventType ?? "general",
		language: "es",
		currency: "PEN",
		heroTitle: draft.heroTitle || null,
		welcomeMessage: draft.welcomeMessage || null,
		thankYouMessage: draft.thankYouMessage || null,
		displayName: draft.displayName || null,
		eventDate: draft.eventDate,
		eventTime: draft.eventTime,
		eventLocation: draft.eventLocation || null,
		dressCode: draft.dressCode || null,
		coverImageUrl: draft.coverImageUrl,
		themeId: draft.themeId,
		layoutId: draft.layoutId,
		buttonStyle: draft.buttonStyle,
		fontPairing: draft.fontPairing,
		showHowItWorks: draft.showHowItWorks,
		categories,
		gifts,
		progress: {
			availableGiftCount: gifts.length,
			purchasedUnits: 0,
			totalUnits,
		},
	};
}
