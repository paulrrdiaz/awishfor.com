// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuestsHeaderToolbar } from "./guests-header-toolbar";

vi.mock("./guest-sheet", () => ({
	GuestSheet: () => null,
}));

vi.mock("./copy-confirmed-guests-button", () => ({
	CopyConfirmedGuestsButton: ({
		confirmedGuests,
		rosterText,
	}: {
		confirmedGuests: number;
		rosterText: string;
	}) => (
		<button data-roster={rosterText} type="button">
			Copiar {confirmedGuests}
		</button>
	),
}));

describe("GuestsHeaderToolbar", () => {
	it("renders person-level and pending-invitation metrics without redundant invitation totals", () => {
		render(
			<GuestsHeaderToolbar
				confirmedGuests={1}
				confirmedGuestsRoster="Confirmados · Celebración\n1 persona confirmada"
				pendingInvitations={1}
				totalGuests={2}
				wishlistId="wishlist_1"
			/>,
		);

		expect(screen.getByText("Invitados").parentElement).toHaveTextContent(
			"Invitados · 2 personas · 1 confirmada · 1 invitación pendiente",
		);
		expect(screen.getByRole("button", { name: "Copiar 1" })).toHaveAttribute(
			"data-roster",
			expect.stringContaining("Confirmados · Celebración"),
		);
	});
});
