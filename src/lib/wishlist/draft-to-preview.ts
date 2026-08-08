import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import { resolveLayout } from "@/config/public-layouts";
import type {
	PublicCategoryViewModel,
	PublicGiftViewModel,
	PublicWishlistViewModel,
	WishlistImageViewModel,
} from "@/server/mappers/view-models";
import type { DraftGift, WishlistDraft } from "@/stores/wishlist-wizard.store";
import { resolveSampleCoverImages } from "./sample-cover-images";

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

/**
 * Fills a layout's unfilled hero slots with occasion-appropriate samples,
 * marking each so it never reads as one of the creator's own photos. Real
 * images always occupy the earliest slots in their stored order and are
 * never displaced. Preview-only: this never mutates the draft.
 */
function compositeCoverImages(draft: WishlistDraft): WishlistImageViewModel[] {
	const layout = resolveLayout(draft.layoutId);
	const shortfall = layout.heroImageSlots - draft.images.length;

	if (shortfall <= 0) {
		return draft.images;
	}

	const samples = resolveSampleCoverImages(
		draft.eventType,
		layout.imageGuidance.orientation,
	);

	const sampleImages: WishlistImageViewModel[] = samples
		.slice(0, shortfall)
		.map((sample) => ({ ...sample, isSample: true }));

	return [...draft.images, ...sampleImages];
}

const PREVIEW_CREATED_AT_OFFSET_DAYS = 45;

/**
 * A draft has no persisted creation date or real purchases. Seeding
 * representative values here (rather than leaving them at their spec-correct
 * "no data" defaults) keeps the `progress-bar` and `social-proof` variants
 * showing their distinctive appearance in every preview surface that routes
 * through this function — including the design editor's preview, via
 * `persistedWishlistToPreviewDraft`, which has no `createdAt` of its own to
 * seed from and so is overridden here too.
 */
function seedPreviewCreatedAt(eventDate: string | null): string {
	if (!eventDate) {
		return new Date(0).toISOString();
	}

	const event = new Date(`${eventDate.slice(0, 10)}T00:00:00.000Z`);
	const created = new Date(
		event.getTime() - PREVIEW_CREATED_AT_OFFSET_DAYS * 24 * 60 * 60 * 1000,
	);
	return created.toISOString();
}

const PREVIEW_CONTRIBUTORS: PublicWishlistViewModel["contributors"] = {
	count: 5,
	initials: ["A", "M", "L"],
};

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
		welcomeMessage: draft.welcomeMessage || null,
		welcomeMessageAttribution: null,
		thankYouMessage: draft.thankYouMessage || null,
		eventDate: draft.eventDate,
		eventTime: draft.eventTime,
		eventLocation: draft.eventLocation || null,
		dressCode: draft.dressCode || null,
		images: compositeCoverImages(draft),
		themeId: draft.themeId,
		layoutId: draft.layoutId,
		buttonStyle: draft.buttonStyle,
		headingFont: draft.headingFont,
		bodyFont: draft.bodyFont,
		countdownVariant: draft.countdownVariant,
		welcomeMessageVariant: draft.welcomeMessageVariant,
		thankYouMessageVariant: draft.thankYouMessageVariant,
		showHowItWorks: draft.showHowItWorks,
		categories,
		gifts,
		progress: {
			availableGiftCount: gifts.length,
			purchasedUnits: 0,
			totalUnits,
		},
		contributors: PREVIEW_CONTRIBUTORS,
		createdAt: seedPreviewCreatedAt(draft.eventDate),
	};
}
