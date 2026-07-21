import { TRPCError } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import {
	Currency,
	EventType,
	GiftPriority,
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
	publishWishlistFromWizard,
	restoreWishlist,
	saveWishlistDraft,
	type WishlistDatabase,
} from "@/server/services/wishlist.service";
import type { SaveDraftWishlistInput } from "@/server/validators/wishlist-save-draft.schema";

const BASE_DATE = new Date("2026-06-25T00:00:00.000Z");

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
	status: WishlistStatus.draft,
	publishedAt: null,
	archivedAt: null,
	createdAt: BASE_DATE,
	updatedAt: BASE_DATE,
	...overrides,
});

const createWishlistInput = () => ({
	ownerId: 42,
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: EventType.wedding,
});

const makeDraftInput = (
	overrides: Partial<SaveDraftWishlistInput & { ownerId: number }> = {},
): SaveDraftWishlistInput & { ownerId: number } => ({
	ownerId: 42,
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: EventType.wedding,
	language: Locale.es,
	currency: Currency.PEN,
	heroTitle: "Nuestra boda",
	welcomeMessage: "Gracias por acompañarnos",
	thankYouMessage: "Con cariño",
	displayName: "Ana y Luis",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	coverImageUrl: "https://example.com/cover.jpg",
	coverImageUrls: ["https://example.com/cover.jpg"],
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	headingFont: null,
	bodyFont: null,
	showHowItWorks: true,
	categories: ["Hogar", "Viaje"],
	gifts: [
		{
			name: "Juego de sábanas",
			productUrl: "https://example.com/sabanas",
			imageUrl: "https://example.com/sabanas.jpg",
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 2,
			priority: GiftPriority.high,
			publicNote: "Algodón",
			internalNote: "Prioridad alta",
			hidden: false,
			sortOrder: 0,
		},
		{
			name: "Maletas",
			productUrl: null,
			imageUrl: null,
			priceAmount: null,
			category: "Viaje",
			quantityNeeded: 1,
			priority: GiftPriority.medium,
			publicNote: null,
			internalNote: null,
			hidden: true,
			sortOrder: 1,
		},
	],
	savedWishlistId: null,
	lastSavedAt: null,
	force: false,
	...overrides,
});

type TestCategory = {
	id: string;
	wishlistId: string;
	name: string;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
};

