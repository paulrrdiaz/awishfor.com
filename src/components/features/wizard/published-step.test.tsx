// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishedStep } from "@/components/features/wizard/published-step";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import type { WishlistDraft } from "@/stores/wishlist-wizard.store";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";

const downloadQrCodePngMock = vi.hoisted(() => vi.fn());
const confettiMock = vi.hoisted(() => vi.fn());

vi.mock("canvas-confetti", () => ({
	default: confettiMock,
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
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/lib/qr", () => ({
	downloadQrCodePng: downloadQrCodePngMock,
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
	categories: ["Hogar"],
	themeId: "soft",
	layoutId: "magazine-editorial",
	buttonStyle: "pill",
	headingFont: null,
	bodyFont: null,
	countdownVariant: null,
	welcomeMessageVariant: null,
	thankYouMessageVariant: null,
	showHowItWorks: true,
	gifts: [],
	...overrides,
});

type PublishSuccessMetadata = {
	wishlistId: string;
	slug: string;
	publicUrlPath: string;
	dashboardUrlPath: string;
};

const DEFAULT_PUBLISH_SUCCESS: PublishSuccessMetadata = {
	wishlistId: "wishlist_123",
	slug: "lista-de-boda",
	publicUrlPath: "/w/lista-de-boda",
	dashboardUrlPath: "/dashboard",
};

function renderStep({
	publishSuccess = DEFAULT_PUBLISH_SUCCESS,
	draft = makeDraft(),
}: {
	publishSuccess?: PublishSuccessMetadata | null;
	draft?: WishlistDraft;
} = {}) {
	const store = createWishlistWizardStore();
	store.getState().replaceDraft(draft);
	if (publishSuccess) {
		store.getState().completePublish(publishSuccess);
	}

	return render(
		<WizardProvider rehydrate={false} store={store}>
			<PublishedStep />
		</WizardProvider>,
	);
}

describe("PublishedStep", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders nothing when there is no publish success in the store", () => {
		const { container } = renderStep({ publishSuccess: null });
		expect(container.textContent).toBe("");
	});

	it("shows the public URL with copy, WhatsApp, QR, Email, and dashboard actions", async () => {
		const user = userEvent.setup();
		renderStep();

		const publicUrl = toCanonicalWishlistUrl("/w/lista-de-boda");

		expect(screen.getByText(publicUrl)).toBeTruthy();
		expect(screen.getByRole("button", { name: /^copiar$/i })).toBeTruthy();

		await user.click(screen.getByRole("button", { name: /^qr$/i }));
		expect(downloadQrCodePngMock).toHaveBeenCalledWith({
			text: publicUrl,
			fileName: "lista-de-boda-qr.png",
		});

		expect(
			screen.getByRole("link", { name: /whatsapp/i }).getAttribute("href"),
		).toContain(encodeURIComponent(publicUrl));
		expect(
			screen.getByRole("link", { name: /^email$/i }).getAttribute("href"),
		).toContain("mailto:");
		expect(
			screen.getByRole("link", { name: /ver mi página/i }).getAttribute("href"),
		).toBe(publicUrl);
		expect(
			screen
				.getByRole("link", { name: /gestionar en dashboard/i })
				.getAttribute("href"),
		).toBe("/dashboard");
	});

	it("offers no back control on the terminal published step", () => {
		renderStep();
		expect(screen.queryByRole("button", { name: /atrás/i })).toBeNull();
	});
});
