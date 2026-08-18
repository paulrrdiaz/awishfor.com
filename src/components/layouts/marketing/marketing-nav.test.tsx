// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingNav } from "./marketing-nav";

describe("MarketingNav", () => {
	it("h2b variant links Blog to /blog without a scrollspy binding", () => {
		render(<MarketingNav variant="h2b" />);

		const blogLinks = screen.getAllByRole("link", { name: "Blog" });
		expect(blogLinks.length).toBeGreaterThan(0);
		for (const link of blogLinks) {
			expect(link).toHaveAttribute("href", "/blog");
			expect(link).not.toHaveAttribute("data-nav-link");
			expect(link).not.toHaveAttribute("data-active");
		}
	});

	it("h2b variant keeps scrollspy bindings on on-page sections", () => {
		render(<MarketingNav variant="h2b" />);

		const comoFunciona = screen.getAllByRole("link", {
			name: "Cómo funciona",
		})[0];
		expect(comoFunciona).toHaveAttribute("data-nav-link", "como-funciona");
		expect(comoFunciona).toHaveAttribute("data-active", "false");
	});
});
