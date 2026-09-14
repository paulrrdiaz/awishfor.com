// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WishlistSectionTabs } from "./wishlist-section-tabs";

const pathnameRef = { current: "/dashboard/wishlists/wl_1" };
vi.mock("next/navigation", () => ({
	usePathname: () => pathnameRef.current,
}));

afterEach(() => {
	cleanup();
	pathnameRef.current = "/dashboard/wishlists/wl_1";
});

describe("WishlistSectionTabs", () => {
	it("resolves the categories alias to the Regalos tab as active", () => {
		pathnameRef.current = "/dashboard/wishlists/wl_1/categories";
		render(<WishlistSectionTabs isOwner wishlistId="wl_1" />);

		const regalos = screen.getByText("Regalos").closest("a");
		expect(regalos).toHaveAttribute("aria-current", "page");
	});

	it("omits a badge when its count is zero", () => {
		render(
			<WishlistSectionTabs
				badges={{ gifts: { count: 0 }, guests: { count: 3 } }}
				isOwner
				wishlistId="wl_1"
			/>,
		);

		const regalos = screen.getByText("Regalos").closest("a");
		expect(regalos?.textContent).toBe("Regalos");
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("hides the owner-only Colaboradores tab for a collaborator", () => {
		render(<WishlistSectionTabs isOwner={false} wishlistId="wl_1" />);

		expect(screen.queryByText("Colaboradores")).not.toBeInTheDocument();
	});

	it("renders the sections in order with Mesas between Invitados and Tema", () => {
		render(<WishlistSectionTabs isOwner wishlistId="wl_1" />);

		const labels = screen
			.getAllByRole("link")
			.map((link) => link.textContent?.trim());
		expect(labels).toEqual([
			"Resumen",
			"Regalos",
			"Invitados",
			"Mesas",
			"Tema",
			"Colaboradores",
			"Ajustes",
		]);
	});

	it("keeps Mesas visible for a collaborator, since seating is not owner-only", () => {
		render(<WishlistSectionTabs isOwner={false} wishlistId="wl_1" />);

		expect(screen.getByText("Mesas").closest("a")).toHaveAttribute(
			"href",
			"/dashboard/wishlists/wl_1/seating",
		);
	});

	it("keeps the Mesas tab active on the nested print route", () => {
		pathnameRef.current = "/dashboard/wishlists/wl_1/seating/print";
		render(<WishlistSectionTabs isOwner wishlistId="wl_1" />);

		expect(screen.getByText("Mesas").closest("a")).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("renders the unseated-guest warning badge on Mesas", () => {
		render(
			<WishlistSectionTabs
				badges={{ seating: { count: 7, variant: "warning" } }}
				isOwner
				wishlistId="wl_1"
			/>,
		);

		expect(screen.getByText("Mesas").closest("a")?.textContent).toBe("Mesas7");
	});

	it("omits the Mesas badge when nobody is unseated", () => {
		render(
			<WishlistSectionTabs
				badges={{ seating: { count: 0, variant: "warning" } }}
				isOwner
				wishlistId="wl_1"
			/>,
		);

		expect(screen.getByText("Mesas").closest("a")?.textContent).toBe("Mesas");
	});
});
