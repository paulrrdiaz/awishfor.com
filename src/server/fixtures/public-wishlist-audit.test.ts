import { afterEach, describe, expect, it } from "vitest";
import {
	getPublicWishlistAuditFixture,
	getPublicWishlistAuditGuest,
	getPublicWishlistAuditSeatingPass,
	PUBLIC_WISHLIST_AUDIT_GUEST_SLUG,
	PUBLIC_WISHLIST_AUDIT_MODE_ENV,
	PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG,
	PUBLIC_WISHLIST_AUDIT_SLUGS,
} from "./public-wishlist-audit";

describe("public wishlist audit fixtures", () => {
	afterEach(() => {
		delete process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV];
	});

	it("reserves fixture slugs as unavailable in normal runtime", () => {
		expect(
			getPublicWishlistAuditFixture(PUBLIC_WISHLIST_AUDIT_SLUGS.light),
		).toBeNull();
		expect(
			getPublicWishlistAuditFixture(PUBLIC_WISHLIST_AUDIT_SLUGS.heavy),
		).toBeNull();
	});

	it("exposes deterministic light and heavy fixtures only in audit mode", () => {
		process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV] = "1";
		const light = getPublicWishlistAuditFixture(
			PUBLIC_WISHLIST_AUDIT_SLUGS.light,
		);
		const heavy = getPublicWishlistAuditFixture(
			PUBLIC_WISHLIST_AUDIT_SLUGS.heavy,
		);

		expect(light?.gifts).toHaveLength(8);
		expect(heavy?.gifts).toHaveLength(24);
		expect(light?.images.every((image) => image.url.startsWith("/"))).toBe(
			true,
		);
		expect(heavy?.images.every((image) => image.url.startsWith("/"))).toBe(
			true,
		);
		expect(
			getPublicWishlistAuditGuest(
				light?.id ?? "missing",
				PUBLIC_WISHLIST_AUDIT_GUEST_SLUG,
			),
		).toMatchObject({ primaryName: "Invitada de auditoría" });
	});

	it("exposes a confirmed, seated guest with an in-window seating pass", () => {
		process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV] = "1";
		const light = getPublicWishlistAuditFixture(
			PUBLIC_WISHLIST_AUDIT_SLUGS.light,
		);
		expect(
			getPublicWishlistAuditGuest(
				light?.id ?? "missing",
				PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG,
			),
		).toMatchObject({ status: "confirmed", primaryName: "Lady Díaz" });
		const pass = getPublicWishlistAuditSeatingPass(
			PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG,
		);
		expect(pass?.headline.label).toBe("Mesa 4");
		expect(pass?.daysAway).toBe(4);
		expect(pass?.tables[0]?.mates).toEqual(["Ana R."]);
		expect(
			getPublicWishlistAuditSeatingPass(PUBLIC_WISHLIST_AUDIT_GUEST_SLUG),
		).toBeNull();
	});

	it("does not intercept ordinary wishlist slugs", () => {
		expect(getPublicWishlistAuditFixture("real-wishlist")).toBeUndefined();
	});
});
