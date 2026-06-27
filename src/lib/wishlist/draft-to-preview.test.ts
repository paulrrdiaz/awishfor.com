import { describe, expect, it } from "vitest";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { DraftGift, WishlistDraft } from "@/stores/wishlist-wizard.store";
import { draftToPreview } from "./draft-to-preview";

function makeDraft(overrides: Partial<WishlistDraft> = {}): WishlistDraft {
	return {
		eventType: "baby_shower",
		title: "Baby shower de Ana",
		slug: "baby-shower-de-ana",
		displayName: "Ana García",
		eventDate: null,
		eventTime: null,
		eventLocation: "",
		coverImageUrl: null,
		heroTitle: "¡Bienvenidos al baby shower de Ana!",
		welcomeMessage: "Gracias por venir",
		thankYouMessage: "Gracias por el regalo",
		categories: ["Pañales", "Ropa", "Otros"],
		themeId: "cielo-suave",
		layoutId: "grid",
		buttonStyle: "rounded",
		fontPairing: "serif-soft",
		showHowItWorks: true,
		gifts: [],
		...overrides,
	};
}

function makeGift(overrides: Partial<DraftGift> = {}): DraftGift {
	return {
		id: "gift-1",
		name: "Cuna de madera",
		productUrl: null,
		imageUrl: null,
		priceAmount: 250,
		category: "Ropa",
		quantityNeeded: 1,
		priority: "high",
		publicNote: "De madera orgánica",
		internalNote: "",
		hidden: false,
		sortOrder: 0,
		...overrides,
	};
}

describe("draftToPreview", () => {
	describe("sample gift fallback", () => {
		it("uses preset sampleGifts when draft has no gifts", () => {
			const draft = makeDraft({ gifts: [] });
			const vm = draftToPreview(draft);
			const preset = EVENT_TYPE_PRESETS.baby_shower;
			expect(vm.gifts).toHaveLength(preset.sampleGifts.length);
			expect(vm.gifts[0]?.name).toBe(preset.sampleGifts[0]?.name);
		});

		it("sample gifts have id prefixed with 'sample-'", () => {
			const draft = makeDraft({ gifts: [] });
			const vm = draftToPreview(draft);
			for (const g of vm.gifts) {
				expect(g.id).toMatch(/^sample-\d+$/);
			}
		});

		it("creates a single synthetic sample category", () => {
			const draft = makeDraft({ gifts: [] });
			const vm = draftToPreview(draft);
			expect(vm.categories).toHaveLength(1);
			expect(vm.categories[0]?.id).toBe("sample");
		});

		it("all sample gifts point to the sample category", () => {
			const draft = makeDraft({ gifts: [] });
			const vm = draftToPreview(draft);
			for (const g of vm.gifts) {
				expect(g.categoryId).toBe("sample");
			}
		});

		it("returns empty gifts and categories when eventType is null and no gifts", () => {
			const draft = makeDraft({ eventType: null, gifts: [] });
			const vm = draftToPreview(draft);
			expect(vm.gifts).toHaveLength(0);
			expect(vm.categories).toHaveLength(0);
		});
	});

	describe("hidden gift exclusion", () => {
		it("excludes hidden gifts from the view model", () => {
			const visible = makeGift({ id: "g1", name: "Visible", hidden: false });
			const hidden = makeGift({
				id: "g2",
				name: "Oculto",
				hidden: true,
				sortOrder: 1,
			});
			const draft = makeDraft({ gifts: [visible, hidden] });
			const vm = draftToPreview(draft);
			expect(vm.gifts).toHaveLength(1);
			expect(vm.gifts[0]?.name).toBe("Visible");
		});

		it("falls back to samples when all gifts are hidden", () => {
			const hiddenGift = makeGift({ hidden: true });
			const draft = makeDraft({ gifts: [hiddenGift] });
			const vm = draftToPreview(draft);
			const preset = EVENT_TYPE_PRESETS.baby_shower;
			expect(vm.gifts).toHaveLength(preset.sampleGifts.length);
		});
	});

	describe("category synthesis", () => {
		it("maps draft string categories to synthetic view-model categories", () => {
			const gift = makeGift({ category: "Pañales" });
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			const category = vm.categories.find((c) => c.id === "Pañales");
			expect(category).toBeDefined();
			expect(category?.name).toBe("Pañales");
		});

		it("uses category name as both id and name", () => {
			const gift = makeGift({ category: "Ropa" });
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			const category = vm.categories.find((c) => c.id === "Ropa");
			expect(category?.id).toBe("Ropa");
			expect(category?.name).toBe("Ropa");
		});

		it("assigns category id to gift.categoryId", () => {
			const gift = makeGift({ category: "Pañales" });
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			expect(vm.gifts[0]?.categoryId).toBe("Pañales");
		});
	});

	describe("view model fields", () => {
		it("maps draft scalar fields to the view model", () => {
			const draft = makeDraft();
			const vm = draftToPreview(draft);
			expect(vm.title).toBe("Baby shower de Ana");
			expect(vm.slug).toBe("baby-shower-de-ana");
			expect(vm.themeId).toBe("cielo-suave");
			expect(vm.layoutId).toBe("grid");
			expect(vm.fontPairing).toBe("serif-soft");
			expect(vm.buttonStyle).toBe("rounded");
			expect(vm.showHowItWorks).toBe(true);
		});

		it("progress reflects all gifts as available with 0 purchased", () => {
			const gift = makeGift({ quantityNeeded: 3 });
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			expect(vm.progress.purchasedUnits).toBe(0);
			expect(vm.progress.totalUnits).toBe(3);
			expect(vm.progress.availableGiftCount).toBe(1);
		});

		it("all gift statuses are 'available'", () => {
			const gift = makeGift();
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			for (const g of vm.gifts) {
				expect(g.status).toBe("available");
			}
		});

		it("priceAmount is stringified when present", () => {
			const gift = makeGift({ priceAmount: 99.5 });
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			expect(vm.gifts[0]?.priceAmount).toBe("99.5");
		});

		it("priceAmount is null when not set", () => {
			const gift = makeGift({ priceAmount: null });
			const draft = makeDraft({ gifts: [gift] });
			const vm = draftToPreview(draft);
			expect(vm.gifts[0]?.priceAmount).toBeNull();
		});
	});
});
