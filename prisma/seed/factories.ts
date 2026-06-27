import type { Prisma } from "../../src/generated/prisma/client";

// ── Image helpers ─────────────────────────────────────────────────────────────

/** Stable placeholder image from picsum.photos, square 400×400. */
export const giftImg = (seed: string) =>
	`https://picsum.photos/seed/${seed}/400/400`;

/** Stable cover image from picsum.photos, wide 1200×500. */
export const coverImg = (seed: string) =>
	`https://picsum.photos/seed/${seed}/1200/500`;

// ── Gift factory ──────────────────────────────────────────────────────────────

export type GiftData = Omit<Prisma.GiftUncheckedCreateInput, "wishlistId">;

/** Returns a gift data object with sensible defaults merged with overrides. */
export function makeGift(overrides: Partial<GiftData>): GiftData {
	return {
		name: "Gift",
		quantityNeeded: 1,
		priority: "medium",
		visibilityStatus: "available",
		sortOrder: 0,
		...overrides,
	};
}

// ── Wishlist factory ──────────────────────────────────────────────────────────

export type WishlistData = Omit<Prisma.WishlistUncheckedCreateInput, "ownerId">;

/** Returns a wishlist data object with sensible defaults merged with overrides. */
export function makeWishlist(overrides: Partial<WishlistData>): WishlistData {
	return {
		title: "My Wishlist",
		slug: "my-wishlist",
		eventType: "general",
		language: "es",
		currency: "PEN",
		showHowItWorks: true,
		status: "published",
		...overrides,
	};
}

// ── Category factory ──────────────────────────────────────────────────────────

export type CategoryData = Omit<
	Prisma.CategoryUncheckedCreateInput,
	"wishlistId"
>;

export function makeCategory(overrides: Partial<CategoryData>): CategoryData {
	return {
		name: "Category",
		sortOrder: 0,
		...overrides,
	};
}

// ── Purchase factory ──────────────────────────────────────────────────────────

export type PurchaseData = Omit<Prisma.PurchaseUncheckedCreateInput, "giftId">;

export function makePurchase(overrides: Partial<PurchaseData>): PurchaseData {
	return {
		guestName: "Invitado",
		quantity: 1,
		...overrides,
	};
}
