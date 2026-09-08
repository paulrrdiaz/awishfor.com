// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const userRef = {
	current: {
		fullName: "Paul Diaz",
		firstName: "Paul",
		imageUrl: undefined as string | undefined,
	},
};
vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({ user: userRef.current }),
}));

import { MobileRootTitleBar } from "@/components/layouts/dashboard/mobile/mobile-root-title-bar";

afterEach(() => {
	cleanup();
	userRef.current = {
		fullName: "Paul Diaz",
		firstName: "Paul",
		imageUrl: undefined,
	};
});

describe("MobileRootTitleBar", () => {
	it("renders the screen title and the signed-in user's avatar", () => {
		render(<MobileRootTitleBar title="Inicio" />);

		expect(screen.getByText("Inicio")).toBeInTheDocument();
		expect(screen.getByText("P")).toBeInTheDocument();
	});

	it("never renders a back affordance", () => {
		render(<MobileRootTitleBar title="Inicio" />);

		expect(
			screen.queryByRole("link", { name: /volver/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /volver/i }),
		).not.toBeInTheDocument();
	});

	it("omits the overflow control when no action is offered", () => {
		render(<MobileRootTitleBar title="Inicio" />);

		expect(
			screen.queryByRole("button", { name: /más opciones/i }),
		).not.toBeInTheDocument();
	});

	it("renders the overflow control when at least one action resolves", () => {
		render(
			<MobileRootTitleBar
				overflowItems={[{ label: "Cerrar sesión", onSelect: () => undefined }]}
				title="Inicio"
			/>,
		);

		expect(
			screen.getByRole("button", { name: /más opciones/i }),
		).toBeInTheDocument();
	});

	it("hides itself at md and above", () => {
		render(<MobileRootTitleBar title="Inicio" />);

		expect(screen.getByText("Inicio").closest("header")).toHaveClass(
			"md:hidden",
		);
	});
});
