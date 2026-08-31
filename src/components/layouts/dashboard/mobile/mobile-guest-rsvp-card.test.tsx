// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import { MobileGuestRsvpCard } from "./mobile-guest-rsvp-card";

const recordOwnerRsvpActionMock = vi.hoisted(() => vi.fn());
const reopenOwnerRsvpActionMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(protected)/dashboard/wishlists/[id]/guests/actions", () => ({
	recordOwnerRsvpAction: recordOwnerRsvpActionMock,
	reopenOwnerRsvpAction: reopenOwnerRsvpActionMock,
}));

function makeInvite(
	overrides: Partial<DashboardInviteViewModel> = {},
): DashboardInviteViewModel {
	return {
		id: "invite_1",
		wishlistId: "wl_1",
		primaryName: "Lady Castillo",
		primaryEmail: null,
		primaryPhone: null,
		slug: "lady-castillo",
		status: "pending",
		partySize: 2,
		extraGuests: [{ id: "g1", name: "Carlos", status: "pending" }],
		openedAt: null,
		respondedAt: null,
		createdAt: "2026-06-01T00:00:00.000Z",
		updatedAt: "2026-06-01T00:00:00.000Z",
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(cleanup);

describe("MobileGuestRsvpCard", () => {
	it("offers both decisions on an unanswered invitation", () => {
		render(<MobileGuestRsvpCard invite={makeInvite()} wishlistId="wl_1" />);

		expect(
			screen.getByRole("button", { name: /Asistirá/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /No podrá/ }),
		).toBeInTheDocument();
	});

	it("links the reminder into the personalized share view for this guest", () => {
		render(<MobileGuestRsvpCard invite={makeInvite()} wishlistId="wl_1" />);

		expect(screen.getByRole("link", { name: /Recordar/ })).toHaveAttribute(
			"href",
			"/dashboard/wishlists/wl_1/share?guest=invite_1&purpose=reminder",
		);
	});

	it("records a response on a single tap, with no further confirmation", async () => {
		recordOwnerRsvpActionMock.mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(<MobileGuestRsvpCard invite={makeInvite()} wishlistId="wl_1" />);

		await user.click(screen.getByRole("button", { name: /Asistirá/ }));

		expect(recordOwnerRsvpActionMock).toHaveBeenCalledWith("wl_1", {
			inviteId: "invite_1",
			status: "confirmed",
			extraGuests: [{ id: "g1", status: "confirmed" }],
		});
	});

	it("does not offer the choices again once a response is recorded", () => {
		render(
			<MobileGuestRsvpCard
				invite={makeInvite({ status: "confirmed", responseSource: "owner" })}
				wishlistId="wl_1"
			/>,
		);

		expect(
			screen.queryByRole("button", { name: /Asistirá/ }),
		).not.toBeInTheDocument();
		expect(screen.getByText(/Registrado por ti/)).toBeInTheDocument();
	});

	it("keeps reversal explicitly confirmed rather than a bare undo", async () => {
		const user = userEvent.setup();
		render(
			<MobileGuestRsvpCard
				invite={makeInvite({ status: "confirmed", responseSource: "owner" })}
				wishlistId="wl_1"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Deshacer" }));

		expect(screen.getByText("¿Reabrir respuesta?")).toBeInTheDocument();
		expect(reopenOwnerRsvpActionMock).not.toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "Reabrir respuesta" }));
		expect(reopenOwnerRsvpActionMock).toHaveBeenCalledWith("wl_1", "invite_1");
	});
});
