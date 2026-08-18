// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { composeDelivery } from "@/lib/format/delivery";
import { DeliveryCard } from "./delivery-card";

describe("DeliveryCard", () => {
	beforeEach(() => {
		Object.assign(navigator, {
			clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
		});
	});

	it("renders nothing without a delivery address", () => {
		const { container } = render(<DeliveryCard delivery={null} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders its exact eyebrow and intro line", () => {
		render(
			<DeliveryCard
				delivery={composeDelivery("Ana Beltrán", "Av. Universidad 1500", null)}
			/>,
		);

		expect(screen.getByText("ENVÍO A DOMICILIO")).toBeVisible();
		expect(screen.getByText("Si prefieres enviarlo a casa")).toBeVisible();
	});

	it("shows the document ID as a separate delivery row", () => {
		render(
			<DeliveryCard
				delivery={composeDelivery(
					"Ana Beltrán",
					"Av. Universidad 1500",
					null,
					"46737335",
				)}
			/>,
		);

		expect(screen.getByText("DNI: 46737335")).toBeVisible();
	});

	it("shows only the address row when name and phone are absent", () => {
		const { container } = render(
			<DeliveryCard
				delivery={composeDelivery(null, "Av. Universidad 1500", null)}
			/>,
		);

		expect(screen.getByText("Av. Universidad 1500")).toBeVisible();
		expect(container.querySelectorAll(".delivery-row")).toHaveLength(1);
		expect(screen.queryByText("👤")).toBeNull();
		expect(screen.queryByText("📱")).toBeNull();
	});

	it("centers the available item rows in a stacked layout", () => {
		const { container } = render(
			<DeliveryCard
				delivery={composeDelivery(
					"Ana Beltrán",
					"Av. Universidad 1500",
					"+52 55 1122 3344",
				)}
			/>,
		);

		const items = container.querySelector(".delivery-row")?.parentElement;
		expect(items).toHaveClass("flex", "flex-col", "items-center");
		expect(container.querySelectorAll(".delivery-row")).toHaveLength(3);
	});

	it("copies the composed line instead of the itemized text", () => {
		const delivery = composeDelivery(
			"Ana Beltrán",
			"Av. Universidad 1500",
			"+52 55 1122 3344",
		);
		render(<DeliveryCard delivery={delivery} />);

		fireEvent.click(screen.getByRole("button", { name: /copiar/i }));

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(delivery?.line);
	});
});
