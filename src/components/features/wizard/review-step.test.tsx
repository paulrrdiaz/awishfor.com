// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewStep } from "@/components/features/wizard/review-step";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";

const useUserMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const checkSlugAvailabilityMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({
	useUser: useUserMock,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	useSearchParams: () => new URLSearchParams("step=review"),
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
		error: vi.fn(),
	},
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
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	dressCode: "",
	images: [
		{
			url: "https://cdn.test/cover.jpg",
			width: 1600,
			height: 900,
			orientation: "landscape",
		},
	],
	welcomeMessage: "Bienvenidos",
	thankYouMessage: "Gracias",
	categories: ["Hogar"],
	themeId: "soft",
	layoutId: "magazine-editorial",
	buttonStyle: "pill",
	headingFont: null,
	bodyFont: null,
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
}: {
	isSignedIn?: boolean;
	draft?: WishlistDraft;
	savedWishlistId?: string | null;
	savedSlug?: string | null;
	lastSavedAt?: number | null;
} = {}) => {
	useUserMock.mockReturnValue({ isSignedIn });
	const store = createWishlistWizardStore();
	store.getState().replaceDraft(draft, {
		savedWishlistId,
		savedSlug,
		lastSavedAt,
	});

	// ReviewStep portals its publish button into a slot that WizardNav renders
	// in the real app; provide it here so the button is reachable in
	// isolation, matching how it actually mounts in production.
	document.getElementById("publish-cta-slot-desktop")?.remove();
	const desktopSlot = document.createElement("div");
	desktopSlot.id = "publish-cta-slot-desktop";
	document.body.appendChild(desktopSlot);

	const result = render(
		<WizardProvider store={store}>
			<ReviewStep />
		</WizardProvider>,
	);

	return { store, ...result };
};

describe("ReviewStep", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		checkSlugAvailabilityMock.mockResolvedValue({ available: true });
		vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
	});

	it("renders the labeled preview, enables publish for a ready draft, and keeps purchase actions disabled", async () => {
		renderStep();

		await waitFor(() => {
			expect(checkSlugAvailabilityMock).toHaveBeenCalledWith({
				slug: "lista-de-boda",
				excludeWishlistId: "wishlist_123",
			});
		});

		expect(screen.getByText(/así lo verán tus invitados/i)).toBeTruthy();
		expect(
			screen
				.getByRole("button", { name: /publicar wishlist/i })
				.getAttribute("disabled"),
		).toBeNull();
		expect(screen.queryByRole("button", { name: /regalar/i })).toBeNull();
	});

	it("shows the specific name and occasion once the draft is ready", async () => {
		renderStep();

		await waitFor(() => {
			expect(screen.getByText("Lista de boda · Boda")).toBeTruthy();
		});
	});

	it("blocks publish when the draft has fewer cover images than its layout needs", async () => {
		renderStep({
			draft: makeDraft({ images: [], layoutId: "collage-staggered" }),
		});

		await waitFor(() => {
			expect(
				screen.getByText(/te faltan 3 fotos para "collage escalonado"/i),
			).toBeTruthy();
		});
		expect(
			screen
				.getByRole("button", { name: /publicar wishlist/i })
				.getAttribute("disabled"),
		).toBeNull();

		const user = userEvent.setup();
		await user.click(
			screen.getByRole("button", { name: /publicar wishlist/i }),
		);

		expect(mutateAsyncMock).not.toHaveBeenCalled();
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
		).toBe("/sign-in?redirect_url=%2Fcreate%3Fstep%3Dreview");
		expect(store.getState().draft.title).toBe("Lista de boda");
	});

	it("publishes, clears the local draft, and navigates to the published step", async () => {
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
			expect(pushMock).toHaveBeenCalledWith(
				expect.stringContaining("step=published"),
			);
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
});
