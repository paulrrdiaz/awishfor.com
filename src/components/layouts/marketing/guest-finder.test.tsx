// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuestFinder } from "./guest-finder";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
}));

describe("GuestFinder", () => {
	it("reserves the message slot before any error, and does not change band height when one appears", () => {
		render(<GuestFinder />);

		const message = screen.getByText("", { selector: "p[aria-live=polite]" });
		expect(message).toHaveClass("min-h-[20px]");

		fireEvent.change(screen.getByLabelText("Enlace o nombre de la lista"), {
			target: { value: "a" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

		expect(message).toHaveTextContent("Ingresa entre 2 y 80 caracteres.");
		// Same node before and after — the slot never gets added/removed.
		expect(
			screen.getByText("Ingresa entre 2 y 80 caracteres.", {
				selector: "p[aria-live=polite]",
			}),
		).toBe(message);
	});

	it("announces the validation message to assistive technology", () => {
		render(<GuestFinder />);
		const message = screen.getByText("", { selector: "p[aria-live=polite]" });
		expect(message).toHaveAttribute("aria-live", "polite");
	});
});
