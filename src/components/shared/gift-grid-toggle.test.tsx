// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { type GiftGridColumns, GiftGridToggle } from "./gift-grid-toggle";

function ToggleHarness() {
	const [columns, setColumns] = useState<GiftGridColumns>(3);
	return <GiftGridToggle onChange={setColumns} value={columns} />;
}

describe("GiftGridToggle", () => {
	it("defaults to three columns and lets the user change the grid density", async () => {
		const user = userEvent.setup();
		render(<ToggleHarness />);

		const oneColumn = screen.getByRole("button", {
			name: "Mostrar en 1 columna",
		});
		const twoColumns = screen.getByRole("button", {
			name: "Mostrar en 2 columnas",
		});
		const threeColumns = screen.getByRole("button", {
			name: "Mostrar en 3 columnas",
		});

		expect(screen.getAllByRole("button")).toEqual([
			threeColumns,
			twoColumns,
			oneColumn,
		]);
		expect(threeColumns).toHaveAttribute("aria-pressed", "true");

		await user.click(twoColumns);
		expect(twoColumns).toHaveAttribute("aria-pressed", "true");
		expect(threeColumns).toHaveAttribute("aria-pressed", "false");

		await user.click(oneColumn);
		expect(oneColumn).toHaveAttribute("aria-pressed", "true");
		expect(twoColumns).toHaveAttribute("aria-pressed", "false");
	});
});
