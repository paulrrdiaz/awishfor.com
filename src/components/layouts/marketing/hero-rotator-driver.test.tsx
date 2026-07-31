// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { H2bHero } from "./h2b-hero";
import { HeroExampleRail } from "./hero-example-rail";
import { HERO_OCCASIONS } from "./hero-occasions";
import { HeroRotatorDriver } from "./hero-rotator-driver";

const animationCancel = vi.hoisted(() => vi.fn());
const animations = vi.hoisted(
	() =>
		[] as Array<{
			cancel: typeof animationCancel;
			onfinish: Animation["onfinish"];
		}>,
);

vi.mock("next/image", () => ({
	default: ({
		alt = "",
		priority,
		fill: _fill,
		sizes,
		...props
	}: ImgHTMLAttributes<HTMLImageElement> & {
		priority?: boolean;
		fill?: boolean;
		sizes?: string;
	}) => (
		// biome-ignore lint/performance/noImgElement: next/image test double
		<img
			alt={alt}
			data-priority={priority ? "true" : "false"}
			data-sizes={sizes}
			{...props}
		/>
	),
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

let intersectionCallback: IntersectionObserverCallback | undefined;
let reducedMotion = false;
const observerDisconnect = vi.fn();

function setVisibility(value: "visible" | "hidden") {
	Object.defineProperty(document, "visibilityState", {
		configurable: true,
		value,
	});
}

function renderRotator() {
	return render(
		<section data-h2b-hero>
			<div data-hero-photo-layer>
				<picture>
					<img alt="" data-hero-photo-index="0" data-initial-hero-photo />
				</picture>
				<HeroRotatorDriver />
			</div>
			<HeroExampleRail />
		</section>,
	);
}

async function loadPhoto(photo: HTMLImageElement) {
	await act(async () => {
		fireEvent.load(photo);
		await Promise.resolve();
	});
}

function finishLatestFade() {
	const fade = [...animations]
		.reverse()
		.find((animation) => typeof animation.onfinish === "function");
	act(() =>
		fade?.onfinish?.call(
			{} as Animation,
			new Event("finish") as AnimationPlaybackEvent,
		),
	);
}

describe("automatic hero rotation", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		vi.spyOn(Math, "random").mockReturnValue(0);
		animations.length = 0;
		reducedMotion = false;
		intersectionCallback = undefined;
		setVisibility("visible");
		Object.defineProperty(document, "readyState", {
			configurable: true,
			value: "complete",
		});
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
		HTMLElement.prototype.animate = vi.fn(() => {
			const animation = {
				cancel: animationCancel,
				onfinish: null,
			};
			animations.push(animation);
			return animation as unknown as Animation;
		});
		globalThis.IntersectionObserver = class IntersectionObserver {
			constructor(callback: IntersectionObserverCallback) {
				intersectionCallback = callback;
			}
			observe() {}
			unobserve() {}
			disconnect() {
				observerDisconnect();
			}
			root = null;
			rootMargin = "";
			scrollMargin = "";
			thresholds = [];
			takeRecords() {
				return [];
			}
		} as unknown as typeof IntersectionObserver;
	});

	it("server-renders one responsive priority candidate and one accessible rail", () => {
		const { container } = render(<H2bHero />);
		const initialPhoto = container.querySelector('[data-hero-photo-index="0"]');

		expect(container.querySelectorAll("[data-hero-photo-index]")).toHaveLength(
			1,
		);
		expect(initialPhoto).toHaveAttribute(
			"src",
			"/assets/hero/wedding-hero-mobile-300.jpg",
		);
		expect(container.querySelector("picture source")).toHaveAttribute(
			"srcset",
			"/assets/hero/wedding-hero.jpg",
		);
		expect(container.querySelectorAll("[data-hero-rail-content]")).toHaveLength(
			1,
		);
		expect(
			container.querySelectorAll('[data-hero-rail] a[href="#ejemplo"]'),
		).toHaveLength(1);
	});

	it("starts after load and visibility without waiting for visitor activity", async () => {
		const { container } = renderRotator();
		act(() => vi.advanceTimersByTime(7000));
		expect(container.querySelector('[data-hero-photo-index="1"]')).toBeNull();

		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);

		act(() => vi.advanceTimersByTime(6499));
		expect(container.querySelector('[data-hero-photo-index="1"]')).toBeNull();

		act(() => vi.advanceTimersByTime(1));
		const nextPhoto = container.querySelector(
			'[data-hero-photo-index="1"]',
		) as HTMLImageElement;
		expect(nextPhoto).toBeInTheDocument();
		await loadPhoto(nextPhoto);
		act(() => vi.advanceTimersByTime(160));

		expect(
			screen.getByText(HERO_OCCASIONS[1]?.rail.name ?? ""),
		).toBeInTheDocument();
		expect(
			container.querySelectorAll('[data-hero-rail] a[href="#ejemplo"]'),
		).toHaveLength(1);
	});

	it("pauses offscreen and in a hidden tab, then resumes from a full hold", async () => {
		const { container } = renderRotator();
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() => vi.advanceTimersByTime(3000));
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: false } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() => vi.advanceTimersByTime(7000));
		expect(container.querySelector('[data-hero-photo-index="1"]')).toBeNull();

		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		setVisibility("hidden");
		act(() => document.dispatchEvent(new Event("visibilitychange")));
		act(() => vi.advanceTimersByTime(7000));
		expect(container.querySelector('[data-hero-photo-index="1"]')).toBeNull();

		setVisibility("visible");
		act(() => document.dispatchEvent(new Event("visibilitychange")));
		act(() => vi.advanceTimersByTime(6500));
		expect(
			container.querySelector('[data-hero-photo-index="1"]'),
		).toBeInTheDocument();
	});

	it("hands the server photo to the controller without retaining a third layer", async () => {
		const { container } = renderRotator();
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() => vi.advanceTimersByTime(6500));
		const nextPhoto = container.querySelector(
			'[data-hero-photo-index="1"]',
		) as HTMLImageElement;
		await loadPhoto(nextPhoto);
		finishLatestFade();

		expect(container.querySelector("[data-initial-hero-photo]")).toBeNull();
		expect(container.querySelectorAll("[data-hero-photo-index]")).toHaveLength(
			1,
		);
	});

	it("keeps each photo motion continuous through the fade boundary", async () => {
		const { container } = renderRotator();
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		act(() => vi.advanceTimersByTime(6500));
		const incoming = container.querySelector(
			'[data-hero-photo-index="1"]',
		) as HTMLImageElement;
		await loadPhoto(incoming);

		expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(4);
		expect(animationCancel).not.toHaveBeenCalled();
		finishLatestFade();
		expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(4);
	});

	it("wraps the four-photo sequence without reinserting or stacking stale layers", async () => {
		const { container } = renderRotator();
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);

		for (const nextIndex of [1, 2, 3, 0]) {
			act(() => vi.advanceTimersByTime(6500));
			const incoming = container.querySelector(
				`[data-hero-photo-index="${nextIndex}"][style*="opacity: 0"]`,
			) as HTMLImageElement;
			expect(incoming).toBeInTheDocument();
			expect(
				container.querySelectorAll("[data-hero-photo-index]"),
			).toHaveLength(2);
			await loadPhoto(incoming);
			finishLatestFade();
			expect(
				container.querySelectorAll("[data-hero-photo-index]"),
			).toHaveLength(1);
		}

		expect(container.querySelector("[data-initial-hero-photo]")).toBeNull();
		expect(
			container.querySelector('[data-hero-occasion-id="boda"]'),
		).toBeInTheDocument();
	});

	it("stays static for reduced motion and cleans up lifecycle work", async () => {
		reducedMotion = true;
		const reduced = renderRotator();
		act(() => vi.advanceTimersByTime(7000));
		expect(
			reduced.container.querySelector('[data-hero-photo-index="1"]'),
		).toBeNull();
		reduced.unmount();

		reducedMotion = false;
		const active = renderRotator();
		act(() =>
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			),
		);
		active.unmount();
		expect(observerDisconnect).toHaveBeenCalled();
		expect(animationCancel).toHaveBeenCalled();
	});
});