type TestGift = {
	id: string;
	wishlistId: string;
	categoryId: string | null;
	name: string;
	productUrl: string | null;
	imageUrl: string | null;
	storeName: string | null;
	priceAmount: number | null;
	priceCurrency: Currency | null;
	quantityNeeded: number;
	priority: GiftPriority;
	visibilityStatus: GiftVisibilityStatus;
	publicNote: string | null;
	internalNote: string | null;
	sortOrder: number;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

type MockDbState = {
	wishlists: Wishlist[];
	categories: TestCategory[];
	gifts: TestGift[];
	clockMs: number;
};

const cloneState = (state: MockDbState): MockDbState => ({
	wishlists: state.wishlists.map((wishlist) => ({ ...wishlist })),
	categories: state.categories.map((category) => ({ ...category })),
	gifts: state.gifts.map((gift) => ({ ...gift })),
	clockMs: state.clockMs,
});

const createMockDatabase = (
	opts: {
		wishlists?: Wishlist[];
		categories?: TestCategory[];
		gifts?: TestGift[];
		visibleGiftCount?: number;
	} = {},
) => {
	const state: MockDbState = {
		wishlists: opts.wishlists
			? opts.wishlists.map((wishlist) => ({ ...wishlist }))
			: [createWishlistRecord()],
		categories: opts.categories
			? opts.categories.map((category) => ({ ...category }))
			: [],
		gifts: opts.gifts ? opts.gifts.map((gift) => ({ ...gift })) : [],
		clockMs: BASE_DATE.getTime(),
	};
	const visibleGiftCount = opts.visibleGiftCount;

	const nextDate = () => {
		state.clockMs += 1_000;
		return new Date(state.clockMs);
	};

	const findWishlistById = (wishlistId: string) =>
		state.wishlists.find((wishlist) => wishlist.id === wishlistId) ?? null;

	const findMatchingWishlist = (
		where: Prisma.WishlistWhereInput | undefined,
	): Wishlist | null => {
		if (!where) {
			return state.wishlists[0] ?? null;
		}

		return (
			state.wishlists.find((wishlist) => {
				if (where.id !== undefined && wishlist.id !== where.id) return false;
				if (where.ownerId !== undefined && wishlist.ownerId !== where.ownerId) {
					return false;
				}
				if (where.status !== undefined && wishlist.status !== where.status) {
					return false;
				}
				if (where.updatedAt !== undefined) {
					const expected =
						where.updatedAt instanceof Date
							? where.updatedAt.getTime()
							: (where.updatedAt as Date).getTime();
					if (wishlist.updatedAt.getTime() !== expected) return false;
				}
				return true;
			}) ?? null
		);
	};

	const buildDraftWishlistRecord = (wishlist: Wishlist) => {
		const categories = state.categories
			.filter((category) => category.wishlistId === wishlist.id)
			.sort(
				(a, b) =>
					a.sortOrder - b.sortOrder ||
					a.createdAt.getTime() - b.createdAt.getTime(),
			);
		const gifts = state.gifts
			.filter((gift) => gift.wishlistId === wishlist.id)
			.sort(
				(a, b) =>
					a.sortOrder - b.sortOrder ||
					a.createdAt.getTime() - b.createdAt.getTime(),
			)
			.map((gift) => ({
				...gift,
				priceAmount: gift.priceAmount,
				category: gift.categoryId
					? (() => {
							const category = state.categories.find(
								(c) => c.id === gift.categoryId,
							);
							return category ? { name: category.name } : null;
						})()
					: null,
			}));

		return {
			...wishlist,
			categories,
			gifts,
		};
	};

	const create = vi.fn(async (args: Prisma.WishlistCreateArgs) => {
		const now = nextDate();
		const ownerId = args.data.owner?.connect?.id;
		if (typeof ownerId !== "number") {
			throw new Error("Expected wishlist owner connect id");
		}
		const wishlist = createWishlistRecord({
			id: `wishlist_${state.wishlists.length + 1}`,
			ownerId,
			title: args.data.title as string,
			slug: args.data.slug as string,
			eventType: args.data.eventType as EventType,
			language: (args.data.language as Locale | undefined) ?? Locale.es,
			currency: (args.data.currency as Currency | undefined) ?? Currency.PEN,
			heroTitle: (args.data.heroTitle as string | null | undefined) ?? null,
			welcomeMessage:
				(args.data.welcomeMessage as string | null | undefined) ?? null,
			thankYouMessage:
				(args.data.thankYouMessage as string | null | undefined) ?? null,
			displayName: (args.data.displayName as string | null | undefined) ?? null,
			eventDate: (args.data.eventDate as Date | null | undefined) ?? null,
			eventTime: (args.data.eventTime as string | null | undefined) ?? null,
			eventLocation:
				(args.data.eventLocation as string | null | undefined) ?? null,
			dressCode: (args.data.dressCode as string | null | undefined) ?? null,
			coverImageUrl:
				(args.data.coverImageUrl as string | null | undefined) ?? null,
			themeId: (args.data.themeId as string | null | undefined) ?? null,
			layoutId: (args.data.layoutId as string | null | undefined) ?? null,
			buttonStyle: (args.data.buttonStyle as string | null | undefined) ?? null,
			fontPairing: (args.data.fontPairing as string | null | undefined) ?? null,
			showHowItWorks: (args.data.showHowItWorks as boolean | undefined) ?? true,
			status:
				(args.data.status as WishlistStatus | undefined) ??
				WishlistStatus.draft,
			publishedAt: (args.data.publishedAt as Date | null | undefined) ?? null,
			archivedAt: (args.data.archivedAt as Date | null | undefined) ?? null,
			createdAt: now,
			updatedAt: now,
		});

		state.wishlists.push(wishlist);
		return wishlist;
	});

	const findUniqueOrThrow = vi.fn(
		async (args: Prisma.WishlistFindUniqueOrThrowArgs) => {
			const wishlist = findWishlistById(args.where.id as string);
			if (!wishlist) {
				throw new Error("Wishlist not found");
			}

			return {
				publishedAt: wishlist.publishedAt,
				title: wishlist.title,
				eventType: wishlist.eventType,
				slug: wishlist.slug,
				language: wishlist.language,
				currency: wishlist.currency,
			};
		},
	);

	const findFirst = vi.fn(async (args: Prisma.WishlistFindFirstArgs) => {
		const wishlist = findMatchingWishlist(args.where);
		if (!wishlist) {
			return null;
		}

		if (args.include) {
			return buildDraftWishlistRecord(wishlist);
		}

		return wishlist;
	});

	const update = vi.fn(async (args: Prisma.WishlistUpdateArgs) => {
		const wishlist = findWishlistById(args.where.id as string);
		if (!wishlist) {
			throw new Error("Wishlist not found");
		}

		const now = nextDate();
		Object.assign(wishlist, args.data, { updatedAt: now });
		return wishlist;
	});

	const updateMany = vi.fn(async (args: Prisma.WishlistUpdateManyArgs) => {
		const wishlist = findMatchingWishlist(args.where);
		if (!wishlist) {
			return { count: 0 };
		}

		const now = nextDate();
		Object.assign(wishlist, args.data, { updatedAt: now });
		return { count: 1 };
	});

	const categoryCreate = vi.fn(async (args: Prisma.CategoryCreateArgs) => {
		const now = nextDate();
		const wishlistId = args.data.wishlist?.connect?.id;
		if (typeof wishlistId !== "string") {
			throw new Error("Expected category wishlist connect id");
		}
		const category: TestCategory = {
			id: `category_${state.categories.length + 1}`,
			wishlistId,
			name: args.data.name as string,
			sortOrder: args.data.sortOrder as number,
			createdAt: now,
			updatedAt: now,
		};

		state.categories.push(category);
		return category as unknown as Prisma.CategoryCreateArgs["data"] extends never
			? never
			: typeof category;
	});

	const categoryDeleteMany = vi.fn(
		async (args: Prisma.CategoryDeleteManyArgs) => {
			const before = state.categories.length;
			state.categories = state.categories.filter(
				(category) => category.wishlistId !== args.where?.wishlistId,
			);
			return { count: before - state.categories.length };
		},
	);

	const createMany = vi.fn(async (args: Prisma.GiftCreateManyArgs) => {
		const rows = Array.isArray(args.data) ? args.data : [args.data];
		for (const data of rows) {
			const now = nextDate();
			state.gifts.push({
				id: `gift_${state.gifts.length + 1}`,
				wishlistId: data.wishlistId,
				categoryId: data.categoryId ?? null,
				name: data.name,
				productUrl: data.productUrl ?? null,
				imageUrl: data.imageUrl ?? null,
				storeName: data.storeName ?? null,
				priceAmount:
					typeof data.priceAmount === "number" ? data.priceAmount : null,
				priceCurrency: data.priceCurrency ?? null,
				quantityNeeded: data.quantityNeeded ?? 1,
				priority: data.priority as GiftPriority,
				visibilityStatus: data.visibilityStatus as GiftVisibilityStatus,
				publicNote: data.publicNote ?? null,
				internalNote: data.internalNote ?? null,
				sortOrder: data.sortOrder ?? 0,
				deletedAt: data.deletedAt instanceof Date ? data.deletedAt : null,
				createdAt: now,
				updatedAt: now,
			});
		}

		return { count: rows.length };
	});

	const giftDeleteMany = vi.fn(async (args: Prisma.GiftDeleteManyArgs) => {
		const before = state.gifts.length;
		state.gifts = state.gifts.filter(
			(gift) => gift.wishlistId !== args.where?.wishlistId,
		);
		return { count: before - state.gifts.length };
	});

	const count = vi.fn(async (args: Prisma.GiftCountArgs) => {
		if (visibleGiftCount !== undefined) {
			return visibleGiftCount;
		}

		return state.gifts.filter((gift) => {
			if (gift.wishlistId !== args.where?.wishlistId) return false;
			if (
				args.where?.visibilityStatus &&
				gift.visibilityStatus !== args.where.visibilityStatus
			) {
				return false;
			}
			if (
				"deletedAt" in (args.where ?? {}) &&
				args.where?.deletedAt === null &&
				gift.deletedAt !== null
			) {
				return false;
			}
			return true;
		}).length;
	});

	const db: WishlistDatabase = {
		wishlist: {
			create,
			findFirst,
			findUniqueOrThrow,
			update,
			updateMany,
		},
		category: {
			create: categoryCreate as never,
			deleteMany: categoryDeleteMany,
		},
		gift: {
			count,
			createMany,
			deleteMany: giftDeleteMany,
		},
		$transaction: async (callback) => {
			const snapshot = cloneState(state);
			try {
				return await callback(db);
			} catch (error) {
				state.wishlists = snapshot.wishlists;
				state.categories = snapshot.categories;
				state.gifts = snapshot.gifts;
				state.clockMs = snapshot.clockMs;
				throw error;
			}
		},
	};

	return {
		db,
		state,
		create,
		findUniqueOrThrow,
		findFirst,
		update,
		updateMany,
		categoryCreate,
		categoryDeleteMany,
		createMany,
		giftDeleteMany,
		count,
	};
};

describe("wishlist service", () => {
	it("creates wishlists with required ownership, defaults, and draft lifecycle", async () => {
		const { db, create } = createMockDatabase();

		const wishlist = await createWishlist(db, createWishlistInput());

		expect(create).toHaveBeenCalledWith({
			data: expect.objectContaining({
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
				status: WishlistStatus.draft,
				publishedAt: null,
				archivedAt: null,
			}),
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
			coverImageUrls: ["https://example.com/cover.jpg"],
			themeId: "cielo-suave",
			layoutId: "editorial",
			buttonStyle: "pill",
			fontPairing: "serif-soft",
			showHowItWorks: false,
		});

		expect(create).toHaveBeenCalledWith({
			data: expect.objectContaining({
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
				coverImageUrls: ["https://example.com/cover.jpg"],
				themeId: "cielo-suave",
				layoutId: "editorial",
				buttonStyle: "pill",
				fontPairing: "serif-soft",
				showHowItWorks: false,
			}),
		});
	});

	it("creates a first saved draft with ordered categories and gifts", async () => {
		const { db, state } = createMockDatabase({ wishlists: [] });

		const result = await saveWishlistDraft(db, makeDraftInput());

		expect(result.status).toBe("saved");
		if (result.status === "saved") {
			expect(result.wishlistId).toBe("wishlist_1");
			expect(result.lastSavedAt).toBeGreaterThan(0);
		}

		expect(state.wishlists).toHaveLength(1);
		const savedWishlist = state.wishlists[0];
		expect(savedWishlist).toBeDefined();
		if (!savedWishlist) {
			throw new Error("Expected a saved wishlist");
		}
		expect(savedWishlist.ownerId).toBe(42);
		expect(savedWishlist.status).toBe(WishlistStatus.draft);
		expect(savedWishlist.slug).toBe("lista-de-boda");
		expect(savedWishlist.eventDate?.toISOString()).toBe(
			"2026-12-24T00:00:00.000Z",
		);

		expect(state.categories.map((category) => category.name)).toEqual([
			"Hogar",
			"Viaje",
		]);
		expect(state.categories.map((category) => category.sortOrder)).toEqual([
			0, 1,
		]);

		expect(
			state.gifts.map((gift) => ({
				name: gift.name,
				categoryId: gift.categoryId,
				sortOrder: gift.sortOrder,
				visibilityStatus: gift.visibilityStatus,
				priority: gift.priority,
				priceCurrency: gift.priceCurrency,
			})),
		).toEqual([
			{
				name: "Juego de sábanas",
				categoryId: state.categories[0]?.id ?? null,
				sortOrder: 0,
				visibilityStatus: GiftVisibilityStatus.available,
				priority: GiftPriority.high,
				priceCurrency: Currency.PEN,
			},
			{
				name: "Maletas",
				categoryId: state.categories[1]?.id ?? null,
				sortOrder: 1,
				visibilityStatus: GiftVisibilityStatus.hidden,
				priority: GiftPriority.medium,
				priceCurrency: null,
			},
		]);
	});

	it("updates the same draft in place and replaces previous collections", async () => {
		const existingWishlist = createWishlistRecord({
			id: "wishlist_existing",
			updatedAt: new Date("2026-06-25T08:00:00.000Z"),
		});
		const existingCategories: TestCategory[] = [
			{
				id: "category_old_1",
				wishlistId: existingWishlist.id,
				name: "Viejo",
				sortOrder: 0,
				createdAt: BASE_DATE,
				updatedAt: BASE_DATE,
			},
		];
		const existingGifts: TestGift[] = [
			{
				id: "gift_old_1",
				wishlistId: existingWishlist.id,
				categoryId: "category_old_1",
				name: "Viejo regalo",
				productUrl: null,
				imageUrl: null,
				storeName: null,
				priceAmount: 50,
				priceCurrency: Currency.PEN,
				quantityNeeded: 1,
				priority: GiftPriority.low,
				visibilityStatus: GiftVisibilityStatus.available,
				publicNote: null,
				internalNote: null,
				sortOrder: 0,
				deletedAt: null,
				createdAt: BASE_DATE,
				updatedAt: BASE_DATE,
			},
		];
		const { db, state } = createMockDatabase({
			wishlists: [existingWishlist],
			categories: existingCategories,
			gifts: existingGifts,
		});

		const result = await saveWishlistDraft(
			db,
			makeDraftInput({
				savedWishlistId: existingWishlist.id,
				lastSavedAt: existingWishlist.updatedAt.getTime(),
				categories: ["Dormitorio"],
				gifts: [
					{
						name: "Edredón",
						productUrl: null,
						imageUrl: null,
						priceAmount: 180,
						category: "Dormitorio",
						quantityNeeded: 1,
						priority: GiftPriority.high,
						publicNote: null,
						internalNote: null,
						hidden: false,
						sortOrder: 0,
					},
				],
			}),
		);

		expect(result.status).toBe("saved");
		expect(state.wishlists).toHaveLength(1);
		expect(state.wishlists[0]?.id).toBe(existingWishlist.id);
		expect(state.categories).toHaveLength(1);
		expect(state.categories[0]?.name).toBe("Dormitorio");
		expect(state.gifts).toHaveLength(1);
		expect(state.gifts[0]?.name).toBe("Edredón");
		expect(state.gifts[0]?.categoryId).toBe(state.categories[0]?.id);
		expect(state.gifts[0]?.sortOrder).toBe(0);
		expect(state.gifts[0]?.priceCurrency).toBe(Currency.PEN);
	});

	it("returns not found when the saved draft id is missing or belongs to another owner", async () => {
		const existingWishlist = createWishlistRecord({
			id: "wishlist_other_owner",
			ownerId: 7,
			updatedAt: new Date("2026-06-25T08:00:00.000Z"),
		});
		const { db } = createMockDatabase({
			wishlists: [existingWishlist],
		});

		await expect(
			saveWishlistDraft(
				db,
				makeDraftInput({
					savedWishlistId: existingWishlist.id,
					lastSavedAt: existingWishlist.updatedAt.getTime(),
				}),
			),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("returns not found when attempting to save over a non-draft wishlist", async () => {
		const publishedWishlist = createWishlistRecord({
			id: "wishlist_published",
			status: WishlistStatus.published,
			publishedAt: new Date("2026-06-24T10:00:00.000Z"),
		});
		const { db } = createMockDatabase({
			wishlists: [publishedWishlist],
		});

		await expect(
			saveWishlistDraft(
				db,
				makeDraftInput({
					savedWishlistId: publishedWishlist.id,
					lastSavedAt: publishedWishlist.updatedAt.getTime(),
				}),
			),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("returns a conflict with the current server draft when the local revision is stale", async () => {
		const existingWishlist = createWishlistRecord({
			id: "wishlist_existing",
			title: "Versión del dashboard",
			updatedAt: new Date("2026-06-25T10:00:00.000Z"),
		});
		const { db } = createMockDatabase({
			wishlists: [existingWishlist],
			categories: [
				{
					id: "category_server_1",
					wishlistId: existingWishlist.id,
					name: "Dashboard",
					sortOrder: 0,
					createdAt: BASE_DATE,
					updatedAt: BASE_DATE,
				},
			],
			gifts: [
				{
					id: "gift_server_1",
					wishlistId: existingWishlist.id,
					categoryId: "category_server_1",
					name: "Set de copas",
					productUrl: null,
					imageUrl: null,
					storeName: null,
					priceAmount: 90,
					priceCurrency: Currency.PEN,
					quantityNeeded: 1,
					priority: GiftPriority.medium,
					visibilityStatus: GiftVisibilityStatus.available,
					publicNote: "Guardado desde dashboard",
					internalNote: null,
					sortOrder: 0,
					deletedAt: null,
					createdAt: BASE_DATE,
					updatedAt: BASE_DATE,
				},
			],
		});

		const result = await saveWishlistDraft(
			db,
			makeDraftInput({
				savedWishlistId: existingWishlist.id,
				lastSavedAt: new Date("2026-06-25T09:00:00.000Z").getTime(),
				title: "Versión local",
			}),
		);

		expect(result).toEqual({
			status: "conflict",
			serverDraft: expect.objectContaining({
				title: "Versión del dashboard",
				savedWishlistId: existingWishlist.id,
				lastSavedAt: existingWishlist.updatedAt.getTime(),
				categories: ["Dashboard"],
				gifts: [
					expect.objectContaining({
						name: "Set de copas",
						category: "Dashboard",
						hidden: false,
						sortOrder: 0,
					}),
				],
			}),
		});
	});

	it("allows an explicit overwrite after a conflict", async () => {
		const existingWishlist = createWishlistRecord({
			id: "wishlist_existing",
			updatedAt: new Date("2026-06-25T10:00:00.000Z"),
		});
		const { db, state } = createMockDatabase({
			wishlists: [existingWishlist],
		});

		const result = await saveWishlistDraft(
			db,
			makeDraftInput({
				savedWishlistId: existingWishlist.id,
				lastSavedAt: new Date("2026-06-25T09:00:00.000Z").getTime(),
				force: true,
				title: "Versión local forzada",
			}),
		);

		expect(result.status).toBe("saved");
		expect(state.wishlists[0]?.title).toBe("Versión local forzada");
		expect(state.categories.map((category) => category.name)).toEqual([
			"Hogar",
			"Viaje",
		]);
		expect(state.gifts.map((gift) => gift.name)).toEqual([
			"Juego de sábanas",
			"Maletas",
		]);
	});

	it("publishes a ready wishlist and sets publishedAt while clearing archivedAt", async () => {
		const { db, findFirst, count, update } = createMockDatabase({
			visibleGiftCount: 1,
		});
		const now = new Date("2026-06-25T10:00:00.000Z");

		const wishlist = await publishWishlist(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
			now,
		});

		expect(findFirst).toHaveBeenCalledWith({
			where: {
				id: "wishlist_123",
				ownerId: 42,
			},
		});
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
			publishWishlist(db, { ownerId: 42, wishlistId: "wishlist_123" }),
		).rejects.toBeInstanceOf(PublishReadinessError);

		expect(update).not.toHaveBeenCalled();
	});

	it("rejects an unready wishlist and surfaces the failed checklist", async () => {
		const { db } = createMockDatabase({
			wishlists: [
				createWishlistRecord({
					title: "",
				}),
			],
			visibleGiftCount: 0,
		});

		const error = await publishWishlist(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
		}).catch((e) => e);

		expect(error).toBeInstanceOf(PublishReadinessError);
		expect(error.result.ready).toBe(false);
		expect(error.result.checks.title).toBe(false);
		expect(error.result.checks.visibleGift).toBe(false);
	});

	it("returns not found when an authenticated owner tries to publish another owner's wishlist", async () => {
		const { db, update } = createMockDatabase();

		await expect(
			publishWishlist(db, {
				ownerId: 7,
				wishlistId: "wishlist_123",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});

		expect(update).not.toHaveBeenCalled();
	});

	it("rejects non-draft wishlists before changing lifecycle state", async () => {
		const { db, update } = createMockDatabase({
			wishlists: [
				createWishlistRecord({
					status: WishlistStatus.published,
					publishedAt: new Date("2026-06-24T10:00:00.000Z"),
				}),
			],
			visibleGiftCount: 1,
		});

		await expect(
			publishWishlist(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
			}),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});

		expect(update).not.toHaveBeenCalled();
	});

	it("creates, publishes, and returns share metadata for an unsaved wizard draft", async () => {
		const { db, state } = createMockDatabase({ wishlists: [] });

		const result = await publishWishlistFromWizard(db, makeDraftInput());

		expect(result).toEqual({
			status: "published",
			wishlistId: "wishlist_1",
			slug: "lista-de-boda",
			publicUrlPath: "/w/lista-de-boda",
			dashboardUrlPath: "/dashboard",
		});
		expect(state.wishlists[0]?.status).toBe(WishlistStatus.published);
		expect(state.wishlists[0]?.publishedAt).not.toBeNull();
	});

	it("updates, publishes, and returns share metadata for an existing saved draft", async () => {
		const existingWishlist = createWishlistRecord({
			id: "wishlist_existing",
			title: "Versión anterior",
			updatedAt: new Date("2026-06-25T08:00:00.000Z"),
		});
		const { db, state } = createMockDatabase({
			wishlists: [existingWishlist],
		});

		const result = await publishWishlistFromWizard(
			db,
			makeDraftInput({
				savedWishlistId: existingWishlist.id,
				lastSavedAt: existingWishlist.updatedAt.getTime(),
				title: "Versión final",
				slug: "version-final",
			}),
		);

		expect(result).toEqual({
			status: "published",
			wishlistId: existingWishlist.id,
			slug: "version-final",
			publicUrlPath: "/w/version-final",
			dashboardUrlPath: "/dashboard",
		});
		expect(state.wishlists[0]?.title).toBe("Versión final");
		expect(state.wishlists[0]?.status).toBe(WishlistStatus.published);
	});

	it("returns the draft conflict response and does not publish when wizard save conflicts", async () => {
		const existingWishlist = createWishlistRecord({
			id: "wishlist_existing",
			title: "Versión del dashboard",
			updatedAt: new Date("2026-06-25T10:00:00.000Z"),
		});
		const { db, state } = createMockDatabase({
			wishlists: [existingWishlist],
			categories: [
				{
					id: "category_server_1",
					wishlistId: existingWishlist.id,
					name: "Dashboard",
					sortOrder: 0,
					createdAt: BASE_DATE,
					updatedAt: BASE_DATE,
				},
			],
		});

		const result = await publishWishlistFromWizard(
			db,
			makeDraftInput({
				savedWishlistId: existingWishlist.id,
				lastSavedAt: new Date("2026-06-25T09:00:00.000Z").getTime(),
			}),
		);

		expect(result).toEqual({
			status: "conflict",
			serverDraft: expect.objectContaining({
				title: "Versión del dashboard",
				savedWishlistId: existingWishlist.id,
			}),
		});
		expect(state.wishlists[0]?.status).toBe(WishlistStatus.draft);
		expect(state.wishlists[0]?.publishedAt).toBeNull();
	});

	it("archives a wishlist and sets archivedAt without deleting the record", async () => {
		const { db, update } = createMockDatabase({
			wishlists: [
				createWishlistRecord({
					publishedAt: new Date("2026-06-24T10:00:00.000Z"),
				}),
			],
		});
		const now = new Date("2026-06-25T11:00:00.000Z");

		const wishlist = await archiveWishlist(db, {
			wishlistId: "wishlist_123",
			ownerId: 42,
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
			wishlists: [
				createWishlistRecord({
					publishedAt,
				}),
			],
		});

		const wishlist = await restoreWishlist(db, {
			wishlistId: "wishlist_123",
			ownerId: 42,
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
			ownerId: 42,
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
