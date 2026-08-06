// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishlistMessage } from "./wishlist-message";

describe("WishlistMessage", () => {
	it("highlights the message and optional attribution", () => {
		render(
			<WishlistMessage
				attribution="Ana & Diego"
				message="Estamos contando los días."
			/>,
		);

		expect(screen.getByText("«Estamos contando los días.»")).toBeVisible();
		expect(screen.getByText("— Ana & Diego")).toBeVisible();
	});
});
