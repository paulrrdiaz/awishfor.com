// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftReorderMode } from "./gift-reorder-mode";

const reorderGiftsActionMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(protected)/dashboard/wishlists/[id]/gifts/actions", () => ({
	reorderGiftsAction: reorderGiftsActionMock,
}));

vi.mock("sonner", () => ({
	toast: { error: vi.fn() },
}));

function makeGift(
	overrides: Partial<DashboardGiftRowViewModel> = {},
): DashboardGiftRowViewModel {
	return {
		id: "gift-1",
		name: "Cafetera",
		productUrl: null,
		imageUrl: null,
		storeName: null,
		size: null,
		priceAmount: "100",
		priceCurrency: "PEN",
		quantityNeeded: 1,
		purchasedQuantity: 0,
		remainingQuantity: 1,
		priority: "medium",
		visibilityStatus: "available",
		publicNote: null,
		hasInternalNote: false,
		sortOrder: 0,
		categoryId: null,
		deletedAt: null,
		createdAt: "2026-08-01T00:00:00.000Z",
		updatedAt: "2026-08-01T00:00:00.000Z",
		...overrides,
	};
}

const gifts = [
	makeGift({ id: "gift-1", name: "Cafetera" }),
	makeGift({ id: "gift-2", name: "Tostadora" }),
];

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(cleanup);

describe("GiftReorderMode", () => {
	it("shows a drag handle of at least 44px for each row and reports reordering is in progress", () => {
		render(
			<GiftReorderMode gifts={gifts} onClose={vi.fn()} wishlistId="wl_1" />,
		);

		expect(screen.getByText("Reordenando regalos…")).toBeInTheDocument();
		const handle = screen.getByRole("button", { name: "Arrastrar Cafetera" });
		expect(handle).toHaveClass("size-11");
	});

	it("saves the current order and closes on confirmation", async () => {
		reorderGiftsActionMock.mockResolvedValue(undefined);
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(
			<GiftReorderMode gifts={gifts} onClose={onClose} wishlistId="wl_1" />,
		);

		await user.click(screen.getByRole("button", { name: "Guardar orden" }));

		expect(reorderGiftsActionMock).toHaveBeenCalledWith({
			wishlistId: "wl_1",
			orderedGiftIds: ["gift-1", "gift-2"],
		});
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("discards the rearrangement and closes without saving on cancel", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(
			<GiftReorderMode gifts={gifts} onClose={onClose} wishlistId="wl_1" />,
		);

		await user.click(screen.getByRole("button", { name: "Cancelar" }));

		expect(reorderGiftsActionMock).not.toHaveBeenCalled();
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
