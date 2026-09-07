import { describe, expect, it } from "vitest";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import { getConfirmedGuestsRoster } from "./confirmed-guests-roster";

function makeInvite(
	overrides: Partial<DashboardInviteViewModel> & { id: string },
): DashboardInviteViewModel {
	return {
		id: overrides.id,
		wishlistId: "wishlist_1",
		primaryName: overrides.primaryName ?? `Guest ${overrides.id}`,
		primaryEmail: overrides.primaryEmail ?? "guest@example.com",
		primaryPhone: overrides.primaryPhone ?? "+51 999 123 456",
		slug: overrides.slug ?? overrides.id,
		status: overrides.status ?? "pending",
		partySize: overrides.partySize ?? 1,
		extraGuests: overrides.extraGuests ?? [],
		openedAt: null,
		respondedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	};
}

describe("getConfirmedGuestsRoster", () => {
	it("counts individual confirmations and keeps mixed primary and companion responses", () => {
		const roster = getConfirmedGuestsRoster(
			[
				makeInvite({
					id: "maria",
					primaryName: "María López",
					status: "confirmed",
					partySize: 3,
					extraGuests: [
						{ id: "carlos", name: "Carlos", status: "confirmed" },
						{ id: "ana", name: "Ana", status: "declined" },
					],
				}),
				makeInvite({
					id: "diego",
					primaryName: "Diego Ramos",
					status: "pending",
					extraGuests: [{ id: "sofia", name: "Sofía", status: "confirmed" }],
				}),
			],
			"Boda de María y Luis",
		);

		expect(roster.confirmedGuests).toBe(3);
		expect(roster.text).toContain("3 personas confirmadas");
		expect(roster.text).toContain("- María López y Carlos");
		expect(roster.text).toContain("- Sofía (acompañante de Diego Ramos)");
		expect(roster.text).not.toContain("- Ana");
	});

	it("uses Spanish singular and plural labels", () => {
		expect(getConfirmedGuestsRoster([], "Cena").text).toContain(
			"0 personas confirmadas",
		);
		expect(
			getConfirmedGuestsRoster(
				[
					makeInvite({
						id: "ana",
						primaryName: "Ana",
						status: "confirmed",
					}),
				],
				"Cena",
			).text,
		).toContain("1 persona confirmada");
	});

	it("groups parties alphabetically without repeating the primary guest", () => {
		const roster = getConfirmedGuestsRoster(
			[
				makeInvite({
					id: "zoe",
					primaryName: "Zoé Álvarez",
					status: "confirmed",
					extraGuests: [{ id: "zoe-extra", name: null, status: "confirmed" }],
				}),
				makeInvite({
					id: "ana-one",
					primaryName: "Ana Núñez",
					status: "confirmed",
				}),
				makeInvite({
					id: "ana-two",
					primaryName: "Ana Núñez",
					status: "confirmed",
				}),
			],
			"Celebración",
		);

		expect(roster.text).toContain("- Zoé Álvarez + 1");
		expect(roster.text.indexOf("Ana Núñez")).toBeLessThan(
			roster.text.indexOf("Zoé Álvarez"),
		);
		expect(roster.text.match(/- Ana Núñez/g)).toHaveLength(2);
		expect(roster.text).not.toContain("\nZoé Álvarez\n");
	});

	it("keeps private contact and invitation data out of the plain-text roster", () => {
		const roster = getConfirmedGuestsRoster(
			[
				makeInvite({
					id: "ana",
					primaryName: "Ana",
					primaryEmail: "ana@example.com",
					primaryPhone: "+51 999 123 456",
					slug: "ana-private-link",
					status: "confirmed",
				}),
			],
			"Lista privada",
		);

		expect(roster.text).not.toContain("ana@example.com");
		expect(roster.text).not.toContain("999 123 456");
		expect(roster.text).not.toContain("ana-private-link");
	});
});
