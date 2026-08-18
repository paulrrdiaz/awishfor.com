// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllButtonStyles } from "@/config/public-button-styles";
import { GuestGiftDrawer } from "./guest-gift-drawer";

const mutateMock = vi.hoisted(() => vi.fn());
const undoMutateMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const callbacks = vi.hoisted(() => ({
	purchaseError: undefined as
		| ((error: { message: string }) => void)
		| undefined,
	purchaseSuccess: undefined as
		| ((data: {
				purchase: { id: string };
				undoExpiresAt: string;
				undoToken: string;
		  }) => void)
		| undefined,
	undoSuccess: undefined as (() => void) | undefined,
	undoError: undefined as ((error: { message: string }) => void) | undefined,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));
vi.mock("@/trpc/react", () => ({
	api: {
		purchase: {
			markGiftPurchased: {
				useMutation: (options: {
					onError?: typeof callbacks.purchaseError;
					onSuccess?: typeof callbacks.purchaseSuccess;
				}) => {
					callbacks.purchaseError = options.onError;
					callbacks.purchaseSuccess = options.onSuccess;
					return { isPending: false, mutate: mutateMock };
				},
			},
			undoRecentPurchase: {
				useMutation: (options: {
					onError?: typeof callbacks.undoError;
					onSuccess?: typeof callbacks.undoSuccess;
				}) => {
					callbacks.undoError = options.onError;
					callbacks.undoSuccess = options.onSuccess;
					return { isPending: false, mutate: undoMutateMock };
				},
			},
		},
	},
}));
vi.mock("@/components/ui/drawer", () => ({
	Drawer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	DrawerContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DrawerClose: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	DrawerDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	DrawerFooter: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DrawerHandle: () => null,
	DrawerHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DrawerTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	),
}));

const gift = {
	id: "gift-1",
	name: "Juego de sábanas",
	productUrl: "https://example.com/sabanas",
	imageUrl: null,
	storeName: null,
	priceAmount: null,
	priceCurrency: null,
	quantityNeeded: 2,
	priority: "medium" as const,
	publicNote: null,
	sortOrder: 0,
	categoryId: null,
	status: "available" as const,
	remainingQuantity: 2,
};
const delivery = {
	address: "Av. Universidad 1500",
	documentId: null,
	line: "Ana, Av. Universidad 1500",
	phone: null,
	recipientName: "Ana",
	rest: "Av. Universidad 1500",
};
const renderDrawer = (
	view: "product" | "purchase" | "success" = "purchase",
	props = {},
) =>
	render(
		<GuestGiftDrawer
			gift={gift}
			onOpenChange={vi.fn()}
			onViewChange={vi.fn()}
			open
			view={view}
			{...props}
		/>,
	);

function ControlledDrawer({
	initialView = "purchase",
	...props
}: Partial<React.ComponentProps<typeof GuestGiftDrawer>> & {
	initialView?: "product" | "purchase" | "success";
}) {
	const [view, setView] = useState(initialView);
	const [open, setOpen] = useState(true);
	return (
		<GuestGiftDrawer
			gift={gift}
			onOpenChange={setOpen}
			onViewChange={setView}
			open={open}
			view={view}
			{...props}
		/>
	);
}

