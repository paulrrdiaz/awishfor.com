import { describe, expect, it } from "vitest";
import {
	deriveGuestSlug,
	isGuestSlugAvailable,
	isReservedGuestSlug,
} from "@/lib/wishlist/guest-slug";

describe("deriveGuestSlug", () => {
	it("derives a slug from a primary guest name", () => {
		expect(deriveGuestSlug("Pedro Castillo")).toBe("pedro-castillo");
	});

	it("strips accents and diacritics", () => {
		expect(deriveGuestSlug("José Andrés Pérez")).toBe("jose-andres-perez");
	});

	it("returns null for names that produce fewer than 3 usable characters", () => {
		expect(deriveGuestSlug("A")).toBeNull();
		expect(deriveGuestSlug("")).toBeNull();
	});
});

describe("isReservedGuestSlug", () => {
	it("rejects reserved segments", () => {
		expect(isReservedGuestSlug("rsvp")).toBe(true);
		expect(isReservedGuestSlug("edit")).toBe(true);
	});

	it("is case-insensitive", () => {
		expect(isReservedGuestSlug("RSVP")).toBe(true);
	});

	it("accepts non-reserved slugs", () => {
		expect(isReservedGuestSlug("pedro-castillo")).toBe(false);
	});
});

describe("isGuestSlugAvailable", () => {
	it("accepts a slug with no conflicts", () => {
		expect(isGuestSlugAvailable("pedro-castillo", ["ana-luis"])).toBe(true);
	});

	it("rejects a slug already taken by a sibling invite", () => {
		expect(
			isGuestSlugAvailable("pedro-castillo", ["ana-luis", "pedro-castillo"]),
		).toBe(false);
	});

	it("rejects a reserved slug even with no conflicting siblings", () => {
		expect(isGuestSlugAvailable("edit", [])).toBe(false);
	});
});
