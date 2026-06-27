import { describe, expect, it } from "vitest";
import type { Gift, Prisma, Purchase } from "@/generated/prisma/client";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import {
	createGift,
	type DashboardGiftDatabase,
	findActiveGift,
	type GiftDatabase,
	type GiftWithPurchases,
	getOwnedGift,
	groupDashboardGifts,
	listDashboardGifts,
	listGifts,
	type ReorderGiftDatabase,
	reorderGifts,
	softDeleteGift,
	updateGift,
} from "@/server/services/gift.service";

const NOW = new Date("2026-06-26T00:00:00.000Z");

const createGiftRecord = (overrides: Partial<Gift> = {}): Gift => ({
	id: "gift_1",
	wishlistId: "wishlist_123",
	categoryId: null,
	name: "Kitchen Aid Mixer",
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
	createdAt: NOW,
	updatedAt: NOW,
	...overrides,
});

const makeDb = (
	overrides: Partial<GiftDatabase["gift"]> = {},
): GiftDatabase => ({
	gift: {
		create: async ({ data }) =>
			createGiftRecord({
				name: (data as Prisma.GiftUncheckedCreateInput).name as string,
				wishlistId:
					((data as Prisma.GiftUncheckedCreateInput).wishlistId as string) ??
					"wishlist_123",
			}),
		findFirst: async () => null,
		findMany: async () => [],
		update: async ({ data, where }) =>
			createGiftRecord({ id: where.id as string, ...(data as Partial<Gift>) }),
		...overrides,
	},
});

describe("gift service", () => {
	it("creates a gift without optional metadata", async () => {
		let captured: Prisma.GiftCreateArgs | undefined;
		const db = makeDb({
			create: async (args) => {
				captured = args;
				return createGiftRecord({ name: "Simple Gift", wishlistId: "w_1" });
			},
		});

		const result = await createGift(db, {
			wishlistId: "w_1",
			name: "Simple Gift",
			quantityNeeded: 1,
			priority: "medium",
			visibilityStatus: "available",
			sortOrder: 0,
		});

		expect(result.name).toBe("Simple Gift");
		expect(result.productUrl).toBeNull();
		expect(result.priceAmount).toBeNull();
		expect(captured).toBeDefined();
	});

	it("creates a hidden gift", async () => {
		let capturedData: Prisma.GiftCreateInput | undefined;
		const db = makeDb({
			create: async (args) => {
				capturedData = args.data as Prisma.GiftCreateInput;
				return createGiftRecord({ visibilityStatus: "hidden" });
			},
		});

		await createGift(db, {
			wishlistId: "w_1",
			name: "Hidden Gift",
			quantityNeeded: 1,
			priority: "medium",
			visibilityStatus: "hidden",
			sortOrder: 0,
		});

		expect(capturedData?.visibilityStatus).toBe("hidden");
	});

	it("soft-deletes a gift by setting deletedAt", async () => {
		let capturedData: Prisma.GiftUpdateInput | undefined;
		const db = makeDb({
			update: async (args) => {
				capturedData = args.data as Prisma.GiftUpdateInput;
				return createGiftRecord({ deletedAt: new Date() });
			},
		});

		const result = await softDeleteGift(db, { giftId: "gift_1" });

		expect(capturedData?.deletedAt).toBeInstanceOf(Date);
		expect(result.deletedAt).not.toBeNull();
	});

	it("excludes soft-deleted gifts from listGifts", async () => {
		let capturedWhere: Prisma.GiftWhereInput | undefined;
		const db = makeDb({
			findMany: async (args) => {
				capturedWhere = args.where;
				return [];
			},
		});

		await listGifts(db, { wishlistId: "w_1" });

		expect(capturedWhere).toMatchObject({ deletedAt: null });
	});

	it("excludes soft-deleted gifts from findActiveGift", async () => {
		let capturedWhere: Prisma.GiftFindFirstArgs["where"];
		const db = makeDb({
			findFirst: async (args) => {
				capturedWhere = args.where;
				return null;
			},
		});

		await findActiveGift(db, "gift_1");

		expect(capturedWhere).toMatchObject({ deletedAt: null });
	});

	it("updateGift sets only provided fields", async () => {
		let capturedData: Prisma.GiftUpdateInput | undefined;
		const db = makeDb({
			update: async (args) => {
				capturedData = args.data as Prisma.GiftUpdateInput;
				return createGiftRecord({ name: "Updated" });
			},
		});

		await updateGift(db, { giftId: "gift_1", name: "Updated" });

		expect(capturedData?.name).toBe("Updated");
		expect(capturedData?.visibilityStatus).toBeUndefined();
	});
});