describe("GuestGiftDrawer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	it("keeps delivery only in the product view and uses a safe store anchor", () => {
		renderDrawer("product", { delivery });
		expect(screen.getByText("Envío a domicilio")).toBeInTheDocument();
		expect(screen.getByText("Envíalo a esta dirección")).toBeInTheDocument();
		expect(screen.getByText("Ana")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /copiar/i })).toHaveClass(
			"w-full",
			"justify-center",
		);
		expect(
			screen.getByRole("link", { name: /ir a la tienda/i }),
		).toHaveAttribute("target", "_blank");
		expect(
			screen.getByRole("link", { name: /ir a la tienda/i }),
		).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("omits delivery details from product view when no address exists", () => {
		renderDrawer("product", { delivery: null });
		expect(screen.queryByText(/envíalo a esta dirección/i)).toBeNull();
		expect(screen.queryByRole("button", { name: /copiar/i })).toBeNull();
	});
	it("switches from purchase to product without clearing form fields", async () => {
		const user = userEvent.setup();
		const onViewChange = vi.fn();
		renderDrawer("purchase", { onViewChange });
		await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
		await user.click(screen.getByRole("button", { name: "Ver producto" }));
		expect(onViewChange).toHaveBeenCalledWith("product");
		expect(screen.getByLabelText(/tu nombre/i)).toHaveValue("Ana García");
	});

	it("returns to the preserved purchase form after opening the store from the form helper", async () => {
		const user = userEvent.setup();
		render(<ControlledDrawer productFromPurchase />);
		await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
		await user.click(screen.getByRole("button", { name: "Ver producto" }));
		await user.click(screen.getByRole("link", { name: /ir a la tienda/i }));
		expect(screen.getByLabelText(/tu nombre/i)).toHaveValue("Ana García");
	});

	it("keeps a direct-entry product view open after opening the store", async () => {
		const user = userEvent.setup();
		const onViewChange = vi.fn();
		renderDrawer("product", { onViewChange, productFromPurchase: false });
		await user.click(screen.getByRole("link", { name: /ir a la tienda/i }));
		expect(onViewChange).not.toHaveBeenCalled();
		expect(
			screen.getByRole("heading", { name: "Vas a salir de A Wish For" }),
		).toBeInTheDocument();
	});
	it("submits simplified payload without guestPhone", async () => {
		const user = userEvent.setup();
		renderDrawer();
		await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
		await user.click(screen.getByRole("button", { name: /confirmar regalo/i }));
		expect(mutateMock).toHaveBeenCalledWith(
			expect.objectContaining({ guestName: "Ana García", quantity: 1 }),
		);
		expect(mutateMock.mock.calls[0]?.[0]).not.toHaveProperty("guestPhone");
		expect(screen.queryByLabelText(/teléfono/i)).toBeNull();
		expect(screen.queryByText(/av\. universidad/i)).toBeNull();
	});

	it("keeps loading, inline validation, and retryable errors inside the purchase view", async () => {
		const user = userEvent.setup();
		renderDrawer("purchase", {
			debugState: { isLoading: true, view: "purchase" },
		});
		expect(screen.getByRole("button", { name: /confirmando/i })).toBeDisabled();

		renderDrawer();
		await user.click(screen.getByRole("button", { name: /confirmar regalo/i }));
		expect(screen.getByText(/entre 2 y 80 caracteres/i)).toBeInTheDocument();
	});

	it("surfaces a purchase failure inline and lets the guest retry", async () => {
		const user = userEvent.setup();
		render(<ControlledDrawer />);
		await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
		await user.click(screen.getByRole("button", { name: /confirmar regalo/i }));
		act(() => callbacks.purchaseError?.({ message: "No pudimos confirmar" }));
		expect(screen.getByText("No pudimos confirmar")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /confirmar regalo/i }));
		expect(mutateMock).toHaveBeenCalledTimes(2);
	});
	it("shows compact success, refreshes, then allows plain undo before server expiry", () => {
		const onViewChange = vi.fn();
		renderDrawer("purchase", { onViewChange });
		act(() =>
			callbacks.purchaseSuccess?.({
				purchase: { id: "purchase-1" },
				undoExpiresAt: "2099-01-01T00:00:00.000Z",
				undoToken: "raw",
			}),
		);
		expect(onViewChange).toHaveBeenCalledWith("success");
		expect(refreshMock).toHaveBeenCalledOnce();
		renderDrawer("success", {
			debugState: {
				undoExpiresAt: "2099-01-01T00:00:00.000Z",
				view: "success",
			},
		});
		expect(screen.getByText("ÉXITO")).toBeInTheDocument();
		expect(
			screen.getByText(/¡Gracias, amiga! Tu regalo quedó marcado\./),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Deshacer" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/segundos|expiró/i)).toBeNull();
	});

	it("preserves refresh and inline undo failures in the controlled success flow", async () => {
		const user = userEvent.setup();
		render(<ControlledDrawer />);
		await user.type(screen.getByLabelText(/tu nombre/i), "Ana García");
		await user.click(screen.getByRole("button", { name: /confirmar regalo/i }));
		act(() =>
			callbacks.purchaseSuccess?.({
				purchase: { id: "purchase-1" },
				undoExpiresAt: new Date(Date.now() + 60_000).toISOString(),
				undoToken: "raw",
			}),
		);
		expect(
			screen.getByText("¡Gracias, Ana García! Tu regalo quedó marcado."),
		).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Deshacer" }));
		expect(undoMutateMock).toHaveBeenCalledWith({
			purchaseId: "purchase-1",
			undoToken: "raw",
		});
		act(() => callbacks.undoError?.({ message: "Undo token has expired" }));
		expect(screen.getByText("Undo token has expired")).toBeInTheDocument();
	});
	it("hides undo at expiry and keeps success dismissible", () => {
		renderDrawer("success", {
			debugState: {
				undoExpiresAt: "2000-01-01T00:00:00.000Z",
				view: "success",
			},
		});
		expect(screen.queryByRole("button", { name: "Deshacer" })).toBeNull();
		expect(screen.getAllByRole("button", { name: "Cerrar" })).toHaveLength(2);
	});
	it("validates quantity boundaries", () => {
		renderDrawer();
		const quantity = screen.getByLabelText("Cantidad") as HTMLInputElement;
		expect(quantity.min).toBe("1");
		expect(quantity.max).toBe("2");
		fireEvent.change(quantity, { target: { value: "8" } });
		expect(quantity.value).toBe("2");
	});

	it("keeps quantity visible and fixed at one when a multi-unit gift has one remaining", () => {
		renderDrawer("purchase", {
			gift: { ...gift, remainingQuantity: 1 },
		});
		const quantity = screen.getByLabelText("Cantidad");
		expect(quantity).toBeDisabled();
		expect(quantity).toHaveValue(1);
	});

	it.each(
		getAllButtonStyles(),
	)("uses scoped public button variables and keyboard focus treatment for $id", (buttonStyle) => {
		const { container } = render(
			<div
				className="public-theme"
				data-btn-variant={buttonStyle.variant}
				style={
					{
						"--public-btn-border-width": buttonStyle.borderWidth,
						"--public-btn-radius": buttonStyle.borderRadius,
						"--public-btn-weight": buttonStyle.fontWeight,
					} as React.CSSProperties
				}
			>
				<GuestGiftDrawer
					gift={gift}
					onOpenChange={vi.fn()}
					onViewChange={vi.fn()}
					open
					view="product"
				/>
			</div>,
		);
		const theme = container.querySelector(".public-theme") as HTMLElement;
		expect(theme.style.getPropertyValue("--public-btn-radius")).toBe(
			buttonStyle.borderRadius,
		);
		for (const action of screen.getAllByRole("button")) {
			expect(action).toHaveClass("public-btn");
		}
		const closeButton = screen
			.getAllByRole("button", { name: "Cerrar" })
			.find((button) => button.getAttribute("aria-label") === "Cerrar");
		if (!closeButton) throw new Error("Drawer close button missing");
		expect(closeButton).toHaveClass("focus-visible:ring-3");
	});
});
