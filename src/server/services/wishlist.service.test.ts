import { describe, expect, it, vi } from "vitest";
import {
	Currency,
	EventType,
	GiftVisibilityStatus,
	Locale,
	type Prisma,
	type Wishlist,
	WishlistStatus,
} from "@/generated/prisma/client";
import { PublishReadinessError } from "@/lib/wishlist/publish-readiness";
import {
	archiveWishlist,
	createWishlist,
	publishWishlist,
	restoreWishlist,
	type WishlistDatabase,
} from "@/server/services/wishlist.service";

const createWishlistRecord = (overrides: Partial<Wishlist> = {}): Wishlist => ({
	id: "wishlist_123",
	ownerId: 42,
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: EventType.wedding,
	language: Locale.es,
	currency: Currency.PEN,
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
	status: WishlistStatus.draft,
	publishedAt: null,
	archivedAt: null,
	createdAt: new Date("2026-06-25T00:00:00.000Z"),
	updatedAt: new Date("2026-06-25T00:00:00.000Z"),
	...overrides,
});

const createWishlistInput = () => ({
	ownerId: 42,
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: EventType.wedding,
});

const createMockDatabase = (
	opts: {
		publishedAt?: Date | null;
		title?: string;
		eventType?: EventType;
		slug?: string;
		language?: Locale;
		currency?: Currency;
		visibleGiftCount?: number;
	} = {},
) => {
	const lookupData = {
		publishedAt: opts.publishedAt ?? null,
		title: opts.title ?? "Lista de boda",
		eventType: opts.eventType ?? EventType.wedding,
		slug: opts.slug ?? "lista-de-boda",
		language: opts.language ?? Locale.es,
		currency: opts.currency ?? Currency.PEN,
	};
	const visibleGiftCount = opts.visibleGiftCount ?? 1;

	const create = vi.fn(async (_args: Prisma.WishlistCreateArgs) =>
		createWishlistRecord(),
	);
	const findUniqueOrThrow = vi.fn(
		async (_args: Prisma.WishlistFindUniqueOrThrowArgs) => lookupData,
	);
	const update = vi.fn(async (args: Prisma.WishlistUpdateArgs) => {
		const data = args.data as Partial<Wishlist>;

		return createWishlistRecord({
			...lookupData,
			...data,
		});
	});
	const count = vi.fn(async (_args: Prisma.GiftCountArgs) => visibleGiftCount);

	const db: WishlistDatabase = {
		wishlist: {
			create,
			findUniqueOrThrow,
			update,
		},
		gift: {
			count,
		},
	};

	return { db, create, findUniqueOrThrow, update, count };
};

