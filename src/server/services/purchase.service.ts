import { createHash, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { Gift, Purchase, Wishlist } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import {
	assertWishlistAccess,
	type WishlistAccessDatabase,
} from "@/server/services/collaboration.service";
import type {
	CreateOwnerManualPurchaseInput,
	CreatePurchaseInput,
} from "@/server/validators/purchase.schema";

export const PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS = 60;

type PurchaseDelegate = {
	create(args: Prisma.PurchaseCreateArgs): Promise<Purchase>;
	delete(args: Prisma.PurchaseDeleteArgs): Promise<Purchase>;
	findFirst(args: Prisma.PurchaseFindFirstArgs): Promise<Purchase | null>;
	aggregate(
		args: Prisma.PurchaseAggregateArgs,
	): Promise<Prisma.GetPurchaseAggregateType<Prisma.PurchaseAggregateArgs>>;
};

type GiftDelegate = {
	findFirst(args: Prisma.GiftFindFirstArgs): Promise<Gift | null>;
};

type WishlistTouchDelegate = {
	update(args: Prisma.WishlistUpdateArgs): Promise<Wishlist>;
};

export type PurchaseDatabase = {
	purchase: PurchaseDelegate;
	gift: GiftDelegate;
};

type OwnerPurchaseClient = {
	purchase: PurchaseDelegate & {
		findMany(args: Prisma.PurchaseFindManyArgs): Promise<Purchase[]>;
	};
	gift: GiftDelegate;
	wishlist: WishlistAccessDatabase["wishlist"] & WishlistTouchDelegate;
};

export type OwnerPurchaseDatabase = OwnerPurchaseClient & {
	$transaction<T>(
		callback: (tx: OwnerPurchaseClient) => Promise<T>,
	): Promise<T>;
};

type WishlistRecentPurchase = Purchase & {
	gift: Pick<Gift, "id" | "name">;
};

export type WishlistRecentPurchaseDatabase = {
	purchase: PurchaseDelegate & {
		findMany(
			args: Prisma.PurchaseFindManyArgs,
		): Promise<WishlistRecentPurchase[]>;
	};
};

type PurchaseMutationClient = PurchaseDatabase & {
	wishlist: WishlistTouchDelegate;
};

export type PurchaseMutationDatabase = PurchaseMutationClient & {
	$transaction<T>(
		callback: (tx: PurchaseMutationClient) => Promise<T>,
	): Promise<T>;
};

const hashToken = (raw: string) =>
	createHash("sha256").update(raw).digest("hex");

/**
 * The published wishlist snapshot is versioned by Wishlist.updatedAt. Purchases
 * are child records, so advance the parent version in the same transaction as
 * every purchase-state change instead of relying only on cache invalidation.
 */
const touchPublicWishlist = (
	db: Pick<PurchaseMutationClient, "wishlist">,
	wishlistId: string,
) =>
	db.wishlist.update({
		where: { id: wishlistId },
		data: { updatedAt: new Date() },
	});

export const getPurchasedQuantity = async (
	db: PurchaseDatabase,
	giftId: string,
): Promise<number> => {
	const result = await db.purchase.aggregate({
		where: { giftId },
		_sum: { quantity: true },
	});
	return result._sum?.quantity ?? 0;
};

export const getRemainingQuantity = async (
	db: PurchaseDatabase,
	gift: Pick<Gift, "id" | "quantityNeeded">,
): Promise<number> => {
	const purchased = await getPurchasedQuantity(db, gift.id);
	return Math.max(0, gift.quantityNeeded - purchased);
};

export type GiftPublicStatus = "available" | "partial" | "purchased";

export const deriveGiftPublicStatus = (
	quantityNeeded: number,
	purchasedQuantity: number,
): GiftPublicStatus => {
	if (purchasedQuantity <= 0) return "available";
	if (purchasedQuantity >= quantityNeeded) return "purchased";
	return "partial";
};

export type CreatePurchaseResult = {
	purchase: Purchase;
	undoToken: string;
};

export const OWNER_MANUAL_PURCHASE_DEFAULT_NAME = "Registrado por el creador";

export const listOwnerGiftPurchases = async (
	db: OwnerPurchaseDatabase,
	{ localUserId, giftId }: { localUserId: number; giftId: string },
): Promise<Purchase[]> => {
	const gift = await db.gift.findFirst({
		where: { id: giftId, deletedAt: null },
	});
	if (!gift) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}
	await assertWishlistAccess(db, {
		localUserId,
		wishlistId: gift.wishlistId,
	});
	return db.purchase.findMany({
		where: { giftId },
		orderBy: { createdAt: "desc" },
	});
};

/**
 * Recent purchases for a wishlist the caller has already been authorized
 * against (via assertWishlistAccess at the call site) — no owner check here.
 */
