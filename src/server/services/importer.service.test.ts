import { describe, expect, it, vi } from "vitest";
import {
	assertSafeUrl,
	domainFromUrl,
	extractJsonLd,
	extractOpenGraph,
	extractTitle,
	extractTwitterCard,
	importGiftFromUrl,
	MAX_BODY_BYTES,
	MAX_REDIRECTS,
} from "@/server/services/importer.service";
import {
	HTML_EMPTY,
	HTML_WITH_JSON_LD,
	HTML_WITH_JSON_LD_AGGREGATE_OFFER,
	HTML_WITH_JSON_LD_GRAPH,
	HTML_WITH_JSON_LD_PRODUCT_GROUP,
	HTML_WITH_MIXED_META_ORDER,
	HTML_WITH_OG_ONLY,
	HTML_WITH_OG_PRICE,
	HTML_WITH_TITLE_ONLY,
	HTML_WITH_TWITTER_ONLY,
} from "@/test/fixtures/importer-html-fixtures";

// --- URL safety ---

describe("assertSafeUrl", () => {
	it("accepts a public https URL", () => {
		expect(() => assertSafeUrl("https://example.com/product")).not.toThrow();
	});

	it("accepts a public http URL", () => {
		expect(() => assertSafeUrl("http://shop.example.com/item")).not.toThrow();
	});

	it("rejects a file: scheme", () => {
		expect(() => assertSafeUrl("file:///etc/passwd")).toThrow();
	});

	it("rejects an ftp: scheme", () => {
		expect(() => assertSafeUrl("ftp://example.com/file")).toThrow();
	});

	it("rejects localhost", () => {
		expect(() => assertSafeUrl("http://localhost/admin")).toThrow();
	});

	it("rejects loopback 127.0.0.1", () => {
		expect(() => assertSafeUrl("http://127.0.0.1/secret")).toThrow();
	});

	it("rejects metadata endpoint 169.254.169.254", () => {
		expect(() =>
			assertSafeUrl("http://169.254.169.254/latest/meta-data"),
		).toThrow();
	});

	it("rejects link-local 169.254.x.x", () => {
		expect(() => assertSafeUrl("http://169.254.0.1/")).toThrow();
	});

	it("rejects RFC-1918 10.x.x.x", () => {
		expect(() => assertSafeUrl("http://10.0.0.1/internal")).toThrow();
	});

	it("rejects RFC-1918 172.16.x.x", () => {
		expect(() => assertSafeUrl("http://172.16.0.1/internal")).toThrow();
	});

	it("rejects RFC-1918 172.31.x.x", () => {
		expect(() => assertSafeUrl("http://172.31.255.255/")).toThrow();
	});

	it("accepts 172.15.x.x (not RFC-1918)", () => {
		expect(() => assertSafeUrl("http://172.15.0.1/")).not.toThrow();
	});

	it("rejects RFC-1918 192.168.x.x", () => {
		expect(() => assertSafeUrl("http://192.168.1.1/router")).toThrow();
	});

	it("rejects IPv6 loopback ::1", () => {
		expect(() => assertSafeUrl("http://[::1]/")).toThrow();
	});

	it("rejects IPv4-mapped IPv6 for private address", () => {
		expect(() => assertSafeUrl("http://[::ffff:192.168.1.1]/")).toThrow();
	});

	it("rejects IPv6 link-local fe80::", () => {
		expect(() => assertSafeUrl("http://[fe80::1]/")).toThrow();
	});

	it("rejects IPv6 unique-local fc00::", () => {
		expect(() => assertSafeUrl("http://[fc00::1]/")).toThrow();
	});

	it("rejects IPv6 unique-local fd00::", () => {
		expect(() => assertSafeUrl("http://[fd00::1]/")).toThrow();
	});
});

// --- Metadata extraction ---

