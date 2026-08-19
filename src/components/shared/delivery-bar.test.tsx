// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { composeDelivery } from "@/lib/format/delivery";
import { DeliveryBar } from "./delivery-bar";

describe("DeliveryBar", () => {
	beforeEach(() => {
		Object.assign(navigator, {
			clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
		});
	});

	it("shows the eyebrow and the composed line", () => {
		const delivery = composeDelivery(
			"Ana Beltrán",
			"Av. Universidad 1500",
			"+52 55 1122 3344",
		);
		if (!delivery) throw new Error("Expected a composed delivery");

		render(<DeliveryBar delivery={delivery} />);

		expect(screen.getByText("Envíos a domicilio")).toBeVisible();
		expect(screen.getByText(delivery.line)).toBeVisible();
	});

	it("omits absent fields from the line, with no doubled separators", () => {
		const delivery = composeDelivery(null, "Av. Universidad 1500", null);
		if (!delivery) throw new Error("Expected a composed delivery");

		render(<DeliveryBar delivery={delivery} />);

		expect(screen.getByText("Av. Universidad 1500")).toBeVisible();
	});

	it("uses the button-treatment copy action and writes the composed line", () => {
		const delivery = composeDelivery(
			"Ana Beltrán",
			"Av. Universidad 1500",
			"+52 55 1122 3344",
		);
		if (!delivery) throw new Error("Expected a composed delivery");

		render(<DeliveryBar delivery={delivery} />);

		const button = screen.getByRole("button", { name: /copiar/i });
		fireEvent.click(button);

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(delivery.line);
	});
});
