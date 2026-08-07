// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishlistFooter } from "./wishlist-footer";

describe("WishlistFooter", () => {
	it("renders the expanded themed body without the marketing newsletter", () => {
		const { container } = render(<WishlistFooter variant="expanded" />);
		const footer = container.querySelector("footer");
		const body = container.querySelector('[data-slot="footer-body"]');

		expect(footer).toHaveAttribute("data-variant", "expanded");
		expect(footer).toHaveClass("bg-accent", "text-accent-foreground");
		expect(body).toHaveAttribute("data-variant", "public-wishlist");
		expect(body).toHaveClass(
			"bg-accent",
			"text-accent-foreground",
			"[font-family:var(--public-font-body)]",
		);
		expect(container.innerHTML).toContain("border-accent-foreground/20");
		expect(container.innerHTML).toContain("bg-card");
		expect(container.innerHTML).toContain("text-card-foreground");
		expect(container.innerHTML).not.toContain("[var(--m");

		expect(screen.getByRole("img", { name: "A Wish For" })).toHaveAttribute(
			"src",
			"/assets/logo.svg",
		);
		expect(screen.getAllByText("Producto")).toHaveLength(2);
		expect(screen.getByText("100% gratis")).toBeInTheDocument();
		expect(
			screen.queryByText("Ideas para tu próximo evento"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Unirme" }),
		).not.toBeInTheDocument();
	});

	it("keeps legal, contact, report, and visible support destinations expanded", () => {
		render(<WishlistFooter variant="expanded" />);

		for (const link of screen.getAllByRole("link", { name: "Privacidad" })) {
			expect(link).toHaveAttribute("href", "/privacy");
		}
		expect(
			screen.getByRole("link", { name: "Términos de uso" }),
		).toHaveAttribute("href", "/terms");
		expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
			"href",
			"mailto:hola@awishfor.com",
		);
		expect(
			screen.getByRole("link", { name: "Reportar lista" }),
		).toHaveAttribute(
			"href",
			"mailto:hola@awishfor.com?subject=Reporte%20de%20lista",
		);
		expect(
			screen.getByRole("link", { name: "hola@awishfor.com" }),
		).toHaveAttribute("href", "mailto:hola@awishfor.com");
	});

	it("keeps the compact brand, report, and support utility without navigation", () => {
		const { container } = render(
			<WishlistFooter variant="compact" wishlistSlug="lista-demo" />,
		);
		const footer = container.querySelector("footer");

		expect(footer).toHaveAttribute("data-variant", "compact");
		expect(footer).toHaveClass("bg-card", "text-card-foreground");
		expect(screen.getByText(/Hecho con cariño en/)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "A Wish For" })).toHaveAttribute(
			"href",
			"/",
		);
		expect(
			screen.getByRole("link", { name: "awishfor.com/w/lista-demo" }),
		).toHaveAttribute("href", "/w/lista-demo");
		expect(
			screen.getByRole("link", { name: "Reportar lista" }),
		).toHaveAttribute(
			"href",
			"mailto:hola@awishfor.com?subject=Reporte%20de%20lista",
		);
		expect(
			screen.getByRole("link", { name: "hola@awishfor.com" }),
		).toHaveAttribute("href", "mailto:hola@awishfor.com");
		expect(screen.queryByText("Producto")).not.toBeInTheDocument();
		expect(screen.queryByText("100% gratis")).not.toBeInTheDocument();
	});
});
