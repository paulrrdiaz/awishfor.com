// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicLayoutShell } from "./public-layout-shell";

describe("PublicLayoutShell", () => {
	it("links Inicio, Blog, Contacto, Iniciar sesión, and the CTA to the right destinations", () => {
		render(
			<PublicLayoutShell heading="Lista de Ana" mode="full">
				<p>Contenido</p>
			</PublicLayoutShell>,
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
			screen.getByRole("link", { name: "Iniciar sesión" }),
		).toHaveAttribute("href", "/sign-in");
		expect(
			screen.getByRole("link", { name: "Crea un wishlist" }),
		).toHaveAttribute("href", "/create");
	});

	it("carries data-marketing-account-link on the sign-in link", () => {
		render(
			<PublicLayoutShell heading="Lista de Ana" mode="full">
				<p>Contenido</p>
			</PublicLayoutShell>,
		);

		expect(
			screen.getByRole("link", { name: "Iniciar sesión" }),
		).toHaveAttribute("data-marketing-account-link");
	});

	it("no longer shows the publish status badge or the share button", () => {
		render(
			<PublicLayoutShell heading="Lista de Ana" mode="full">
				<p>Contenido</p>
			</PublicLayoutShell>,
		);

		expect(screen.queryByText(/Publicada/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Compartir" }),
		).not.toBeInTheDocument();
	});
});
