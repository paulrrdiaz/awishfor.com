// @vitest-environment jsdom

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyConfirmedGuestsButton } from "./copy-confirmed-guests-button";

const toastErrorMock = vi.hoisted(() => vi.fn());
const clipboardWriteTextMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
	toast: { error: toastErrorMock },
}));

describe("CopyConfirmedGuestsButton", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clipboardWriteTextMock.mockReset();
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: clipboardWriteTextMock },
		});
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it("copies the roster and temporarily confirms success", async () => {
		vi.useFakeTimers();
		clipboardWriteTextMock.mockResolvedValue(undefined);
		render(
			<CopyConfirmedGuestsButton
				confirmedGuests={2}
				rosterText="Confirmados · Celebración"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Copiar confirmados" }));
		await act(async () => {
			await Promise.resolve();
		});

		expect(clipboardWriteTextMock).toHaveBeenCalledWith(
			"Confirmados · Celebración",
		);
		expect(screen.getByRole("button", { name: "Lista copiada" })).toBeVisible();

		act(() => vi.advanceTimersByTime(1500));
		expect(
			screen.getByRole("button", { name: "Copiar confirmados" }),
		).toBeVisible();
	});

	it("explains a rejected clipboard write and leaves retry available", async () => {
		clipboardWriteTextMock.mockRejectedValue(new Error("denied"));
		render(
			<CopyConfirmedGuestsButton
				confirmedGuests={1}
				rosterText="Confirmados · Celebración"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Copiar confirmados" }));

		await waitFor(() =>
			expect(toastErrorMock).toHaveBeenCalledWith(
				"No se pudo copiar la lista. Inténtalo de nuevo.",
			),
		);
		expect(
			screen.getByRole("button", { name: "Copiar confirmados" }),
		).toBeEnabled();
	});

	it("remains visible and explains why it is disabled with no confirmed people", () => {
		render(<CopyConfirmedGuestsButton confirmedGuests={0} rosterText="" />);

		const button = screen.getByRole("button", { name: "Copiar confirmados" });
		expect(button).toBeDisabled();
		expect(button).toHaveAccessibleDescription(
			"No hay personas confirmadas todavía.",
		);
	});
});
