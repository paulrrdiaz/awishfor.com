import { TRPCError } from "@trpc/server";
import type { Prisma, Wishlist } from "@/generated/prisma/client";

export type WishlistAccessDelegate = {
	findFirst(
		args: Prisma.WishlistFindFirstArgs,
	): Promise<Pick<Wishlist, "id" | "ownerId"> | null>;
};

export type WishlistAccessDatabase = {
	wishlist: WishlistAccessDelegate;
};

export type WishlistAccessResult = {
	wishlistId: string;
	isOwner: boolean;
};

/**
 * The single authorization seam for wishlist-scoped reads and writes. Grants
 * access to the owner and, unless `requireOwner` is set, to collaborators.
 * Always throws NOT_FOUND rather than FORBIDDEN so a caller cannot tell a
 * wishlist that does not exist from one they cannot reach.
 */
export const assertWishlistAccess = async (
	db: WishlistAccessDatabase,
	{
		localUserId,
		wishlistId,
		requireOwner = false,
	}: {
		localUserId: number;
		wishlistId: string;
		requireOwner?: boolean;
	},
): Promise<WishlistAccessResult> => {
	const wishlist = await db.wishlist.findFirst({
		where: {
			id: wishlistId,
			...(requireOwner
				? { ownerId: localUserId }
				: {
						OR: [
							{ ownerId: localUserId },
							{ members: { some: { userId: localUserId } } },
						],
					}),
		},
		select: { id: true, ownerId: true },
	});

	if (!wishlist) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Wishlist not found" });
	}

	return {
		wishlistId: wishlist.id,
		isOwner: wishlist.ownerId === localUserId,
	};
};
