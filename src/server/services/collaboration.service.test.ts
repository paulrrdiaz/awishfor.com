import { describe, expect, it } from "vitest";
import type { Prisma, Wishlist } from "@/generated/prisma/client";
import {
	assertWishlistAccess,
	type WishlistAccessDatabase,
} from "@/server/services/collaboration.service";

type StoredWishlist = Pick<Wishlist, "id" | "ownerId">;

const makeDb = (
	wishlists: StoredWishlist[],
	members: { wishlistId: string; userId: number }[] = [],
): WishlistAccessDatabase => ({
	wishlist: {
		findFirst: async (args: Prisma.WishlistFindFirstArgs) => {
			const where = args.where as {
				id?: string;
				ownerId?: number;
				OR?: Array<{
					ownerId?: number;
					members?: { some: { userId: number } };
				}>;
			};

			return (
				wishlists.find((wishlist) => {
					if (wishlist.id !== where.id) return false;

					if (where.ownerId !== undefined) {
						return wishlist.ownerId === where.ownerId;
					}

					if (where.OR) {
						return where.OR.some((clause) => {
							if (clause.ownerId !== undefined) {
								return wishlist.ownerId === clause.ownerId;
							}
							if (clause.members) {
								return members.some(
									(member) =>
										member.wishlistId === wishlist.id &&
										member.userId === clause.members?.some.userId,
								);
							}
							return false;
						});
					}

					return true;
				}) ?? null
			);
		},
	},
});

describe("assertWishlistAccess", () => {
	it("grants access to the owner", async () => {
		const db = makeDb([{ id: "wl_1", ownerId: 1 }]);
		const result = await assertWishlistAccess(db, {
			localUserId: 1,
			wishlistId: "wl_1",
		});
		expect(result).toEqual({ wishlistId: "wl_1", isOwner: true });
	});

	it("grants access to a collaborator", async () => {
		const db = makeDb(
			[{ id: "wl_1", ownerId: 1 }],
			[{ wishlistId: "wl_1", userId: 2 }],
		);
		const result = await assertWishlistAccess(db, {
			localUserId: 2,
			wishlistId: "wl_1",
		});
		expect(result).toEqual({ wishlistId: "wl_1", isOwner: false });
	});

	it("rejects an unrelated account with NOT_FOUND", async () => {
		const db = makeDb([{ id: "wl_1", ownerId: 1 }]);
		await expect(
			assertWishlistAccess(db, { localUserId: 99, wishlistId: "wl_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("rejects a removed collaborator with NOT_FOUND", async () => {
		const db = makeDb([{ id: "wl_1", ownerId: 1 }], []);
		await expect(
			assertWishlistAccess(db, { localUserId: 2, wishlistId: "wl_1" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("rejects a collaborator when requireOwner is set", async () => {
		const db = makeDb(
			[{ id: "wl_1", ownerId: 1 }],
			[{ wishlistId: "wl_1", userId: 2 }],
		);
		await expect(
			assertWishlistAccess(db, {
				localUserId: 2,
				wishlistId: "wl_1",
				requireOwner: true,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("grants the owner access even when requireOwner is set", async () => {
		const db = makeDb([{ id: "wl_1", ownerId: 1 }]);
		const result = await assertWishlistAccess(db, {
			localUserId: 1,
			wishlistId: "wl_1",
			requireOwner: true,
		});
		expect(result.isOwner).toBe(true);
	});

	it("never throws FORBIDDEN, only NOT_FOUND, for any unauthorized caller", async () => {
		const db = makeDb([{ id: "wl_1", ownerId: 1 }]);
		try {
			await assertWishlistAccess(db, { localUserId: 42, wishlistId: "wl_1" });
			throw new Error("expected assertWishlistAccess to throw");
		} catch (error) {
			expect(error).toMatchObject({ code: "NOT_FOUND" });
			expect(error).not.toMatchObject({ code: "FORBIDDEN" });
		}
	});
});
