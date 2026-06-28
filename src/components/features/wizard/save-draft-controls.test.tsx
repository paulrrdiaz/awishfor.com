// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SaveDraftControls } from "@/components/features/wizard/save-draft-controls";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";

const useUserMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({
	useUser: useUserMock,
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			saveDraft: {
				useMutation: () => ({
					mutateAsync: mutateAsyncMock,
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
	heroTitle: "Nuestra boda",
	welcomeMessage: "Bienvenidos",
	thankYouMessage: "Gracias",
	categories: ["Hogar"],
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	showHowItWorks: true,
	gifts: [
		{
			id: "gift_1",
			name: "Juego de sábanas",
			productUrl: "https://example.com/sabanas",
			imageUrl: null,
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 2,
			priority: "high",
			publicNote: "Algodón",
			internalNote: "",
			hidden: false,
			sortOrder: 0,
		},
	],
	...overrides,
});

const renderControls = ({
	isSignedIn = true,
	draft = makeDraft(),
	savedWishlistId = null,
	lastSavedAt = null,
}: {
	isSignedIn?: boolean;
	draft?: WishlistDraft;
	savedWishlistId?: string | null;
	lastSavedAt?: number | null;
} = {}) => {
	useUserMock.mockReturnValue({ isSignedIn });
	const store = createWishlistWizardStore();
	store.getState().replaceDraft(draft, {
		savedWishlistId,
		lastSavedAt,
	});

	const result = render(
		<WizardProvider store={store}>
			<SaveDraftControls />
		</WizardProvider>,
	);

	return { store, ...result };
};

describe("SaveDraftControls", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("saves manually for signed-in users, updates metadata, and shows success feedback", async () => {
		mutateAsyncMock.mockResolvedValue({
			status: "saved",
			wishlistId: "wishlist_123",
			lastSavedAt: 123456789,
		});
		const user = userEvent.setup();
		const { store } = renderControls();

		await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

		await waitFor(() => {
			expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
		});

		expect(store.getState().savedWishlistId).toBe("wishlist_123");
		expect(store.getState().lastSavedAt).toBe(123456789);
		expect(toastSuccessMock).toHaveBeenCalledWith("Borrador guardado");
		expect(
			screen
				.getByRole("link", { name: /ver en dashboard/i })
				.getAttribute("href"),
		).toBe("/dashboard");
	});

	it("prevents duplicate save requests while one is pending", async () => {
		let resolveRequest: ((value: unknown) => void) | undefined;
		mutateAsyncMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveRequest = resolve;
				}),
		);
		const user = userEvent.setup();
		renderControls();

		const button = screen.getByRole("button", { name: /guardar borrador/i });
		await user.click(button);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: /guardando/i })).toBeTruthy();
		});
		await user.click(screen.getByRole("button", { name: /guardando/i }));

		expect(mutateAsyncMock).toHaveBeenCalledTimes(1);

		resolveRequest?.({
			status: "saved",
			wishlistId: "wishlist_123",
			lastSavedAt: 123456789,
		});
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /guardar borrador/i }),
			).toBeTruthy();
		});
	});

	it("prompts signed-out users to authenticate without sending a save mutation", async () => {
		const user = userEvent.setup();
		renderControls({ isSignedIn: false });

		await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

		expect(mutateAsyncMock).not.toHaveBeenCalled();
		expect(
			screen.getByText(/inicia sesión para guardar este borrador/i),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: /iniciar sesión/i })
				.getAttribute("href"),
		).toBe("/sign-in?redirect_url=%2Fcreate");
	});

	it("loads the server version when the user chooses the dashboard draft after a conflict", async () => {
		mutateAsyncMock.mockResolvedValue({
			status: "conflict",
			serverDraft: {
				title: "Versión del dashboard",
				slug: "dashboard",
				eventType: "wedding",
				language: "es",
				currency: "PEN",
				heroTitle: null,
				welcomeMessage: "Desde dashboard",
				thankYouMessage: null,
				displayName: null,
				eventDate: "2026-12-31",
				eventTime: null,
				eventLocation: null,
				coverImageUrl: null,
				themeId: "soft",
				layoutId: "editorial",
				buttonStyle: "pill",
				fontPairing: "serif-soft",
				showHowItWorks: true,
				categories: ["Dashboard"],
				gifts: [],
				savedWishlistId: "wishlist_123",
				lastSavedAt: 999,
			},
		});
		const user = userEvent.setup();
		const { store } = renderControls();

		await user.click(screen.getByRole("button", { name: /guardar borrador/i }));
		await user.click(
			await screen.findByRole("button", {
				name: /usar versión del dashboard/i,
			}),
		);

		expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
		expect(store.getState().draft.title).toBe("Versión del dashboard");
		expect(store.getState().savedWishlistId).toBe("wishlist_123");
		expect(store.getState().lastSavedAt).toBe(999);
	});

	it("retries with explicit overwrite confirmation when the user keeps the local draft", async () => {
		mutateAsyncMock
			.mockResolvedValueOnce({
				status: "conflict",
				serverDraft: {
					title: "Versión del dashboard",
					slug: "dashboard",
					eventType: "wedding",
					language: "es",
					currency: "PEN",
					heroTitle: null,
					welcomeMessage: "Desde dashboard",
					thankYouMessage: null,
					displayName: null,
					eventDate: "2026-12-31",
					eventTime: null,
					eventLocation: null,
					coverImageUrl: null,
					themeId: "soft",
					layoutId: "editorial",
					buttonStyle: "pill",
					fontPairing: "serif-soft",
					showHowItWorks: true,
					categories: ["Dashboard"],
					gifts: [],
					savedWishlistId: "wishlist_123",
					lastSavedAt: 999,
				},
			})
			.mockResolvedValueOnce({
				status: "saved",
				wishlistId: "wishlist_123",
				lastSavedAt: 1000,
			});
		const user = userEvent.setup();
		const { store } = renderControls({
			savedWishlistId: "wishlist_123",
			lastSavedAt: 100,
		});

		await user.click(screen.getByRole("button", { name: /guardar borrador/i }));
		await user.click(
			await screen.findByRole("button", {
				name: /continuar con este borrador local/i,
			}),
		);

		expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
		expect(mutateAsyncMock.mock.calls[1]?.[0]).toMatchObject({
			savedWishlistId: "wishlist_123",
			lastSavedAt: 100,
			force: true,
		});
		expect(store.getState().lastSavedAt).toBe(1000);
	});

	it("clears stale local metadata and offers save-as-new when the server draft is missing", async () => {
		mutateAsyncMock
			.mockRejectedValueOnce({
				data: {
					code: "NOT_FOUND",
				},
			})
			.mockResolvedValueOnce({
				status: "saved",
				wishlistId: "wishlist_new",
				lastSavedAt: 222,
			});
		const user = userEvent.setup();
		const { store } = renderControls({
			savedWishlistId: "wishlist_old",
			lastSavedAt: 111,
		});

		await user.click(screen.getByRole("button", { name: /guardar borrador/i }));
		await user.click(
			await screen.findByRole("button", { name: /guardar como nuevo/i }),
		);

		expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
		expect(mutateAsyncMock.mock.calls[1]?.[0]).toMatchObject({
			savedWishlistId: null,
			lastSavedAt: null,
			force: false,
		});
		expect(store.getState().savedWishlistId).toBe("wishlist_new");
		expect(store.getState().lastSavedAt).toBe(222);
	});
});
