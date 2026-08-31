// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WishlistChips } from "./wishlist-chips";

afterEach(cleanup);

describe("WishlistChips", () => {
	it("marks the active chip without relying on hover", () => {
		render(<WishlistChips activeSegment="gifts" isOwner wishlistId="wl_1" />);

		const regalos = screen.getByText("Regalos").closest("a");
		expect(regalos).toHaveAttribute("aria-current", "page");
		expect(screen.getByText("Invitados").closest("a")).not.toHaveAttribute(
			"aria-current",
		);
	});

	it("carries the same badge count and variant the desktop tabs would show", () => {
		render(
			<WishlistChips
				activeSegment="gifts"
				badges={{ guests: { count: 3, variant: "warning" } }}
				isOwner
				wishlistId="wl_1"
			/>,
		);

		const badge = screen.getByText("3");
		expect(badge).toHaveClass("bg-amber-100");
	});

	it("omits Colaboradores and Ajustes from the chip row", () => {
		render(<WishlistChips activeSegment="gifts" isOwner wishlistId="wl_1" />);

		expect(screen.queryByText("Colaboradores")).not.toBeInTheDocument();
		expect(screen.queryByText("Ajustes")).not.toBeInTheDocument();
	});

	it("hides owner-only sections for a collaborator, same as the desktop tabs", () => {
		render(
			<WishlistChips activeSegment="gifts" isOwner={false} wishlistId="wl_1" />,
		);

		expect(screen.getByText("Regalos")).toBeInTheDocument();
		expect(screen.getByText("Invitados")).toBeInTheDocument();
	});
});
