import { describe, expect, it } from "vitest";
import type { PersistedWishlistPreviewSource } from "./persisted-to-preview";
import { persistedWishlistToPreviewDraft } from "./persisted-to-preview";

function makePersistedWishlist(
	overrides: Partial<PersistedWishlistPreviewSource> = {},
): PersistedWishlistPreviewSource {
	return {
		eventType: "wedding",
		title: "Lista de Ana y Luis",
		slug: "ana-y-luis",
		displayName: "Ana y Luis",
		eventDate: "2026-12-24T00:00:00.000Z",
		eventTime: "18:30",
		eventLocation: "Barranco",
		dressCode: "Formal",
		coverImageUrl: "https://example.com/cover.jpg",
		heroTitle: "Nuestra boda",
		welcomeMessage: "Gracias por acompañarnos",
		thankYouMessage: "Con cariño",
		categories: [{ name: "Hogar" }, { name: "Cocina" }],
		themeId: "cielo-suave",
		layoutId: "grid",
		buttonStyle: "rounded",
		fontPairing: "serif-soft",
		showHowItWorks: true,
		gifts: [
			{
				id: "gift-1",
				name: "Cafetera",
				productUrl: "https://example.com/cafetera",
				imageUrl: null,
				priceAmount: "120.5",
				category: "Cocina",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: null,
				internalNote: null,
				hidden: false,
				sortOrder: 0,
			},
		],
		...overrides,
	};
}

describe("persistedWishlistToPreviewDraft", () => {
	it("maps persisted wishlist content into the draft preview shape", () => {
		const draft = persistedWishlistToPreviewDraft(makePersistedWishlist());

		expect(draft).toMatchObject({
			title: "Lista de Ana y Luis",
			slug: "ana-y-luis",
			eventType: "wedding",
			categories: ["Hogar", "Cocina"],
			themeId: "cielo-suave",
			layoutId: "grid",
			fontPairing: "serif-soft",
			buttonStyle: "rounded",
		});
		expect(draft.gifts[0]).toMatchObject({
			id: "gift-1",
			name: "Cafetera",
			priceAmount: 120.5,
			category: "Cocina",
			publicNote: "",
			internalNote: "",
		});
	});

	it("applies pending design values without mutating persisted content", () => {
		const persisted = makePersistedWishlist();
		const draft = persistedWishlistToPreviewDraft(persisted, {
			themeId: "crema-elegante",
			layoutId: "editorial",
			fontPairing: "sans-modern",
			buttonStyle: "pill",
			coverImageUrl: null,
		});

		expect(draft.themeId).toBe("crema-elegante");
		expect(draft.layoutId).toBe("editorial");
		expect(draft.fontPairing).toBe("sans-modern");
		expect(draft.buttonStyle).toBe("pill");
		expect(draft.coverImageUrl).toBeNull();
		expect(draft.title).toBe("Lista de Ana y Luis");
	});

	it("normalizes invalid persisted prices to null for the draft", () => {
		const draft = persistedWishlistToPreviewDraft(
			makePersistedWishlist({
				gifts: [
					{
						id: "gift-1",
						name: "Cafetera",
						productUrl: null,
						imageUrl: null,
						priceAmount: "not-a-number",
						category: null,
						quantityNeeded: 1,
						priority: "medium",
						publicNote: null,
						internalNote: null,
						hidden: false,
						sortOrder: 0,
					},
				],
			}),
		);

		expect(draft.gifts[0]?.priceAmount).toBeNull();
		expect(draft.gifts[0]?.category).toBe("");
	});
});
