// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
	beforeEach(() => {
		Object.assign(navigator, {
			clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("writes the value to the clipboard and shows a copied confirmation", async () => {
		render(<CopyButton value="Ana Beltrán, Av. Universidad 1500" />);

		fireEvent.click(screen.getByRole("button", { name: /copiar/i }));

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
			"Ana Beltrán, Av. Universidad 1500",
		);
		expect(
			await screen.findByRole("button", { name: /copiado/i }),
		).toBeInTheDocument();
	});

	it("reverts to the resting label after the confirmation window", async () => {
		vi.useFakeTimers();
		render(<CopyButton value="line" />);

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
			await Promise.resolve();
		});

		expect(screen.getByRole("button")).toHaveTextContent("Copiado");

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1500);
		});

		expect(screen.getByRole("button")).toHaveTextContent("Copiar");
	});

	it("does not error visibly when the clipboard write is rejected", async () => {
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn().mockRejectedValue(new Error("denied")),
			},
		});

		render(<CopyButton value="line" />);
		fireEvent.click(screen.getByRole("button", { name: /copiar/i }));

		await vi.waitFor(() => {
			expect(screen.getByRole("button")).toHaveTextContent("Copiar");
		});
	});
});
