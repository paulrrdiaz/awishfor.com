import { describe, expect, it } from "vitest";
import {
	createGiftSchema,
	GIFT_NAME_MAX_LENGTH,
	updateGiftSchema,
} from "@/server/validators/gift.schema";

const baseCreate = {
	wishlistId: "wishlist_123",
	name: "Kitchen Aid Mixer",
	quantityNeeded: 1,
};

describe("gift validation", () => {
	it("trims gift names on create and update", () => {
		expect(
			createGiftSchema.parse({ ...baseCreate, name: "  Kitchen Aid  " }),
		).toMatchObject({ name: "Kitchen Aid" });

		expect(
			updateGiftSchema.parse({ giftId: "gift_1", name: "  Blender  " }),
		).toMatchObject({ name: "Blender" });
	});

	it("rejects empty gift names after trimming", () => {
		expect(() =>
			createGiftSchema.parse({ ...baseCreate, name: "   " }),
		).toThrow("Gift name is required");
	});

	it("rejects gift names that exceed the maximum length", () => {
		expect(() =>
			createGiftSchema.parse({
				...baseCreate,
				name: "a".repeat(GIFT_NAME_MAX_LENGTH + 1),
			}),
		).toThrow(`Gift name must be at most ${GIFT_NAME_MAX_LENGTH} characters`);
	});

	it("creates gift without optional commerce metadata", () => {
		const result = createGiftSchema.parse(baseCreate);
		expect(result.productUrl).toBeUndefined();
		expect(result.imageUrl).toBeUndefined();
		expect(result.storeName).toBeUndefined();
		expect(result.priceAmount).toBeUndefined();
		expect(result.priceCurrency).toBeUndefined();
	});

	it("accepts a gift with all optional fields", () => {
		const result = createGiftSchema.parse({
			...baseCreate,
			productUrl: "https://example.com/product",
			imageUrl: "https://example.com/image.jpg",
			storeName: "Amazon",
			priceAmount: 99.99,
			priceCurrency: "USD",
			quantityNeeded: 3,
			priority: "high",
			visibilityStatus: "hidden",
			publicNote: "Great gift idea",
			internalNote: "Already have one in mind",
			sortOrder: 5,
		});

		expect(result.priceAmount).toBe(99.99);
		expect(result.priceCurrency).toBe("USD");
		expect(result.quantityNeeded).toBe(3);
		expect(result.priority).toBe("high");
		expect(result.visibilityStatus).toBe("hidden");
	});

	it("rejects quantity needed below 1", () => {
		expect(() =>
			createGiftSchema.parse({ ...baseCreate, quantityNeeded: 0 }),
		).toThrow("Quantity must be at least 1");
	});

	it("applies default quantity of 1 when omitted", () => {
		const result = createGiftSchema.parse({ wishlistId: "w_1", name: "Gift" });
		expect(result.quantityNeeded).toBe(1);
	});

	it("applies default priority of medium and visibility of available", () => {
		const result = createGiftSchema.parse(baseCreate);
		expect(result.priority).toBe("medium");
		expect(result.visibilityStatus).toBe("available");
	});

	it("rejects javascript: scheme in productUrl", () => {
		expect(() =>
			createGiftSchema.parse({
				...baseCreate,
				productUrl: "javascript:alert(1)",
			}),
		).toThrow("must use http or https scheme");
	});

	it("rejects data: scheme in imageUrl", () => {
		expect(() =>
			createGiftSchema.parse({
				...baseCreate,
				imageUrl: "data:text/html,<h1>hi</h1>",
			}),
		).toThrow();
	});

	it("rejects negative price amounts", () => {
		expect(() =>
			createGiftSchema.parse({ ...baseCreate, priceAmount: -1 }),
		).toThrow("Price must be zero or greater");
	});

	it("accepts zero price amount", () => {
		const result = createGiftSchema.parse({ ...baseCreate, priceAmount: 0 });
		expect(result.priceAmount).toBe(0);
	});
});
