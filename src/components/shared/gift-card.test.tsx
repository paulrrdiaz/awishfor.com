// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GiftCard } from "./gift-card";
import { sampleGift } from "./story-data";

describe("GiftCard collage row", () => {
	it("offers separate product and purchase actions", async () => {
		const user = userEvent.setup();
		const onGiftAction = vi.fn();

		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				onGiftAction={onGiftAction}
			/>,
		);

		const productLink = screen.getByRole("link", {
			name: `Abrir ${sampleGift.name} en una nueva pestaña`,
		});
		expect(productLink).toHaveAttribute("href", sampleGift.productUrl);
		expect(productLink).toHaveAttribute("target", "_blank");
		expect(productLink).toHaveAttribute("rel", "noopener noreferrer");

		await user.click(
			screen.getByRole("button", {
				name: `Marcar como comprado: ${sampleGift.name}`,
			}),
		);
		expect(onGiftAction).toHaveBeenCalledOnce();
		expect(onGiftAction).toHaveBeenCalledWith(sampleGift);
	});

	it("hides both actions once the gift is purchased", () => {
		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={{ ...sampleGift, remainingQuantity: 0, status: "purchased" }}
			/>,
		);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
