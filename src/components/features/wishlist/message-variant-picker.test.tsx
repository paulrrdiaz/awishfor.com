// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageVariantPicker } from "@/components/features/wishlist/message-variant-picker";
import { getAllCountdownVariants } from "@/config/public-message-variants";

const COUNTDOWN_VARIANTS = getAllCountdownVariants();

describe("MessageVariantPicker", () => {
	it("renders every option with its label", () => {
		render(
			<MessageVariantPicker
				onSelect={vi.fn()}
				options={COUNTDOWN_VARIANTS}
				selected="outline-pill"
			/>,
		);

		for (const option of COUNTDOWN_VARIANTS) {
			expect(screen.getByText(option.label)).toBeVisible();
		}
	});

	it("marks the selected option as pressed", () => {
		render(
			<MessageVariantPicker
				onSelect={vi.fn()}
				options={COUNTDOWN_VARIANTS}
				selected="progress-bar"
			/>,
		);

		expect(
			screen.getByRole("button", { name: /Barra de progreso/ }),
		).toHaveAttribute("aria-pressed", "true");
		expect(
			screen.getByRole("button", { name: /Píldora con contorno/ }),
		).toHaveAttribute("aria-pressed", "false");
	});

	it("reports the selected id when an option is clicked", async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();
		render(
			<MessageVariantPicker
				onSelect={onSelect}
				options={COUNTDOWN_VARIANTS}
				selected="outline-pill"
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Píldora sólida/ }));

		expect(onSelect).toHaveBeenCalledWith("filled-pill");
	});
});
