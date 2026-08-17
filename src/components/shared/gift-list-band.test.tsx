// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GiftListBand } from "./gift-list-band";

describe("GiftListBand", () => {
	it("paints the card surface with no border or rounding", () => {
		render(
			<GiftListBand>
				<p>Gift content</p>
			</GiftListBand>,
		);

		const band = screen.getByText("Gift content").parentElement;
		expect(band).toHaveClass("bg-card");
		expect(band?.className).not.toMatch(/rounded/);
		expect(band?.className).not.toMatch(/\bborder\b|border-[a-z]/);
	});

	it("merges caller-supplied classes for the breakout mechanics", () => {
		render(
			<GiftListBand className="relative left-1/2 w-screen -translate-x-1/2">
				<p>Gift content</p>
			</GiftListBand>,
		);

		const band = screen.getByText("Gift content").parentElement;
		expect(band).toHaveClass("w-screen", "left-1/2", "-translate-x-1/2");
	});
});
