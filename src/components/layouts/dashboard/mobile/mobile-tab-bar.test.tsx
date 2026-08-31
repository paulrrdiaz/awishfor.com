// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileTabBar } from "./mobile-tab-bar";

const pathnameRef = { current: "/dashboard" };
vi.mock("next/navigation", () => ({
	usePathname: () => pathnameRef.current,
}));

const openUserProfileMock = vi.fn();
vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({ openUserProfile: openUserProfileMock }),
}));

afterEach(() => {
	cleanup();
	pathnameRef.current = "/dashboard";
	openUserProfileMock.mockReset();
});

describe("MobileTabBar", () => {
	it("marks Inicio active on the root dashboard route", () => {
		pathnameRef.current = "/dashboard";
		render(<MobileTabBar />);

		expect(screen.getByRole("link", { name: /Inicio/ })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: /Wishlists/ })).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("marks Wishlists active while browsing a wishlist's sections", () => {
		pathnameRef.current = "/dashboard/wishlists/wl_1/gifts";
		render(<MobileTabBar />);

		expect(screen.getByRole("link", { name: /Wishlists/ })).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("opens Clerk's profile modal from the Cuenta tab", async () => {
		const user = userEvent.setup();
		render(<MobileTabBar />);

		await user.click(screen.getByRole("button", { name: /Cuenta/ }));

		expect(openUserProfileMock).toHaveBeenCalledTimes(1);
	});

	it("suppresses the tab bar in editor mode", () => {
		pathnameRef.current = "/dashboard/wishlists/wl_1/settings";
		const { container } = render(<MobileTabBar />);

		expect(container).toBeEmptyDOMElement();
	});

	it("also suppresses the tab bar on the Tema editor route", () => {
		pathnameRef.current = "/dashboard/wishlists/wl_1/design";
		const { container } = render(<MobileTabBar />);

		expect(container).toBeEmptyDOMElement();
	});

	it("omits Datos, since no analytics route exists to navigate to", () => {
		render(<MobileTabBar />);

		expect(screen.getAllByRole("link")).toHaveLength(2);
		expect(screen.queryByText(/Datos/)).not.toBeInTheDocument();
	});
});
