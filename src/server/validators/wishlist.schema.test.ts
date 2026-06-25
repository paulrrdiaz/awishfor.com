import { describe, expect, it } from "vitest";
import {
	createWishlistSchema,
	restoreWishlistSchema,
	wishlistRestoreTargetStatusSchema,
} from "@/server/validators/wishlist.schema";

describe("wishlist creation validation", () => {
	it("requires an owner and applies language, currency, and how-it-works defaults", () => {
		const missingOwnerResult = createWishlistSchema.safeParse({
			title: "Lista de boda",
			slug: "lista-de-boda",
			eventType: "wedding",
		});

		expect(missingOwnerResult.success).toBe(false);
		if (!missingOwnerResult.success) {
			expect(missingOwnerResult.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: ["ownerId"],
					}),
				]),
			);
		}

		expect(
			createWishlistSchema.parse({
				ownerId: 42,
				title: "Lista de boda",
				slug: "lista-de-boda",
				eventType: "wedding",
			}),
		).toMatchObject({
			ownerId: 42,
			title: "Lista de boda",
			slug: "lista-de-boda",
			eventType: "wedding",
			language: "es",
			currency: "PEN",
			showHowItWorks: true,
		});
	});

	it("rejects invalid slugs", () => {
		expect(() =>
			createWishlistSchema.parse({
				ownerId: 42,
				title: "Lista de boda",
				slug: "Lista-De-Boda",
				eventType: "wedding",
			}),
		).toThrow(
			"Slug must be 3-60 characters of lowercase letters, numbers, or hyphens, and cannot start or end with a hyphen",
		);
	});

	it("rejects invalid event time values", () => {
		expect(() =>
			createWishlistSchema.parse({
				ownerId: 42,
				title: "Lista de boda",
				slug: "lista-de-boda",
				eventType: "wedding",
				eventTime: "24:00",
			}),
		).toThrow("Event time must use 24-hour HH:mm format");
	});

	it("accepts optional event details, including past dates", () => {
		const eventDate = new Date("2020-01-01T00:00:00.000Z");

		expect(
			createWishlistSchema.parse({
				ownerId: 42,
				title: "Lista de boda",
				slug: "lista-de-boda",
				eventType: "wedding",
				eventDate,
				eventTime: "08:15",
				eventLocation: "Barranco, Lima",
			}),
		).toMatchObject({
			eventDate,
			eventTime: "08:15",
			eventLocation: "Barranco, Lima",
		});
	});
});

describe("wishlist restore validation", () => {
	it("accepts draft and published as restore target states", () => {
		expect(wishlistRestoreTargetStatusSchema.parse("draft")).toBe("draft");
		expect(wishlistRestoreTargetStatusSchema.parse("published")).toBe(
			"published",
		);
	});

	it("rejects archived as a restore target state", () => {
		expect(() =>
			restoreWishlistSchema.parse({
				wishlistId: "wishlist_123",
				targetStatus: "archived",
			}),
		).toThrow();
	});
});
