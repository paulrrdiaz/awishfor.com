// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountLinkEnhancement } from "./account-link-enhancement";
import { MarketingNav } from "./marketing-nav";

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
	default: ({
		alt = "",
		priority: _priority,
		fill: _fill,
		...props
	}: ImgHTMLAttributes<HTMLImageElement> & {
		priority?: boolean;
		fill?: boolean;
	}) => (
		// biome-ignore lint/performance/noImgElement: next/image test double
		<img alt={alt} {...props} />
	),
}));

describe("marketing account fallback", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.restoreAllMocks();
	});

	it("renders a geometry-stable anonymous fallback in initial navigation", () => {
		render(<MarketingNav variant="h2b" />);

		const links = screen.getAllByRole("link", { name: "Iniciar sesión" });
		expect(links).toHaveLength(2);
		for (const link of links) {
			expect(link).toHaveAttribute("href", "/sign-in");
			expect(link).toHaveAttribute("data-marketing-account-link");
		}
	});

	it("enhances signed-in links in place without replacing their markup", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				json: () => Promise.resolve({ authenticated: true }),
			}),
		);
		render(
			<>
				<a data-marketing-account-link href="/sign-in">
					Iniciar sesión
				</a>
				<AccountLinkEnhancement />
			</>,
		);
		const originalLink = screen.getByRole("link", { name: "Iniciar sesión" });

		await act(async () => {
			window.dispatchEvent(new Event("load"));
			window.dispatchEvent(new Event("pointerdown"));
			await Promise.resolve();
			await Promise.resolve();
		});

		const enhancedLink = screen.getByRole("link", { name: "Dashboard" });
		expect(enhancedLink).toBe(originalLink);
		expect(enhancedLink).toHaveAttribute("href", "/dashboard");
	});

	it("keeps the sign-in redirect fallback when session enhancement is unavailable", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(
			<>
				<a data-marketing-account-link href="/sign-in">
					Iniciar sesión
				</a>
				<AccountLinkEnhancement />
			</>,
		);

		await act(async () => {
			window.dispatchEvent(new Event("load"));
			window.dispatchEvent(new Event("pointerdown"));
			await Promise.resolve();
		});

		expect(
			screen.getByRole("link", { name: "Iniciar sesión" }),
		).toHaveAttribute("href", "/sign-in");
	});
});