export const listWishlistRecentPurchases = async (
	db: WishlistRecentPurchaseDatabase,
	{ wishlistId, take = 5 }: { wishlistId: string; take?: number },
): Promise<WishlistRecentPurchase[]> =>
	db.purchase.findMany({
		where: {
			gift: {
				wishlistId,
				deletedAt: null,
			},
		},
		include: {
			gift: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
		take,
	});

export const createOwnerManualPurchase = async (
	db: OwnerPurchaseDatabase,
	{
		localUserId,
		giftId,
		guestName,
		guestEmail,
		guestPhone,
		message,
		quantity,
	}: { localUserId: number } & CreateOwnerManualPurchaseInput,
): Promise<Purchase> => {
	const gift = await db.gift.findFirst({
		where: { id: giftId, deletedAt: null },
	});
	if (!gift) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}
	await assertWishlistAccess(db, {
		localUserId,
		wishlistId: gift.wishlistId,
	});

	return db.$transaction(async (tx) => {
		const remaining = await getRemainingQuantity(tx, gift);
		if (quantity > remaining) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Purchase quantity exceeds remaining quantity",
			});
		}

		const purchase = await tx.purchase.create({
			data: {
				gift: { connect: { id: giftId } },
				guestName: guestName ?? OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
				guestEmail: guestEmail ?? null,
				guestPhone: guestPhone ?? null,
				message: message ?? null,
				quantity,
			},
		});
		await touchPublicWishlist(tx, gift.wishlistId);
		return purchase;
	});
};

export const deleteOwnerPurchase = async (
	db: OwnerPurchaseDatabase,
	{ localUserId, purchaseId }: { localUserId: number; purchaseId: string },
): Promise<Purchase> => {
	return db.$transaction(async (tx) => {
		const purchase = await tx.purchase.findFirst({
			where: { id: purchaseId },
		});
		if (!purchase) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Purchase not found" });
		}

		const gift = await tx.gift.findFirst({
			where: { id: purchase.giftId },
		});
		if (!gift) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
		}
		await assertWishlistAccess(tx, {
			localUserId,
			wishlistId: gift.wishlistId,
		});

		try {
			const deletedPurchase = await tx.purchase.delete({
				where: { id: purchaseId },
			});
			await touchPublicWishlist(tx, gift.wishlistId);
			return deletedPurchase;
		} catch (err) {
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === "P2025"
			) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Purchase not found",
				});
			}
			throw err;
		}
	});
};

type GiftWithWishlist = Gift & { wishlist: Wishlist };

type PublicGiftDelegate = {
	findFirst(args: Prisma.GiftFindFirstArgs): Promise<GiftWithWishlist | null>;
};

type PublicPurchaseClient = {
	purchase: PurchaseDelegate;
	gift: PublicGiftDelegate;
} & Pick<PurchaseMutationClient, "wishlist">;

export type PublicPurchaseDatabase = PublicPurchaseClient & {
	$transaction<T>(
		callback: (tx: PublicPurchaseClient) => Promise<T>,
	): Promise<T>;
};

export const markGiftPurchasedPublic = async (
	db: PublicPurchaseDatabase,
	input: CreatePurchaseInput,
): Promise<CreatePurchaseResult> => {
	const gift = await db.gift.findFirst({
		where: { id: input.giftId },
		include: { wishlist: true },
	});

	if (!gift) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}

	if (gift.wishlist.status !== "published") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Wishlist is not published",
		});
	}

	if (gift.visibilityStatus === "hidden") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Gift is not available",
		});
	}

	if (gift.deletedAt !== null) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}

	const rawToken = randomBytes(32).toString("hex");
	const tokenHash = hashToken(rawToken);
	const expiresAt = new Date(
		Date.now() + PUBLIC_UNDO_TOKEN_EXPIRY_SECONDS * 1000,
	);

	const purchase = await db.$transaction(async (tx) => {
		const remaining = await getRemainingQuantity(
			tx as unknown as PurchaseDatabase,
			gift,
		);

		if (input.quantity > remaining) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Purchase quantity exceeds remaining quantity",
			});
		}

		const purchase = await tx.purchase.create({
			data: {
				gift: { connect: { id: input.giftId } },
				guestName: input.guestName,
				guestEmail: input.guestEmail ?? null,
				guestPhone: input.guestPhone ?? null,
				message: input.message ?? null,
				quantity: input.quantity,
				undoTokenHash: tokenHash,
				undoExpiresAt: expiresAt,
			},
		});
		await touchPublicWishlist(tx, gift.wishlistId);
		return purchase;
	});

	return { purchase, undoToken: rawToken };
};

export const undoPurchase = async (
	db: PurchaseMutationDatabase,
	{ purchaseId, undoToken }: { purchaseId: string; undoToken: string },
): Promise<Purchase> => {
	return db.$transaction(async (tx) => {
		const purchase = await tx.purchase.findFirst({
			where: { id: purchaseId },
		});

		if (!purchase) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Purchase not found" });
		}

		if (!purchase.undoTokenHash || !purchase.undoExpiresAt) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "This purchase does not support undo",
			});
		}

		if (purchase.undoExpiresAt < new Date()) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Undo token has expired",
			});
		}

		if (hashToken(undoToken) !== purchase.undoTokenHash) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid undo token",
			});
		}

		const gift = await tx.gift.findFirst({ where: { id: purchase.giftId } });
		if (!gift) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
		}

		const deletedPurchase = await tx.purchase.delete({
			where: { id: purchaseId },
		});
		await touchPublicWishlist(tx, gift.wishlistId);
		return deletedPurchase;
	});
};
