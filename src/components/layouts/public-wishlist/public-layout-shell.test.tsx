// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicLayoutShell } from "./public-layout-shell";

describe("PublicLayoutShell sharing", () => {
	afterEach(() => {
		Reflect.deleteProperty(navigator, "share");
		Reflect.deleteProperty(navigator, "clipboard");
	});

	it("uses the native share sheet with the current public URL", async () => {
		const share = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: share,
		});
		const user = userEvent.setup();
		render(
			<PublicLayoutShell heading="Lista de Ana" mode="full">
				<p>Contenido</p>
			</PublicLayoutShell>,
		);

		await user.click(screen.getByRole("button", { name: "Compartir" }));

		expect(share).toHaveBeenCalledWith({
			title: "Lista de Ana",
			url: window.location.href,
		});
	});

	it("copies the current URL when the native share sheet is unavailable", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: undefined,
		});
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});
		render(
			<PublicLayoutShell heading="Lista de Ana" mode="full">
				<p>Contenido</p>
			</PublicLayoutShell>,
		);

		await user.click(screen.getByRole("button", { name: "Compartir" }));

		expect(writeText).toHaveBeenCalledWith(window.location.href);
	});
});
