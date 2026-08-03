// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqSection } from "./faq-section";

describe("FaqSection", () => {
	it("renders exactly five questions with the first expanded", () => {
		render(<FaqSection />);

		const questions = [
			"¿Qué es A Wish For?",
			"¿Cuánto cuesta?",
			"¿Cómo se reciben los regalos?",
			"¿Funciona con cualquier tienda?",
			"¿Necesito crear una cuenta?",
		];
		for (const q of questions) {
			expect(screen.getByText(q)).toBeInTheDocument();
		}
		expect(
			screen.queryByText("¿Cómo comparto mi lista?"),
		).not.toBeInTheDocument();

		expect(
			screen.getByText("Una plataforma para crear listas de regalos hermosas", {
				exact: false,
			}),
		).toBeVisible();
		expect(
			screen.getByRole("button", { name: "¿Cuánto cuesta?" }),
		).toHaveAttribute("data-state", "closed");
		expect(
			document.querySelectorAll('[data-slot="accordion-trigger-icon"]'),
		).toHaveLength(10);
	});

	it("uses the source icon tiles instead of a secondary support panel", () => {
		render(<FaqSection />);
		expect(screen.getByText("🎁")).toBeInTheDocument();
		expect(screen.getByText("🔐")).toBeInTheDocument();
		expect(
			screen.queryByText("¿No encuentras tu respuesta?"),
		).not.toBeInTheDocument();
	});
});
