import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { Gift, Prisma, Purchase } from "@/generated/prisma/client";
import {
	createPurchase,
	deriveGiftPublicStatus,
	getPurchasedQuantity,
	getRemainingQuantity,
	type PurchaseDatabase,
	undoPurchase,
} from "@/server/services/purchase.service";

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
	quantityNeeded: 3,
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

const createPurchaseRecord = (overrides: Partial<Purchase> = {}): Purchase => ({
	id: "purchase_1",
	giftId: "gift_1",
	guestName: "Jane Doe",
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

const makeDb = (
	purchasedSum: number,
	gift: Gift | null = createGiftRecord(),
	overrides: Partial<PurchaseDatabase["purchase"]> = {},
): PurchaseDatabase => ({
	gift: {
		findFirst: async () => gift,
	},
	purchase: {
		create: async ({ data }) =>
			createPurchaseRecord({
				quantity:
					((data as Prisma.PurchaseUncheckedCreateInput).quantity as number) ??
					1,
				undoTokenHash:
					((data as Prisma.PurchaseUncheckedCreateInput)
						.undoTokenHash as string) ?? null,
				undoExpiresAt:
					((data as Prisma.PurchaseUncheckedCreateInput)
						.undoExpiresAt as Date) ?? null,
			}),
		delete: async ({ where }) =>
			createPurchaseRecord({ id: where.id as string }),
		findFirst: async () => null,
		aggregate: async () =>
			({
				_sum: { quantity: purchasedSum },
			}) as Prisma.GetPurchaseAggregateType<Prisma.PurchaseAggregateArgs>,
		...overrides,
	},
});

describe("getPurchasedQuantity", () => {
	it("returns sum of purchase quantities", async () => {
		const db = makeDb(5);
		expect(await getPurchasedQuantity(db, "gift_1")).toBe(5);
	});

	it("returns 0 when no purchases", async () => {
		const db = makeDb(0);
		expect(await getPurchasedQuantity(db, "gift_1")).toBe(0);
	});
});

describe("getRemainingQuantity", () => {
	it("returns quantityNeeded minus purchased", async () => {
		const db = makeDb(1);
		const gift = createGiftRecord({ quantityNeeded: 3 });
		expect(await getRemainingQuantity(db, gift)).toBe(2);
	});

	it("returns 0 when fully purchased", async () => {
		const db = makeDb(3);
		const gift = createGiftRecord({ quantityNeeded: 3 });
		expect(await getRemainingQuantity(db, gift)).toBe(0);
	});

	it("is floored at 0 even when over-purchased (race condition)", async () => {
		const db = makeDb(5);
		const gift = createGiftRecord({ quantityNeeded: 3 });
		expect(await getRemainingQuantity(db, gift)).toBe(0);
	});

	it("excludes soft-deleted gifts by requiring caller to pass active gift", async () => {
		const db = makeDb(0);
		const deletedGift = createGiftRecord({ deletedAt: new Date() });
		expect(await getRemainingQuantity(db, deletedGift)).toBe(3);
	});
});

describe("deriveGiftPublicStatus", () => {
	it("returns available when nothing purchased", () => {
		expect(deriveGiftPublicStatus(3, 0)).toBe("available");
	});

	it("returns partial when some units purchased", () => {
		expect(deriveGiftPublicStatus(3, 1)).toBe("partial");
		expect(deriveGiftPublicStatus(3, 2)).toBe("partial");
	});

	it("returns purchased when all units purchased", () => {
		expect(deriveGiftPublicStatus(3, 3)).toBe("purchased");
		expect(deriveGiftPublicStatus(3, 4)).toBe("purchased");
	});
});

describe("createPurchase", () => {
	it("creates a purchase and returns raw undo token once", async () => {
		const db = makeDb(0);
		const { purchase, undoToken } = await createPurchase(db, {
			giftId: "gift_1",
			guestName: "Jane",
			quantity: 1,
		});

		expect(purchase).toBeDefined();
		expect(typeof undoToken).toBe("string");
		expect(undoToken.length).toBeGreaterThan(0);
		expect(purchase.undoTokenHash).not.toBe(undoToken);
	});

	it("stores hashed token, not raw token", async () => {
		let storedHash: string | null = null;

		const db = makeDb(0, createGiftRecord(), {
			create: async ({ data }) => {
				storedHash = (data as Prisma.PurchaseUncheckedCreateInput)
					.undoTokenHash as string;
				return createPurchaseRecord({ undoTokenHash: storedHash });
			},
		});

		const { undoToken } = await createPurchase(db, {
			giftId: "gift_1",
			guestName: "Jane",
			quantity: 1,
		});

		const expectedHash = createHash("sha256").update(undoToken).digest("hex");
		expect(storedHash).toBe(expectedHash);
		expect(storedHash).not.toBe(undoToken);
	});

	it("rejects when quantity exceeds remaining", async () => {
		const db = makeDb(2, createGiftRecord({ quantityNeeded: 3 }));
		await expect(
			createPurchase(db, { giftId: "gift_1", guestName: "Jane", quantity: 2 }),
		).rejects.toThrow("Purchase quantity exceeds remaining quantity");
	});

	it("rejects soft-deleted gifts", async () => {
		const db = makeDb(0, null);
		await expect(
			createPurchase(db, { giftId: "gift_1", guestName: "Jane", quantity: 1 }),
		).rejects.toThrow("Gift not found");
	});
});

describe("undoPurchase", () => {
	it("deletes purchase when token and expiry are valid", async () => {
		const rawToken = "valid-token-123";
		const validHash = createHash("sha256").update(rawToken).digest("hex");
		const futureExpiry = new Date(Date.now() + 60_000);

		const db = makeDb(0, createGiftRecord(), {
			findFirst: async () =>
				createPurchaseRecord({
					undoTokenHash: validHash,
					undoExpiresAt: futureExpiry,
				}),
			delete: async ({ where }) =>
				createPurchaseRecord({ id: where.id as string }),
		});

		const result = await undoPurchase(db, {
			purchaseId: "purchase_1",
			undoToken: rawToken,
		});
		expect(result.id).toBe("purchase_1");
	});

	it("rejects expired undo token", async () => {
		const rawToken = "valid-token";
		const validHash = createHash("sha256").update(rawToken).digest("hex");
		const pastExpiry = new Date(Date.now() - 60_000);

		const db = makeDb(0, createGiftRecord(), {
			findFirst: async () =>
				createPurchaseRecord({
					undoTokenHash: validHash,
					undoExpiresAt: pastExpiry,
				}),
		});

		await expect(
			undoPurchase(db, { purchaseId: "purchase_1", undoToken: rawToken }),
		).rejects.toThrow("Undo token has expired");
	});

	it("rejects invalid undo token", async () => {
		const validHash = createHash("sha256")
			.update("correct-token")
			.digest("hex");
		const futureExpiry = new Date(Date.now() + 60_000);

		const db = makeDb(0, createGiftRecord(), {
			findFirst: async () =>
				createPurchaseRecord({
					undoTokenHash: validHash,
					undoExpiresAt: futureExpiry,
				}),
		});

		await expect(
			undoPurchase(db, {
				purchaseId: "purchase_1",
				undoToken: "wrong-token",
			}),
		).rejects.toThrow("Invalid undo token");
	});

	it("rejects when purchase not found", async () => {
		const db = makeDb(0, createGiftRecord(), {
			findFirst: async () => null,
		});

		await expect(
			undoPurchase(db, { purchaseId: "purchase_1", undoToken: "any" }),
		).rejects.toThrow("Purchase not found");
	});
});
