import { describe, expect, it } from "vitest";
import type {
	Category,
	Gift,
	Purchase,
	Wishlist,
} from "@/generated/prisma/client";
import { mapPublicWishlist } from "@/server/mappers/public-wishlist.mapper";

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
		status: "published",
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
		guestEmail: "guest@example.com",
		guestPhone: "555-1234",
		message: "Congrats!",
		quantity: 1,
		undoTokenHash: null,
		undoExpiresAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function makeCategory(overrides: Partial<Category> = {}): Category {
	return {
		id: "cat-1",
		wishlistId: "wl-1",
		name: "Electronics",
		sortOrder: 0,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

describe("mapPublicWishlist", () => {
	it("includes visible gifts", () => {
		const gift = makeGift({
			id: "gift-visible",
			visibilityStatus: "available",
		});
		const wishlist = makeWishlist();
		const result = mapPublicWishlist({
			...wishlist,
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts).toHaveLength(1);
		expect(result.gifts[0]?.id).toBe("gift-visible");
	});

	it("excludes hidden gifts", () => {
		const gift = makeGift({ id: "gift-hidden", visibilityStatus: "hidden" });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts).toHaveLength(0);
	});

	it("excludes soft-deleted gifts", () => {
		const gift = makeGift({ id: "gift-deleted", deletedAt: now });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts).toHaveLength(0);
	});

	it("excludes guest PII from output", () => {
		const gift = makeGift();
		const purchase = makePurchase({
			guestEmail: "test@email.com",
			guestPhone: "555",
			message: "hi",
		});
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [purchase] }],
		});
		const vm = result.gifts[0];
		expect(vm).not.toHaveProperty("guestEmail");
		expect(vm).not.toHaveProperty("guestPhone");
		expect(vm).not.toHaveProperty("message");
	});

	it("excludes internal notes", () => {
		const gift = makeGift({ internalNote: "internal secret" });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts[0]).not.toHaveProperty("internalNote");
	});

	it("serializes Decimal price to string", () => {
		const gift = makeGift({
			priceAmount: {
				toString: () => "199.90",
			} as unknown as Gift["priceAmount"],
		});
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts[0]?.priceAmount).toBe("199.90");
	});

	it("maps null price to null", () => {
		const gift = makeGift({ priceAmount: null });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts[0]?.priceAmount).toBeNull();
	});

	it("serializes eventDate to ISO string", () => {
		const eventDate = new Date("2026-12-25T00:00:00Z");
		const result = mapPublicWishlist({
			...makeWishlist({ eventDate }),
			categories: [],
			gifts: [],
		});
		expect(result.eventDate).toBe("2026-12-25T00:00:00.000Z");
	});

	it("maps null eventDate to null", () => {
		const result = mapPublicWishlist({
			...makeWishlist({ eventDate: null }),
			categories: [],
			gifts: [],
		});
		expect(result.eventDate).toBeNull();
	});

	it("derives gift status as purchased when fully purchased", () => {
		const gift = makeGift({ quantityNeeded: 2 });
		const p1 = makePurchase({ id: "p1", quantity: 1 });
		const p2 = makePurchase({ id: "p2", quantity: 1 });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [p1, p2] }],
		});
		expect(result.gifts[0]?.status).toBe("purchased");
	});

	it("derives gift status as partial when partially purchased", () => {
		const gift = makeGift({ quantityNeeded: 3 });
		const purchase = makePurchase({ quantity: 1 });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [purchase] }],
		});
		expect(result.gifts[0]?.status).toBe("partial");
	});

	it("derives gift status as available when not purchased", () => {
		const gift = makeGift({ quantityNeeded: 1 });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.gifts[0]?.status).toBe("available");
	});

	it("maps categories", () => {
		const category = makeCategory({ name: "Electronics" });
		const gift = makeGift({ categoryId: "cat-1" });
		const result = mapPublicWishlist({
			...makeWishlist(),
			categories: [{ ...category, gifts: [{ ...gift, purchases: [] }] }],
			gifts: [{ ...gift, purchases: [] }],
		});
		expect(result.categories).toHaveLength(1);
		expect(result.categories[0]?.name).toBe("Electronics");
	});
});
