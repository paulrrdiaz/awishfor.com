import { describe, expect, it } from "vitest";
import { extractWishlistSlug } from "./slug-extract";

describe("extractWishlistSlug", () => {
	describe("full URL with /w/<slug>", () => {
		it("extracts slug from full https URL", () => {
			expect(
				extractWishlistSlug("https://awishfor.com/w/mi-lista-de-boda"),
			).toBe("mi-lista-de-boda");
		});

		it("extracts slug from URL with trailing path", () => {
			expect(extractWishlistSlug("https://awishfor.com/w/cumple123")).toBe(
				"cumple123",
			);
		});

		it("extracts slug from a bare path", () => {
			expect(extractWishlistSlug("/w/casa-nueva")).toBe("casa-nueva");
		});
	});

	describe("bare slug", () => {
		it("accepts a 3-char bare slug", () => {
			expect(extractWishlistSlug("abc")).toBe("abc");
		});

		it("accepts a typical bare slug", () => {
			expect(extractWishlistSlug("mi-lista")).toBe("mi-lista");
		});

		it("accepts a 60-char bare slug", () => {
			const slug = "a".repeat(60);
			expect(extractWishlistSlug(slug)).toBe(slug);
		});

		it("accepts slug with numbers", () => {
			expect(extractWishlistSlug("lista-2025")).toBe("lista-2025");
		});
	});

	describe("malformed input", () => {
		it("returns null for empty string", () => {
			expect(extractWishlistSlug("")).toBeNull();
		});

		it("returns null for a slug with leading hyphen", () => {
			expect(extractWishlistSlug("-mi-lista")).toBeNull();
		});

		it("returns null for a slug with trailing hyphen", () => {
			expect(extractWishlistSlug("mi-lista-")).toBeNull();
		});

		it("returns null for slug shorter than 3 chars", () => {
			expect(extractWishlistSlug("ab")).toBeNull();
		});

		it("returns null for slug longer than 60 chars", () => {
			expect(extractWishlistSlug("a".repeat(61))).toBeNull();
		});

		it("returns null for free-text name", () => {
			expect(extractWishlistSlug("María José")).toBeNull();
		});

		it("returns null for uppercase slug", () => {
			expect(extractWishlistSlug("Mi-Lista")).toBeNull();
		});

		it("returns null for URL without /w/ segment", () => {
			expect(extractWishlistSlug("https://awishfor.com/create")).toBeNull();
		});
	});
});
