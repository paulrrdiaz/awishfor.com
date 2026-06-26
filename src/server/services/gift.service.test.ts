import { describe, expect, it } from "vitest";
import type { Gift, Prisma } from "@/generated/prisma/client";
import {
	createGift,
	findActiveGift,
	type GiftDatabase,
	listGifts,
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
