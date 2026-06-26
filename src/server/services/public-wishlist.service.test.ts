import { describe, expect, it, vi } from "vitest";
import type {
	Category,
	Gift,
	Prisma,
	Purchase,
	Wishlist,
} from "@/generated/prisma/client";
import {
	Currency,
	EventType,
	GiftPriority,
	GiftVisibilityStatus,
	Locale,
	WishlistStatus,
} from "@/generated/prisma/client";
import {
	getPublicWishlistBySlug,
	type PublicWishlistDatabase,
} from "@/server/services/public-wishlist.service";

const BASE_DATE = new Date("2026-06-26T00:00:00.000Z");

type MockGift = Gift & { purchases: Purchase[] };
type MockCategory = Category & { gifts: MockGift[] };
type MockRow = Wishlist & {
	categories: MockCategory[];
	gifts: MockGift[];
	owner: { clerkId: string };
};

const makeGift = (overrides: Partial<MockGift> = {}): MockGift => ({
	id: "gift_1",
	wishlistId: "wl_1",
	categoryId: null,
	name: "Regalo",
	productUrl: null,
	imageUrl: null,
	storeName: null,
	priceAmount: null,
	priceCurrency: null,
	quantityNeeded: 1,
	priority: GiftPriority.medium,
	visibilityStatus: GiftVisibilityStatus.available,
	publicNote: null,
	internalNote: null,
	sortOrder: 0,
	deletedAt: null,
	createdAt: BASE_DATE,
	updatedAt: BASE_DATE,
	purchases: [],
	...overrides,
});

const makeWishlist = (overrides: Partial<MockRow> = {}): MockRow => ({
	id: "wl_1",
	ownerId: 1,
	title: "Mi lista",
	slug: "mi-lista",
	eventType: EventType.wedding,
	language: Locale.es,
	currency: Currency.PEN,
	heroTitle: null,
	welcomeMessage: null,
	thankYouMessage: null,
	displayName: "Ana y Luis",
	eventDate: null,
	eventTime: null,
	eventLocation: null,
	coverImageUrl: null,
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	fontPairing: null,
	showHowItWorks: true,
	status: WishlistStatus.published,
	publishedAt: BASE_DATE,
	archivedAt: null,
	createdAt: BASE_DATE,
	updatedAt: BASE_DATE,
	categories: [],
	gifts: [],
	owner: { clerkId: "clerk_owner" },
	...overrides,
});

const makeDb = (row: MockRow | null): PublicWishlistDatabase => ({
	wishlist: {
		findUnique: vi.fn(
			async (_args: Prisma.WishlistFindUniqueArgs) =>
				row as Awaited<
					ReturnType<PublicWishlistDatabase["wishlist"]["findUnique"]>
				>,
		),
	},
});

describe("getPublicWishlistBySlug", () => {
	it("returns published result for a published wishlist", async () => {
		const db = makeDb(makeWishlist({ status: WishlistStatus.published }));
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("published");
	});

	it("returns preview for draft + owner viewer", async () => {
		const db = makeDb(
			makeWishlist({ status: WishlistStatus.draft, publishedAt: null }),
		);
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: "clerk_owner",
		});
		expect(result.kind).toBe("preview");
	});

	it("returns notFound for draft + non-owner viewer", async () => {
		const db = makeDb(
			makeWishlist({ status: WishlistStatus.draft, publishedAt: null }),
		);
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: "clerk_other",
		});
		expect(result.kind).toBe("notFound");
	});

	it("returns notFound for draft + signed-out viewer", async () => {
		const db = makeDb(
			makeWishlist({ status: WishlistStatus.draft, publishedAt: null }),
		);
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("notFound");
	});

	it("returns archived result without gifts for an archived wishlist", async () => {
		const gift = makeGift();
		const db = makeDb(
			makeWishlist({
				status: WishlistStatus.archived,
				archivedAt: BASE_DATE,
				publishedAt: BASE_DATE,
				gifts: [gift],
			}),
		);
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("archived");
		if (result.kind === "archived") {
			expect(result.archived.title).toBe("Mi lista");
			expect(result.archived.displayName).toBe("Ana y Luis");
			expect(Object.hasOwn(result.archived, "gifts")).toBe(false);
		}
	});

	it("returns notFound for an unknown slug", async () => {
		const db = makeDb(null);
		const result = await getPublicWishlistBySlug(db, {
			slug: "does-not-exist",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("notFound");
	});

	it("excludes hidden gifts from the published result", async () => {
		const hiddenGift = makeGift({
			id: "gift_hidden",
			visibilityStatus: GiftVisibilityStatus.hidden,
		});
		const visibleGift = makeGift({ id: "gift_visible" });
		const db = makeDb(makeWishlist({ gifts: [hiddenGift, visibleGift] }));
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("published");
		if (result.kind === "published") {
			expect(result.wishlist.gifts).toHaveLength(1);
			expect(result.wishlist.gifts[0]?.id).toBe("gift_visible");
		}
	});

	it("excludes soft-deleted gifts from the published result", async () => {
		const deletedGift = makeGift({ id: "gift_deleted", deletedAt: BASE_DATE });
		const activeGift = makeGift({ id: "gift_active" });
		const db = makeDb(makeWishlist({ gifts: [deletedGift, activeGift] }));
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("published");
		if (result.kind === "published") {
			expect(result.wishlist.gifts).toHaveLength(1);
			expect(result.wishlist.gifts[0]?.id).toBe("gift_active");
		}
	});

	it("draft preview carries the same view model as published", async () => {
		const gift = makeGift({ id: "gift_preview" });
		const db = makeDb(
			makeWishlist({
				status: WishlistStatus.draft,
				publishedAt: null,
				gifts: [gift],
			}),
		);
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: "clerk_owner",
		});
		expect(result.kind).toBe("preview");
		if (result.kind === "preview") {
			expect(result.wishlist.gifts).toHaveLength(1);
			expect(result.wishlist.gifts[0]?.id).toBe("gift_preview");
		}
	});

	it("draft and unknown slug are both notFound for a non-owner", async () => {
		const dbDraft = makeDb(
			makeWishlist({ status: WishlistStatus.draft, publishedAt: null }),
		);
		const dbMissing = makeDb(null);
		const [draftResult, missingResult] = await Promise.all([
			getPublicWishlistBySlug(dbDraft, {
				slug: "mi-lista",
				viewerClerkId: "clerk_other",
			}),
			getPublicWishlistBySlug(dbMissing, {
				slug: "does-not-exist",
				viewerClerkId: "clerk_other",
			}),
		]);
		expect(draftResult.kind).toBe("notFound");
		expect(missingResult.kind).toBe("notFound");
	});
});
