import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type {
	Gift,
	Prisma,
	Purchase,
	Wishlist,
} from "@/generated/prisma/client";
import {
	createOwnerManualPurchase,
	createPurchase,
	deleteOwnerPurchase,
	deriveGiftPublicStatus,
	getPurchasedQuantity,
	getRemainingQuantity,
	listOwnerGiftPurchases,
	markGiftPurchasedPublic,
	type OwnerPurchaseDatabase,
	PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS,
	type PublicPurchaseDatabase,
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

const makeOwnerDb = (
	purchasedSum: number,
	gift: Gift | null = createGiftRecord(),
	purchaseOverrides: Partial<OwnerPurchaseDatabase["purchase"]> = {},
): OwnerPurchaseDatabase => ({
	gift: {
		findFirst: async () => gift,
	},
	purchase: {
		create: async ({ data }) =>
			createPurchaseRecord({
				guestName:
					((data as Prisma.PurchaseUncheckedCreateInput).guestName as string) ??
					"",
				quantity:
					((data as Prisma.PurchaseUncheckedCreateInput).quantity as number) ??
					1,
				undoTokenHash: null,
				undoExpiresAt: null,
			}),
		delete: async ({ where }) =>
			createPurchaseRecord({ id: where.id as string }),
		findFirst: async () => null,
		findMany: async () => [createPurchaseRecord()],
		aggregate: async () =>
			({
				_sum: { quantity: purchasedSum },
			}) as Prisma.GetPurchaseAggregateType<Prisma.PurchaseAggregateArgs>,
		...purchaseOverrides,
	},
});

describe("listOwnerGiftPurchases", () => {
	it("returns purchase records when owner owns the gift", async () => {
		const purchase = createPurchaseRecord();
		const db = makeOwnerDb(1, createGiftRecord(), {
			findMany: async () => [purchase],
		});
		const result = await listOwnerGiftPurchases(db, {
			ownerId: 1,
			giftId: "gift_1",
		});
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("purchase_1");
	});

	it("rejects when gift is not found or not owned", async () => {
		const db = makeOwnerDb(0, null);
		await expect(
			listOwnerGiftPurchases(db, { ownerId: 1, giftId: "gift_1" }),
		).rejects.toThrow("Gift not found");
	});
});

describe("createOwnerManualPurchase", () => {
	it("creates purchase with default name when guest name is omitted", async () => {
		let capturedName: string | undefined;
		const db = makeOwnerDb(0, createGiftRecord(), {
			create: async ({ data }) => {
				capturedName = (data as Prisma.PurchaseUncheckedCreateInput)
					.guestName as string;
				return createPurchaseRecord({ guestName: capturedName });
			},
		});
		await createOwnerManualPurchase(db, {
			ownerId: 1,
			giftId: "gift_1",
			quantity: 1,
		});
		expect(capturedName).toBe("Registrado por el creador");
	});

	it("uses provided guest name when supplied", async () => {
		let capturedName: string | undefined;
		const db = makeOwnerDb(0, createGiftRecord(), {
			create: async ({ data }) => {
				capturedName = (data as Prisma.PurchaseUncheckedCreateInput)
					.guestName as string;
				return createPurchaseRecord({ guestName: capturedName });
			},
		});
		await createOwnerManualPurchase(db, {
			ownerId: 1,
			giftId: "gift_1",
			guestName: "Ana García",
			quantity: 1,
		});
		expect(capturedName).toBe("Ana García");
	});

	it("rejects quantity above remaining", async () => {
		const db = makeOwnerDb(2, createGiftRecord({ quantityNeeded: 3 }));
		await expect(
			createOwnerManualPurchase(db, {
				ownerId: 1,
				giftId: "gift_1",
				quantity: 2,
			}),
		).rejects.toThrow("Purchase quantity exceeds remaining quantity");
	});

	it("rejects when gift is not owned", async () => {
		const db = makeOwnerDb(0, null);
		await expect(
			createOwnerManualPurchase(db, {
				ownerId: 99,
				giftId: "gift_1",
				quantity: 1,
			}),
		).rejects.toThrow("Gift not found");
	});
});

describe("deleteOwnerPurchase", () => {
	it("deletes purchase when owner owns the gift", async () => {
		const db = makeOwnerDb(1, createGiftRecord(), {
			findFirst: async () => createPurchaseRecord(),
			delete: async ({ where }) =>
				createPurchaseRecord({ id: where.id as string }),
		});
		const result = await deleteOwnerPurchase(db, {
			ownerId: 1,
			purchaseId: "purchase_1",
		});
		expect(result.id).toBe("purchase_1");
	});

	it("rejects when purchase does not exist", async () => {
		const db = makeOwnerDb(0, createGiftRecord(), {
			findFirst: async () => null,
		});
		await expect(
			deleteOwnerPurchase(db, { ownerId: 1, purchaseId: "purchase_missing" }),
		).rejects.toThrow("Purchase not found");
	});

	it("rejects when the gift does not belong to the owner", async () => {
		let giftFindFirstCalled = 0;
		const db: OwnerPurchaseDatabase = {
			gift: {
				findFirst: async () => {
					giftFindFirstCalled++;
					return null;
				},
			},
			purchase: {
				...makeOwnerDb(0).purchase,
				findFirst: async () => createPurchaseRecord(),
			},
		};
		await expect(
			deleteOwnerPurchase(db, { ownerId: 99, purchaseId: "purchase_1" }),
		).rejects.toThrow("Not authorized");
		expect(giftFindFirstCalled).toBe(1);
	});
});

// --- markGiftPurchasedPublic ---

const makeWishlistRecord = (overrides: Partial<Wishlist> = {}): Wishlist => ({
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
	dressCode: null,
	coverImageUrl: null,
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	fontPairing: null,
	showHowItWorks: true,
	status: "published",
	publishedAt: null,
	archivedAt: null,
	createdAt: NOW,
	updatedAt: NOW,
	...overrides,
});

const makePublicDb = (
	gift: (Gift & { wishlist: Wishlist }) | null,
	purchasedQuantity = 0,
): PublicPurchaseDatabase => ({
	gift: {
		findFirst: async () => gift,
	},
	purchase: {
		aggregate: async () =>
			({
				_sum: { quantity: purchasedQuantity },
			}) as Prisma.GetPurchaseAggregateType<Prisma.PurchaseAggregateArgs>,
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
	},
});

const publicInput = {
	giftId: "gift_1",
	guestName: "Ana García",
	quantity: 1,
} as const;

describe("markGiftPurchasedPublic", () => {
	it("succeeds for a published, visible, non-deleted gift", async () => {
		const gift = createGiftRecord();
		const wishlist = makeWishlistRecord({ status: "published" });
		const db = makePublicDb({ ...gift, wishlist });

		const result = await markGiftPurchasedPublic(db, publicInput);

		expect(result.purchase.quantity).toBe(1);
		expect(typeof result.undoToken).toBe("string");
		expect(result.undoToken.length).toBeGreaterThan(0);
	});

	it("stores hash of undo token, not raw token", async () => {
		const gift = createGiftRecord();
		const wishlist = makeWishlistRecord();
		const db = makePublicDb({ ...gift, wishlist });

		const result = await markGiftPurchasedPublic(db, publicInput);

		const expectedHash = createHash("sha256")
			.update(result.undoToken)
			.digest("hex");
		expect(result.purchase.undoTokenHash).toBe(expectedHash);
		expect(result.purchase.undoTokenHash).not.toBe(result.undoToken);
	});

	it("sets undo expiry to 60 seconds", async () => {
		const before = Date.now();
		const gift = createGiftRecord();
		const wishlist = makeWishlistRecord();
		const db = makePublicDb({ ...gift, wishlist });

		const result = await markGiftPurchasedPublic(db, publicInput);
		const after = Date.now();

		const expiresAt = result.purchase.undoExpiresAt?.getTime();
		expect(expiresAt).toBeGreaterThanOrEqual(
			before + PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS * 1000,
		);
		expect(expiresAt).toBeLessThanOrEqual(
			after + PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS * 1000,
		);
	});

	it("rejects when wishlist is draft", async () => {
		const gift = createGiftRecord();
		const wishlist = makeWishlistRecord({ status: "draft" });
		const db = makePublicDb({ ...gift, wishlist });

		await expect(markGiftPurchasedPublic(db, publicInput)).rejects.toThrow(
			TRPCError,
		);
	});

	it("rejects when wishlist is archived", async () => {
		const gift = createGiftRecord();
		const wishlist = makeWishlistRecord({ status: "archived" });
		const db = makePublicDb({ ...gift, wishlist });

		await expect(markGiftPurchasedPublic(db, publicInput)).rejects.toThrow(
			TRPCError,
		);
	});

	it("rejects when gift is hidden", async () => {
		const gift = createGiftRecord({ visibilityStatus: "hidden" });
		const wishlist = makeWishlistRecord();
		const db = makePublicDb({ ...gift, wishlist });

		await expect(markGiftPurchasedPublic(db, publicInput)).rejects.toThrow(
			TRPCError,
		);
	});

	it("rejects when gift is soft-deleted", async () => {
		const gift = createGiftRecord({ deletedAt: NOW });
		const wishlist = makeWishlistRecord();
		const db = makePublicDb({ ...gift, wishlist });

		await expect(markGiftPurchasedPublic(db, publicInput)).rejects.toThrow(
			TRPCError,
		);
	});

	it("rejects when quantity exceeds remaining", async () => {
		const gift = createGiftRecord({ quantityNeeded: 2 });
		const wishlist = makeWishlistRecord();
		const db = makePublicDb({ ...gift, wishlist }, 2);

		await expect(
			markGiftPurchasedPublic(db, { ...publicInput, quantity: 1 }),
		).rejects.toThrow("Purchase quantity exceeds remaining quantity");
	});

	it("rejects when gift is not found", async () => {
		const db = makePublicDb(null);

		await expect(markGiftPurchasedPublic(db, publicInput)).rejects.toThrow(
			TRPCError,
		);
	});
});
