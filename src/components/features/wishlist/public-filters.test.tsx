// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PublicGiftFilters } from "./public-filters";

vi.mock("gsap", () => ({
	default: { fromTo: vi.fn(), killTweensOf: vi.fn(), set: vi.fn() },
}));
vi.mock("@/lib/gsap/use-reduced-motion", () => ({
	useReducedMotion: () => true,
}));
vi.mock("@/components/shared/gift-grid", () => ({
	GiftGrid: ({
		gifts,
		onProductAction,
		onPurchaseAction,
	}: {
		gifts: Array<{ id: string }>;
		onProductAction?: (gift: { id: string }) => void;
		onPurchaseAction?: (gift: { id: string }) => void;
	}) => (
		<div>
			<button
				onClick={() => gifts[0] && onProductAction?.(gifts[0])}
				type="button"
			>
				Abrir producto
			</button>
			<button
				onClick={() => gifts[0] && onPurchaseAction?.(gifts[0])}
				type="button"
			>
				Abrir compra
			</button>
		</div>
	),
}));
vi.mock("@/components/shared/gift-list", () => ({ GiftList: () => null }));
vi.mock("@/components/features/wishlist/guest-gift-drawer", () => ({
	GuestGiftDrawer: ({
		container,
		onOpenChange,
		onViewChange,
		view,
	}: {
		container: HTMLElement;
		onOpenChange: (open: boolean) => void;
		onViewChange: (view: "success") => void;
		view: string;
	}) => (
		<div data-container={container.dataset.theme} data-testid="guest-drawer">
			{view}
			<button onClick={() => onViewChange("success")} type="button">
				Éxito
			</button>
			<button onClick={() => onOpenChange(false)} type="button">
				Cerrar drawer
			</button>
		</div>
	),
}));

const gift = {
	id: "gift-1",
	name: "Cojín",
	productUrl: "https://example.com",
	imageUrl: null,
	storeName: null,
	priceAmount: null,
	priceCurrency: null,
	quantityNeeded: 1,
	priority: "medium" as const,
	publicNote: null,
	sortOrder: 0,
	categoryId: null,
	status: "available" as const,
	remainingQuantity: 1,
};

const layout = {
	id: "default",
	giftCardStyle: "card",
	giftColumns: 2,
} as never;

describe("PublicGiftFilters guest drawer controller", () => {
	it("keeps product, purchase, and success drawers inside their triggering public theme", async () => {
		const user = userEvent.setup();
		render(
			<>
				<div className="public-theme" data-theme="first">
					<PublicGiftFilters
						actionsEnabled
						categories={[]}
						gifts={gift ? [gift] : []}
						layout={layout}
					/>
				</div>
				<div className="public-theme" data-theme="second">
					<PublicGiftFilters
						actionsEnabled
						categories={[]}
						gifts={[gift]}
						layout={layout}
					/>
				</div>
			</>,
		);

		const productButtons = screen.getAllByRole("button", {
			name: "Abrir producto",
		});
		const secondProductButton = productButtons.at(1);
		if (!secondProductButton)
			throw new Error("Second public preview trigger missing");
		await user.click(secondProductButton);
		expect(screen.getByTestId("guest-drawer")).toHaveAttribute(
			"data-container",
			"second",
		);
		expect(screen.getByTestId("guest-drawer")).toHaveTextContent("product");

		await user.click(screen.getByRole("button", { name: "Éxito" }));
		expect(screen.getByTestId("guest-drawer")).toHaveTextContent("success");

		await user.click(screen.getByRole("button", { name: "Cerrar drawer" }));
		await waitFor(() => expect(secondProductButton).toHaveFocus());
	});
});
