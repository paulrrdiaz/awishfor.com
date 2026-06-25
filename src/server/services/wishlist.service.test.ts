import { describe, expect, it, vi } from "vitest";
import {
	type Prisma,
	type Wishlist,
	WishlistStatus,
} from "@/generated/prisma/client";
import {
	archiveWishlist,
	createWishlist,
	publishWishlist,
	restoreWishlist,
	type WishlistDatabase,
} from "@/server/services/wishlist.service";

const createWishlistRecord = (overrides: Partial<Wishlist> = {}): Wishlist => ({
	id: "wishlist_123",
	status: WishlistStatus.draft,
	publishedAt: null,
	archivedAt: null,
	createdAt: new Date("2026-06-25T00:00:00.000Z"),
	updatedAt: new Date("2026-06-25T00:00:00.000Z"),
	...overrides,
});

const createMockDatabase = (
	existingWishlist: Pick<Wishlist, "publishedAt"> = { publishedAt: null },
) => {
	const create = vi.fn(async (_args: Prisma.WishlistCreateArgs) =>
		createWishlistRecord(),
	);
	const findUniqueOrThrow = vi.fn(
		async (_args: Prisma.WishlistFindUniqueOrThrowArgs) => existingWishlist,
	);
	const update = vi.fn(async (args: Prisma.WishlistUpdateArgs) => {
		const data = args.data as Partial<Wishlist>;

		return createWishlistRecord({
			...existingWishlist,
			...data,
		});
	});

	const db: WishlistDatabase = {
		wishlist: {
			create,
			findUniqueOrThrow,
			update,
		},
	};

	return { db, create, findUniqueOrThrow, update };
};

describe("wishlist service", () => {
	it("creates wishlists as draft with null lifecycle timestamps", async () => {
		const { db, create } = createMockDatabase();

		const wishlist = await createWishlist(db);

		expect(create).toHaveBeenCalledWith({
			data: {
				status: WishlistStatus.draft,
				publishedAt: null,
				archivedAt: null,
			},
		});
		expect(wishlist.status).toBe(WishlistStatus.draft);
		expect(wishlist.publishedAt).toBeNull();
		expect(wishlist.archivedAt).toBeNull();
	});

	it("publishes a wishlist and sets publishedAt while clearing archivedAt", async () => {
		const { db, update } = createMockDatabase();
		const now = new Date("2026-06-25T10:00:00.000Z");

		const wishlist = await publishWishlist(db, {
			wishlistId: "wishlist_123",
			now,
		});

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
