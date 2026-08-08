// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishlistMessage } from "./wishlist-message";

describe("WishlistMessage", () => {
	it("renders the postcard variant with the message and attribution, without requiring a signature", () => {
		render(
			<WishlistMessage
				message="Estamos contando los días."
				variant="postcard"
			/>,
		);

		expect(screen.getByText("«Estamos contando los días.»")).toBeVisible();
		expect(screen.getByText("Para ti")).toBeVisible();
	});

	it("renders the handwritten variant with an initials seal derived from the signature", () => {
		render(
			<WishlistMessage
				attribution="Ana & Diego"
				message="Estamos contando los días."
				variant="handwritten"
			/>,
		);

		expect(screen.getByText("«Estamos contando los días.»")).toBeVisible();
		expect(screen.getByText("— Ana & Diego")).toBeVisible();
		expect(screen.getByText("A+D")).toBeVisible();
	});

	it("degrades the handwritten variant to a seal-less card when there is no signature", () => {
		render(
			<WishlistMessage
				message="Estamos contando los días."
				variant="handwritten"
			/>,
		);

		expect(screen.getByText("«Estamos contando los días.»")).toBeVisible();
		expect(screen.queryByText("+")).toBeNull();
	});

	it("renders the avatars variant with a cluster derived from the signature", () => {
		render(
			<WishlistMessage
				attribution="Ana & Diego"
				message="Estamos contando los días."
				variant="avatars"
			/>,
		);

		expect(screen.getByText("«Estamos contando los días.»")).toBeVisible();
		expect(screen.getByText("A")).toBeVisible();
		expect(screen.getByText("D")).toBeVisible();
	});

	it("degrades the avatars variant to a cluster-less card when there is no signature", () => {
		const { container } = render(
			<WishlistMessage
				message="Estamos contando los días."
				variant="avatars"
			/>,
		);

		expect(screen.getByText("«Estamos contando los días.»")).toBeVisible();
		expect(container.querySelector(".-space-x-2")).toBeNull();
	});

	it("falls back to the default variant for an unknown id", () => {
		render(
			<WishlistMessage
				message="Estamos contando los días."
				variant="not-a-real-variant"
			/>,
		);

		expect(screen.getByText("Para ti")).toBeVisible();
	});
});
