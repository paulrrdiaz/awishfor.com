// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeroCardCarousel } from "./hero-card-carousel";
import { HERO_FEATURED_OCCASIONS } from "./hero-occasions";

vi.mock("next/image", () => ({
	default: ({
		alt = "",
		fill: _fill,
		...props
	}: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
		// biome-ignore lint/performance/noImgElement: next/image test double
		<img alt={alt} {...props} />
	),
}));

let intersectionCallback: IntersectionObserverCallback | undefined;
let reducedMotion = false;

function setVisibility(value: "visible" | "hidden") {
	Object.defineProperty(document, "visibilityState", {
		configurable: true,
		value,
	});
}

describe("progressive occasion example carousel", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		reducedMotion = false;
		setVisibility("visible");
		intersectionCallback = undefined;
		HTMLElement.prototype.scrollTo = vi.fn();
		window.matchMedia = vi.fn().mockImplementation((query: string) => ({
			matches: query.includes("prefers-reduced-motion") && reducedMotion,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		}));
		globalThis.IntersectionObserver = class IntersectionObserver {
			constructor(callback: IntersectionObserverCallback) {
				intersectionCallback = callback;
			}
			observe() {}
			unobserve() {}
			disconnect() {}
			root = null;
			rootMargin = "";
			scrollMargin = "";
			thresholds = [];
			takeRecords() {
				return [];
			}
		} as unknown as typeof IntersectionObserver;
	});

	it("keeps every card readable before JavaScript enhancement loads media", () => {
		render(<HeroCardCarousel />);
		for (const occasion of HERO_FEATURED_OCCASIONS)
			expect(screen.getAllByText(occasion.card.title).length).toBeGreaterThan(
				0,
			);
		expect(screen.queryAllByRole("img")).toHaveLength(0);
		expect(screen.getAllByRole("article")).toHaveLength(
			HERO_FEATURED_OCCASIONS.length,
		);
	});

	it("loads lazy media near the viewport and synchronizes autoplay dots", () => {
		render(<HeroCardCarousel />);
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
		expect(
			screen.getByRole("link", { name: /Ver ejemplo 1:/ }),
		).toHaveAttribute("aria-current", "true");

		act(() => vi.advanceTimersByTime(6000));
		expect(
			screen.getByRole("link", { name: /Ver ejemplo 2:/ }),
		).toHaveAttribute("aria-current", "true");
		expect(HTMLElement.prototype.scrollTo).toHaveBeenCalled();
	});

	it("pauses autoplay offscreen, in hidden tabs, and for reduced motion", () => {
		const { unmount } = render(<HeroCardCarousel />);
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: false } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() => vi.advanceTimersByTime(12_000));
		expect(
			screen.getByRole("link", { name: /Ver ejemplo 1:/ }),
		).toHaveAttribute("aria-current", "true");

		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		setVisibility("hidden");
		act(() => document.dispatchEvent(new Event("visibilitychange")));
		act(() => vi.advanceTimersByTime(12_000));
		expect(
			screen.getByRole("link", { name: /Ver ejemplo 1:/ }),
		).toHaveAttribute("aria-current", "true");
		unmount();

		reducedMotion = true;
		render(<HeroCardCarousel />);
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() => vi.advanceTimersByTime(12_000));
		expect(
			screen.getByRole("link", { name: /Ver ejemplo 1:/ }),
		).toHaveAttribute("aria-current", "true");
	});
});
