// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BenefitsSection } from "./benefits-section";

describe("BenefitsSection", () => {
	it("renders exactly four benefit cards", () => {
		const { container } = render(<BenefitsSection />);

		const titles = [
			"Todo en un lugar",
			"Gratis, sin comisiones",
			"Enlace y QR gratis",
			"Listas sugeridas",
		];
		for (const title of titles) {
			expect(screen.getByText(title)).toBeInTheDocument();
		}
		expect(container.querySelectorAll("img")).toHaveLength(4);
	});

	it("renders the two-line heading exactly once", () => {
		render(<BenefitsSection />);
		expect(
			screen.getByText(
				(_content, element) =>
					element?.textContent === "Todo lo que necesitas,sin complicaciones",
			),
		).toBeInTheDocument();
	});
});
