// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import { GuestRow } from "./guest-row";

function makeInvite(
	overrides: Partial<DashboardInviteViewModel> = {},
): DashboardInviteViewModel {
	return {
		id: "invite_1",
		wishlistId: "wishlist_1",
		primaryName: "Lady Castillo",
		primaryEmail: null,
		primaryPhone: null,
		slug: "lady-castillo",
		status: "pending",
		partySize: 3,
		extraGuests: [
			{ id: "g1", name: "Carlos", status: "pending" },
			{ id: "g2", name: "Ana", status: "pending" },
		],
		openedAt: null,
		respondedAt: null,
		createdAt: "2026-06-01T00:00:00.000Z",
		updatedAt: "2026-06-01T00:00:00.000Z",
		...overrides,
	};
}

afterEach(() => {
	cleanup();
});

describe("GuestRow", () => {
	it("shows the party size without a confirmation count while pending", () => {
		render(
			<GuestRow
				invite={makeInvite()}
				inviteUrl="https://example.com/w/lista/lady-castillo"
				onEdit={vi.fn()}
				wishlistId="wishlist_1"
			/>,
		);

		expect(screen.getByText("3 personas")).toBeVisible();
		expect(screen.queryByText(/confirmados/)).toBeNull();
	});

	it("shows how many of the party confirmed once responded", () => {
		render(
			<GuestRow
				invite={makeInvite({
					status: "confirmed",
					extraGuests: [
						{ id: "g1", name: "Carlos", status: "confirmed" },
						{ id: "g2", name: "Ana", status: "declined" },
					],
				})}
				inviteUrl="https://example.com/w/lista/lady-castillo"
				onEdit={vi.fn()}
				wishlistId="wishlist_1"
			/>,
		);

		expect(screen.getByText("2 de 3 confirmados")).toBeVisible();
	});

	it("shows zero confirmed when the primary declined", () => {
		render(
			<GuestRow
				invite={makeInvite({
					status: "declined",
					extraGuests: [
						{ id: "g1", name: "Carlos", status: "declined" },
						{ id: "g2", name: "Ana", status: "declined" },
					],
				})}
				inviteUrl="https://example.com/w/lista/lady-castillo"
				onEdit={vi.fn()}
				wishlistId="wishlist_1"
			/>,
		);

		expect(screen.getByText("0 de 3 confirmados")).toBeVisible();
	});

	it("shows owner-only link views with an explicit zero-data state", () => {
		render(
			<GuestRow
				invite={makeInvite({ lastViewedAt: null, viewCount: 0 })}
				inviteUrl="https://example.com/w/lista/lady-castillo"
				onEdit={vi.fn()}
				wishlistId="wishlist_1"
			/>,
		);

		expect(screen.getByText("0 vistas")).toBeVisible();
		expect(screen.getByText("Sin vistas aún")).toBeVisible();
	});

	it("does not render analytics omitted for a collaborator", () => {
		render(
			<GuestRow
				invite={makeInvite()}
				inviteUrl="https://example.com/w/lista/lady-castillo"
				onEdit={vi.fn()}
				wishlistId="wishlist_1"
			/>,
		);

		expect(screen.queryByText(/vistas/)).toBeNull();
	});
});
