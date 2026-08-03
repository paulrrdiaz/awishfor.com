// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { OccasionPickerSection } from "./occasion-picker-section";

describe("OccasionPickerSection", () => {
	beforeEach(() => {
		globalThis.IntersectionObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof IntersectionObserver;
	});

	it("renders the four occasion cards with the reference copy", () => {
		render(<OccasionPickerSection />);

		for (const [label, subtitle] of [
			["Baby Shower", "Da la bienvenida con cariño"],
			["Boda", "Vajilla, viajes y menaje"],
			["Cumpleaños", "Deseos para su día especial"],
			["Nuevo hogar", "Todo para empezar juntos"],
		]) {
			expect(screen.getByText(label ?? "")).toBeInTheDocument();
			expect(screen.getByText(subtitle ?? "")).toBeInTheDocument();
		}
		expect(screen.getAllByText("Crear mi lista →")).toHaveLength(1);
	});

	it("renders the general wishlist as the fifth card in the centered mosaic", () => {
		const { container } = render(<OccasionPickerSection />);

		const links = screen.getAllByRole("link", {
			name: /Crear una wishlist general/,
		});
		expect(links).toHaveLength(1);

		const grid = container.querySelector("[data-occasion-grid]");
		expect(grid).not.toBeNull();
		expect(grid?.contains(links[0] ?? null)).toBe(true);
		expect(container.querySelector(".max-w-\\[1152px\\]")).not.toBeNull();
	});
});
