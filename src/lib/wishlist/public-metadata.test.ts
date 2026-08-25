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
	eventDate: new Date("2027-06-26T00:00:00.000Z"),
	language: "es",
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
		expect(metadata.title).toBe(
			"Mi lista — Sábado, 26 de junio de 2027 | A Wish For",
		);
	});

	it("uses localized dated and undated titles within the total budget", () => {
		const english = buildPublicWishlistMetadata({
			...wishlist,
			title: "A very long wishlist title made of several useful words",
			eventDate: new Date("2027-06-26T00:00:00.000Z"),
			language: "en",
		} as PublishedWishlistMetadataProjection);
		const undated = buildPublicWishlistMetadata({
			...wishlist,
			eventDate: null,
			language: "en",
		} as PublishedWishlistMetadataProjection);

		expect(String(english.title)).toContain("Saturday, June 26, 2027");
		expect(String(undated.title)).toContain("Wishlist | A Wish For");
		expect(String(english.title).length).toBeLessThanOrEqual(
			publicMetadataLimits.title,
		);
		expect(String(undated.title).length).toBeLessThanOrEqual(
			publicMetadataLimits.title,
		);
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
		expect(String(metadata.description)).toMatch(/…$/);
	});

	it("uses event-aware copy for an empty normalized welcome message", () => {
		const metadata = buildPublicWishlistMetadata({
			...wishlist,
			welcomeMessage: "  \n \t ",
		} as PublishedWishlistMetadataProjection);
		expect(metadata.description).toBe(
			"Descubre esta lista de deseos para celebrar una boda.",
		);
	});
});
