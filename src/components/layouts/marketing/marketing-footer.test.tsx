// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingFooter } from "./marketing-footer";

describe("MarketingFooter", () => {
	it("renders the responsive newsletter band and footer navigation", () => {
		render(<MarketingFooter />);

		expect(
			screen.getByText("Ideas para tu próximo evento"),
		).toBeInTheDocument();
		expect(screen.getByText("Un correo al mes, sin spam.")).toBeInTheDocument();
		expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Unirme" })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "A Wish For" })).toHaveAttribute(
			"src",
			"/assets/logo.svg",
		);

		expect(screen.getAllByText("Producto")).toHaveLength(2);
		expect(
			screen.getByText("© 2025 A Wish For · awishfor.com"),
		).toBeInTheDocument();
	});
});