describe("extractJsonLd", () => {
	it("extracts name, imageUrl, priceAmount, priceCurrency from a Product", () => {
		const result = extractJsonLd(HTML_WITH_JSON_LD);
		expect(result).toMatchObject({
			name: "Fancy Mug",
			imageUrl: "https://cdn.example.com/mug.jpg",
			priceAmount: 24.99,
			priceCurrency: "USD",
		});
	});

	it("extracts from a Product inside @graph", () => {
		const result = extractJsonLd(HTML_WITH_JSON_LD_GRAPH);
		expect(result).toMatchObject({
			name: "Graph Widget",
			imageUrl: "https://cdn.example.com/widget.jpg",
			priceAmount: 9.99,
			priceCurrency: "EUR",
		});
	});

	it("returns empty object when no JSON-LD is present", () => {
		expect(extractJsonLd(HTML_WITH_OG_ONLY)).toEqual({});
	});

	it("resolves the matching variant price when a variant query param is passed", () => {
		const result = extractJsonLd(
			HTML_WITH_JSON_LD_PRODUCT_GROUP,
			"https://infanti.com.pe/products/b-005s-silla-de-comer-feed?variant=50394283770156",
		);
		expect(result).toMatchObject({
			name: "Feed High Chair Pink",
			imageUrl: "https://cdn.example.com/feed-chair.jpg",
			priceAmount: 279.2,
			priceCurrency: "PEN",
		});
	});

	it("falls back to the first priced variant when no variant matches", () => {
		const result = extractJsonLd(
			HTML_WITH_JSON_LD_PRODUCT_GROUP,
			"https://infanti.com.pe/products/b-005s-silla-de-comer-feed?variant=99999999999999",
		);
		expect(result).toMatchObject({
			name: "Feed High Chair Blue",
			imageUrl: "https://cdn.example.com/feed-chair.jpg",
			priceAmount: 244.3,
			priceCurrency: "PEN",
		});
	});

	it("reads AggregateOffer lowPrice when no single Offer price exists", () => {
		const result = extractJsonLd(HTML_WITH_JSON_LD_AGGREGATE_OFFER);
		expect(result).toMatchObject({
			name: "Bundle Pack",
			imageUrl: "https://cdn.example.com/bundle.jpg",
			priceAmount: 18.5,
			priceCurrency: "USD",
		});
	});
});

describe("extractOpenGraph", () => {
	it("extracts og:title, og:image, og:site_name", () => {
		const result = extractOpenGraph(HTML_WITH_OG_ONLY);
		expect(result).toMatchObject({
			name: "Blue Sneakers",
			imageUrl: "https://cdn.example.com/sneakers.jpg",
			storeName: "Sneaker Store",
		});
	});

	it("handles reversed attribute order", () => {
		const result = extractOpenGraph(HTML_WITH_MIXED_META_ORDER);
		expect(result.name).toBe("Reversed Attrs Product");
		expect(result.imageUrl).toBe("https://cdn.example.com/rev.jpg");
	});

	it("does not extract JSON-LD name as OG", () => {
		const result = extractOpenGraph(HTML_WITH_JSON_LD);
		expect(result.name).toBe("OG Mug Title");
	});

	it("returns empty object when no OG tags present", () => {
		expect(extractOpenGraph(HTML_WITH_TITLE_ONLY)).toEqual({});
	});

	it("extracts og:price:amount and og:price:currency", () => {
		const result = extractOpenGraph(HTML_WITH_OG_PRICE);
		expect(result).toMatchObject({
			name: "Price Tag Item",
			imageUrl: "https://cdn.example.com/price-tag.jpg",
			priceAmount: 49.5,
			priceCurrency: "USD",
		});
	});
});

describe("extractTwitterCard", () => {
	it("extracts twitter:title and twitter:image", () => {
		const result = extractTwitterCard(HTML_WITH_TWITTER_ONLY);
		expect(result).toMatchObject({
			name: "Red Hat",
			imageUrl: "https://cdn.example.com/hat.jpg",
		});
	});

	it("returns empty object when no Twitter tags present", () => {
		expect(extractTwitterCard(HTML_WITH_TITLE_ONLY)).toEqual({});
	});
});

describe("extractTitle", () => {
	it("extracts the title text", () => {
		expect(extractTitle(HTML_WITH_TITLE_ONLY)).toBe("Cool Gadget");
	});

	it("returns undefined when no title is present", () => {
		expect(extractTitle(HTML_EMPTY)).toBeUndefined();
	});
});

// --- Priority chain ---

