import { describe, expect, it } from "vitest";
import type { Gift, Purchase, Wishlist } from "@/generated/prisma/client";
import { mapDashboardWishlist } from "@/server/mappers/dashboard-wishlist.mapper";

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
		coverImageUrl: null,
		themeId: null,
		layoutId: null,
		buttonStyle: null,
		fontPairing: null,
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
