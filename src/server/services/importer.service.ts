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

function findJsonLdProducts(data: unknown): unknown[] {
	if (!data || typeof data !== "object") return [];
	if (Array.isArray(data)) {
		return data.flatMap(findJsonLdProducts);
	}
	const obj = data as Record<string, unknown>;
	if (obj["@type"] === "Product") return [obj];
	if (Array.isArray(obj["@graph"])) {
		return obj["@graph"].flatMap(findJsonLdProducts);
	}
	return [];
}

export function extractJsonLd(html: string): MetadataFields {
	const scriptRe =
		/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
	for (const match of html.matchAll(scriptRe)) {
		try {
			const data: unknown = JSON.parse(match[1] ?? "");
			const products = findJsonLdProducts(data);
			for (const product of products) {
				const p = product as Record<string, unknown>;
				const name =
					typeof p.name === "string" ? p.name.trim() || undefined : undefined;
				const imageUrl = extractJsonLdImageUrl(p.image);
				const offers = Array.isArray(p.offers) ? p.offers[0] : p.offers;
				const offerObj =
					offers && typeof offers === "object"
						? (offers as Record<string, unknown>)
						: undefined;
				const priceRaw = offerObj?.price;
				const priceAmount =
					priceRaw !== undefined ? Number(priceRaw) : undefined;
				const priceCurrency =
					typeof offerObj?.priceCurrency === "string"
						? offerObj.priceCurrency
						: undefined;
				if (name || imageUrl || priceAmount !== undefined) {
					return {
						name,
						imageUrl,
						priceAmount:
							priceAmount !== undefined && !Number.isNaN(priceAmount)
								? priceAmount
								: undefined,
						priceCurrency,
					};
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

		const jsonLd = extractJsonLd(html);
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
