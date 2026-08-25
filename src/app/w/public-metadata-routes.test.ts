import { describe, expect, it, vi } from "vitest";

const findUnique = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/server/db", () => ({ db: { wishlist: { findUnique } } }));
vi.mock("@/components/layouts/public-wishlist/public-wishlist-page", () => ({
	PublicWishlistPage: () => null,
}));

import { generateMetadata as generateInviteMetadata } from "./[slug]/[guestSlug]/page";
import { generateMetadata as generateWishlistMetadata } from "./[slug]/page";

const publicMetadataRow = {
	id: "wishlist_1",
	status: "published",
	slug: "lista-publica",
	title: "Lista pública",
	welcomeMessage: "Bienvenidos a nuestra celebración",
	eventType: "wedding",
	eventDate: new Date("2027-06-26T00:00:00.000Z"),
	language: "es",
	themeId: "crema-elegante",
	images: [{ url: "https://cdn.example/cover.png", width: 1200, height: 630 }],
};

describe("public wishlist route metadata", () => {
	it("emits published social tags without rendering client UI", async () => {
		findUnique.mockResolvedValueOnce(publicMetadataRow);
		const metadata = await generateWishlistMetadata({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		expect(metadata.alternates?.canonical).toBe(
			"http://localhost:4000/w/lista-publica",
		);
		expect(metadata.openGraph).toMatchObject({
			title: "Lista pública — Sábado, 26 de junio de 2027 | A Wish For",
			url: "http://localhost:4000/w/lista-publica",
		});
		expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
		expect(metadata.robots).toEqual({ index: false, follow: false });
	});

	it("gives personalized URLs the same anonymous social identity", async () => {
		findUnique.mockResolvedValueOnce(publicMetadataRow);
		const metadata = await generateInviteMetadata({
			params: Promise.resolve({
				slug: "lista-publica",
				guestSlug: "maria-garcia-private-token",
			}),
		});
		const htmlSafeMetadata = JSON.stringify(metadata);

		expect(metadata.alternates?.canonical).toBe(
			"http://localhost:4000/w/lista-publica",
		);
		expect(htmlSafeMetadata).not.toContain("maria-garcia-private-token");
		expect(htmlSafeMetadata).not.toContain("Maria Garcia");
		expect(htmlSafeMetadata).not.toContain("delivery");
		expect(htmlSafeMetadata).not.toContain("purchase");
	});

	it("does not advertise a draft through metadata", async () => {
		findUnique.mockResolvedValueOnce({
			...publicMetadataRow,
			status: "draft",
			title: "Borrador secreto",
		});
		const metadata = await generateWishlistMetadata({
			params: Promise.resolve({ slug: "borrador" }),
		});

		expect(metadata.title).toBe("Lista no encontrada");
		expect(metadata.openGraph).toBeUndefined();
	});
});