describe("importGiftFromUrl metadata priority chain", () => {
	const makeOkFetch = (html: string) =>
		vi.fn().mockResolvedValue(
			new Response(html, {
				status: 200,
				headers: { "content-type": "text/html" },
			}),
		);

	it("JSON-LD values take priority over OG", async () => {
		const result = await importGiftFromUrl(
			{ fetch: makeOkFetch(HTML_WITH_JSON_LD) },
			{ url: "https://example.com/product" },
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.name).toBe("Fancy Mug");
		expect(result.draft.imageUrl).toBe("https://cdn.example.com/mug.jpg");
		expect(result.draft.priceAmount).toBe(24.99);
		expect(result.draft.priceCurrency).toBe("USD");
	});

	it("falls back to OG when JSON-LD absent", async () => {
		const result = await importGiftFromUrl(
			{ fetch: makeOkFetch(HTML_WITH_OG_ONLY) },
			{ url: "https://example.com/product" },
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.name).toBe("Blue Sneakers");
		expect(result.draft.storeName).toBe("Sneaker Store");
	});

	it("falls back to Twitter Card when OG absent", async () => {
		const result = await importGiftFromUrl(
			{ fetch: makeOkFetch(HTML_WITH_TWITTER_ONLY) },
			{ url: "https://example.com/product" },
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.name).toBe("Red Hat");
	});

	it("falls back to <title> when no structured meta", async () => {
		const result = await importGiftFromUrl(
			{ fetch: makeOkFetch(HTML_WITH_TITLE_ONLY) },
			{ url: "https://example.com/product" },
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.name).toBe("Cool Gadget");
	});

	it("uses domain as store name fallback when no store name in metadata", async () => {
		const result = await importGiftFromUrl(
			{ fetch: makeOkFetch(HTML_WITH_TITLE_ONLY) },
			{ url: "https://www.example.com/product" },
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.storeName).toBe("example.com");
	});

	it("uses the URL-selected ProductGroup variant price end to end", async () => {
		const result = await importGiftFromUrl(
			{ fetch: makeOkFetch(HTML_WITH_JSON_LD_PRODUCT_GROUP) },
			{
				url: "https://infanti.com.pe/products/b-005s-silla-de-comer-feed?variant=50394283770156",
			},
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.productUrl).toBe(
			"https://infanti.com.pe/products/b-005s-silla-de-comer-feed?variant=50394283770156",
		);
		expect(result.draft.priceAmount).toBe(279.2);
		expect(result.draft.priceCurrency).toBe("PEN");
	});
});

// --- Sparse draft ---

describe("importGiftFromUrl sparse draft", () => {
	it("returns at minimum the source URL and domain store name for empty HTML", async () => {
		const fetchFn = vi
			.fn()
			.mockResolvedValue(new Response(HTML_EMPTY, { status: 200 }));
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "https://minimal.example.com/item" },
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.draft.productUrl).toBe("https://minimal.example.com/item");
		expect(result.draft.storeName).toBe("minimal.example.com");
		expect(result.draft.name).toBeUndefined();
		expect(result.draft.imageUrl).toBeUndefined();
	});
});

// --- Hardened fetch ---

describe("importGiftFromUrl hardened fetch", () => {
	it("returns timeout error when fetch is aborted", async () => {
		const fetchFn = vi.fn().mockImplementation(() => {
			const err = new DOMException("The operation was aborted", "AbortError");
			return Promise.reject(err);
		});
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "https://slow.example.com/" },
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.kind).toBe("timeout");
	});

	it("returns too_many_redirects when redirect cap exceeded", async () => {
		let callCount = 0;
		const fetchFn = vi.fn().mockImplementation(() => {
			callCount++;
			return Promise.resolve(
				new Response(null, {
					status: 302,
					headers: { location: `https://example.com/redirect-${callCount}` },
				}),
			);
		});
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "https://example.com/start" },
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.kind).toBe("too_many_redirects");
		expect(callCount).toBe(MAX_REDIRECTS + 1);
	});

	it("returns blocked_host when redirect points to a private IP", async () => {
		const fetchFn = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(null, {
					status: 301,
					headers: { location: "http://192.168.1.1/secret" },
				}),
			)
			.mockResolvedValue(new Response("internal", { status: 200 }));
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "https://example.com/redir" },
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.kind).toBe("blocked_host");
	});

	it("returns oversized error when body exceeds cap", async () => {
		const bigBody = "x".repeat(MAX_BODY_BYTES + 1);
		const fetchFn = vi
			.fn()
			.mockResolvedValue(new Response(bigBody, { status: 200 }));
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "https://example.com/huge" },
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.kind).toBe("oversized");
	});

	it("returns network error on generic fetch failure", async () => {
		const fetchFn = vi.fn().mockRejectedValue(new Error("Connection refused"));
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "https://example.com/down" },
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.kind).toBe("network");
	});

	it("returns blocked_host for a blocked URL without fetch", async () => {
		const fetchFn = vi.fn();
		const result = await importGiftFromUrl(
			{ fetch: fetchFn },
			{ url: "http://192.168.0.1/" },
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.kind).toBe("blocked_host");
		expect(fetchFn).not.toHaveBeenCalled();
	});
});

// --- domainFromUrl ---

describe("domainFromUrl", () => {
	it("strips www prefix", () => {
		expect(domainFromUrl("https://www.example.com/path")).toBe("example.com");
	});

	it("returns hostname without www for non-www URLs", () => {
		expect(domainFromUrl("https://shop.example.com/")).toBe("shop.example.com");
	});
});
