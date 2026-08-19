// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

vi.mock("next/image", () => ({
	default: ({ alt }: { alt: string }) => <span data-image-alt={alt} />,
}));

vi.mock("@/components/layouts/public-wishlist/public-theme-provider", () => ({
	PublicThemeProvider: ({ children }: { children: ReactNode }) => (
		<div className="public-theme">{children}</div>
	),
}));

vi.mock("@/components/layouts/public-wishlist/public-layout-shell", () => ({
	PublicLayoutShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/features/wishlist/public-filters", () => ({
	PublicGiftFilters: () => <div data-testid="gifts" />,
}));

vi.mock("@/components/shared/gift-grid", () => ({
	GiftGrid: () => <div data-testid="gifts" />,
}));

vi.mock("@/components/shared/gift-list-band", () => ({
	GiftListBand: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/shared/hero-gallery", () => ({
	HeroCarouselGallery: ({ alt }: { alt: string }) => (
		<div data-testid={`carousel-${alt}`} />
	),
	HeroImageSlot: ({ alt }: { alt: string }) => (
		<div data-testid={`slot-${alt}`} />
	),
	SampleImageMarker: () => null,
}));

vi.mock("@/components/shared/event-details", () => ({
	EventDetails: () => <section data-testid="event-details" />,
}));

vi.mock("@/components/shared/delivery-bar", () => ({
	DeliveryBar: () => <div data-testid="delivery-bar" />,
}));

vi.mock("@/components/shared/countdown", () => ({
	Countdown: () => <section data-testid="countdown" />,
}));

vi.mock("@/components/shared/wishlist-message", () => ({
	WishlistMessage: ({ message }: { message: string }) => (
		<section data-testid="welcome">{message}</section>
	),
}));

vi.mock("@/components/shared/wishlist-thank-you", () => ({
	WishlistThankYou: () => <section data-testid="thank-you" />,
}));

vi.mock("@/components/shared/progress-summary", () => ({
	ProgressSummary: () => null,
}));

vi.mock("@/components/shared/wishlist-footer", () => ({
	WishlistFooter: () => null,
}));

vi.mock("@/components/shared/how-it-works", () => ({
	HowItWorksDrawer: ({ showHowItWorks }: { showHowItWorks: boolean }) =>
		showHowItWorks ? <button type="button">Cómo funciona</button> : null,
}));

vi.mock("@/lib/gsap/use-motif-tilt", () => ({
	useMotifTilt: () => undefined,
}));

const LAYOUT_IDS = [
	"carousel-hero",
	"scrapbook-polaroids",
	"portrait-frame-split",
	"arch-hero-party",
	"arch-trio",
	"overlap-duo",
	"split-image-right",
	"collage-staggered",
	"magazine-editorial",
] as const;

const MODES = ["full", "preview", "compact"] as const;
const SUBTITLE = "Una historia que celebramos juntos";

function wishlist(
	layoutId: (typeof LAYOUT_IDS)[number],
	subtitle: string | null,
	showHowItWorks = true,
): PublicWishlistViewModel {
	return {
		...DEMO_WISHLIST,
		layoutId,
		showHowItWorks,
		subtitle,
	};
}

function expectBefore(before: Element, after: Element) {
	expect(
		Boolean(
			before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING,
		),
	).toBe(true);
}

afterEach(cleanup);

describe("public wishlist subtitle and relocated CTA behavior", () => {
	it("covers all layouts with and without subtitle in full, preview, and compact modes", () => {
		for (const layoutId of LAYOUT_IDS) {
			for (const mode of MODES) {
				for (const subtitle of [SUBTITLE, null]) {
					render(
						<PublicWishlistPage
							mode={mode}
							rsvpSection={<section data-testid="rsvp" />}
							wishlist={wishlist(layoutId, subtitle)}
						/>,
					);

					const headings = screen.getAllByRole("heading", { level: 1 });
					expect(headings).toHaveLength(1);
					expect(headings[0]).toHaveTextContent(DEMO_WISHLIST.title);

					if (subtitle) {
						const subtitleElement = screen.getByText(subtitle);
						expect(subtitleElement.tagName).toBe("P");
						expect(headings[0]?.nextElementSibling).toBe(subtitleElement);
					} else {
						expect(screen.queryByText(SUBTITLE)).not.toBeInTheDocument();
					}

					const giftLinks = screen.queryAllByRole("link", {
						name: "Ver lista de regalos",
					});
					if (mode === "compact") {
						expect(giftLinks).toHaveLength(0);
						expect(
							screen.queryByRole("button", { name: "Cómo funciona" }),
						).not.toBeInTheDocument();
					} else {
						expect(giftLinks).toHaveLength(1);
						const welcome = screen.getByTestId("welcome");
						const giftLink = giftLinks[0];
						if (!giftLink) throw new Error("Expected relocated gift CTA");
						expectBefore(welcome, giftLink);
						expect(
							screen.getByRole("button", { name: "Cómo funciona" }),
						).toBeInTheDocument();
					}

					cleanup();
				}
			}
		}
	});

	it("respects showHowItWorks while preserving the primary CTA", () => {
		for (const layoutId of LAYOUT_IDS) {
			render(
				<PublicWishlistPage
					mode="full"
					wishlist={wishlist(layoutId, SUBTITLE, false)}
				/>,
			);

			expect(
				screen.getByRole("link", { name: "Ver lista de regalos" }),
			).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: "Cómo funciona" }),
			).not.toBeInTheDocument();
			cleanup();
		}
	});
});

describe("self-contained layout section ordering", () => {
	it.each([
		["arch-trio", ["welcome", "countdown", "cta", "rsvp", "gifts"]],
		["split-image-right", ["countdown", "welcome", "cta", "rsvp", "gifts"]],
		["collage-staggered", ["countdown", "welcome", "cta", "rsvp", "gifts"]],
	] as const)("keeps %s content and actions in the required order", (layoutId, order) => {
		render(
			<PublicWishlistPage
				mode="full"
				rsvpSection={<section data-testid="rsvp" />}
				wishlist={wishlist(layoutId, SUBTITLE)}
			/>,
		);

		const elements = {
			countdown: screen.getByTestId("countdown"),
			cta: screen.getByRole("link", { name: "Ver lista de regalos" }),
			gifts: screen.getByTestId("gifts"),
			rsvp: screen.getByTestId("rsvp"),
			welcome: screen.getByTestId("welcome"),
		};

		for (let index = 0; index < order.length - 1; index += 1) {
			const current = order[index];
			const next = order[index + 1];
			if (!(current && next)) throw new Error("Invalid ordering fixture");
			expectBefore(elements[current], elements[next]);
		}
	});
});

describe("delivery presentation position", () => {
	it("renders the delivery bar after the gift list in every layout and render mode", () => {
		for (const layoutId of LAYOUT_IDS) {
			for (const mode of MODES) {
				render(
					<PublicWishlistPage
						mode={mode}
						wishlist={wishlist(layoutId, SUBTITLE)}
					/>,
				);

				expectBefore(
					screen.getByTestId("gifts"),
					screen.getByTestId("delivery-bar"),
				);

				cleanup();
			}
		}
	});
});
