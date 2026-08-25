import { describe, expect, it } from "vitest";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import {
	countDashboardInvitesByStatus,
	filterDashboardInvites,
	normalizeGuestPhone,
	normalizeGuestSearchText,
} from "./guest-filters";

function makeInvite(
	overrides: Partial<DashboardInviteViewModel> & { id: string },
): DashboardInviteViewModel {
	return {
		id: overrides.id,
		wishlistId: "wishlist_1",
		primaryName: overrides.primaryName ?? `Guest ${overrides.id}`,
		primaryEmail: overrides.primaryEmail ?? null,
		primaryPhone: overrides.primaryPhone ?? null,
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

const invites = [
	makeInvite({
		id: "maria",
		primaryName: "María López",
		primaryEmail: "maria@example.com",
		primaryPhone: "+51 (999) 123-456",
		status: "confirmed",
		extraGuests: [{ id: "extra_1", name: "José Pérez", status: "confirmed" }],
	}),
	makeInvite({
		id: "ana",
		primaryName: "Ana Castillo",
		primaryEmail: "ana@example.com",
		status: "pending",
	}),
	makeInvite({
		id: "diego",
		primaryName: "Diego Ramos",
		status: "declined",
	}),
];

describe("guest search normalization", () => {
	it("normalizes case, surrounding whitespace, and accents", () => {
		expect(normalizeGuestSearchText("  MARÍA  ")).toBe("maria");
	});

	it("normalizes formatted phone values to digits", () => {
		expect(normalizeGuestPhone("+51 (999) 123-456")).toBe("51999123456");
	});
});

describe("filterDashboardInvites", () => {
	it("matches primary names, named companions, and email without case or accents", () => {
		expect(
			filterDashboardInvites(invites, { q: "maria" }).map(({ id }) => id),
		).toEqual(["maria"]);
		expect(
			filterDashboardInvites(invites, { q: "josé" }).map(({ id }) => id),
		).toEqual(["maria"]);
		expect(
			filterDashboardInvites(invites, { q: "ANA@EXAMPLE" }).map(({ id }) => id),
		).toEqual(["ana"]);
	});

	it("matches a formatted stored phone with digit-only input", () => {
		expect(
			filterDashboardInvites(invites, { q: "999123" }).map(({ id }) => id),
		).toEqual(["maria"]);
	});

	it("filters by invitation-level RSVP status", () => {
		expect(
			filterDashboardInvites(invites, { status: "confirmed" }).map(
				({ id }) => id,
			),
		).toEqual(["maria"]);
	});

	it("intersects search and RSVP status while preserving source order", () => {
		expect(
			filterDashboardInvites(invites, { q: "a", status: "pending" }).map(
				({ id }) => id,
			),
		).toEqual(["ana"]);
		expect(filterDashboardInvites(invites, {}).map(({ id }) => id)).toEqual([
			"maria",
			"ana",
			"diego",
		]);
	});

	it("treats formatting-only queries as no search", () => {
		expect(filterDashboardInvites(invites, { q: " (+) - " })).toEqual(invites);
	});
});

describe("countDashboardInvitesByStatus", () => {
	it("counts statuses from the complete invitation list", () => {
		expect(countDashboardInvitesByStatus(invites)).toEqual({
			all: 3,
			pending: 1,
			confirmed: 1,
			declined: 1,
		});
	});
});
