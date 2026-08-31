import { describe, expect, it } from "vitest";
import { contextLineFor } from "./mobile-context-line";

describe("contextLineFor", () => {
	it("reads the wishlist's publication status on Regalos", () => {
		expect(
			contextLineFor({
				segment: "gifts",
				status: "published",
				totalGuests: 0,
				totalInvitations: 0,
			}),
		).toBe("Publicada");
	});

	it("reports guest and invitation counts on Invitados instead of status", () => {
		expect(
			contextLineFor({
				segment: "guests",
				status: "published",
				totalGuests: 4,
				totalInvitations: 4,
			}),
		).toBe("4 personas · 4 invitaciones");
	});

	it("uses singular forms for a single guest and invitation", () => {
		expect(
			contextLineFor({
				segment: "guests",
				status: "draft",
				totalGuests: 1,
				totalInvitations: 1,
			}),
		).toBe("1 persona · 1 invitación");
	});

	it("defaults to the wishlist status for a section with no declared context line", () => {
		expect(
			contextLineFor({
				segment: "",
				status: "draft",
				totalGuests: 4,
				totalInvitations: 4,
			}),
		).toBe("Borrador");
		expect(
			contextLineFor({
				segment: "design",
				status: "archived",
				totalGuests: 0,
				totalInvitations: 0,
			}),
		).toBe("Archivada");
	});
});
