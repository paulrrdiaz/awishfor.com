import { describe, expect, it } from "vitest";
import { isValidSlug, slugify } from "@/lib/slug";

describe("slugify", () => {
	it("converts a plain title to a slug", () => {
		expect(slugify("Lista de Boda")).toBe("lista-de-boda");
	});

	it("strips accents and diacritics", () => {
		expect(slugify("Cumpleaños de Ámbar")).toBe("cumpleanos-de-ambar");
	});

	it("replaces ampersands and special chars with hyphens", () => {
		expect(slugify("Lista de Boda de Ana & Luis")).toBe(
			"lista-de-boda-de-ana-luis",
		);
	});

	it("collapses multiple non-alphanumeric chars into a single hyphen", () => {
		expect(slugify("Hello   ---   World")).toBe("hello-world");
	});

	it("trims leading and trailing hyphens", () => {
		expect(slugify("  ---Fiesta---  ")).toBe("fiesta");
	});

	it("returns null when fewer than 3 usable characters", () => {
		expect(slugify("ab")).toBeNull();
		expect(slugify("a")).toBeNull();
		expect(slugify("")).toBeNull();
		expect(slugify("--")).toBeNull();
	});

	it("truncates to 60 characters without a trailing hyphen", () => {
		const longTitle = "a".repeat(100);
		const result = slugify(longTitle);
		expect(result).not.toBeNull();
		expect(result?.length).toBeLessThanOrEqual(60);
		expect(result).not.toMatch(/-$/);
	});

	it("handles titles that truncate mid-word gracefully", () => {
		const title = `${"palabra-".repeat(9)}extra`;
		const result = slugify(title);
		expect(result).not.toBeNull();
		expect(result?.length).toBeLessThanOrEqual(60);
		expect(result).not.toMatch(/-$/);
	});
});

describe("isValidSlug", () => {
	it("accepts a valid slug", () => {
		expect(isValidSlug("lista-de-boda")).toBe(true);
		expect(isValidSlug("abc")).toBe(true);
		expect(isValidSlug("a1b2c3")).toBe(true);
	});

	it("rejects slugs shorter than 3 characters", () => {
		expect(isValidSlug("ab")).toBe(false);
		expect(isValidSlug("a")).toBe(false);
	});

	it("rejects slugs longer than 60 characters", () => {
		expect(isValidSlug("a".repeat(61))).toBe(false);
	});

	it("rejects slugs with uppercase letters", () => {
		expect(isValidSlug("Lista-De-Boda")).toBe(false);
	});

	it("rejects slugs with spaces", () => {
		expect(isValidSlug("lista de boda")).toBe(false);
	});

	it("rejects slugs with a leading hyphen", () => {
		expect(isValidSlug("-lista-de-boda")).toBe(false);
	});

	it("rejects slugs with a trailing hyphen", () => {
		expect(isValidSlug("lista-de-boda-")).toBe(false);
	});

	it("rejects slugs with special characters", () => {
		expect(isValidSlug("lista_de_boda")).toBe(false);
		expect(isValidSlug("lista.de.boda")).toBe(false);
	});
});
