import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const findUnique = vi.hoisted(() => vi.fn());
const imageResponse = vi.hoisted(() => vi.fn());
const ImageResponseMock = vi.hoisted(
	() =>
		class ImageResponseMock {
			constructor(element: unknown, init: unknown) {
				imageResponse(element, init);
			}
		},
);

vi.mock("@/server/db", () => ({ db: { wishlist: { findUnique } } }));
vi.mock("next/og", () => ({ ImageResponse: ImageResponseMock }));

import OpenGraphImage, { contentType, size } from "./opengraph-image";

const publishedRow = {
	id: "wishlist_1",
	status: "published",
	slug: "lista-publica",
	title: "Lista pública",
	welcomeMessage: "Bienvenidos",
	eventType: "wedding",
	themeId: "crema-elegante",
	images: [
		{ url: "https://cdn.example/first-cover.png", width: 1200, height: 630 },
	],
};

describe("public Open Graph image", () => {
	it("renders the fixed branded image from the first safe cover", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response(new Uint8Array([1, 2, 3]), {
						headers: { "content-type": "image/png", "content-length": "3" },
						status: 200,
					}),
			),
		);

		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});
		expect(imageResponse).toHaveBeenCalledWith(expect.anything(), size);
		expect(JSON.stringify(imageResponse.mock.calls[0]?.[0])).toContain(
			"first-cover.png",
		);
		expect(contentType).toBe("image/png");
	});

	it("uses a branded fallback when the cover cannot be read", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 500 })),
		);

		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});
		expect(JSON.stringify(imageResponse.mock.calls[1]?.[0])).not.toContain(
			"first-cover.png",
		);
		expect(JSON.stringify(imageResponse.mock.calls[1]?.[0])).toContain(
			"A Wish For",
		);
	});

	it("returns not-found for non-public and unknown lifecycle states", async () => {
		for (const row of [
			{ ...publishedRow, status: "draft" },
			{ ...publishedRow, status: "archived" },
			null,
		]) {
			findUnique.mockResolvedValueOnce(row);
			const response = await OpenGraphImage({
				params: Promise.resolve({ slug: "inaccesible" }),
			});
			expect(response).toBeInstanceOf(Response);
			expect((response as Response).status).toBe(404);
		}
	});

	it("never receives personalized or owner-only values", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 500 })),
		);
		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		const rendered = JSON.stringify(imageResponse.mock.calls[2]?.[0]);
		expect(rendered).not.toContain("guest-slug");
		expect(rendered).not.toContain("delivery");
		expect(rendered).not.toContain("purchase");
	});

	it("escapes user-controlled title text", async () => {
		findUnique.mockResolvedValueOnce({
			...publishedRow,
			title: '<script>alert("not executable")</script>',
		});
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 500 })),
		);
		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		const markup = renderToStaticMarkup(imageResponse.mock.calls[3]?.[0]);
		expect(markup).toContain("&lt;script&gt;");
		expect(markup).not.toContain("<script>");
	});
});
