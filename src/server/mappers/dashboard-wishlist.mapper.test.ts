import { describe, expect, it } from "vitest";
import type { Gift, Purchase, Wishlist } from "@/generated/prisma/client";
import {
	mapDashboardWishlist,
	mapDashboardWishlistOverview,
	mapDashboardWishlistSummary,
} from "@/server/mappers/dashboard-wishlist.mapper";

const now = new Date("2026-06-26T12:00:00Z");

function makeWishlist(overrides: Partial<Wishlist> = {}): Wishlist {
	return {
		id: "wl-1",
		ownerId: 1,
		title: "My Wishlist",
		slug: "my-wishlist",
		eventType: "birthday",
		language: "es",
		currency: "PEN",
		heroTitle: null,
		welcomeMessage: null,
		thankYouMessage: null,
		displayName: null,
		eventDate: null,
		eventTime: null,
		eventLocation: null,
		dressCode: null,
		coverImageUrl: null,
		coverImageUrls: [],
		themeId: null,
		layoutId: null,
		buttonStyle: null,
		fontPairing: null,
		headingFont: null,
		bodyFont: null,
		showHowItWorks: true,
		status: "draft",
		publishedAt: null,
		archivedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

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

describe("mapDashboardWishlist", () => {
	it("counts only visible non-deleted gifts", () => {
		const visible = makeGift({ id: "g1", visibilityStatus: "available" });
		const hidden = makeGift({ id: "g2", visibilityStatus: "hidden" });
		const deleted = makeGift({ id: "g3", deletedAt: now });
		const result = mapDashboardWishlist({
			...makeWishlist(),
			gifts: [
				{ ...visible, purchases: [] },
				{ ...hidden, purchases: [] },
				{ ...deleted, purchases: [] },
			],
		});
		expect(result.visibleGiftCount).toBe(1);
	});

	it("includes wishlist status", () => {
		const result = mapDashboardWishlist({
			...makeWishlist({ status: "published" }),
			gifts: [],
		});
		expect(result.status).toBe("published");
	});

	it("serializes eventDate to ISO string", () => {
		const eventDate = new Date("2026-12-25T00:00:00Z");
		const result = mapDashboardWishlist({
			...makeWishlist({ eventDate }),
			gifts: [],
		});
		expect(result.eventDate).toBe("2026-12-25T00:00:00.000Z");
	});

	it("maps null eventDate to null", () => {
		const result = mapDashboardWishlist({
			...makeWishlist({ eventDate: null }),
			gifts: [],
		});
		expect(result.eventDate).toBeNull();
	});

	it("serializes publishedAt and archivedAt", () => {
		const result = mapDashboardWishlist({
			...makeWishlist({ publishedAt: now, archivedAt: null }),
			gifts: [],
		});
		expect(result.publishedAt).toBe("2026-06-26T12:00:00.000Z");
		expect(result.archivedAt).toBeNull();
	});

	it("includes mapped dashboard gift rows", () => {
		const gift = makeGift({ quantityNeeded: 2 });
		const purchase = makePurchase({ quantity: 1 });
		const result = mapDashboardWishlist({
			...makeWishlist(),
			gifts: [{ ...gift, purchases: [purchase] }],
		});
		expect(result.gifts).toHaveLength(1);
		expect(result.gifts[0]?.purchasedQuantity).toBe(1);
		expect(result.gifts[0]?.remainingQuantity).toBe(1);
	});

	it("serializes createdAt and updatedAt", () => {
		const result = mapDashboardWishlist({
			...makeWishlist(),
			gifts: [],
		});
		expect(result.createdAt).toBe("2026-06-26T12:00:00.000Z");
		expect(result.updatedAt).toBe("2026-06-26T12:00:00.000Z");
	});
});

describe("mapDashboardWishlistSummary", () => {
	it("returns zero quantity aggregates when there are no visible gifts", () => {
		const result = mapDashboardWishlistSummary({
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "hidden", visibilityStatus: "hidden" }),
					purchases: [],
				},
				{ ...makeGift({ id: "deleted", deletedAt: now }), purchases: [] },
			],
		});

		expect(result.totalGiftCount).toBe(0);
		expect(result.availableGiftCount).toBe(0);
		expect(result.totalUnits).toBe(0);
		expect(result.purchasedUnits).toBe(0);
	});

	it("computes partial quantity progress from visible non-deleted gifts", () => {
		const result = mapDashboardWishlistSummary({
			...makeWishlist({ status: "published" }),
			gifts: [
				{
					...makeGift({ id: "g1", quantityNeeded: 3 }),
					purchases: [makePurchase({ id: "p1", giftId: "g1", quantity: 1 })],
				},
				{
					...makeGift({ id: "g2", quantityNeeded: 2 }),
					purchases: [makePurchase({ id: "p2", giftId: "g2", quantity: 2 })],
				},
				{
					...makeGift({
						id: "g3",
						quantityNeeded: 5,
						visibilityStatus: "hidden",
					}),
					purchases: [makePurchase({ id: "p3", giftId: "g3", quantity: 5 })],
				},
			],
		});

		expect(result.status).toBe("published");
		expect(result.totalGiftCount).toBe(2);
		expect(result.availableGiftCount).toBe(1);
		expect(result.totalUnits).toBe(5);
		expect(result.purchasedUnits).toBe(3);
	});

	it("caps over-purchased units at quantity needed", () => {
		const result = mapDashboardWishlistSummary({
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "g1", quantityNeeded: 2 }),
					purchases: [makePurchase({ id: "p1", giftId: "g1", quantity: 3 })],
				},
			],
		});

		expect(result.totalGiftCount).toBe(1);
		expect(result.availableGiftCount).toBe(0);
		expect(result.totalUnits).toBe(2);
		expect(result.purchasedUnits).toBe(2);
	});
});

describe("mapDashboardWishlistOverview", () => {
	const readiness = {
		ready: true,
		checks: {
			title: true,
			eventType: true,
			slug: true,
			language: true,
			currency: true,
			visibleGift: true,
		},
	};

	it("maps overview metrics and recent purchases", () => {
		const purchase = {
			...makePurchase({
				id: "purchase-1",
				giftId: "g1",
				quantity: 2,
				undoTokenHash: null,
				undoExpiresAt: null,
			}),
			gift: { id: "g1", name: "Cafetera" },
		};

		const result = mapDashboardWishlistOverview(
			{
				...makeWishlist({ status: "published" }),
				gifts: [
					{
						...makeGift({ id: "g1", quantityNeeded: 2 }),
						purchases: [makePurchase({ id: "p1", giftId: "g1", quantity: 2 })],
					},
					{
						...makeGift({ id: "g2", quantityNeeded: 4 }),
						purchases: [makePurchase({ id: "p2", giftId: "g2", quantity: 1 })],
					},
				],
			},
			{
				publicUrlPath: "/w/my-wishlist",
				publicUrl: "https://awishfor.com/w/my-wishlist",
				whatsAppUrl: "https://wa.me/?text=hello",
				readiness,
				recentPurchases: [purchase],
			},
		);

		expect(result.metrics).toEqual({
			totalGifts: 2,
			availableGifts: 1,
			purchasedGifts: 1,
			totalUnits: 6,
			purchasedUnits: 3,
		});
		expect(result.recentPurchases).toEqual([
			{
				id: "purchase-1",
				guestName: "Guest",
				giftId: "g1",
				giftName: "Cafetera",
				quantity: 2,
				status: "confirmed",
				createdAt: "2026-06-26T12:00:00.000Z",
			},
		]);
	});
});
