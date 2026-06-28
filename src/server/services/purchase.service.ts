import { createHash, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { Gift, Purchase, Wishlist } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
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

export type PurchaseDatabase = {
	purchase: PurchaseDelegate;
	gift: GiftDelegate;
};

type OwnerPurchaseClient = {
	purchase: PurchaseDelegate & {
		findMany(args: Prisma.PurchaseFindManyArgs): Promise<Purchase[]>;
	};
	gift: GiftDelegate;
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

const hashToken = (raw: string) =>
	createHash("sha256").update(raw).digest("hex");

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

const OWNER_MANUAL_PURCHASE_DEFAULT_NAME = "Registrado por el creador";

export const listOwnerGiftPurchases = async (
	db: OwnerPurchaseDatabase,
	{ ownerId, giftId }: { ownerId: number; giftId: string },
): Promise<Purchase[]> => {
	const gift = await db.gift.findFirst({
		where: { id: giftId, deletedAt: null, wishlist: { ownerId } },
	});
	if (!gift) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}
	return db.purchase.findMany({
		where: { giftId },
		orderBy: { createdAt: "desc" },
	});
};

export const listOwnerWishlistRecentPurchases = async (
	db: WishlistRecentPurchaseDatabase,
	{
		ownerId,
		wishlistId,
		take = 5,
	}: { ownerId: number; wishlistId: string; take?: number },
): Promise<WishlistRecentPurchase[]> =>
	db.purchase.findMany({
		where: {
			gift: {
				wishlistId,
				deletedAt: null,
				wishlist: { ownerId },
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
		ownerId,
		giftId,
		guestName,
		guestEmail,
		guestPhone,
		message,
		quantity,
	}: { ownerId: number } & CreateOwnerManualPurchaseInput,
): Promise<Purchase> => {
	const gift = await db.gift.findFirst({
		where: { id: giftId, deletedAt: null, wishlist: { ownerId } },
	});
	if (!gift) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}

	return db.$transaction(async (tx) => {
		const remaining = await getRemainingQuantity(tx, gift);
		if (quantity > remaining) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Purchase quantity exceeds remaining quantity",
			});
		}

		return tx.purchase.create({
			data: {
				gift: { connect: { id: giftId } },
				guestName: guestName ?? OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
				guestEmail: guestEmail ?? null,
				guestPhone: guestPhone ?? null,
				message: message ?? null,
				quantity,
			},
		});
	});
};

export const deleteOwnerPurchase = async (
	db: OwnerPurchaseDatabase,
	{ ownerId, purchaseId }: { ownerId: number; purchaseId: string },
): Promise<Purchase> => {
	return db.$transaction(async (tx) => {
		const purchase = await tx.purchase.findFirst({
			where: { id: purchaseId },
		});
		if (!purchase) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Purchase not found" });
		}

		const gift = await tx.gift.findFirst({
			where: { id: purchase.giftId, wishlist: { ownerId } },
		});
		if (!gift) {
			throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
		}

		try {
			return await tx.purchase.delete({ where: { id: purchaseId } });
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
};

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

		return tx.purchase.create({
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
	});

	return { purchase, undoToken: rawToken };
};

export const undoPurchase = async (
	db: PurchaseDatabase,
	{ purchaseId, undoToken }: { purchaseId: string; undoToken: string },
): Promise<Purchase> => {
	const purchase = await db.purchase.findFirst({
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

	return db.purchase.delete({ where: { id: purchaseId } });
};
