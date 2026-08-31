// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WishlistSwitcher } from "./wishlist-switcher";

const pathnameRef = { current: "/dashboard/wishlists/wl_1/collaborators" };
vi.mock("next/navigation", () => ({
	usePathname: () => pathnameRef.current,
}));

const summaryListRef = {
	current: {
		owned: [
			{
				id: "wl_1",
				title: "Babyshower de Juliette",
				status: "draft",
				totalGiftCount: 4,
				purchasedUnits: 1,
				totalUnits: 6,
			},
			{
				id: "wl_2",
				title: "Boda de Ana",
				status: "published",
				totalGiftCount: 10,
				purchasedUnits: 3,
				totalUnits: 12,
			},
		],
		shared: [
			{
				id: "wl_3",
				title: "Cumpleaños de Marco",
				status: "published",
				totalGiftCount: 5,
				purchasedUnits: 2,
				totalUnits: 5,
				ownerName: "Marco Pérez",
			},
		],
	},
};

vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			summaryList: {
				useQuery: () => ({ data: summaryListRef.current, isLoading: false }),
			},
		},
	},
}));

beforeEach(() => {
	render(
		<WishlistSwitcher
			status="draft"
			title="Babyshower de Juliette"
			wishlistId="wl_1"
		/>,
	);
});

afterEach(() => {
	cleanup();
	pathnameRef.current = "/dashboard/wishlists/wl_1/collaborators";
});

async function openSwitcher() {
	const user = userEvent.setup();
	await user.click(
		screen.getByRole("button", { name: /Babyshower de Juliette/ }),
	);
	return user;
}

describe("WishlistSwitcher", () => {
	it("filters the listed wishlists as the owner types", async () => {
		const user = await openSwitcher();
		const list = screen.getByRole("list");
		expect(within(list).getByText("Boda de Ana")).toBeInTheDocument();

		await user.type(screen.getByPlaceholderText("Buscar wishlist…"), "boda");

		expect(within(list).getByText("Boda de Ana")).toBeInTheDocument();
		expect(
			within(list).queryByText("Babyshower de Juliette"),
		).not.toBeInTheDocument();
	});

	it("preserves the current section when the target wishlist offers it", async () => {
		await openSwitcher();

		const link = screen.getByText("Boda de Ana").closest("a");
		expect(link).toHaveAttribute(
			"href",
			"/dashboard/wishlists/wl_2/collaborators",
		);
	});

	it("falls back to Resumen when the target does not offer the current section", async () => {
		await openSwitcher();

		const link = screen.getByText("Cumpleaños de Marco").closest("a");
		expect(link).toHaveAttribute("href", "/dashboard/wishlists/wl_3");
	});

	it("offers creation and the full list", async () => {
		await openSwitcher();

		expect(
			screen.getByRole("link", { name: /Nueva wishlist/ }),
		).toHaveAttribute("href", "/create");
		expect(
			screen.getByRole("link", { name: /Ver todas · archivadas/ }),
		).toHaveAttribute("href", "/dashboard/wishlists");
	});
});