const createPurchaseRecord = (overrides: Partial<Purchase> = {}): Purchase => ({
	id: "purchase_1",
	giftId: "gift_1",
	guestName: "Alice",
	guestEmail: null,
	guestPhone: null,
	message: null,
	quantity: 1,
	undoTokenHash: null,
	undoExpiresAt: null,
	createdAt: NOW,
	updatedAt: NOW,
	...overrides,
});

const makeDashboardDb = (
	overrides: Partial<{
		gift: Partial<DashboardGiftDatabase["gift"]>;
		wishlist: Partial<DashboardGiftDatabase["wishlist"]>;
	}> = {},
): DashboardGiftDatabase => ({
	gift: {
		findMany: async () => [],
		findFirst: async () => null,
		update: async ({ data, where }) =>
			createGiftRecord({ id: where.id as string, ...(data as Partial<Gift>) }),
		...overrides.gift,
	},
	wishlist: {
		findFirst: async () => ({ id: "wishlist_123" }),
		...overrides.wishlist,
	},
});

describe("listDashboardGifts", () => {
	it("throws NOT_FOUND when wishlist is not owned by user", async () => {
		const db = makeDashboardDb({
			wishlist: { findFirst: async () => null },
		});
		await expect(
			listDashboardGifts(db, { ownerId: 42, wishlistId: "wl_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("returns gifts with purchases when wishlist is owned", async () => {
		const giftWithPurchases: GiftWithPurchases = {
			...createGiftRecord(),
			purchases: [createPurchaseRecord()],
		};
		const db = makeDashboardDb({
			gift: { findMany: async () => [giftWithPurchases] },
		});
		const result = await listDashboardGifts(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
		});
		expect(result).toHaveLength(1);
		expect(result[0]?.purchases).toHaveLength(1);
	});

	it("queries with deletedAt: null filter", async () => {
		let capturedWhere: Prisma.GiftFindManyArgs["where"];
		const db = makeDashboardDb({
			gift: {
				findMany: async (args) => {
					capturedWhere = args.where;
					return [];
				},
			},
		});
		await listDashboardGifts(db, { ownerId: 42, wishlistId: "wishlist_123" });
		expect(capturedWhere).toMatchObject({ deletedAt: null });
	});

	it("includes hidden gifts in the result", async () => {
		const hiddenGift: GiftWithPurchases = {
			...createGiftRecord({ visibilityStatus: "hidden" }),
			purchases: [],
		};
		const db = makeDashboardDb({
			gift: { findMany: async () => [hiddenGift] },
		});
		const result = await listDashboardGifts(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
		});
		expect(result[0]?.visibilityStatus).toBe("hidden");
	});
});

describe("getOwnedGift", () => {
	it("returns gift when it belongs to owner", async () => {
		const gift = createGiftRecord();
		const db = makeDashboardDb({
			gift: { findFirst: async () => gift },
		});
		const result = await getOwnedGift(db, { ownerId: 42, giftId: "gift_1" });
		expect(result.id).toBe("gift_1");
	});

	it("throws NOT_FOUND when gift does not belong to owner", async () => {
		const db = makeDashboardDb({
			gift: { findFirst: async () => null },
		});
		await expect(
			getOwnedGift(db, { ownerId: 42, giftId: "gift_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

const makeRow = (
	overrides: Partial<DashboardGiftRowViewModel> = {},
): DashboardGiftRowViewModel => ({
	id: "gift_1",
	name: "Test",
	productUrl: null,
	imageUrl: null,
	storeName: null,
	priceAmount: null,
	priceCurrency: null,
	quantityNeeded: 2,
	purchasedQuantity: 0,
	remainingQuantity: 2,
	priority: "medium",
	visibilityStatus: "available",
	publicNote: null,
	hasInternalNote: false,
	sortOrder: 0,
	categoryId: null,
	deletedAt: null,
	createdAt: NOW.toISOString(),
	updatedAt: NOW.toISOString(),
	...overrides,
});

const makeReorderDb = (
	overrides: Partial<{
		gift: Partial<ReorderGiftDatabase["gift"]>;
		wishlist: Partial<ReorderGiftDatabase["wishlist"]>;
		$transaction: ReorderGiftDatabase["$transaction"];
	}> = {},
): ReorderGiftDatabase => ({
	gift: {
		findMany: async () => [{ id: "g1" }, { id: "g2" }, { id: "g3" }],
		update: async ({ data, where }) =>
			createGiftRecord({
				id: where.id as string,
				sortOrder: (data as Partial<Gift>).sortOrder,
			}),
		...overrides.gift,
	},
	wishlist: {
		findFirst: async () => ({ id: "wishlist_123" }),
		...overrides.wishlist,
	},
	$transaction: overrides.$transaction ?? (async (ops) => Promise.all(ops)),
});

describe("reorderGifts", () => {
	it("updates each gift sortOrder to its index in the submitted list", async () => {
		const updateCalls: Prisma.GiftUpdateArgs[] = [];
		const db = makeReorderDb({
			gift: {
				update: async (args) => {
					updateCalls.push(args);
					return createGiftRecord({
						id: args.where.id as string,
						sortOrder: (args.data as Partial<Gift>).sortOrder,
					});
				},
			},
		});

		await reorderGifts(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
			orderedGiftIds: ["g2", "g3", "g1"],
		});

		expect(updateCalls).toHaveLength(3);
		expect(updateCalls[0]).toMatchObject({
			where: { id: "g2" },
			data: { sortOrder: 0 },
		});
		expect(updateCalls[1]).toMatchObject({
			where: { id: "g3" },
			data: { sortOrder: 1 },
		});
		expect(updateCalls[2]).toMatchObject({
			where: { id: "g1" },
			data: { sortOrder: 2 },
		});
	});

	it("throws NOT_FOUND and makes no writes when wishlist is not owned by user", async () => {
		const updateCalls: unknown[] = [];
		const db = makeReorderDb({
			wishlist: { findFirst: async () => null },
			gift: {
				update: async (args) => {
					updateCalls.push(args);
					return createGiftRecord();
				},
			},
		});

		await expect(
			reorderGifts(db, {
				ownerId: 99,
				wishlistId: "wishlist_123",
				orderedGiftIds: ["g1", "g2", "g3"],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		expect(updateCalls).toHaveLength(0);
	});

	it("throws NOT_FOUND and makes no writes when submitted ids omit a non-deleted gift", async () => {
		const updateCalls: unknown[] = [];
		const db = makeReorderDb({
			gift: {
				update: async (args) => {
					updateCalls.push(args);
					return createGiftRecord();
				},
			},
		});

		await expect(
			reorderGifts(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
				orderedGiftIds: ["g1", "g2"],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		expect(updateCalls).toHaveLength(0);
	});

	it("throws NOT_FOUND and makes no writes when submitted ids include a foreign gift", async () => {
		const updateCalls: unknown[] = [];
		const db = makeReorderDb({
			gift: {
				update: async (args) => {
					updateCalls.push(args);
					return createGiftRecord();
				},
			},
		});

		await expect(
			reorderGifts(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
				orderedGiftIds: ["g1", "g2", "foreign_id"],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		expect(updateCalls).toHaveLength(0);
	});
});

describe("groupDashboardGifts", () => {
	it("places hidden gifts in hidden group regardless of purchase progress", () => {
		const row = makeRow({ visibilityStatus: "hidden", remainingQuantity: 0 });
		const { available, purchased, hidden } = groupDashboardGifts([row]);
		expect(hidden).toHaveLength(1);
		expect(available).toHaveLength(0);
		expect(purchased).toHaveLength(0);
	});

	it("places fully purchased non-hidden gifts in purchased group", () => {
		const row = makeRow({
			visibilityStatus: "available",
			remainingQuantity: 0,
			purchasedQuantity: 2,
		});
		const { purchased } = groupDashboardGifts([row]);
		expect(purchased).toHaveLength(1);
	});

	it("places partially purchased non-hidden gifts in available group", () => {
		const row = makeRow({
			visibilityStatus: "available",
			remainingQuantity: 1,
			purchasedQuantity: 1,
		});
		const { available } = groupDashboardGifts([row]);
		expect(available).toHaveLength(1);
	});

	it("places unpurchased non-hidden gifts in available group", () => {
		const row = makeRow({
			visibilityStatus: "available",
			remainingQuantity: 2,
			purchasedQuantity: 0,
		});
		const { available } = groupDashboardGifts([row]);
		expect(available).toHaveLength(1);
	});

	it("correctly distributes mixed rows across three buckets", () => {
		const rows = [
			makeRow({ id: "a", visibilityStatus: "available", remainingQuantity: 1 }),
			makeRow({ id: "b", visibilityStatus: "available", remainingQuantity: 0 }),
			makeRow({ id: "c", visibilityStatus: "hidden", remainingQuantity: 2 }),
		];
		const { available, purchased, hidden } = groupDashboardGifts(rows);
		expect(available).toHaveLength(1);
		expect(purchased).toHaveLength(1);
		expect(hidden).toHaveLength(1);
	});
});
