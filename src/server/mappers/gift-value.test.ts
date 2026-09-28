import { describe, expect, it } from "vitest";
import type { Gift, Purchase } from "@/generated/prisma/client";
import { OWNER_MANUAL_PURCHASE_DEFAULT_NAME } from "@/server/services/purchase.service";
import { computeApproxGiftValue } from "./gift-value";

const now = new Date("2026-06-26T12:00:00Z");

function makeGift(overrides: Partial<Gift> = {}): Gift {
	return {
		id: "gift-1",
		wishlistId: "wl-1",
		categoryId: null,
		name: "Test Gift",
		productUrl: null,
		imageUrl: null,
		storeName: null,
		size: null,
		priceAmount: null,
		priceCurrency: null,
		quantityNeeded: 1,
		priority: "medium",
		visibilityStatus: "available",
		publicNote: null,
		internalNote: null,
		sortOrder: 0,
		deletedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
	return {
		id: "purchase-1",
		giftId: "gift-1",
		guestName: "Guest",
		guestEmail: null,
		guestPhone: null,
		message: null,
		quantity: 1,
		undoTokenHash: null,
		undoExpiresAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function pricedGift(priceAmount: string, overrides: Partial<Gift> = {}): Gift {
	return makeGift({
		priceAmount: priceAmount as unknown as Gift["priceAmount"],
		...overrides,
	});
}

describe("computeApproxGiftValue", () => {
	it("computes received and goal amounts, caps over-purchases, and includes manual purchases", () => {
		const result = computeApproxGiftValue(
			[
				{
					...pricedGift("100.00", { id: "one", quantityNeeded: 2 }),
					purchases: [makePurchase({ quantity: 1 })],
				},
				{
					...pricedGift("50.00", { id: "two", quantityNeeded: 1 }),
					purchases: [
						makePurchase({
							quantity: 2,
							guestName: OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
						}),
					],
				},
			],
			"PEN",
		);

		expect(result).toMatchObject({
			receivedAmount: "150.00",
			goalAmount: "250.00",
			pricedGiftCount: 2,
			visibleGiftCount: 2,
		});
	});

	it("excludes hidden and deleted gifts and treats a missing price currency as the wishlist currency", () => {
		const result = computeApproxGiftValue(
			[
				{
					...pricedGift("40.00", { id: "visible" }),
					purchases: [makePurchase()],
				},
				{
					...pricedGift("100.00", {
						id: "hidden",
						visibilityStatus: "hidden",
					}),
					purchases: [makePurchase()],
				},
				{
					...pricedGift("100.00", { id: "deleted", deletedAt: now }),
					purchases: [makePurchase()],
				},
			],
			"PEN",
		);

		expect(result).toMatchObject({
			receivedAmount: "40.00",
			goalAmount: "40.00",
			pricedGiftCount: 1,
			visibleGiftCount: 1,
		});
	});

	it("adds decimal prices in cents without rounding drift", () => {
		const result = computeApproxGiftValue(
			["0.10", "0.20", "0.30"].map((priceAmount, index) => ({
				...pricedGift(priceAmount, { id: `gift-${index}` }),
				purchases: [makePurchase()],
			})),
			"PEN",
		);

		expect(result.receivedAmount).toBe("0.60");
		expect(result.goalAmount).toBe("0.60");
	});

	it("reports partial and full pricing coverage, including a wishlist without gifts", () => {
		expect(
			computeApproxGiftValue(
				[
					{ ...pricedGift("10.00", { id: "priced" }), purchases: [] },
					{ ...makeGift({ id: "unpriced" }), purchases: [] },
				],
				"PEN",
			),
		).toMatchObject({ pricedGiftCount: 1, visibleGiftCount: 2 });
		expect(
			computeApproxGiftValue(
				[{ ...pricedGift("10.00"), purchases: [] }],
				"PEN",
			),
		).toMatchObject({ pricedGiftCount: 1, visibleGiftCount: 1 });
		expect(computeApproxGiftValue([], "PEN")).toMatchObject({
			receivedAmount: "0.00",
			goalAmount: "0.00",
			pricedGiftCount: 0,
			visibleGiftCount: 0,
		});
	});

	it("separates purchased foreign-currency amounts, sorts them, and omits unpurchased foreign gifts", () => {
		const result = computeApproxGiftValue(
			[
				{
					...pricedGift("30.00", { id: "usd", priceCurrency: "USD" }),
					purchases: [makePurchase()],
				},
				{
					...pricedGift("20.00", { id: "eur", priceCurrency: "EUR" }),
					purchases: [makePurchase()],
				},
				{
					...pricedGift("40.00", {
						id: "unbought-usd",
						priceCurrency: "USD",
					}),
					purchases: [],
				},
			],
			"PEN",
		);

		expect(result).toMatchObject({
			receivedAmount: "0.00",
			goalAmount: "0.00",
			pricedGiftCount: 0,
			visibleGiftCount: 3,
			foreignReceived: [
				{ currency: "EUR", amount: "20.00" },
				{ currency: "USD", amount: "30.00" },
			],
		});
	});
});