describe("wishlist service", () => {
	it("creates wishlists with required ownership, defaults, and draft lifecycle", async () => {
		const { db, create } = createMockDatabase();

		const wishlist = await createWishlist(db, createWishlistInput());

		expect(create).toHaveBeenCalledWith({
			data: {
				owner: {
					connect: {
						id: 42,
					},
				},
				title: "Lista de boda",
				slug: "lista-de-boda",
				eventType: EventType.wedding,
				language: Locale.es,
				currency: Currency.PEN,
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
				status: WishlistStatus.draft,
				publishedAt: null,
				archivedAt: null,
			},
		});
		expect(wishlist.ownerId).toBe(42);
		expect(wishlist.status).toBe(WishlistStatus.draft);
		expect(wishlist.language).toBe(Locale.es);
		expect(wishlist.currency).toBe(Currency.PEN);
		expect(wishlist.showHowItWorks).toBe(true);
		expect(wishlist.publishedAt).toBeNull();
		expect(wishlist.archivedAt).toBeNull();
	});

	it("persists expanded wishlist fields during creation", async () => {
		const { db, create } = createMockDatabase();
		const eventDate = new Date("2026-12-24T00:00:00.000Z");

		await createWishlist(db, {
			ownerId: 42,
			title: "Cumple de Ana",
			slug: "cumple-de-ana",
			eventType: EventType.birthday,
			language: Locale.en,
			currency: Currency.USD,
			heroTitle: "Celebra con nosotros",
			welcomeMessage: "Gracias por ser parte de este dia.",
			thankYouMessage: "Nos vemos pronto.",
			displayName: "Ana y Luis",
			eventDate,
			eventTime: "18:30",
			eventLocation: "Miraflores, Lima",
			coverImageUrl: "https://example.com/cover.jpg",
			themeId: "cielo-suave",
			layoutId: "editorial",
			buttonStyle: "pill",
			fontPairing: "serif-soft",
			showHowItWorks: false,
		});

		expect(create).toHaveBeenCalledWith({
			data: {
				owner: {
					connect: {
						id: 42,
					},
				},
				title: "Cumple de Ana",
				slug: "cumple-de-ana",
				eventType: EventType.birthday,
				language: Locale.en,
				currency: Currency.USD,
				heroTitle: "Celebra con nosotros",
				welcomeMessage: "Gracias por ser parte de este dia.",
				thankYouMessage: "Nos vemos pronto.",
				displayName: "Ana y Luis",
				eventDate,
				eventTime: "18:30",
				eventLocation: "Miraflores, Lima",
				coverImageUrl: "https://example.com/cover.jpg",
				themeId: "cielo-suave",
				layoutId: "editorial",
				buttonStyle: "pill",
				fontPairing: "serif-soft",
				showHowItWorks: false,
				status: WishlistStatus.draft,
				publishedAt: null,
				archivedAt: null,
			},
		});
	});

	it("publishes a ready wishlist and sets publishedAt while clearing archivedAt", async () => {
		const { db, findUniqueOrThrow, count, update } = createMockDatabase({
			visibleGiftCount: 1,
		});
		const now = new Date("2026-06-25T10:00:00.000Z");

		const wishlist = await publishWishlist(db, {
			wishlistId: "wishlist_123",
			now,
		});

		expect(findUniqueOrThrow).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: "wishlist_123" } }),
		);
		expect(count).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					wishlistId: "wishlist_123",
					visibilityStatus: GiftVisibilityStatus.available,
					deletedAt: null,
				}),
			}),
		);
		expect(update).toHaveBeenCalledWith({
			where: { id: "wishlist_123" },
			data: {
				status: WishlistStatus.published,
				publishedAt: now,
				archivedAt: null,
			},
		});
		expect(wishlist.status).toBe(WishlistStatus.published);
		expect(wishlist.publishedAt).toBe(now);
		expect(wishlist.archivedAt).toBeNull();
	});

	it("rejects an unready wishlist without updating its status", async () => {
		const { db, update } = createMockDatabase({ visibleGiftCount: 0 });

		await expect(
			publishWishlist(db, { wishlistId: "wishlist_123" }),
		).rejects.toBeInstanceOf(PublishReadinessError);

		expect(update).not.toHaveBeenCalled();
	});

	it("rejects an unready wishlist and surfaces the failed checklist", async () => {
		const { db } = createMockDatabase({
			title: "",
			visibleGiftCount: 0,
		});

		const error = await publishWishlist(db, {
			wishlistId: "wishlist_123",
		}).catch((e) => e);

		expect(error).toBeInstanceOf(PublishReadinessError);
		expect(error.result.ready).toBe(false);
		expect(error.result.checks.title).toBe(false);
		expect(error.result.checks.visibleGift).toBe(false);
	});

	it("archives a wishlist and sets archivedAt without deleting the record", async () => {
		const { db, update } = createMockDatabase({
			publishedAt: new Date("2026-06-24T10:00:00.000Z"),
		});
		const now = new Date("2026-06-25T11:00:00.000Z");

		const wishlist = await archiveWishlist(db, {
			wishlistId: "wishlist_123",
			now,
		});

		expect(update).toHaveBeenCalledWith({
			where: { id: "wishlist_123" },
			data: {
				status: WishlistStatus.archived,
				archivedAt: now,
			},
		});
		expect(wishlist.status).toBe(WishlistStatus.archived);
		expect(wishlist.archivedAt).toBe(now);
	});

	it("restores an archived wishlist to draft and preserves publishedAt", async () => {
		const publishedAt = new Date("2026-06-20T09:00:00.000Z");
		const { db, findUniqueOrThrow, update } = createMockDatabase({
			publishedAt,
		});

		const wishlist = await restoreWishlist(db, {
			wishlistId: "wishlist_123",
			targetStatus: WishlistStatus.draft,
		});

		expect(findUniqueOrThrow).toHaveBeenCalledWith({
			where: { id: "wishlist_123" },
			select: { publishedAt: true },
		});
		expect(update).toHaveBeenCalledWith({
			where: { id: "wishlist_123" },
			data: {
				status: WishlistStatus.draft,
				archivedAt: null,
				publishedAt,
			},
		});
		expect(wishlist.status).toBe(WishlistStatus.draft);
		expect(wishlist.archivedAt).toBeNull();
		expect(wishlist.publishedAt).toBe(publishedAt);
	});

	it("restores an archived wishlist to published and sets publishedAt when missing", async () => {
		const { db, update } = createMockDatabase();
		const now = new Date("2026-06-25T12:00:00.000Z");

		const wishlist = await restoreWishlist(db, {
			wishlistId: "wishlist_123",
			targetStatus: WishlistStatus.published,
			now,
		});

		expect(update).toHaveBeenCalledWith({
			where: { id: "wishlist_123" },
			data: {
				status: WishlistStatus.published,
				archivedAt: null,
				publishedAt: now,
			},
		});
		expect(wishlist.status).toBe(WishlistStatus.published);
		expect(wishlist.archivedAt).toBeNull();
		expect(wishlist.publishedAt).toBe(now);
	});
});
