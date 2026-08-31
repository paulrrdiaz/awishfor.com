// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pathnameRef = { current: "/dashboard" };
vi.mock("next/navigation", () => ({
	usePathname: () => pathnameRef.current,
}));

const openUserProfileMock = vi.fn();
vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({ user: null }),
	useClerk: () => ({ openUserProfile: openUserProfileMock }),
	UserButton: () => null,
}));

const listQueryRef = {
	current: { owned: [] as { id: string }[], shared: [] as { id: string }[] },
};
vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			list: {
				useQuery: () => ({ data: listQueryRef.current }),
			},
		},
	},
}));

import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

afterEach(() => {
	cleanup();
	listQueryRef.current = { owned: [], shared: [] };
	pathnameRef.current = "/dashboard";
	openUserProfileMock.mockClear();
});

function renderSidebar() {
	return render(
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar />
			</SidebarProvider>
		</TooltipProvider>,
	);
}

describe("AppSidebar", () => {
	it("renders exactly the four fixed destinations and no wishlist tree", () => {
		listQueryRef.current = {
			owned: [{ id: "wl_1" }, { id: "wl_2" }],
			shared: [{ id: "wl_3" }],
		};
		renderSidebar();

		expect(screen.getByText("Inicio")).toBeInTheDocument();
		expect(screen.getByText("Mis wishlists")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Mi cuenta" }),
		).toBeInTheDocument();
		expect(screen.getByText("Ayuda y soporte")).toBeInTheDocument();
		expect(screen.queryByText("Compartidas conmigo")).not.toBeInTheDocument();
		expect(screen.queryByText("Nueva wishlist")).not.toBeInTheDocument();
		expect(screen.queryByText("Analíticas")).not.toBeInTheDocument();
	});

	it("badges Mis wishlists with the owned non-archived count", () => {
		listQueryRef.current = {
			owned: [{ id: "wl_1" }, { id: "wl_2" }, { id: "wl_3" }],
			shared: [],
		};
		renderSidebar();

		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("marks Mis wishlists active on a nested wishlist route", () => {
		pathnameRef.current = "/dashboard/wishlists/wl_1/gifts";
		renderSidebar();

		const link = screen.getByText("Mis wishlists").closest("a");
		expect(link).toHaveAttribute("data-active", "true");
	});

	it("opens the account profile when Mi cuenta is activated", () => {
		renderSidebar();

		screen.getByRole("button", { name: "Mi cuenta" }).click();
		expect(openUserProfileMock).toHaveBeenCalled();
	});
});
