import { describe, expect, it } from "vitest";
import {
	draftToSaveDraftInput,
	serverDraftToLocalDraft,
} from "@/lib/wishlist/save-draft";
import type { SaveDraftServerDraft } from "@/server/validators/wishlist-save-draft.schema";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";

const makeDraft = (overrides: Partial<WishlistDraft> = {}): WishlistDraft => ({
	eventType: "wedding",
	title: "Lista de boda",
	slug: "lista-de-boda",
	displayName: "",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "",
	dressCode: "",
	coverImageUrl: null,
	heroTitle: "Nuestra boda",
	welcomeMessage: "Bienvenidos",
	thankYouMessage: "Gracias",
	categories: ["Hogar", "Viaje"],
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	showHowItWorks: true,
	gifts: [
		{
			id: "gift_2",
			name: "Maletas",
			productUrl: null,
			imageUrl: null,
			priceAmount: null,
			category: "Viaje",
			quantityNeeded: 1,
			priority: "medium",
			publicNote: "",
			internalNote: "",
			hidden: true,
			sortOrder: 1,
		},
		{
			id: "gift_1",
			name: "Juego de sábanas",
			productUrl: "https://example.com/sabanas",
			imageUrl: null,
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 2,
			priority: "high",
			publicNote: "Algodón",
			internalNote: "Urgente",
			hidden: false,
			sortOrder: 0,
		},
	],
	...overrides,
});

const makeServerDraft = (
	overrides: Partial<SaveDraftServerDraft> = {},
): SaveDraftServerDraft => ({
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: "wedding",
	language: "es",
	currency: "PEN",
	heroTitle: null,
	welcomeMessage: "Bienvenidos",
	thankYouMessage: null,
	displayName: null,
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: null,
	dressCode: null,
	coverImageUrl: null,
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	showHowItWorks: true,
	categories: ["Hogar"],
	gifts: [
		{
			name: "Juego de sábanas",
			productUrl: "https://example.com/sabanas",
			imageUrl: null,
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 2,
			priority: "high",
			publicNote: "Algodón",
			internalNote: null,
			hidden: false,
			sortOrder: 0,
		},
	],
	savedWishlistId: "wishlist_123",
	lastSavedAt: 123456789,
	...overrides,
});

describe("save draft mapping", () => {
	it("maps the local wizard draft into the API payload while preserving order and metadata", () => {
		const result = draftToSaveDraftInput(makeDraft(), {
			savedWishlistId: "wishlist_123",
			lastSavedAt: 123,
		});

		expect(result).toMatchObject({
			title: "Lista de boda",
			slug: "lista-de-boda",
			eventType: "wedding",
			language: "es",
			currency: "PEN",
			savedWishlistId: "wishlist_123",
			lastSavedAt: 123,
			force: false,
		});
		expect(result.gifts.map((gift) => gift.name)).toEqual([
			"Juego de sábanas",
			"Maletas",
		]);
		expect(result.gifts.map((gift) => gift.sortOrder)).toEqual([0, 1]);
		expect(result.gifts[0]?.category).toBe("Hogar");
		expect(result.gifts[1]?.hidden).toBe(true);
	});

	it("maps a server draft into the local wizard format with generated client ids", () => {
		let counter = 0;
		const result = serverDraftToLocalDraft(makeServerDraft(), {
			createGiftId: () => `generated_${++counter}`,
		});

		expect(result.savedWishlistId).toBe("wishlist_123");
		expect(result.lastSavedAt).toBe(123456789);
		expect(result.draft.displayName).toBe("");
		expect(result.draft.eventLocation).toBe("");
		expect(result.draft.heroTitle).toBe("");
		expect(result.draft.thankYouMessage).toBe("");
		expect(result.draft.gifts).toEqual([
			expect.objectContaining({
				id: "generated_1",
				name: "Juego de sábanas",
				category: "Hogar",
				publicNote: "Algodón",
				internalNote: "",
				sortOrder: 0,
			}),
		]);
	});
});
