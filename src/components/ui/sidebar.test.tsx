// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarMenuButton, SidebarProvider } from "./sidebar";

describe("SidebarMenuButton", () => {
	it("renders as a link when composed with an anchor", () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton asChild>
					<a href="/dashboard">Dashboard</a>
				</SidebarMenuButton>
			</SidebarProvider>,
		);

		const link = screen.getByRole("link", { name: "Dashboard" });
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/dashboard");
	});
});
