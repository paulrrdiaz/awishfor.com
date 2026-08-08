// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GiftsStep } from "@/components/features/wizard/gifts-step";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";

const importFromUrlMock = vi.hoisted(() => vi.fn());

vi.mock("next/image", () => ({
	default: ({
		alt,
		src,
		fill: _fill,
		unoptimized: _unoptimized,
		...props
	}: {
		alt: string;
		src: string;
		fill?: boolean;
		unoptimized?: boolean;
	}) => (
		/* biome-ignore lint/performance/noImgElement: jsdom test mock for next/image */
		<img alt={alt} src={src} {...props} />
	),
}));

vi.mock("@/components/ui/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipContent: () => null,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock("@/trpc/react", () => ({
	api: {
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

const makeDraft = (overrides: Partial<WishlistDraft> = {}): WishlistDraft => ({
	eventType: "wedding",
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	dressCode: "",
	images: [],
	welcomeMessage: "Bienvenidos",
	thankYouMessage: "Gracias",
	categories: ["Hogar", "Favoritos"],
	themeId: "soft",
	layoutId: "magazine-editorial",
	buttonStyle: "pill",
	headingFont: null,
	bodyFont: null,
	countdownVariant: null,
	welcomeMessageVariant: null,
	thankYouMessageVariant: null,
	showHowItWorks: true,
	gifts: [
		{
			id: "gift_1",
			name: "Lámpara de mesa",
			productUrl: null,
			imageUrl: "https://example.com/lamp.png",
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 1,
			priority: "high",
			publicNote: "",
			internalNote: "",
			hidden: false,
			sortOrder: 0,
		},
		{
			id: "gift_2",
			name: "Juego de copas",
			productUrl: null,
			imageUrl: null,
			priceAmount: null,
			category: "",
			quantityNeeded: 2,
			priority: "medium",
			publicNote: "",
			internalNote: "",
			hidden: false,
			sortOrder: 1,
		},
	],
	...overrides,
});

function renderStep(draft = makeDraft()) {
	const store = createWishlistWizardStore();
	store.getState().replaceDraft(draft);

	const result = render(
		<WizardProvider rehydrate={false} store={store}>
			<GiftsStep />
		</WizardProvider>,
	);

	return { store, ...result };
}

describe("GiftsStep", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("offers no edit, hide, or reorder control for an existing gift", () => {
		renderStep();

		expect(screen.queryByRole("button", { name: /^editar$/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /^ocultar$/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /^mostrar$/i })).toBeNull();
		expect(screen.queryByTestId("edit-drawer")).toBeNull();
		expect(screen.getAllByRole("button", { name: /^eliminar$/i }).length).toBe(
			2,
		);
	});

	it("removes a gift via delete and updates the draft", async () => {
		const user = userEvent.setup();
		const { store } = renderStep();

		const [firstDeleteButton] = screen.getAllByRole("button", {
			name: /^eliminar$/i,
		});
		expect(firstDeleteButton).toBeTruthy();
		if (!firstDeleteButton) throw new Error("Expected a delete button");
		await user.click(firstDeleteButton);

		expect(store.getState().draft.gifts.map((gift) => gift.name)).toEqual([
			"Juego de copas",
		]);
		expect(screen.queryByText("Lámpara de mesa")).toBeNull();
	});

	it("adds a manual gift without a product URL", async () => {
		const user = userEvent.setup();
		const { store } = renderStep(makeDraft({ gifts: [] }));

		await user.click(
			screen.getByRole("button", { name: /agregar regalo manualmente/i }),
		);
		await user.type(
			screen.getByLabelText(/nombre del regalo/i),
			"Set de toallas",
		);
		await user.click(screen.getByRole("button", { name: /guardar regalo/i }));

		expect(store.getState().draft.gifts.map((gift) => gift.name)).toEqual([
			"Set de toallas",
		]);
	});

	it("assigns a category and quantity to a new gift", async () => {
		const user = userEvent.setup();
		const { store } = renderStep(makeDraft({ gifts: [] }));

		await user.click(
			screen.getByRole("button", { name: /agregar regalo manualmente/i }),
		);
		await user.type(screen.getByLabelText(/nombre del regalo/i), "Vajilla");
		const quantityInput = screen.getByLabelText(/^cantidad$/i);
		await user.tripleClick(quantityInput);
		await user.keyboard("3");
		await user.click(screen.getByRole("button", { name: /guardar regalo/i }));

		const gift = store.getState().draft.gifts[0];
		expect(gift?.name).toBe("Vajilla");
		expect(gift?.quantityNeeded).toBe(3);
	});

	it("imports a gift from a URL", async () => {
		importFromUrlMock.mockResolvedValue({
			ok: true,
			draft: {
				name: "Cafetera",
				productUrl: "https://tienda.com/cafetera",
				imageUrl: null,
				priceAmount: 90,
			},
		});
		const user = userEvent.setup();
		const { store } = renderStep(makeDraft({ gifts: [] }));

		await user.type(
			screen.getByPlaceholderText(/tienda.com/i),
			"https://tienda.com/cafetera",
		);
		await user.click(screen.getByRole("button", { name: /^importar$/i }));

		expect(store.getState().draft.gifts.map((gift) => gift.name)).toEqual([
			"Cafetera",
		]);
	});

	it("renders icon-only category actions with category-specific accessible labels", () => {
		renderStep();

		expect(screen.queryByRole("button", { name: /^Renombrar$/i })).toBeNull();
		expect(screen.queryByRole("button", { name: /^Quitar$/i })).toBeNull();
		expect(
			screen.getByRole("button", { name: "Renombrar categoría Hogar" }),
		).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Quitar categoría Hogar" }),
		).toBeTruthy();
	});

	it("renders the preview pane with guest-styled gift cards", () => {
		renderStep();

		expect(screen.getByText(/así los verán tus invitados/i)).toBeTruthy();
		expect(screen.getAllByText("Lámpara de mesa").length).toBeGreaterThan(0);
	});
});
