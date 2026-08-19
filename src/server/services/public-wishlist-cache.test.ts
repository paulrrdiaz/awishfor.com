import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
	revalidatePath: revalidatePathMock,
	revalidateTag: revalidateTagMock,
}));

import {
	invalidatePublicWishlist,
	invalidatePublicWishlistByGiftId,
	invalidatePublicWishlistById,
} from "./public-wishlist-cache";

describe("public wishlist invalidation", () => {
	beforeEach(() => vi.clearAllMocks());

	it("clears id and old/new slug tags, pages, and social images", () => {
		invalidatePublicWishlist({
			wishlistId: "wishlist_1",
			slug: "new-slug",
			previousSlug: "old-slug",
		});

		expect(revalidateTagMock.mock.calls).toEqual([
			["public-wishlist:wishlist_1", "immediate"],
			["public-wishlist-slug:new-slug", "immediate"],
			["public-wishlist-slug:old-slug", "immediate"],
		]);
		expect(revalidatePathMock.mock.calls).toEqual([
			["/w/new-slug"],
			["/w/new-slug/opengraph-image"],
			["/w/old-slug"],
			["/w/old-slug/opengraph-image"],
		]);
	});

	it("resolves the current slug after a related mutation commits", async () => {
		const db = {
			wishlist: {
				findUnique: vi
					.fn()
					.mockResolvedValue({ id: "wishlist_1", slug: "lista-publica" }),
			},
		};

		await invalidatePublicWishlistById(db as never, "wishlist_1");

		expect(db.wishlist.findUnique).toHaveBeenCalledWith({
			where: { id: "wishlist_1" },
			select: { id: true, slug: true },
		});
		expect(revalidateTagMock).toHaveBeenCalledWith(
			"public-wishlist:wishlist_1",
			"immediate",
		);
	});

	it("resolves purchase invalidation through the gift's wishlist", async () => {
		const db = {
			gift: {
				findUnique: vi.fn().mockResolvedValue({ wishlistId: "wishlist_1" }),
			},
			wishlist: {
				findUnique: vi
					.fn()
					.mockResolvedValue({ id: "wishlist_1", slug: "lista-publica" }),
			},
		};

		await invalidatePublicWishlistByGiftId(db as never, "gift_1");

		expect(db.gift.findUnique).toHaveBeenCalledWith({
			where: { id: "gift_1" },
			select: { wishlistId: true },
		});
		expect(revalidatePathMock).toHaveBeenCalledWith("/w/lista-publica");
	});
});
