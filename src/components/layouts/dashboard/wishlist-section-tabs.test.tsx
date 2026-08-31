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
});
