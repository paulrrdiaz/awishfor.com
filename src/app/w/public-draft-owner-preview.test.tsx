import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const cookiesMock = vi.hoisted(() => vi.fn());
const getPublicWishlistBySlugMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/server/db", () => ({ db: {} }));
vi.mock("@/server/services/public-wishlist.service", () => ({
	getPublicWishlistBySlug: getPublicWishlistBySlugMock,
}));
vi.mock("@/server/services/public-wishlist-metadata.service", () => ({
	getPublishedWishlistMetadata: vi.fn(),
}));
vi.mock("@/components/layouts/public-wishlist/public-wishlist-page", () => ({
	PublicWishlistPage: () => null,
}));

import WishlistSlugPage from "./[slug]/page";

describe("public draft owner preview", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		cookiesMock.mockResolvedValue({
			getAll: () => [{ name: "__session", value: "signed-in" }],
		});
	});

	it("uses server Clerk auth without a public ClerkProvider", async () => {
		authMock.mockResolvedValue({ userId: "clerk_owner" });
		getPublicWishlistBySlugMock
			.mockResolvedValueOnce({ kind: "notFound" })
			.mockResolvedValueOnce({
				kind: "preview",
				wishlist: { id: "wishlist_1", slug: "draft-list" },
			});

		const page = (await WishlistSlugPage({
			params: Promise.resolve({ slug: "draft-list" }),
		})) as ReactElement<{ mode: string }>;

		expect(getPublicWishlistBySlugMock).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			{ slug: "draft-list", viewerClerkId: null },
		);
		expect(getPublicWishlistBySlugMock).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			{ slug: "draft-list", viewerClerkId: "clerk_owner" },
		);
		expect(page.props.mode).toBe("preview");
	});

	it("does not initialize Clerk for an anonymous published page", async () => {
		getPublicWishlistBySlugMock.mockResolvedValue({
			kind: "published",
			wishlist: { id: "wishlist_1", slug: "published-list" },
		});

		await WishlistSlugPage({
			params: Promise.resolve({ slug: "published-list" }),
		});

		expect(authMock).not.toHaveBeenCalled();
		expect(cookiesMock).not.toHaveBeenCalled();
		expect(getPublicWishlistBySlugMock).toHaveBeenCalledOnce();
	});
});
