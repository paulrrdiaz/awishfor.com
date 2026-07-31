// @vitest-environment jsdom

import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { H2bNavController } from "./h2b-nav-controller";

describe("H2bNavController", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		Object.defineProperty(window, "scrollY", {
			configurable: true,
			value: 0,
			writable: true,
		});
		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 800,
		});
		Object.defineProperty(document.documentElement, "scrollHeight", {
			configurable: true,
			value: 2800,
		});
		window.requestAnimationFrame = vi.fn(
			(callback) => setTimeout(() => callback(0), 0) as unknown as number,
		);
		window.cancelAnimationFrame = vi.fn();
	});

	it("keeps structural nav state and progress functional without motion", () => {
		const { container } = render(
			<>
				<nav data-h2b-nav data-scrolled="false" />
				<div data-h2b-scroll-progress />
				<H2bNavController />
			</>,
		);
		const nav = container.querySelector("[data-h2b-nav]");
		const progress = container.querySelector(
			"[data-h2b-scroll-progress]",
		) as HTMLElement;
		expect(nav).toHaveAttribute("data-scrolled", "false");
		expect(progress.style.transform).toBe("scaleX(0)");

		act(() => {
			window.scrollY = 1000;
			window.dispatchEvent(new Event("scroll"));
			vi.runOnlyPendingTimers();
		});
		expect(nav).toHaveAttribute("data-scrolled", "true");
		expect(progress.style.transform).toBe("scaleX(0.5)");

		act(() => {
			window.scrollY = 0;
			window.dispatchEvent(new Event("scroll"));
			vi.runOnlyPendingTimers();
		});
		expect(nav).toHaveAttribute("data-scrolled", "false");
	});
});
