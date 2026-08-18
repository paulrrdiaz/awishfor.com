import { describe, expect, it } from "vitest";
import type { PublishedWishlistMetadataProjection } from "@/server/services/public-wishlist-metadata.service";
import {
	buildPublicWishlistMetadata,
	publicMetadataLimits,
} from "./public-metadata";

const wishlist = {
	id: "wishlist_1",
	status: "published",
	slug: "mi-lista",
	title: "Mi lista",
	welcomeMessage: "",
	eventType: "wedding",
	themeId: "crema-elegante",
	images: [],
} as PublishedWishlistMetadataProjection;

describe("buildPublicWishlistMetadata", () => {
	it("creates absolute, noindex social metadata with an event fallback", () => {
		const metadata = buildPublicWishlistMetadata(wishlist);
		expect(metadata.alternates?.canonical).toBe(
			"http://localhost:4000/w/mi-lista",
		);
		expect(metadata.robots).toEqual({ index: false, follow: false });
		expect(metadata.openGraph).toMatchObject({
			siteName: "A Wish For",
			type: "website",
			url: "http://localhost:4000/w/mi-lista",
		});
		expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
	});

	it("bounds whitespace-normalized user text", () => {
		const metadata = buildPublicWishlistMetadata({
			...wishlist,
			title: "t ".repeat(300),
			welcomeMessage: "d \n ".repeat(300),
		} as PublishedWishlistMetadataProjection);
		expect(String(metadata.title).length).toBeLessThanOrEqual(
			publicMetadataLimits.title,
		);
		expect(String(metadata.description).length).toBeLessThanOrEqual(
			publicMetadataLimits.description,
		);
	});
});
