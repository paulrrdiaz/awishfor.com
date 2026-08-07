// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingFooter } from "./marketing-footer";

describe("MarketingFooter", () => {
	it("keeps the newsletter band above the reusable footer body", () => {
		const { container } = render(<MarketingFooter />);

		expect(
			screen.getByText("Ideas para tu próximo evento"),
		).toBeInTheDocument();
		expect(screen.getByText("Un correo al mes, sin spam.")).toBeInTheDocument();
		expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Unirme" })).toBeInTheDocument();
		expect(
			container.querySelector('[data-slot="footer-body"]'),
		).toHaveAttribute("data-variant", "marketing");
		expect(screen.getByRole("img", { name: "A Wish For" })).toHaveAttribute(
			"src",
			"/assets/logo.svg",
		);

		expect(screen.getAllByText("Producto")).toHaveLength(2);
		expect(
			screen.getByText("© 2025 A Wish For · awishfor.com"),
		).toBeInTheDocument();
	});

	it("uses root-qualified marketing anchors and preserves application links", () => {
		render(<MarketingFooter />);

		for (const link of screen.getAllByRole("link", {
			name: "Cómo funciona",
		})) {
			expect(link).toHaveAttribute("href", "/#como-funciona");
		}
		expect(
			screen.getByRole("link", { name: "Temas y estilos" }),
		).toHaveAttribute("href", "/#temas");
		expect(screen.getByRole("link", { name: "Ver ejemplos" })).toHaveAttribute(
			"href",
			"/#ejemplo",
		);
		expect(
			screen.getByRole("link", { name: "Preguntas frecuentes" }),
		).toHaveAttribute("href", "/#faq");

		for (const link of screen.getAllByRole("link", { name: "Boda" })) {
			expect(link).toHaveAttribute("href", "/create");
		}
		expect(
			screen.getByRole("link", { name: "Términos de uso" }),
		).toHaveAttribute("href", "/terms");
		expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
			"href",
			"mailto:hola@awishfor.com",
		);
	});
});
