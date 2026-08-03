// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getAllThemes } from "@/config/public-themes";

import { ThemePreviews } from "./theme-previews";

describe("ThemePreviews", () => {
	it("renders a selectable control for every configured theme", () => {
		render(<ThemePreviews />);

		for (const theme of getAllThemes()) {
			expect(
				screen.getByRole("button", { name: theme.label }),
			).toBeInTheDocument();
		}
	});

	it("updates the live preview when a theme is selected", () => {
		render(<ThemePreviews />);

		const selectedTheme = screen.getByRole("button", {
			name: "Lavanda Fiesta",
		});
		fireEvent.click(selectedTheme);

		expect(selectedTheme).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByTestId("theme-preview-name")).toHaveTextContent(
			"Lavanda Fiesta",
		);
	});
});
