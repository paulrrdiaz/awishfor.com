// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { composeDelivery } from "@/lib/format/delivery";
import { GiftSection } from "./gift-section";

describe("GiftSection", () => {
	it("renders the delivery bar after the gift band's children when delivery is present", () => {
		const delivery = composeDelivery(
			"Ana Beltrán",
			"Av. Universidad 1500",
			null,
		);
		if (!delivery) throw new Error("Expected a composed delivery");

		render(
			<GiftSection delivery={delivery}>
				<div data-testid="gifts">gifts</div>
			</GiftSection>,
		);

		const gifts = screen.getByTestId("gifts");
		const deliveryLine = screen.getByText(delivery.line);
		expect(
			Boolean(
				gifts.compareDocumentPosition(deliveryLine) &
					Node.DOCUMENT_POSITION_FOLLOWING,
			),
		).toBe(true);
	});

	it("omits the delivery bar when delivery is absent", () => {
		render(
			<GiftSection delivery={null}>
				<div data-testid="gifts">gifts</div>
			</GiftSection>,
		);

		expect(screen.getByTestId("gifts")).toBeVisible();
		expect(screen.queryByText("Envíos a domicilio")).not.toBeInTheDocument();
	});

	it("applies the same breakout className to the band and the delivery bar", () => {
		const delivery = composeDelivery(
			"Ana Beltrán",
			"Av. Universidad 1500",
			null,
		);
		if (!delivery) throw new Error("Expected a composed delivery");

		const { container } = render(
			<GiftSection className="w-screen -translate-x-1/2" delivery={delivery}>
				<div>gifts</div>
			</GiftSection>,
		);

		const sections = container.querySelectorAll(":scope > *");
		for (const section of sections) {
			expect(section).toHaveClass("w-screen", "-translate-x-1/2");
		}
		expect(sections).toHaveLength(2);
	});
});
