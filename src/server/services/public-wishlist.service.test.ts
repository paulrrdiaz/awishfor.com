import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	Category,
	Gift,
	Prisma,
	Purchase,
	Wishlist,
	WishlistImage,
} from "@/generated/prisma/client";
import {
	Currency,
	EventType,
	GiftPriority,
	GiftVisibilityStatus,
	Locale,
	WishlistStatus,
} from "@/generated/prisma/client";

const sharedCache = vi.hoisted(() => new Map<string, Promise<unknown>>());
const unstableCacheMock = vi.hoisted(() =>
	vi.fn(
		<T extends (...args: never[]) => Promise<unknown>>(
			callback: T,
			keyParts: string[] = [],
		) =>
			((...args: Parameters<T>) => {
				const key = JSON.stringify([keyParts, args]);
				const cached = sharedCache.get(key);
				if (cached) return cached;
				const pending = callback(...args);
				sharedCache.set(key, pending);
				return pending;
			}) as T,
	),
);

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
	unstable_cache: unstableCacheMock,
}));

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
	images: WishlistImage[];
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
	size: null,
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
	welcomeMessage: "Welcome!",
	welcomeMessageAttribution: null,
	thankYouMessage: null,
	giftListMessage: null,
	eventDate: null,
	eventTime: null,
	rsvpDeadline: null,
	eventLocation: null,
	dressCode: null,
	deliveryRecipientName: null,
	deliveryDocumentId: null,
	deliveryAddress: null,
	deliveryPhone: null,
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	headingFont: null,
	bodyFont: null,
	countdownVariant: null,
	welcomeMessageVariant: null,
	thankYouMessageVariant: null,
	motifId: null,
	motifTreatment: null,
	motifPalette: null,
	showHowItWorks: true,
	status: WishlistStatus.published,
	publishedAt: BASE_DATE,
	archivedAt: null,
	createdAt: BASE_DATE,
	updatedAt: BASE_DATE,
	categories: [],
	gifts: [],
	images: [],
	owner: { clerkId: "clerk_owner" },
	...overrides,
	subtitle: overrides.subtitle === undefined ? null : overrides.subtitle,
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
	beforeEach(() => {
		sharedCache.clear();
		unstableCacheMock.mockClear();
	});

	it("uses a slim public projection without nested category gifts or purchase contacts", async () => {
		const db = makeDb(makeWishlist());
		await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		const args = vi.mocked(db.wishlist.findUnique).mock.calls[1]?.[0];
		expect(args?.select?.categories).toEqual({
			select: { id: true, name: true, sortOrder: true },
		});
		expect(args?.select?.subtitle).toBe(true);
		expect(args?.select?.gifts).toMatchObject({
			select: { purchases: { select: { guestName: true, quantity: true } } },
		});
		expect(JSON.stringify(args)).not.toContain("guestEmail");
		expect(JSON.stringify(args)).not.toContain("internalNote");
	});
	it("returns published result for a published wishlist", async () => {
		const db = makeDb(
			makeWishlist({
				status: WishlistStatus.published,
				subtitle: "Celebramos juntos",
			}),
		);
		const result = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		expect(result.kind).toBe("published");
		if (result.kind === "published") {
			expect(result.wishlist.subtitle).toBe("Celebramos juntos");
		}
	});

	it("reuses a tagged published presentation across anonymous requests", async () => {
		const db = makeDb(makeWishlist({ status: WishlistStatus.published }));

		const first = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});
		const second = await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: null,
		});

		expect(first).toEqual(second);
		expect(db.wishlist.findUnique).toHaveBeenCalledTimes(3);
		expect(unstableCacheMock).toHaveBeenLastCalledWith(
			expect.any(Function),
			["public-wishlist-presentation", "wl_1", "mi-lista"],
			{
				revalidate: false,
				tags: ["public-wishlist:wl_1", "public-wishlist-slug:mi-lista"],
			},
		);
	});

	it("keeps draft owner previews outside the shared published cache", async () => {
		const db = makeDb(
			makeWishlist({ status: WishlistStatus.draft, publishedAt: null }),
		);

		await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: "clerk_owner",
		});
		await getPublicWishlistBySlug(db, {
			slug: "mi-lista",
			viewerClerkId: "clerk_owner",
		});

		expect(db.wishlist.findUnique).toHaveBeenCalledTimes(4);
		expect(unstableCacheMock).not.toHaveBeenCalled();
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

	it("returns notFound for reserved audit slugs in normal runtime", async () => {
		delete process.env.PUBLIC_WISHLIST_AUDIT_MODE;
		const db = makeDb(makeWishlist());

		const result = await getPublicWishlistBySlug(db, {
			slug: "__audit-public-wishlist-light",
			viewerClerkId: null,
		});

		expect(result.kind).toBe("notFound");
		expect(db.wishlist.findUnique).not.toHaveBeenCalled();
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
