import { describe, expect, it, vi } from "vitest";
import { WishlistStatus } from "@/generated/prisma/client";

vi.mock("server-only", () => ({}));

import {
	getPublishedWishlistMetadata,
	type PublicWishlistMetadataDatabase,
	publicWishlistMetadataSelect,
} from "./public-wishlist-metadata.service";

function database(status: WishlistStatus): PublicWishlistMetadataDatabase {
	return {
		wishlist: {
			findUnique: vi.fn(
				async () =>
					({
						id: "wishlist_1",
						status,
						slug: "mi-lista",
						title: "Mi lista",
						welcomeMessage: "Bienvenidos",
						eventType: "wedding",
						eventDate: new Date("2027-06-26T00:00:00.000Z"),
						language: "es",
						themeId: null,
						images: [],
					}) as never,
			),
		},
	};
}

describe("getPublishedWishlistMetadata", () => {
	it("uses the minimal safe projection", async () => {
		const db = database(WishlistStatus.published);
		await getPublishedWishlistMetadata(db, "mi-lista");
		expect(db.wishlist.findUnique).toHaveBeenCalledWith({
			where: { slug: "mi-lista" },
			select: publicWishlistMetadataSelect,
		});
		expect(publicWishlistMetadataSelect).not.toHaveProperty("owner");
		expect(publicWishlistMetadataSelect).not.toHaveProperty("gifts");
		expect(publicWishlistMetadataSelect).toMatchObject({
			eventDate: true,
			language: true,
		});
	});

	it("does not return draft presentation data", async () => {
		expect(
			await getPublishedWishlistMetadata(
				database(WishlistStatus.draft),
				"mi-lista",
			),
		).toBeNull();
	});
});
