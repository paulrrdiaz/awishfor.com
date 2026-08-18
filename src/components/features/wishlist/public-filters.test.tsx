// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
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
		<div
			data-gift-ids={gifts.map(({ id }) => id).join(",")}
			data-testid="gift-grid"
		>
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
vi.mock("@/components/features/wishlist/public-guest-gift-drawer", () => ({
	PublicGuestGiftDrawer: ({
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

const gift: PublicGiftViewModel = {
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

function makeGift(
	id: string,
	overrides: Partial<PublicGiftViewModel> = {},
): PublicGiftViewModel {
	return {
		...gift,
		id,
		name: `Regalo ${id}`,
		sortOrder: Number(id.replace(/\D/g, "")) || 0,
		...overrides,
	};
}

function makeWishlistGifts(size: number) {
	return Array.from({ length: size }, (_, index) =>
		makeGift(`gift-${index + 1}`, {
			categoryId: index % 2 === 0 ? "category-home" : "category-travel",
			priceAmount: String((index + 1) * 10),
			priority: index % 4 === 0 ? "high" : "medium",
			status: index % 3 === 0 ? "purchased" : "available",
		}),
	);
}

const categories = [
	{ id: "category-home", name: "Hogar", sortOrder: 0 },
	{ id: "category-travel", name: "Viaje", sortOrder: 1 },
];

const layout = {
	id: "default",
	giftCardStyle: "card",
	giftColumns: 2,
} as never;

describe("PublicGiftFilters guest drawer controller", () => {
	it.each([
		8, 24,
	])("keeps filters and sorting interactive for a %i-gift wishlist", async (size) => {
		const user = userEvent.setup();
		const gifts = makeWishlistGifts(size);
		const { rerender } = render(
			<PublicGiftFilters
				actionsEnabled
				categories={categories}
				gifts={gifts}
				layout={layout}
			/>,
		);

		await user.click(
			screen.getByRole("button", {
				name: `Disponibles (${gifts.filter(({ status }) => status === "available").length})`,
			}),
		);
		expect(screen.getByTestId("gift-grid").dataset.giftIds?.split(",")).toEqual(
			expect.arrayContaining(
				gifts
					.filter(({ status }) => status === "available")
					.map(({ id }) => id),
			),
		);

		await user.click(screen.getByRole("button", { name: "Hogar" }));
		await user.selectOptions(screen.getByRole("combobox"), "price-desc");
		const expectedHomeIds = gifts
			.filter(({ categoryId }) => categoryId === "category-home")
			.sort((a, b) => Number(b.priceAmount) - Number(a.priceAmount))
			.map(({ id }) => id);
		expect(screen.getByTestId("gift-grid")).toHaveAttribute(
			"data-gift-ids",
			expectedHomeIds.join(","),
		);

		const refreshedGifts = [
			...gifts,
			makeGift(`gift-${size + 1}`, {
				categoryId: "category-home",
				priceAmount: "999",
			}),
		];
		rerender(
			<PublicGiftFilters
				actionsEnabled
				categories={categories}
				gifts={refreshedGifts}
				layout={layout}
			/>,
		);
		expect(screen.getByRole("button", { name: "Hogar" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		expect(screen.getByRole("combobox")).toHaveValue("price-desc");
		expect(screen.getByTestId("gift-grid").dataset.giftIds?.split(",")[0]).toBe(
			`gift-${size + 1}`,
		);
	});

	it("opens the purchase drawer on its first keyboard activation", async () => {
		const user = userEvent.setup();
		render(
			<div className="public-theme" data-theme="keyboard">
				<PublicGiftFilters
					actionsEnabled
					categories={[]}
					gifts={[gift]}
					layout={layout}
				/>
			</div>,
		);

		const purchaseButton = screen.getByRole("button", { name: "Abrir compra" });
		purchaseButton.focus();
		await user.keyboard("{Enter}");

		const drawer = await screen.findByTestId("guest-drawer");
		expect(drawer).toHaveTextContent("purchase");
		expect(drawer).toHaveAttribute("data-container", "keyboard");
	});

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
		const drawer = await screen.findByTestId("guest-drawer");
		expect(drawer).toHaveAttribute("data-container", "second");
		expect(drawer).toHaveTextContent("product");

		await user.click(screen.getByRole("button", { name: "Éxito" }));
		expect(screen.getByTestId("guest-drawer")).toHaveTextContent("success");

		await user.click(screen.getByRole("button", { name: "Cerrar drawer" }));
		await waitFor(() => expect(secondProductButton).toHaveFocus());
	});
});
