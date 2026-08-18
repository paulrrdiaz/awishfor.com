// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const pathnameRef = { current: "/" };
vi.mock("next/navigation", () => ({
	usePathname: () => pathnameRef.current,
}));

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
	it("links the brand, Inicio, Blog, Contacto, and the CTA to the right destinations", () => {
		pathnameRef.current = "/";
		render(<SiteHeader />);

		expect(screen.getByRole("link", { name: "A Wish For" })).toHaveAttribute(
			"href",
			"/",
		);
		expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute(
			"href",
			"/",
		);
		expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
			"href",
			"/blog",
		);
		expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
			"href",
			"mailto:contact@awishfor.com",
		);
		expect(
			screen.getByRole("link", { name: "Crea un wishlist" }),
		).toHaveAttribute("href", "/create");
	});

	it("carries data-marketing-account-link on the sign-in link", () => {
		pathnameRef.current = "/";
		render(<SiteHeader />);

		const accountLink = screen.getByRole("link", { name: "Iniciar sesión" });
		expect(accountLink).toHaveAttribute("data-marketing-account-link");
		expect(accountLink).toHaveAttribute("href", "/sign-in");
	});

	it("marks Blog active, conveyed to assistive technology, on a blog route", () => {
		pathnameRef.current = "/blog/mi-post";
		render(<SiteHeader />);

		const blogLink = screen.getByRole("link", { name: "Blog" });
		expect(blogLink).toHaveAttribute("aria-current", "page");
		expect(blogLink).toHaveAttribute("data-active", "true");
	});

	it("does not mark Blog active on a non-blog route", () => {
		pathnameRef.current = "/privacy";
		render(<SiteHeader />);

		const blogLink = screen.getByRole("link", { name: "Blog" });
		expect(blogLink).not.toHaveAttribute("aria-current");
		expect(blogLink).toHaveAttribute("data-active", "false");
	});
});
