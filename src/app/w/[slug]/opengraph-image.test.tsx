import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.hoisted(() => vi.fn());
const imageResponse = vi.hoisted(() => vi.fn());
const encodeSocialImage = vi.hoisted(() =>
	vi.fn(async () => Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
);
const arrayBufferMock = vi.hoisted(() =>
	vi.fn(async () => new Uint8Array([1, 2, 3]).buffer),
);
const ImageResponseMock = vi.hoisted(
	() =>
		class ImageResponseMock {
			status = 200;
			headers = new Headers({ "content-type": "image/png" });
			#element: unknown;
			constructor(element: unknown, init: unknown) {
				this.#element = element;
				imageResponse(element, init);
			}
			async arrayBuffer() {
				return arrayBufferMock();
			}
			get element() {
				return this.#element;
			}
		},
);

vi.mock("@/server/db", () => ({ db: { wishlist: { findUnique } } }));
vi.mock("next/og", () => ({ ImageResponse: ImageResponseMock }));
vi.mock("@/lib/wishlist/social-image-jpeg", () => ({ encodeSocialImage }));

import OpenGraphImage, { contentType, size } from "./opengraph-image";

const publishedRow = {
	id: "wishlist_1",
	status: "published",
	slug: "lista-publica",
	title: "Lista pública",
	welcomeMessage: "Bienvenidos",
	eventType: "wedding",
	eventDate: new Date("2027-06-26T00:00:00.000Z"),
	language: "es",
	themeId: "crema-elegante",
	images: [
		{ url: "https://cdn.example/first-cover.png", width: 1200, height: 630 },
	],
};

function stubFetch(handler: (input: unknown, init?: RequestInit) => Response) {
	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: unknown, init?: RequestInit) => handler(input, init)),
	);
}

function renderedMarkup(callIndex: number) {
	return renderToStaticMarkup(
		imageResponse.mock.calls[callIndex]?.[0] as Parameters<
			typeof renderToStaticMarkup
		>[0],
	);
}

afterEach(() => {
	imageResponse.mockClear();
	arrayBufferMock.mockClear();
	encodeSocialImage.mockClear();
	findUnique.mockReset();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("public Open Graph image", () => {
	it("renders the hero composition when the cover image is reachable", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		stubFetch(() => new Response(null, { status: 200 }));

		const response = await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		expect(response).toBeInstanceOf(Response);
		expect(imageResponse).toHaveBeenCalledWith(expect.anything(), size);
		expect(renderedMarkup(0)).toContain("first-cover.png");
		expect(contentType).toBe("image/jpeg");
		expect(response.headers.get("content-type")).toBe("image/jpeg");
		expect(response.headers.get("content-length")).toBe("4");
		expect(encodeSocialImage).toHaveBeenCalledTimes(1);
	});

	it("uses the branded fallback when the wishlist has no cover image", async () => {
		findUnique.mockResolvedValueOnce({ ...publishedRow, images: [] });
		stubFetch(() => new Response(null, { status: 200 }));

		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		expect(renderedMarkup(0)).not.toContain("first-cover.png");
		expect(renderedMarkup(0)).toContain("A Wish For");
	});

	it("uses the branded fallback when the cover image HEAD check fails", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		stubFetch(() => new Response(null, { status: 404 }));

		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		expect(imageResponse).toHaveBeenCalledTimes(1);
		expect(renderedMarkup(0)).not.toContain("first-cover.png");
		expect(renderedMarkup(0)).toContain("A Wish For");
	});

	it("uses the branded fallback when the hero render throws", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		stubFetch(() => new Response(null, { status: 200 }));
		imageResponse.mockImplementationOnce(() => {
			throw new Error("render failed");
		});

		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		expect(imageResponse).toHaveBeenCalledTimes(2);
		expect(renderedMarkup(1)).not.toContain("first-cover.png");
		expect(renderedMarkup(1)).toContain("A Wish For");
	});

	it("surfaces JPEG encoding failures for the fallback composition", async () => {
		findUnique.mockResolvedValueOnce({ ...publishedRow, images: [] });
		encodeSocialImage.mockRejectedValueOnce(new Error("encoder failed"));

		await expect(
			OpenGraphImage({
				params: Promise.resolve({ slug: "lista-publica" }),
			}),
		).rejects.toThrow("encoder failed");
	});

	it("uses the branded fallback when the hero render hangs past the timeout", async () => {
		findUnique.mockResolvedValueOnce(publishedRow);
		stubFetch(() => new Response(null, { status: 200 }));
		arrayBufferMock.mockImplementationOnce(() => new Promise(() => {}));

		vi.useFakeTimers();
		const resultPromise = OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});
		await vi.advanceTimersByTimeAsync(5_000);
		await resultPromise;
		vi.useRealTimers();

		expect(imageResponse).toHaveBeenCalledTimes(2);
		expect(renderedMarkup(1)).not.toContain("first-cover.png");
		expect(renderedMarkup(1)).toContain("A Wish For");
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
		stubFetch(() => new Response(null, { status: 200 }));
		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		const rendered = renderedMarkup(0);
		expect(rendered).not.toContain("guest-slug");
		expect(rendered).not.toContain("delivery");
		expect(rendered).not.toContain("purchase");
	});

	it("escapes user-controlled title text", async () => {
		findUnique.mockResolvedValueOnce({
			...publishedRow,
			title: '<script>alert("not executable")</script>',
		});
		stubFetch(() => new Response(null, { status: 200 }));
		await OpenGraphImage({
			params: Promise.resolve({ slug: "lista-publica" }),
		});

		const markup = renderedMarkup(0);
		expect(markup).toContain("&lt;script&gt;");
		expect(markup).not.toContain("<script>");
	});
});
