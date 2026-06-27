// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PurchaseGiftModal } from "@/components/features/wishlist/purchase-gift-modal";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";

const mutateMock = vi.hoisted(() => vi.fn());

vi.mock("@/trpc/react", () => ({
	api: {
		purchase: {
			markGiftPurchased: {
				useMutation: () => ({
					mutate: mutateMock,
					isPending: false,
				}),
			},
		},
	},
}));

// Render dialog contents inline so tests can query form fields without portal issues
vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	),
	DialogDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	DialogFooter: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

function makeGift(
	overrides: Partial<PublicGiftViewModel> = {},
): PublicGiftViewModel {
	return {
		id: "gift-1",
		name: "Juego de sábanas",
		productUrl: null,
		imageUrl: null,
		storeName: null,
		priceAmount: null,
		priceCurrency: null,
		quantityNeeded: 1,
		priority: "medium",
		publicNote: null,
		sortOrder: 0,
		categoryId: null,
		status: "available",
		remainingQuantity: 1,
		...overrides,
	};
}

function renderModal(gift = makeGift(), onOpenChange = vi.fn()) {
	return render(
		<PurchaseGiftModal gift={gift} onOpenChange={onOpenChange} open />,
	);
}

describe("PurchaseGiftModal", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	describe("consent copy", () => {
		it("renders consent copy about name sharing", () => {
			renderModal();
			expect(
				screen.getByText(/autorizas que tu nombre sea compartido/i),
			).toBeTruthy();
		});
	});

	describe("quantity selector", () => {
		it("does not show quantity selector when remainingQuantity is 1", () => {
			renderModal(makeGift({ remainingQuantity: 1 }));
			expect(screen.queryByLabelText(/cantidad/i)).toBeNull();
		});

		it("shows quantity selector when remainingQuantity is greater than 1", () => {
			renderModal(makeGift({ remainingQuantity: 3 }));
			expect(screen.getByLabelText(/cantidad/i)).toBeTruthy();
		});

		it("constrains quantity selector to 1..remainingQuantity", () => {
			renderModal(makeGift({ remainingQuantity: 5 }));
			const input = screen.getByLabelText(/cantidad/i) as HTMLInputElement;
			expect(input.min).toBe("1");
			expect(input.max).toBe("5");
		});
	});

	describe("name validation", () => {
		it("shows an error when name is too short", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.type(screen.getByLabelText(/tu nombre/i), "A");
			await user.click(screen.getByRole("button", { name: /confirmar/i }));

			expect(await screen.findByText(/entre 2 y 80 caracteres/i)).toBeTruthy();
			expect(mutateMock).not.toHaveBeenCalled();
		});

		it("shows an error when name is empty", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.click(screen.getByRole("button", { name: /confirmar/i }));

			expect(await screen.findByText(/entre 2 y 80 caracteres/i)).toBeTruthy();
			expect(mutateMock).not.toHaveBeenCalled();
		});

		it("submits when name is valid", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
			await user.click(screen.getByRole("button", { name: /confirmar/i }));

			expect(mutateMock).toHaveBeenCalledWith(
				expect.objectContaining({ guestName: "Ana García" }),
			);
		});
	});

	describe("optional field validation", () => {
		it("shows email error when invalid email is provided", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
			await user.type(
				screen.getByLabelText(/correo electrónico/i),
				"not-an-email",
			);
			await user.click(screen.getByRole("button", { name: /confirmar/i }));

			expect(
				await screen.findByText(/correo electrónico válido/i),
			).toBeTruthy();
			expect(mutateMock).not.toHaveBeenCalled();
		});

		it("accepts empty optional fields without error", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
			await user.click(screen.getByRole("button", { name: /confirmar/i }));

			expect(screen.queryByText(/correo electrónico válido/i)).toBeNull();
			expect(mutateMock).toHaveBeenCalled();
		});

		it("shows message error when message exceeds 500 characters", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
			fireEvent.change(screen.getByLabelText(/mensaje/i), {
				target: { value: "a".repeat(501) },
			});
			await user.click(screen.getByRole("button", { name: /confirmar/i }));

			expect(await screen.findByText(/500 caracteres/i)).toBeTruthy();
			expect(mutateMock).not.toHaveBeenCalled();
		});
	});
});
