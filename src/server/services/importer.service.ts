import type { ImportedGiftDraft } from "@/server/validators/importer.schema";

export const MAX_REDIRECTS = 5;
export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const FETCH_TIMEOUT_MS = 5_000;

export type ImportErrorKind =
	| "timeout"
	| "network"
	| "blocked_host"
	| "too_many_redirects"
	| "oversized"
	| "invalid_url";

export type ImportResult =
	| { ok: true; draft: ImportedGiftDraft }
	| { ok: false; error: { kind: ImportErrorKind } };

class ImportFetchError extends Error {
	constructor(public readonly kind: ImportErrorKind) {
		super(kind);
		this.name = "ImportFetchError";
	}
}

// --- Host safety ---

function isUnsafeHost(hostname: string): boolean {
	const h = hostname.toLowerCase().replace(/\.$/, "");

	if (h === "localhost") return true;

	// IPv4
	const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (v4) {
		const a = Number(v4[1]);
		const b = Number(v4[2]);
		if (a === 127) return true; // loopback
		if (a === 169 && b === 254) return true; // link-local + metadata
		if (a === 10) return true; // RFC-1918
		if (a === 172 && b >= 16 && b <= 31) return true; // RFC-1918
		if (a === 192 && b === 168) return true; // RFC-1918
		if (a === 0) return true; // unspecified
		return false;
	}

	// Strip IPv6 brackets
	const v6 = h.startsWith("[") && h.endsWith("]") ? h.slice(1, -1) : h;

	if (v6 === "::1") return true; // loopback

	// IPv4-mapped IPv6 in decimal form (::ffff:x.x.x.x)
	const v4mapped = v6.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
	if (v4mapped?.[1]) return isUnsafeHost(v4mapped[1]);

	// IPv4-mapped IPv6 in hex form (::ffff:xxxx:xxxx) — produced by URL parser
	const v4mappedHex = v6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
	if (v4mappedHex?.[1] && v4mappedHex?.[2]) {
		const high = Number.parseInt(v4mappedHex[1], 16);
		const low = Number.parseInt(v4mappedHex[2], 16);
		const syntheticIp = `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
		return isUnsafeHost(syntheticIp);
	}

	// Link-local fe80::/10 (fe80 – febf)
	if (/^fe[89ab]/i.test(v6)) return true;

	// Unique-local fc00::/7 (fc00 – fdff)
	if (/^f[cd]/i.test(v6)) return true;

	return false;
}

export function assertSafeUrl(url: string): void {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new ImportFetchError("invalid_url");
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new ImportFetchError("invalid_url");
	}

	if (isUnsafeHost(parsed.hostname)) {
		throw new ImportFetchError("blocked_host");
	}
}

// --- Hardened fetch ---

async function readBodyCapped(response: Response): Promise<string> {
	const reader = response.body?.getReader();
	if (!reader) return "";

	const chunks: Uint8Array[] = [];
	let totalBytes = 0;
	let oversized = false;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) {
				totalBytes += value.byteLength;
				chunks.push(value);
				if (totalBytes > MAX_BODY_BYTES) {
					oversized = true;
					break;
				}
			}
		}
	} finally {
		reader.cancel().catch(() => {});
	}

	if (oversized) {
		throw new ImportFetchError("oversized");
	}

	const decoder = new TextDecoder();
	return (
		chunks.map((c) => decoder.decode(c, { stream: true })).join("") +
		decoder.decode()
	);
}

type FetchFn = typeof globalThis.fetch;

async function safeFetch(
	url: string,
	fetchFn: FetchFn,
): Promise<{ html: string; finalUrl: string }> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	let currentUrl = url;
	let redirectCount = 0;

	try {
		while (true) {
			assertSafeUrl(currentUrl);

			const response = await fetchFn(currentUrl, {
				redirect: "manual",
				signal: controller.signal,
				headers: { "User-Agent": "awishfor-importer/1.0" },
			});

			if (response.status >= 300 && response.status < 400) {
				if (redirectCount >= MAX_REDIRECTS) {
					throw new ImportFetchError("too_many_redirects");
				}
				const location = response.headers.get("location");
				if (!location) throw new ImportFetchError("network");
				currentUrl = new URL(location, currentUrl).toString();
				redirectCount++;
				continue;
			}

			assertSafeUrl(currentUrl);
			const html = await readBodyCapped(response);
			return { html, finalUrl: currentUrl };
		}
	} finally {
		clearTimeout(timer);
	}
}

// --- Metadata extraction ---

type MetadataFields = {
	name?: string;
	imageUrl?: string;
	storeName?: string;
	priceAmount?: number;
	priceCurrency?: string;
};

type JsonLdProductCandidate = Record<string, unknown>;

function extractJsonLdImageUrl(image: unknown): string | undefined {
	if (typeof image === "string") return image;
	if (Array.isArray(image)) {
		for (const item of image) {
			const url = extractJsonLdImageUrl(item);
			if (url) return url;
		}
	}
	if (image && typeof image === "object") {
		const url = (image as Record<string, unknown>).url;
		if (typeof url === "string") return url;
	}
	return undefined;
}

function hasJsonLdType(
	value: unknown,
	expected: "Product" | "ProductGroup" | "AggregateOffer",
): boolean {
	if (typeof value === "string") return value === expected;
	if (Array.isArray(value)) return value.includes(expected);
	return false;
}

function withInheritedProductGroupFields(
	group: Record<string, unknown>,
	variant: unknown,
): JsonLdProductCandidate[] {
	if (!variant || typeof variant !== "object") return [];
	const variantObj = variant as Record<string, unknown>;
	return [
		{
			...group,
			...variantObj,
			name: variantObj.name ?? group.name,
			image: variantObj.image ?? group.image,
		},
	];
}

function findJsonLdProducts(data: unknown): JsonLdProductCandidate[] {
	if (!data || typeof data !== "object") return [];
	if (Array.isArray(data)) {
		return data.flatMap(findJsonLdProducts);
	}
	const obj = data as Record<string, unknown>;
	if (hasJsonLdType(obj["@type"], "Product")) return [obj];
	if (
		hasJsonLdType(obj["@type"], "ProductGroup") &&
		Array.isArray(obj.hasVariant)
	) {
		return obj.hasVariant.flatMap((variant) =>
			withInheritedProductGroupFields(obj, variant),
		);
	}
	if (Array.isArray(obj["@graph"])) {
		return obj["@graph"].flatMap(findJsonLdProducts);
	}
	return [];
}

function selectPrimaryOffer(
	offers: unknown,
): Record<string, unknown> | undefined {
	const first = Array.isArray(offers) ? offers[0] : offers;
	return first && typeof first === "object"
		? (first as Record<string, unknown>)
		: undefined;
}

function parseOfferPrice(offerObj: Record<string, unknown> | undefined): {
	priceAmount?: number;
	priceCurrency?: string;
} {
	if (!offerObj) return {};
	const rawPrice = hasJsonLdType(offerObj["@type"], "AggregateOffer")
		? (offerObj.price ?? offerObj.lowPrice)
		: offerObj.price;
	const priceAmount = rawPrice !== undefined ? Number(rawPrice) : undefined;
	return {
		priceAmount:
			priceAmount !== undefined && !Number.isNaN(priceAmount)
				? priceAmount
				: undefined,
		priceCurrency:
			typeof offerObj.priceCurrency === "string"
				? offerObj.priceCurrency
				: undefined,
	};
}

function urlMatchesVariantId(value: unknown, variantId: string): boolean {
	if (typeof value !== "string") return false;
	try {
		return new URL(value).searchParams.get("variant") === variantId;
	} catch {
		return value.includes(`variant=${variantId}`);
	}
}

function findMatchingVariantProduct(
	products: JsonLdProductCandidate[],
	variantId: string | null,
): JsonLdProductCandidate | undefined {
	if (!variantId) return undefined;
	return products.find((product) => {
		const offerObj = selectPrimaryOffer(product.offers);
		return (
			urlMatchesVariantId(product["@id"], variantId) ||
			urlMatchesVariantId(offerObj?.url, variantId)
		);
	});
}

function mapJsonLdProduct(product: JsonLdProductCandidate): MetadataFields {
	const name =
		typeof product.name === "string"
			? product.name.trim() || undefined
			: undefined;
	const imageUrl = extractJsonLdImageUrl(product.image);
	const { priceAmount, priceCurrency } = parseOfferPrice(
		selectPrimaryOffer(product.offers),
	);
	return {
		name,
		imageUrl,
		priceAmount,
		priceCurrency,
	};
}

export function extractJsonLd(
	html: string,
	sourceUrl?: string,
): MetadataFields {
	const scriptRe =
		/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
	const selectedVariantId = sourceUrl
		? new URL(sourceUrl).searchParams.get("variant")
		: null;
	for (const match of html.matchAll(scriptRe)) {
		try {
			const data: unknown = JSON.parse(match[1] ?? "");
			const products = findJsonLdProducts(data);
			const prioritizedProducts = [
				findMatchingVariantProduct(products, selectedVariantId),
				...products.filter((product) => {
					const { priceAmount } = parseOfferPrice(
						selectPrimaryOffer(product.offers),
					);
					return priceAmount !== undefined;
				}),
				...products,
			].filter((product): product is JsonLdProductCandidate =>
				Boolean(product),
			);
			for (const product of prioritizedProducts) {
				const metadata = mapJsonLdProduct(product);
				if (
					metadata.name ||
					metadata.imageUrl ||
					metadata.priceAmount !== undefined
				) {
					return metadata;
				}
			}
		} catch {
			// invalid JSON, try next script tag
		}
	}
	return {};
}

function parseMetaTag(tag: string): {
	property?: string;
	name?: string;
	content?: string;
} {
	const property = tag.match(/\bproperty\s*=\s*["']([^"']+)["']/i)?.[1];
	const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
	const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
	return { property, name, content };
}

export function extractOpenGraph(html: string): MetadataFields {
	const result: MetadataFields = {};
	for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
		const { property, content } = parseMetaTag(tag);
		if (!property || content === undefined) continue;
		if (property === "og:title" && !result.name) result.name = content;
		if (property === "og:image" && !result.imageUrl) result.imageUrl = content;
		if (property === "og:site_name" && !result.storeName)
			result.storeName = content;
		if (property === "og:price:amount" && result.priceAmount === undefined) {
			const priceAmount = Number(content);
			if (!Number.isNaN(priceAmount)) {
				result.priceAmount = priceAmount;
			}
		}
		if (property === "og:price:currency" && !result.priceCurrency) {
			result.priceCurrency = content;
		}
	}
	return result;
}

export function extractTwitterCard(html: string): MetadataFields {
	const result: MetadataFields = {};
	for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
		const { name, content } = parseMetaTag(tag);
		if (!name || content === undefined) continue;
		if (name === "twitter:title" && !result.name) result.name = content;
		if (name === "twitter:image" && !result.imageUrl) result.imageUrl = content;
	}
	return result;
}

export function extractTitle(html: string): string | undefined {
	const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	const raw = match?.[1]?.trim();
	return raw || undefined;
}

export function domainFromUrl(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function mergeMetadata(sources: MetadataFields[]): MetadataFields {
	const result: MetadataFields = {};
	for (const src of sources) {
		if (!result.name && src.name) result.name = src.name;
		if (!result.imageUrl && src.imageUrl) result.imageUrl = src.imageUrl;
		if (!result.storeName && src.storeName) result.storeName = src.storeName;
		if (result.priceAmount === undefined && src.priceAmount !== undefined)
			result.priceAmount = src.priceAmount;
		if (!result.priceCurrency && src.priceCurrency)
			result.priceCurrency = src.priceCurrency;
	}
	return result;
}

// --- Public API ---

export type ImporterDeps = {
	fetch?: FetchFn;
};

export async function importGiftFromUrl(
	deps: ImporterDeps,
	input: { url: string },
): Promise<ImportResult> {
	const fetchFn = deps.fetch ?? globalThis.fetch;

	try {
		const { html, finalUrl } = await safeFetch(input.url, fetchFn);

		const jsonLd = extractJsonLd(html, finalUrl);
		const og = extractOpenGraph(html);
		const twitter = extractTwitterCard(html);
		const title = extractTitle(html);
		const domain = domainFromUrl(finalUrl);

		const meta = mergeMetadata([
			jsonLd,
			og,
			twitter,
			{ name: title },
			{ storeName: domain },
		]);

		return {
			ok: true,
			draft: {
				name: meta.name,
				productUrl: finalUrl,
				imageUrl: meta.imageUrl,
				storeName: meta.storeName ?? domain,
				priceAmount: meta.priceAmount,
				priceCurrency: meta.priceCurrency,
			},
		};
	} catch (err) {
		if (err instanceof ImportFetchError) {
			return { ok: false, error: { kind: err.kind } };
		}
		if (
			(err instanceof DOMException && err.name === "AbortError") ||
			(err as { name?: string }).name === "AbortError"
		) {
			return { ok: false, error: { kind: "timeout" } };
		}
		return { ok: false, error: { kind: "network" } };
	}
}
