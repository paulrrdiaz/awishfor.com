// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinalCta } from "./final-cta";

describe("FinalCta", () => {
	it("renders the heading and CTA exactly once, with no floating decoration", () => {
		const { container } = render(<FinalCta />);

		expect(
			screen.getByText(
				"Tu próximo momento especial merece una página hermosa.",
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Crear mi wishlist →" }),
		).toBeInTheDocument();
		expect(container.querySelectorAll(".m-blob")).toHaveLength(0);
	});

	it("applies the compositor-only glow class to the CTA", () => {
		render(<FinalCta />);
		expect(
			screen.getByRole("link", { name: "Crear mi wishlist →" }),
		).toHaveClass("m-btn-glow");
	});
});
