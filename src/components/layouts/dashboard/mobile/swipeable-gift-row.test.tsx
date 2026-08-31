// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwipeableGiftRow } from "./swipeable-gift-row";

afterEach(cleanup);

describe("SwipeableGiftRow", () => {
	it("exposes the same Editar action reachable by swipe as a real control", async () => {
		const onEdit = vi.fn();
		const user = userEvent.setup();
		const { container } = render(
			<SwipeableGiftRow onEdit={onEdit}>
				<div>Cafetera</div>
			</SwipeableGiftRow>,
		);

		const editButton = container.querySelector("button");
		if (!editButton) throw new Error("Editar button not found");
		await user.click(editButton);

		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it("renders the row content", () => {
		render(
			<SwipeableGiftRow onEdit={vi.fn()}>
				<div>Cafetera</div>
			</SwipeableGiftRow>,
		);

		expect(screen.getByText("Cafetera")).toBeInTheDocument();
	});
});
