// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuestsMobileActionBar } from "./guests-mobile-action-bar";

vi.mock("@/components/features/dashboard/guests/guest-sheet", () => ({
	GuestSheet: () => null,
}));

afterEach(cleanup);

describe("GuestsMobileActionBar", () => {
	it("shows the reminder above the primary action when invitations are pending", () => {
		render(<GuestsMobileActionBar pendingInvitations={3} wishlistId="wl_1" />);

		expect(
			screen.getByRole("link", { name: /Recordar a los 3 pendientes/ }),
		).toHaveAttribute(
			"href",
			"/dashboard/wishlists/wl_1/guests?status=pending",
		);
		expect(
			screen.getByRole("button", { name: "Agregar invitado" }),
		).toBeInTheDocument();
	});

	it("omits the reminder when no invitation is pending", () => {
		render(<GuestsMobileActionBar pendingInvitations={0} wishlistId="wl_1" />);

		expect(
			screen.queryByRole("link", { name: /Recordar/ }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Agregar invitado" }),
		).toBeInTheDocument();
	});
});
