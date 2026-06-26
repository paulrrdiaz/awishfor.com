import { describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import {
	checkSlugAvailability,
	type SlugDatabase,
} from "@/server/services/slug.service";

const createMockDb = (
	findFirstResult: { id: string } | null = null,
): SlugDatabase => ({
	wishlist: {
		findFirst: vi.fn(
			async (_args: Prisma.WishlistFindFirstArgs) => findFirstResult,
		),
	},
});

describe("checkSlugAvailability", () => {
	it("returns available when slug is unused", async () => {
		const db = createMockDb(null);
		const result = await checkSlugAvailability(db, { slug: "lista-de-boda" });
		expect(result).toEqual({ available: true });
		expect(db.wishlist.findFirst).toHaveBeenCalledOnce();
	});

	it("returns unavailable with reason 'taken' when slug is used by another wishlist", async () => {
		const db = createMockDb({ id: "other-wishlist-id" });
		const result = await checkSlugAvailability(db, { slug: "lista-de-boda" });
		expect(result).toEqual({ available: false, reason: "taken" });
	});

	it("returns available when slug belongs to the excluded wishlist", async () => {
		const db = createMockDb(null);
		const result = await checkSlugAvailability(db, {
			slug: "lista-de-boda",
			excludeWishlistId: "my-wishlist-id",
		});
		expect(result).toEqual({ available: true });
		expect(db.wishlist.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ NOT: { id: "my-wishlist-id" } }),
			}),
		);
	});

	it("returns unavailable with reason 'taken' when a different wishlist has the slug despite excludeWishlistId", async () => {
		const db = createMockDb({ id: "other-wishlist-id" });
		const result = await checkSlugAvailability(db, {
			slug: "lista-de-boda",
			excludeWishlistId: "my-wishlist-id",
		});
		expect(result).toEqual({ available: false, reason: "taken" });
	});

	it("returns unavailable with reason 'invalid' for an invalid slug without querying DB", async () => {
		const db = createMockDb(null);
		const result = await checkSlugAvailability(db, { slug: "INVALID SLUG!" });
		expect(result).toEqual({ available: false, reason: "invalid" });
		expect(db.wishlist.findFirst).not.toHaveBeenCalled();
	});

	it("returns unavailable with reason 'invalid' for a slug with a leading hyphen", async () => {
		const db = createMockDb(null);
		const result = await checkSlugAvailability(db, { slug: "-bad-slug" });
		expect(result).toEqual({ available: false, reason: "invalid" });
		expect(db.wishlist.findFirst).not.toHaveBeenCalled();
	});
});
