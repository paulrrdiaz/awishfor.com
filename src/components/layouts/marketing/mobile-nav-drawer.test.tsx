// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MobileNavDrawer } from "./mobile-nav-drawer";

beforeAll(() => {
	if (!HTMLDialogElement.prototype.showModal) {
		HTMLDialogElement.prototype.showModal = function showModal(
			this: HTMLDialogElement,
		) {
			this.setAttribute("open", "");
		};
	}
	if (!HTMLDialogElement.prototype.close) {
		HTMLDialogElement.prototype.close = function close(
			this: HTMLDialogElement,
		) {
			this.removeAttribute("open");
		};
	}
});

describe("MobileNavDrawer", () => {
	it("includes Blog and root-relative section links so they work off the landing route", () => {
		render(<MobileNavDrawer isSignedIn={false} />);
		fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));

		expect(screen.getByRole("link", { name: "Cómo funciona" })).toHaveAttribute(
			"href",
			"/#como-funciona",
		);
		expect(screen.getByRole("link", { name: "Ocasiones" })).toHaveAttribute(
			"href",
			"/#ocasiones",
		);
		expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
			"href",
			"/blog",
		);
	});
});
