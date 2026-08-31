// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { SectionsSheet } from "./sections-sheet";

afterEach(cleanup);

async function openSheet() {
	const user = userEvent.setup();
	await user.click(
		screen.getByRole("button", { name: "Ver todas las secciones" }),
	);
	return user;
}

const baseProps = {
	activeSegment: "gifts" as const,
	isOwner: true,
	publicUrlPath: "/w/my-wishlist",
	wishlistId: "wl_1",
};

describe("SectionsSheet", () => {
	it("lists every section available to the owner, plus Ver pública and Compartir", async () => {
		render(<SectionsSheet {...baseProps} />);
		await openSheet();

		for (const label of [
			"Resumen",
			"Regalos",
			"Invitados",
			"Tema",
			"Colaboradores",
			"Ajustes",
		]) {
			expect(screen.getByText(label)).toBeInTheDocument();
		}
		expect(screen.getByRole("link", { name: /Ver pública/ })).toHaveAttribute(
			"href",
			"/w/my-wishlist",
		);
		expect(screen.getByRole("link", { name: /Compartir/ })).toHaveAttribute(
			"href",
			"/dashboard/wishlists/wl_1/share",
		);
	});

	it("hides owner-only sections for a collaborator", async () => {
		render(<SectionsSheet {...baseProps} isOwner={false} />);
		await openSheet();

		expect(screen.queryByText("Colaboradores")).not.toBeInTheDocument();
	});

	it("marks the current section as active", async () => {
		render(<SectionsSheet {...baseProps} activeSegment="guests" />);
		await openSheet();

		expect(screen.getByText("Invitados").closest("a")).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByText("Regalos").closest("a")).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("navigates to the selected section", async () => {
		render(<SectionsSheet {...baseProps} />);
		await openSheet();

		expect(screen.getByText("Invitados").closest("a")).toHaveAttribute(
			"href",
			"/dashboard/wishlists/wl_1/guests",
		);
	});
});
