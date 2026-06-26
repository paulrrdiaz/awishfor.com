import { describe, expect, it } from "vitest";
import {
	formatStoreDomain,
	resolveStoreDisplayName,
} from "@/lib/format/strings";

describe("formatStoreDomain", () => {
	it("strips www. and lowercases the hostname", () => {
		expect(formatStoreDomain("https://www.Amazon.com/dp/123")).toBe(
			"amazon.com",
		);
	});

	it("handles URLs without www.", () => {
		expect(formatStoreDomain("https://store.example.com/product")).toBe(
			"store.example.com",
		);
	});

	it("returns empty string for null", () => {
		expect(formatStoreDomain(null)).toBe("");
	});

	it("returns empty string for empty string", () => {
		expect(formatStoreDomain("")).toBe("");
	});

	it("returns empty string for invalid URL", () => {
		expect(formatStoreDomain("not-a-valid-url")).toBe("");
	});

	it("returns empty string for undefined", () => {
		expect(formatStoreDomain(undefined)).toBe("");
	});

	it("lowercases mixed-case domains", () => {
		expect(formatStoreDomain("https://WWW.EXAMPLE.COM/path")).toBe(
			"example.com",
		);
	});
});

describe("resolveStoreDisplayName", () => {
	it("returns the friendly name for a known store", () => {
		expect(
			resolveStoreDisplayName("https://falabella.com.pe/product/123"),
		).toBe("Falabella");
	});

	it("ignores www. prefix and still returns the friendly name", () => {
		expect(
			resolveStoreDisplayName("https://www.falabella.com.pe/product/123"),
		).toBe("Falabella");
	});

	it("falls back to the clean domain for an unknown store", () => {
		expect(
			resolveStoreDisplayName("https://www.unknownstore.com/item?id=1"),
		).toBe("unknownstore.com");
	});

	it("returns the friendly name for a Peru/LatAm store", () => {
		expect(resolveStoreDisplayName("https://mercadolibre.com.pe/item")).toBe(
			"Mercado Libre",
		);
	});

	it("returns the friendly name for an international store", () => {
		expect(resolveStoreDisplayName("https://amazon.com/dp/B08N5LNQCX")).toBe(
			"Amazon",
		);
	});

	it("returns empty string for empty input", () => {
		expect(resolveStoreDisplayName("")).toBe("");
	});

	it("returns empty string for null", () => {
		expect(resolveStoreDisplayName(null)).toBe("");
	});

	it("returns empty string for malformed URL", () => {
		expect(resolveStoreDisplayName("not-a-url")).toBe("");
	});
});
