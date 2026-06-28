// @vitest-environment jsdom

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PurchaseGiftModal } from "@/components/features/wishlist/purchase-gift-modal";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";

const mutateMock = vi.hoisted(() => vi.fn());
const undoMutateMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

const mockCallbacks = vi.hoisted(() => ({
	purchaseSuccess: undefined as
		| ((data: { purchase: { id: string }; undoToken: string }) => void)
		| undefined,
	purchaseError: undefined as ((e: { message: string }) => void) | undefined,
	undoSuccess: undefined as (() => void) | undefined,
	undoError: undefined as ((e: { message: string }) => void) | undefined,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("@/trpc/react", () => ({
	api: {
		purchase: {
			markGiftPurchased: {
				useMutation: (opts: {
					onSuccess?: (data: {
						purchase: { id: string };
						undoToken: string;
					}) => void;
					onError?: (e: { message: string }) => void;
				}) => {
					mockCallbacks.purchaseSuccess = opts?.onSuccess;
					mockCallbacks.purchaseError = opts?.onError;
					return { mutate: mutateMock, isPending: false };
				},
			},
			undoRecentPurchase: {
				useMutation: (opts: {
					onSuccess?: () => void;
					onError?: (e: { message: string }) => void;
				}) => {
					mockCallbacks.undoSuccess = opts?.onSuccess;
					mockCallbacks.undoError = opts?.onError;
					return { mutate: undoMutateMock, isPending: false };
				},
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
				screen.getByText(
					/Al marcar este regalo como comprado, compartiremos tu nombre y los datos opcionales que ingreses con el creador de la lista\./i,
				),
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

	describe("success state", () => {
		function triggerPurchaseSuccess() {
			act(() => {
				mockCallbacks.purchaseSuccess?.({
					purchase: { id: "purchase-1" },
					undoToken: "raw-token-abc",
				});
			});
		}

		it("shows success state with non-personalized fallback copy when no name entered", () => {
			renderModal();
			triggerPurchaseSuccess();

			expect(screen.getByText(/regalo confirmado/i)).toBeTruthy();
			expect(
				screen.getByText(
					/¡Gracias! Tu regalo fue marcado como comprado\. Gracias por tu cariño y por ser parte de este momento\./i,
				),
			).toBeTruthy();
		});

		it("shows personalized copy with guest name in success state", async () => {
			const user = userEvent.setup();
			renderModal();

			await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
			triggerPurchaseSuccess();

			expect(
				screen.getByText(
					/¡Gracias, Ana García! Tu regalo fue marcado como comprado\. Gracias por tu cariño y por ser parte de este momento\./i,
				),
			).toBeTruthy();
		});

		it("shows Deshacer and Cerrar buttons in success state", () => {
			renderModal();
			triggerPurchaseSuccess();

			expect(screen.getByRole("button", { name: /deshacer/i })).toBeTruthy();
			expect(screen.getByRole("button", { name: /cerrar/i })).toBeTruthy();
		});

		it("hides the form in success state", () => {
			renderModal();
			triggerPurchaseSuccess();

			expect(
				screen.queryByRole("button", { name: /confirmar regalo/i }),
			).toBeNull();
			expect(screen.queryByLabelText(/tu nombre/i)).toBeNull();
		});

		it("calls router.refresh after purchase succeeds", () => {
			renderModal();
			triggerPurchaseSuccess();

			expect(refreshMock).toHaveBeenCalledTimes(1);
		});

		it("Deshacer invokes undoRecentPurchase mutation with stored purchaseId and undoToken", async () => {
			const user = userEvent.setup();
			renderModal();
			triggerPurchaseSuccess();

			await user.click(screen.getByRole("button", { name: /deshacer/i }));

			expect(undoMutateMock).toHaveBeenCalledWith({
				purchaseId: "purchase-1",
				undoToken: "raw-token-abc",
			});
		});

		it("shows undo error when undo fails and keeps success state", () => {
			renderModal();
			triggerPurchaseSuccess();

			act(() => {
				mockCallbacks.undoError?.({ message: "Undo token has expired" });
			});

			expect(screen.getByText(/undo token has expired/i)).toBeTruthy();
			expect(
				screen.getByRole("button", { name: /deshacer \(\d+ s\)/i }),
			).toBeTruthy();
		});

		it("Cerrar closes the modal without calling undo mutation", async () => {
			const user = userEvent.setup();
			const onOpenChange = vi.fn();
			render(
				<PurchaseGiftModal
					gift={makeGift()}
					onOpenChange={onOpenChange}
					open
				/>,
			);
			triggerPurchaseSuccess();

			await user.click(screen.getByRole("button", { name: /cerrar/i }));

			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(undoMutateMock).not.toHaveBeenCalled();
		});

		it("calls router.refresh and closes after successful undo", () => {
			const onOpenChange = vi.fn();
			render(
				<PurchaseGiftModal
					gift={makeGift()}
					onOpenChange={onOpenChange}
					open
				/>,
			);
			triggerPurchaseSuccess();

			act(() => {
				mockCallbacks.undoSuccess?.();
			});

			expect(refreshMock).toHaveBeenCalledTimes(2);
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		describe("undo countdown", () => {
			beforeEach(() => {
				vi.useFakeTimers();
			});

			afterEach(() => {
				vi.useRealTimers();
			});

			it("shows countdown on Deshacer button when success state is entered", () => {
				renderModal();
				triggerPurchaseSuccess();

				expect(
					screen.getByRole("button", { name: /deshacer \(8 s\)/i }),
				).toBeTruthy();
			});

			it("decrements the countdown on the Deshacer button each second", () => {
				renderModal();
				triggerPurchaseSuccess();

				act(() => {
					vi.advanceTimersByTime(3000);
				});

				expect(
					screen.getByRole("button", { name: /deshacer \(5 s\)/i }),
				).toBeTruthy();
			});

			it("replaces Deshacer with expiry message after 8 seconds", () => {
				renderModal();
				triggerPurchaseSuccess();

				act(() => {
					vi.advanceTimersByTime(8000);
				});

				expect(screen.queryByRole("button", { name: /deshacer/i })).toBeNull();
				expect(
					screen.getByText(/el tiempo para deshacer expiró/i),
				).toBeTruthy();
				expect(screen.getByRole("button", { name: /cerrar/i })).toBeTruthy();
			});
		});
	});
});
