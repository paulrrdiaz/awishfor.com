// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureMarketingEvent, initializeMinimalAnalytics, push } = vi.hoisted(
	() => ({
		captureMarketingEvent: vi.fn(),
		initializeMinimalAnalytics: vi.fn(),
		push: vi.fn(),
	}),
);
const navigation = { pathname: "/", search: "utm_source=instagram" };

vi.mock("@/lib/analytics", () => ({
	captureMarketingEvent,
	getCampaignProperties: (search: URLSearchParams) =>
		Object.fromEntries(search.entries()),
	initializeMinimalAnalytics,
}));

vi.mock("next/navigation", () => ({
	usePathname: () => navigation.pathname,
	useRouter: () => ({ push }),
	useSearchParams: () => new URLSearchParams(navigation.search),
}));

import { FaqSection } from "./faq-section";
import { GuestFinder } from "./guest-finder";
import {
	MarketingPageviewTracker,
	MarketingSectionTracker,
} from "./marketing-analytics";
import { MarketingCtaLink } from "./marketing-cta-link";
import { OccasionPickerSection } from "./occasion-picker-section";
import { ThemePreviews } from "./theme-previews";

describe("Marketing analytics", () => {
	beforeEach(() => {
		captureMarketingEvent.mockClear();
		initializeMinimalAnalytics.mockClear();
		push.mockClear();
		navigation.pathname = "/";
		navigation.search = "utm_source=instagram";
	});

	it("captures one pageview on load and one for each client navigation", () => {
		const { rerender } = render(<MarketingPageviewTracker />);
		expect(captureMarketingEvent).toHaveBeenCalledTimes(1);
		expect(captureMarketingEvent).toHaveBeenLastCalledWith("$pageview", {
			path: "/",
			utm_source: "instagram",
			visitor_intent: "creator",
		});

		rerender(<MarketingPageviewTracker />);
		expect(captureMarketingEvent).toHaveBeenCalledTimes(1);

		navigation.pathname = "/blog";
		navigation.search = "utm_campaign=launch";
		rerender(<MarketingPageviewTracker />);
		expect(captureMarketingEvent).toHaveBeenCalledTimes(2);
		expect(captureMarketingEvent).toHaveBeenLastCalledWith("$pageview", {
			path: "/blog",
			utm_campaign: "launch",
			visitor_intent: "creator",
		});
	});

	it("captures each marketing engagement event with its visitor intent", () => {
		const { container } = render(
			<>
				<OccasionPickerSection />
				<ThemePreviews />
				<FaqSection />
				<GuestFinder />
				{(["desktop_nav", "hero", "final", "mobile_nav"] as const).map(
					(placement) => (
						<MarketingCtaLink
							href="/create"
							key={placement}
							placement={placement}
						>
							{placement}
						</MarketingCtaLink>
					),
				)}
			</>,
		);

		fireEvent.click(
			screen.getByRole("link", { name: "Crear una lista para Boda" }),
			{ button: 1 },
		);
		fireEvent.click(screen.getByRole("button", { name: "Lavanda Fiesta" }));
		fireEvent.click(screen.getByRole("button", { name: "¿Cuánto cuesta?" }));
		fireEvent.change(screen.getByLabelText("Enlace o nombre de la lista"), {
			target: { value: "lista-de-boda" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
		for (const placement of ["desktop_nav", "hero", "final", "mobile_nav"])
			fireEvent.click(screen.getByRole("link", { name: placement }), {
				button: 1,
			});

		expect(captureMarketingEvent).toHaveBeenCalledWith("occasion_selected", {
			occasion: "wedding",
			visitor_intent: "creator",
		});
		expect(captureMarketingEvent).toHaveBeenCalledWith("theme_preview_opened", {
			theme: "lavanda-fiesta",
			visitor_intent: "creator",
		});
		expect(captureMarketingEvent).toHaveBeenCalledWith("faq_opened", {
			question: "faq-1",
			visitor_intent: "creator",
		});
		expect(captureMarketingEvent).toHaveBeenCalledWith("guest_finder_used", {
			visitor_intent: "guest",
		});
		expect(push).toHaveBeenCalledWith("/w/lista-de-boda");
		for (const placement of [
			"occasion",
			"desktop_nav",
			"hero",
			"final",
			"mobile_nav",
		])
			expect(captureMarketingEvent).toHaveBeenCalledWith("cta_clicked", {
				placement,
				visitor_intent: "creator",
			});

		const observed: IntersectionObserverCallback[] = [];
		globalThis.IntersectionObserver = class {
			constructor(callback: IntersectionObserverCallback) {
				observed.push(callback);
			}
			disconnect() {}
			observe() {}
			unobserve() {}
		} as unknown as typeof IntersectionObserver;
		render(<MarketingSectionTracker />);
		const section = container.querySelector("[data-analytics-section]");
		if (!section) throw new Error("Analytics section missing");
		act(() =>
			observed.at(-1)?.(
				[
					{
						isIntersecting: true,
						target: section,
					} as IntersectionObserverEntry,
				],
				{} as IntersectionObserver,
			),
		);
		act(() =>
			observed.at(-1)?.(
				[
					{
						isIntersecting: true,
						target: section,
					} as IntersectionObserverEntry,
				],
				{} as IntersectionObserver,
			),
		);
		expect(captureMarketingEvent).toHaveBeenCalledWith("section_viewed", {
			section: "occasions",
			visitor_intent: "creator",
		});
		expect(
			captureMarketingEvent.mock.calls.filter(
				([event]) => event === "section_viewed",
			),
		).toHaveLength(1);
	});
});
