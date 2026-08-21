// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GiftListMessage } from "./gift-list-message";

describe("GiftListMessage", () => {
	it("renders nothing when the message is absent", () => {
		const { container: withNull } = render(<GiftListMessage message={null} />);
		expect(withNull).toBeEmptyDOMElement();

		const { container: withUndefined } = render(<GiftListMessage />);
		expect(withUndefined).toBeEmptyDOMElement();

		const { container: withEmptyString } = render(
			<GiftListMessage message="" />,
		);
		expect(withEmptyString).toBeEmptyDOMElement();
	});

	it("renders the message text when present", () => {
		render(
			<GiftListMessage message="Tu presencia es el mejor regalo, pero si quieres llevar un presente, aquí hay una lista de opciones." />,
		);

		expect(
			screen.getByText(
				"Tu presencia es el mejor regalo, pero si quieres llevar un presente, aquí hay una lista de opciones.",
			),
		).toBeVisible();
	});
});
