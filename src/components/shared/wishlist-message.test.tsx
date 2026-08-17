// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { composeDelivery } from "@/lib/format/delivery";
import { WishlistMessage } from "./wishlist-message";

const FULL_DELIVERY = composeDelivery(
	"Ana Beltrán",
	"Av. Universidad 1500, CDMX",
	"+52 55 1122 3344",
);
const ADDRESS_ONLY_DELIVERY = composeDelivery(
	null,
	"Av. Universidad 1500, CDMX",
	null,
);

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

	describe("delivery postscript", () => {
		it.each([
			"postcard",
			"handwritten",
			"avatars",
		] as const)("renders the postscript in the %s variant when a delivery address is present", (variant) => {
			const { container } = render(
				<WishlistMessage
					delivery={FULL_DELIVERY}
					message="Estamos contando los días."
					variant={variant}
				/>,
			);

			expect(
				screen.getByText("P.D. — si prefieres enviarlo a casa:"),
			).toBeVisible();
			expect(screen.getByText("👤")).toBeVisible();
			expect(screen.getByText("Ana Beltrán")).toBeVisible();
			expect(screen.getByText("📍")).toBeVisible();
			expect(screen.getByText("Av. Universidad 1500, CDMX")).toBeVisible();
			expect(screen.getByText("📱")).toBeVisible();
			expect(screen.getByText("+52 55 1122 3344")).toBeVisible();
			expect(screen.getByRole("button", { name: /copiar/i })).toBeVisible();
			expect(container.querySelectorAll(".delivery-row")).toHaveLength(3);
			expect(container.querySelectorAll("br")).toHaveLength(2);
			expect(
				container.querySelector('[data-slot="delivery-postscript"]'),
			).toHaveClass("flex-col");
		});

		it.each([
			"postcard",
			"handwritten",
			"avatars",
		] as const)("renders no postscript in the %s variant when the delivery address is absent", (variant) => {
			render(
				<WishlistMessage
					delivery={null}
					message="Estamos contando los días."
					variant={variant}
				/>,
			);

			expect(
				screen.queryByText("P.D. — si prefieres enviarlo a casa:"),
			).toBeNull();
			expect(screen.queryByRole("button", { name: /copiar/i })).toBeNull();
		});

		it("renders a partial line with no orphaned separator when only the address is present", () => {
			render(
				<WishlistMessage
					delivery={ADDRESS_ONLY_DELIVERY}
					message="Estamos contando los días."
					variant="postcard"
				/>,
			);

			expect(screen.getByText("Av. Universidad 1500, CDMX")).toBeVisible();
			expect(screen.queryByText(/^,/)).toBeNull();
			expect(screen.queryByText(/·/)).toBeNull();
		});
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
