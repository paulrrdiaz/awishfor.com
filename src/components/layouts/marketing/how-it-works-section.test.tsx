// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowItWorksSection } from "./how-it-works-section";

describe("HowItWorksSection", () => {
	it("renders the five wizard-aligned steps in order", () => {
		render(<HowItWorksSection />);

		const titles = [
			"Elige el tipo de evento",
			"Ponle nombre y elige tu enlace",
			"Elige tu tema y personalízalo",
			"Agrega tus regalos",
			"Publica y comparte",
		];
		for (const title of titles) {
			expect(screen.getByText(title)).toBeInTheDocument();
		}
		for (const n of ["1", "2", "3", "4", "5"]) {
			expect(screen.getByText(n)).toBeInTheDocument();
		}
	});

	it("renders exactly once, with no breakpoint-duplicated heading", () => {
		render(<HowItWorksSection />);
		expect(
			screen.getByText("Del primer clic a tu lista publicada"),
		).toBeInTheDocument();
	});
});
