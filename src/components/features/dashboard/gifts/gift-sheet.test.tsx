// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftSheet } from "./gift-sheet";

const importFromUrlMock = vi.hoisted(() => vi.fn());
const toastInfoMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(protected)/dashboard/wishlists/[id]/gifts/actions", () => ({
	createGiftAction: vi.fn(),
	updateGiftAction: vi.fn(),
}));

vi.mock("@/components/features/wishlist/image-upload", () => ({
	ImageUpload: ({ value }: { value: string | null }) => (
		<div data-testid="image-upload" data-value={value ?? ""} />
	),
}));

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		info: toastInfoMock,
		success: vi.fn(),
		warning: vi.fn(),
	},
}));

vi.mock("@/trpc/react", () => ({
	api: {
		category: {
			list: {
				useQuery: () => ({ data: [] }),
			},
		},
		importer: {
			importFromUrl: {
				useMutation: () => ({
					isPending: false,
					mutateAsync: importFromUrlMock,
				}),
			},
		},
	},
}));

const gift: DashboardGiftRowViewModel = {
	id: "gift-1",
	name: "Bolsa anterior",
	productUrl: "https://tienda.example/bolsa",
	imageUrl: "https://tienda.example/imagen-anterior.jpg",
	storeName: "Tienda anterior",
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

describe("GiftSheet re-import", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("re-imports an existing gift from its saved product URL", async () => {
		importFromUrlMock.mockResolvedValue({
			ok: true,
			draft: {
				name: "Bolsa actualizada",
				productUrl: gift.productUrl,
				imageUrl: "https://tienda.example/imagen-nueva.jpg",
				storeName: "Tienda actualizada",
				priceAmount: 142.5,
				priceCurrency: "PEN",
			},
		});
		const user = userEvent.setup();

		render(
			<GiftSheet
				gift={gift}
				onOpenChange={vi.fn()}
				open
				wishlistId="wishlist-1"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Reimportar datos" }));

		expect(importFromUrlMock).toHaveBeenCalledWith({ url: gift.productUrl });
		expect(screen.getByLabelText(/nombre del regalo/i)).toHaveValue(
			"Bolsa actualizada",
		);
		expect(screen.getByLabelText("Tienda")).toHaveValue("Tienda actualizada");
		expect(screen.getByLabelText("Precio")).toHaveValue(142.5);
		expect(screen.getByTestId("image-upload")).toHaveAttribute(
			"data-value",
			"https://tienda.example/imagen-nueva.jpg",
		);
	});

	it("does not offer re-import without a valid saved product URL", () => {
		render(
			<GiftSheet
				gift={{ ...gift, productUrl: null }}
				onOpenChange={vi.fn()}
				open
				wishlistId="wishlist-1"
			/>,
		);

		expect(
			screen.queryByRole("button", { name: "Reimportar datos" }),
		).not.toBeInTheDocument();
	});

	it("keeps the recovery action visible and explains a failed retry", async () => {
		importFromUrlMock.mockResolvedValue({
			ok: false,
			error: { kind: "blocked" },
		});
		const user = userEvent.setup();

		render(
			<GiftSheet
				gift={gift}
				onOpenChange={vi.fn()}
				open
				wishlistId="wishlist-1"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Reimportar datos" }));

		expect(screen.getByText("No pudimos importar ese enlace.")).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Reimportar datos" }),
		).toBeEnabled();
	});

	it("explains when the store returns the same image URL", async () => {
		importFromUrlMock.mockResolvedValue({
			ok: true,
			draft: {
				productUrl: gift.productUrl,
				imageUrl: gift.imageUrl,
			},
		});
		const user = userEvent.setup();

		render(
			<GiftSheet
				gift={gift}
				onOpenChange={vi.fn()}
				open
				wishlistId="wishlist-1"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Reimportar datos" }));

		expect(toastInfoMock).toHaveBeenCalledWith(
			"La tienda devolvió la misma imagen. Si sigue sin cargar, súbela manualmente.",
		);
	});
});
