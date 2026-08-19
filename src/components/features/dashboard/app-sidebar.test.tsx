// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pathnameRef = { current: "/dashboard" };
vi.mock("next/navigation", () => ({
	usePathname: () => pathnameRef.current,
}));

vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({ user: null }),
	UserButton: () => null,
}));

import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

afterEach(() => {
	cleanup();
});

const OWNED = [
	{ id: "wl_1", title: "Boda de Ana", status: "draft", eventType: "wedding" },
];

const SHARED = [
	{
		id: "wl_2",
		title: "Baby shower de Sofía",
		status: "published",
		eventType: "baby_shower",
		ownerName: "Marco Pérez",
	},
];

function renderSidebar(owned: typeof OWNED, shared: typeof SHARED) {
	return render(
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar owned={owned} shared={shared} />
			</SidebarProvider>
		</TooltipProvider>,
	);
}

describe("AppSidebar", () => {
	it("does not render the shared group for a solo user with no shared wishlists", () => {
		renderSidebar(OWNED, []);

		expect(screen.queryByText("Compartidas conmigo")).not.toBeInTheDocument();
		expect(screen.getByText("Boda de Ana")).toBeInTheDocument();
	});

	it("renders the shared group with owner labels when wishlists are shared", () => {
		renderSidebar(OWNED, SHARED);

		expect(screen.getByText("Compartidas conmigo")).toBeInTheDocument();
		expect(screen.getByText("Baby shower de Sofía")).toBeInTheDocument();
		expect(screen.getByText("de Marco Pérez")).toBeInTheDocument();
	});
});
