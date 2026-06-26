// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStep } from "@/components/features/wizard/publish-step";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";

const useUserMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const checkSlugAvailabilityMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const downloadQrCodePngMock = vi.hoisted(() => vi.fn());

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

vi.mock("next/image", () => ({
	default: ({ alt, src, ...props }: { alt: string; src: string }) => (
		/* biome-ignore lint/performance/noImgElement: jsdom test mock for next/image */
		<img alt={alt} src={src} {...props} />
	),
}));

vi.mock("next/font/google", () => {
	const makeFont = () => ({
		className: "font-test",
		variable: "--font-test",
	});

	return {
		Cormorant_Garamond: () => makeFont(),
		Inter: () => makeFont(),
		Lato: () => makeFont(),
		Montserrat: () => makeFont(),
		Nunito: () => makeFont(),
		Playfair_Display: () => makeFont(),
	};
});

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

vi.mock("@/lib/qr", () => ({
	downloadQrCodePng: downloadQrCodePngMock,
}));

vi.mock("@/trpc/react", () => ({
	api: {
		useUtils: () => ({
			wishlist: {
				checkSlugAvailability: {
					fetch: checkSlugAvailabilityMock,
				},
			},
		}),
		wishlist: {
			publishWizard: {
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
	coverImageUrl: null,
	heroTitle: "Nuestra boda",
	welcomeMessage: "Bienvenidos",
	thankYouMessage: "Gracias",
	categories: ["Hogar"],
	themeId: "soft",
	layoutId: "minimal",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	showHowItWorks: true,
	gifts: [
		{
			id: "gift_1",
			name: "Juego de sábanas",
			productUrl: null,
			imageUrl: null,
			priceAmount: 120,
			category: "Hogar",
			quantityNeeded: 1,
			priority: "high",
			publicNote: "Algodón",
			internalNote: "",
			hidden: false,
			sortOrder: 0,
		},
	],
	...overrides,
});

const renderStep = ({
	isSignedIn = true,
	draft = makeDraft(),
	savedWishlistId = "wishlist_123",
	savedSlug = draft.slug,
	lastSavedAt = 123456789,
	publishSuccess = null,
}: {
	isSignedIn?: boolean;
	draft?: WishlistDraft;
	savedWishlistId?: string | null;
	savedSlug?: string | null;
	lastSavedAt?: number | null;
	publishSuccess?: {
		wishlistId: string;
		slug: string;
		publicUrlPath: string;
		dashboardUrlPath: string;
	} | null;
} = {}) => {
	useUserMock.mockReturnValue({ isSignedIn });
	const store = createWishlistWizardStore();
	store.getState().replaceDraft(draft, {
		savedWishlistId,
		savedSlug,
		lastSavedAt,
	});

	if (publishSuccess) {
		store.getState().completePublish(publishSuccess);
	}

	const result = render(
		<WizardProvider store={store}>
			<PublishStep />
		</WizardProvider>,
	);

	return { store, ...result };
};

describe("PublishStep", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		checkSlugAvailabilityMock.mockResolvedValue({ available: true });
		vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
	});

	it("renders the final preview, enables publish for a ready draft, and keeps purchase actions disabled", async () => {
		renderStep();

		await waitFor(() => {
			expect(checkSlugAvailabilityMock).toHaveBeenCalledWith({
				slug: "lista-de-boda",
				excludeWishlistId: "wishlist_123",
			});
		});

		expect(
			screen
				.getByRole("button", { name: /publicar wishlist/i })
				.getAttribute("disabled"),
		).toBeNull();
		expect(
			screen
				.getByRole("link", { name: /abrir vista completa/i })
				.getAttribute("href"),
		).toBe("/w/lista-de-boda");
		expect(screen.queryByRole("button", { name: /regalar/i })).toBeNull();
	});

	it("prompts signed-out users to authenticate without sending a publish mutation", async () => {
		const user = userEvent.setup();
		const { store } = renderStep({ isSignedIn: false });

		await waitFor(() => {
			expect(
				screen
					.getByRole("button", { name: /inicia sesión para publicar/i })
					.getAttribute("disabled"),
			).toBeNull();
		});
		await user.click(
			screen.getByRole("button", { name: /inicia sesión para publicar/i }),
		);

		expect(mutateAsyncMock).not.toHaveBeenCalled();
		expect(
			screen
				.getByRole("link", { name: /iniciar sesión/i })
				.getAttribute("href"),
		).toBe("/sign-in?redirect_url=%2Fcreate%3Fstep%3Dpublish");
		expect(store.getState().draft.title).toBe("Lista de boda");
	});

	it("stores publish success state, clears the local draft, and shows share actions after a successful publish", async () => {
		mutateAsyncMock.mockResolvedValue({
			status: "published",
			wishlistId: "wishlist_123",
			slug: "lista-de-boda",
			publicUrlPath: "/w/lista-de-boda",
			dashboardUrlPath: "/dashboard",
		});
		const user = userEvent.setup();
		const { store } = renderStep();

		await waitFor(() => {
			expect(
				screen
					.getByRole("button", { name: /publicar wishlist/i })
					.getAttribute("disabled"),
			).toBeNull();
		});
		await user.click(
			screen.getByRole("button", { name: /publicar wishlist/i }),
		);

		await waitFor(() => {
			expect(screen.getByText(/tu wishlist está publicada/i)).toBeTruthy();
		});

		expect(store.getState().draft.title).toBe("");
		expect(store.getState().savedWishlistId).toBeNull();
		expect(store.getState().publishSuccess).toEqual({
			wishlistId: "wishlist_123",
			slug: "lista-de-boda",
			publicUrlPath: "/w/lista-de-boda",
			dashboardUrlPath: "/dashboard",
		});
		expect(Storage.prototype.removeItem).toHaveBeenCalledWith(
			"wishlist-wizard-draft",
		);
		expect(toastSuccessMock).toHaveBeenCalledWith("Wishlist publicada");
	});

	it("supports copy, WhatsApp, and QR actions from the publish success state", async () => {
		const user = userEvent.setup();
		renderStep({
			publishSuccess: {
				wishlistId: "wishlist_123",
				slug: "lista-de-boda",
				publicUrlPath: "/w/lista-de-boda",
				dashboardUrlPath: "/dashboard",
			},
		});

		const publicUrl = toCanonicalWishlistUrl("/w/lista-de-boda");

		expect(screen.getByRole("button", { name: /copiar enlace/i })).toBeTruthy();

		await user.click(screen.getByRole("button", { name: /descargar qr/i }));

		expect(downloadQrCodePngMock).toHaveBeenCalledWith({
			text: publicUrl,
			fileName: "lista-de-boda-qr.png",
		});

		expect(
			screen
				.getByRole("link", { name: /compartir por whatsapp/i })
				.getAttribute("href"),
		).toContain(encodeURIComponent(publicUrl));
		expect(
			screen
				.getByRole("link", { name: /gestionar en dashboard/i })
				.getAttribute("href"),
		).toBe("/dashboard");
		expect(screen.getByText(publicUrl)).toBeTruthy();
	});
});
