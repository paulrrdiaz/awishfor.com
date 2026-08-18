// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BlogShareControl } from "./blog-share-control";

const TITLE = "La guía definitiva para organizar un baby shower sin estrés";
const URL = "https://awishfor.com/blog/organizar-baby-shower-sin-estres";

afterEach(() => {
	// @ts-expect-error test cleanup of a browser API we stub per test
	delete navigator.share;
	vi.restoreAllMocks();
});

describe("BlogShareControl", () => {
	it("opens the native share sheet with the post's title and URL when available", async () => {
		const shareMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: shareMock,
		});

		render(<BlogShareControl title={TITLE} url={URL} />);
		fireEvent.click(screen.getByRole("button", { name: "↗ Compartir" }));

		await vi.waitFor(() => {
			expect(shareMock).toHaveBeenCalledWith({ title: TITLE, url: URL });
		});
	});

	it("copies the URL to the clipboard and shows visible confirmation without the Web Share API", async () => {
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: undefined,
		});
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});

		render(<BlogShareControl title={TITLE} url={URL} />);
		fireEvent.click(screen.getByRole("button", { name: "↗ Compartir" }));

		await vi.waitFor(() => {
			expect(writeTextMock).toHaveBeenCalledWith(URL);
		});
		expect(
			await screen.findByRole("button", { name: "¡Copiado!" }),
		).toBeInTheDocument();
	});
});
