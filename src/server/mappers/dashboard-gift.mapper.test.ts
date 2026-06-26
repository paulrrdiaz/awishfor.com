import { describe, expect, it } from "vitest";
import type { Gift, Purchase } from "@/generated/prisma/client";
import { mapDashboardGift } from "@/server/mappers/dashboard-gift.mapper";

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

describe("mapDashboardGift", () => {
	it("computes purchased and remaining quantities", () => {
		const gift = makeGift({ quantityNeeded: 3 });
		const p1 = makePurchase({ id: "p1", quantity: 1 });
		const result = mapDashboardGift({ ...gift, purchases: [p1] });
		expect(result.purchasedQuantity).toBe(1);
		expect(result.remainingQuantity).toBe(2);
	});

	it("remaining quantity does not go below zero", () => {
		const gift = makeGift({ quantityNeeded: 1 });
		const p1 = makePurchase({ quantity: 2 });
		const result = mapDashboardGift({ ...gift, purchases: [p1] });
		expect(result.remainingQuantity).toBe(0);
	});

	it("serializes Decimal price to string", () => {
		const gift = makeGift({
			priceAmount: {
				toString: () => "99.50",
			} as unknown as Gift["priceAmount"],
		});
		const result = mapDashboardGift({ ...gift, purchases: [] });
		expect(result.priceAmount).toBe("99.50");
	});

	it("maps null price to null", () => {
		const result = mapDashboardGift({ ...makeGift(), purchases: [] });
		expect(result.priceAmount).toBeNull();
	});

	it("serializes dates to ISO strings", () => {
		const result = mapDashboardGift({ ...makeGift(), purchases: [] });
		expect(result.createdAt).toBe("2026-06-26T12:00:00.000Z");
		expect(result.updatedAt).toBe("2026-06-26T12:00:00.000Z");
	});

	it("serializes deletedAt to ISO string when set", () => {
		const gift = makeGift({ deletedAt: now });
		const result = mapDashboardGift({ ...gift, purchases: [] });
		expect(result.deletedAt).toBe("2026-06-26T12:00:00.000Z");
	});

	it("maps null deletedAt to null", () => {
		const result = mapDashboardGift({ ...makeGift(), purchases: [] });
		expect(result.deletedAt).toBeNull();
	});

	it("sets hasInternalNote true when internalNote is set", () => {
		const gift = makeGift({ internalNote: "secret" });
		const result = mapDashboardGift({ ...gift, purchases: [] });
		expect(result.hasInternalNote).toBe(true);
	});

	it("sets hasInternalNote false when internalNote is null", () => {
		const result = mapDashboardGift({ ...makeGift(), purchases: [] });
		expect(result.hasInternalNote).toBe(false);
	});

	it("sums purchased quantity from multiple purchases", () => {
		const gift = makeGift({ quantityNeeded: 5 });
		const p1 = makePurchase({ id: "p1", quantity: 2 });
		const p2 = makePurchase({ id: "p2", quantity: 1 });
		const result = mapDashboardGift({ ...gift, purchases: [p1, p2] });
		expect(result.purchasedQuantity).toBe(3);
		expect(result.remainingQuantity).toBe(2);
	});
});
