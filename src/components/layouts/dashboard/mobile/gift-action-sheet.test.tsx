// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftActionSheet } from "./gift-action-sheet";

const duplicateGiftActionMock = vi.hoisted(() => vi.fn());
const deleteGiftActionMock = vi.hoisted(() => vi.fn());
const setGiftPriorityActionMock = vi.hoisted(() => vi.fn());
const setGiftVisibilityActionMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(protected)/dashboard/wishlists/[id]/gifts/actions", () => ({
	duplicateGiftAction: duplicateGiftActionMock,
	deleteGiftAction: deleteGiftActionMock,
	setGiftPriorityAction: setGiftPriorityActionMock,
	setGiftVisibilityAction: setGiftVisibilityActionMock,
}));

vi.mock("sonner", () => ({
	toast: { success: toastSuccessMock, error: vi.fn() },
}));

const gift: DashboardGiftRowViewModel = {
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
};

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(cleanup);

async function openSheet() {
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: "Más acciones" }));
	return user;
}

describe("GiftActionSheet", () => {
	it("lists the gift's actions with Eliminar last and destructive", async () => {
		render(
			<GiftActionSheet
				gift={gift}
				onEdit={vi.fn()}
				onOpenPurchases={vi.fn()}
				wishlistId="wl_1"
			/>,
		);
		await openSheet();

		const list = screen.getByRole("list");
		const buttons = within(list)
			.getAllByRole("button")
			.map((b) => b.textContent);
		expect(buttons.at(-1)).toBe("Eliminar");
		expect(screen.getByText("Eliminar")).toHaveClass("text-destructive");
	});

	it("requires confirmation before deleting", async () => {
		render(
			<GiftActionSheet
				gift={gift}
				onEdit={vi.fn()}
				onOpenPurchases={vi.fn()}
				wishlistId="wl_1"
			/>,
		);
		const user = await openSheet();
		await user.click(screen.getByText("Eliminar"));

		expect(screen.getByText(/¿Eliminar\s.Cafetera.\?/)).toBeInTheDocument();
		expect(deleteGiftActionMock).not.toHaveBeenCalled();
	});

	it("hides a gift immediately and offers an undo for at least five seconds", async () => {
		setGiftVisibilityActionMock.mockResolvedValue(undefined);
		render(
			<GiftActionSheet
				gift={gift}
				onEdit={vi.fn()}
				onOpenPurchases={vi.fn()}
				wishlistId="wl_1"
			/>,
		);
		const user = await openSheet();
		await user.click(screen.getByText("Ocultar de la lista pública"));

		expect(setGiftVisibilityActionMock).toHaveBeenCalledWith(
			"wl_1",
			"gift-1",
			"hidden",
		);
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Regalo oculto",
			expect.objectContaining({
				duration: expect.any(Number),
				action: expect.objectContaining({ label: "Deshacer" }),
			}),
		);
		const [, options] = toastSuccessMock.mock.calls[0] as [
			string,
			{ duration: number },
		];
		expect(options.duration).toBeGreaterThanOrEqual(5000);
	});

	it("undoing a visibility toggle restores the previous value", async () => {
		setGiftVisibilityActionMock.mockResolvedValue(undefined);
		render(
			<GiftActionSheet
				gift={gift}
				onEdit={vi.fn()}
				onOpenPurchases={vi.fn()}
				wishlistId="wl_1"
			/>,
		);
		const user = await openSheet();
		await user.click(screen.getByText("Ocultar de la lista pública"));

		const [, options] = toastSuccessMock.mock.calls[0] as [
			string,
			{ action: { onClick: () => void } },
		];
		options.action.onClick();

		expect(setGiftVisibilityActionMock).toHaveBeenLastCalledWith(
			"wl_1",
			"gift-1",
			"available",
		);
	});
});
