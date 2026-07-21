// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("nuqs", async () => {
	const React = await vi.importActual<typeof import("react")>("react");

	return {
		useQueryState: (key: string) => {
			const readValue = () =>
				new URLSearchParams(window.location.search).get(key);
			const [value, setValue] = React.useState<string | null>(() =>
				readValue(),
			);

			React.useEffect(() => {
				const sync = () => setValue(readValue());
				window.addEventListener("querychange", sync);
				window.addEventListener("popstate", sync);
				return () => {
					window.removeEventListener("querychange", sync);
					window.removeEventListener("popstate", sync);
				};
			}, [key]);

			const setQueryState = async (
				nextValue: string | null | ((oldValue: string | null) => string | null),
			) => {
				const currentValue = readValue();
				const resolvedValue =
					typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
				const params = new URLSearchParams(window.location.search);

				if (resolvedValue === null || resolvedValue === "") {
					params.delete(key);
				} else {
					params.set(key, resolvedValue);
				}

				const query = params.toString();
				window.history.replaceState(
					{},
					"",
					`${window.location.pathname}${query ? `?${query}` : ""}`,
				);
				window.dispatchEvent(new Event("querychange"));

				return params;
			};

			return [value, setQueryState] as const;
		},
	};
});

vi.mock("@/components/ui/drawer", () => ({
	Drawer: ({
		children,
		open,
	}: {
		children: React.ReactNode;
		open?: boolean;
	}) => (open ? <div>{children}</div> : null),
	DrawerContent: ({ children, ...props }: React.ComponentProps<"div">) => (
		<div data-testid="edit-drawer" {...props}>
			{children}
		</div>
	),
	DrawerDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	DrawerHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DrawerTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
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
	displayName: "Ana y Luis",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	dressCode: "",
	coverImageUrl: null,
	coverImageUrls: [],
	heroTitle: "Nuestra boda",
	welcomeMessage: "Bienvenidos",
	thankYouMessage: "Gracias",
	categories: ["Hogar", "Favoritos"],
	themeId: "soft",
	layoutId: "minimal",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	headingFont: null,
	bodyFont: null,
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
		window.history.replaceState({}, "", "/create?step=gifts");
	});

	afterEach(() => {
		cleanup();
	});

	it("opens the edit drawer from the giftId query param and keeps the list visible", async () => {
		window.history.replaceState({}, "", "/create?step=gifts&giftId=gift_1");
		renderStep();

		expect(
			await screen.findByRole("heading", { name: /editar regalo/i }),
		).toBeTruthy();
		expect(screen.getAllByText("Lámpara de mesa").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Juego de copas").length).toBeGreaterThan(0);

		const params = new URLSearchParams(window.location.search);
		expect(params.get("step")).toBe("gifts");
		expect(params.get("giftId")).toBe("gift_1");
	});

	it("saves drawer edits through the store and clears giftId while preserving step", async () => {
		const user = userEvent.setup();
		const { store } = renderStep();
		const [firstEditButton] = screen.getAllByRole("button", { name: "Editar" });

		expect(firstEditButton).toBeTruthy();
		if (!firstEditButton) throw new Error("Expected at least one edit button");
		await user.click(firstEditButton);
		expect(await screen.findByTestId("edit-drawer")).toBeTruthy();

		const nameInput = screen.getByLabelText(/nombre del regalo/i);
		await user.clear(nameInput);
		await user.type(nameInput, "Lámpara actualizada");
		await user.click(
			screen.getByRole("button", { name: /actualizar regalo/i }),
		);

		await waitFor(() => {
			expect(screen.queryByTestId("edit-drawer")).toBeNull();
		});

		expect(store.getState().draft.gifts[0]?.name).toBe("Lámpara actualizada");
		const params = new URLSearchParams(window.location.search);
		expect(params.get("step")).toBe("gifts");
		expect(params.get("giftId")).toBeNull();
	});

	it("cancels drawer edits without mutating the draft and clears giftId", async () => {
		const user = userEvent.setup();
		const { store } = renderStep();
		const [firstEditButton] = screen.getAllByRole("button", { name: "Editar" });

		expect(firstEditButton).toBeTruthy();
		if (!firstEditButton) throw new Error("Expected at least one edit button");
		await user.click(firstEditButton);
		expect(await screen.findByTestId("edit-drawer")).toBeTruthy();

		const nameInput = screen.getByLabelText(/nombre del regalo/i);
		await user.clear(nameInput);
		await user.type(nameInput, "Cambio temporal");
		await user.click(screen.getByRole("button", { name: /cancelar/i }));

		await waitFor(() => {
			expect(screen.queryByTestId("edit-drawer")).toBeNull();
		});

		expect(store.getState().draft.gifts[0]?.name).toBe("Lámpara de mesa");
		const params = new URLSearchParams(window.location.search);
		expect(params.get("step")).toBe("gifts");
		expect(params.get("giftId")).toBeNull();
	});

	it("clears stale giftId values without opening the drawer or changing gifts", async () => {
		window.history.replaceState({}, "", "/create?step=gifts&giftId=missing");
		const { store } = renderStep();

		await waitFor(() => {
			const params = new URLSearchParams(window.location.search);
			expect(params.get("giftId")).toBeNull();
		});

		expect(screen.queryByTestId("edit-drawer")).toBeNull();
		expect(store.getState().draft.gifts.map((gift) => gift.name)).toEqual([
			"Lámpara de mesa",
			"Juego de copas",
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
});
