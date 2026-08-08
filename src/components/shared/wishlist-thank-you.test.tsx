// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishlistThankYou } from "./wishlist-thank-you";

describe("WishlistThankYou", () => {
	it("renders nothing when there is no message", () => {
		const { container } = render(<WishlistThankYou message={null} />);
		expect(container.textContent).toBe("");
	});

	it("renders the spotlight variant with the signature", () => {
		render(
			<WishlistThankYou
				attribution="Ana & Diego"
				message="¡Gracias!"
				variant="spotlight"
			/>,
		);

		expect(screen.getByText("Gracias")).toBeVisible();
		expect(screen.getByText("¡Gracias!")).toBeVisible();
		expect(screen.getByText("— Ana & Diego")).toBeVisible();
	});

	it("renders the handwritten variant with an initials seal derived from the signature", () => {
		render(
			<WishlistThankYou
				attribution="Ana & Diego"
				message="¡Gracias!"
				variant="handwritten"
			/>,
		);

		expect(screen.getByText("¡Gracias!")).toBeVisible();
		expect(screen.getByText("A+D")).toBeVisible();
	});

	it("degrades the handwritten variant to a seal-less card when there is no signature", () => {
		render(<WishlistThankYou message="¡Gracias!" variant="handwritten" />);

		expect(screen.getByText("¡Gracias!")).toBeVisible();
		expect(screen.queryByText("+")).toBeNull();
	});

	it("renders the social-proof variant with the contributor cluster and count", () => {
		render(
			<WishlistThankYou
				attribution="Ana & Diego"
				contributors={{ count: 6, initials: ["M", "J", "A", "R"] }}
				message="¡Gracias!"
				variant="social-proof"
			/>,
		);

		expect(screen.getByText("6 personas hicieron esto posible")).toBeVisible();
		expect(screen.getByText("+2")).toBeVisible();
		expect(screen.getByText("— Ana & Diego")).toBeVisible();
	});

	it("degrades the social-proof variant to the plain message body when the contributor count is zero", () => {
		render(
			<WishlistThankYou
				contributors={{ count: 0, initials: [] }}
				message="¡Gracias!"
				variant="social-proof"
			/>,
		);

		expect(screen.getByText("¡Gracias!")).toBeVisible();
		expect(screen.queryByText(/personas hicieron/)).toBeNull();
	});

	it("falls back to the default variant for an unknown variant id, rather than throwing", () => {
		render(
			<WishlistThankYou message="¡Gracias!" variant="not-a-real-variant" />,
		);
		expect(screen.getByText("¡Gracias!")).toBeVisible();
	});
});
