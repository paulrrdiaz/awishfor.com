import { describe, expect, it } from "vitest";
import {
	type SaveDraftWishlistInput,
	saveDraftWishlistSchema,
} from "@/server/validators/wishlist-save-draft.schema";

const makeInput = (
	overrides: Partial<SaveDraftWishlistInput> = {},
): SaveDraftWishlistInput => ({
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: "wedding",
	language: "es",
	currency: "PEN",
	heroTitle: "Nuestra boda",
	welcomeMessage: "Gracias por acompañarnos",
	thankYouMessage: "Con cariño",
	displayName: "Ana y Luis",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	coverImageUrl: "https://example.com/cover.jpg",
	coverImageUrls: ["https://example.com/cover.jpg"],
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	headingFont: null,
	bodyFont: null,
	showHowItWorks: true,
	categories: ["Hogar", "Viaje"],
	gifts: [
		{
			name: "Juego de sábanas",
			productUrl: "https://example.com/sabanas",
			imageUrl: null,
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 1,
			priority: "medium",
			publicNote: "Algodón",
			internalNote: null,
			hidden: false,
			sortOrder: 0,
		},
	],
	savedWishlistId: null,
	lastSavedAt: null,
	force: false,
	...overrides,
});

describe("saveDraftWishlistSchema", () => {
	it("normalizes nullable empty strings and defaults language/currency/force", () => {
		const result = saveDraftWishlistSchema.parse(
			makeInput({
				language: undefined,
				currency: undefined,
				heroTitle: "",
				welcomeMessage: "",
				thankYouMessage: "",
				displayName: "",
				eventDate: null,
				eventTime: "",
				eventLocation: "",
				coverImageUrl: "",
				themeId: "",
				layoutId: "",
				buttonStyle: "",
				fontPairing: "",
				gifts: [
					{
						name: "Licuadora",
						productUrl: "",
						imageUrl: "",
						priceAmount: null,
						category: "",
						quantityNeeded: 2,
						priority: "high",
						publicNote: "",
						internalNote: "",
						hidden: true,
						sortOrder: 0,
					},
				],
				force: undefined,
			}),
		);

		expect(result.language).toBe("es");
		expect(result.currency).toBe("PEN");
		expect(result.force).toBe(false);
		expect(result.heroTitle).toBeNull();
		expect(result.welcomeMessage).toBeNull();
		expect(result.thankYouMessage).toBeNull();
		expect(result.displayName).toBeNull();
		expect(result.eventDate).toBeNull();
		expect(result.eventTime).toBeNull();
		expect(result.eventLocation).toBeNull();
		expect(result.coverImageUrl).toBeNull();
		expect(result.themeId).toBeNull();
		expect(result.layoutId).toBeNull();
		expect(result.buttonStyle).toBeNull();
		expect(result.fontPairing).toBeNull();
		expect(result.gifts[0]?.productUrl).toBeNull();
		expect(result.gifts[0]?.imageUrl).toBeNull();
		expect(result.gifts[0]?.category).toBeNull();
		expect(result.gifts[0]?.publicNote).toBeNull();
		expect(result.gifts[0]?.internalNote).toBeNull();
	});

	it("rejects duplicate categories after trimming and case-folding", () => {
		const result = saveDraftWishlistSchema.safeParse(
			makeInput({
				categories: ["Hogar", " hogar "],
			}),
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: ["categories", 1],
						message:
							"Category names must be unique after trimming and case-folding",
					}),
				]),
			);
		}
	});

	it("rejects gifts that reference a missing category", () => {
		const result = saveDraftWishlistSchema.safeParse(
			makeInput({
				gifts: [
					{
						name: "Cafetera",
						productUrl: null,
						imageUrl: null,
						priceAmount: 80,
						category: "Electro",
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

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: ["gifts", 0, "category"],
						message:
							"Gift category must reference a submitted category or be empty",
					}),
				]),
			);
		}
	});

	it("rejects duplicate gift sort orders", () => {
		const result = saveDraftWishlistSchema.safeParse(
			makeInput({
				gifts: [
					{
						name: "Toallas",
						productUrl: null,
						imageUrl: null,
						priceAmount: 30,
						category: "Hogar",
						quantityNeeded: 1,
						priority: "medium",
						publicNote: null,
						internalNote: null,
						hidden: false,
						sortOrder: 0,
					},
					{
						name: "Vajilla",
						productUrl: null,
						imageUrl: null,
						priceAmount: 90,
						category: "Hogar",
						quantityNeeded: 1,
						priority: "high",
						publicNote: null,
						internalNote: null,
						hidden: false,
						sortOrder: 0,
					},
				],
			}),
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: ["gifts", 1, "sortOrder"],
						message: "Gift sort orders must be unique",
					}),
				]),
			);
		}
	});

	it("requires a revision when updating without force", () => {
		const result = saveDraftWishlistSchema.safeParse(
			makeInput({
				savedWishlistId: "wishlist_123",
				lastSavedAt: null,
				force: false,
			}),
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: ["lastSavedAt"],
						message:
							"Revision is required when updating an existing draft without overwrite confirmation",
					}),
				]),
			);
		}
	});

	it("allows a forced overwrite without a revision", () => {
		const result = saveDraftWishlistSchema.parse(
			makeInput({
				savedWishlistId: "wishlist_123",
				lastSavedAt: null,
				force: true,
			}),
		);

		expect(result.savedWishlistId).toBe("wishlist_123");
		expect(result.lastSavedAt).toBeNull();
		expect(result.force).toBe(true);
	});
});
