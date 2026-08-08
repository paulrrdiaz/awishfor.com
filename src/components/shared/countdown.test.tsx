// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "./countdown";

describe("Countdown", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders the outline-pill variant", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));

		render(<Countdown eventDate="2026-08-20" variant="outline-pill" />);

		expect(screen.getByText("Faltan 14 días")).toHaveClass(
			"h-[30px]",
			"rounded-full",
			"border",
		);
	});

	it("renders the filled-pill variant", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));

		render(<Countdown eventDate="2026-08-20" variant="filled-pill" />);

		expect(screen.getByText("Faltan 14 días")).toHaveClass(
			"h-[30px]",
			"rounded-full",
			"bg-foreground",
		);
	});

	it("renders the progress-bar variant with the day count and end labels", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));

		render(
			<Countdown
				createdAt="2026-07-22T00:00:00.000Z"
				eventDate="2026-08-20"
				variant="progress-bar"
			/>,
		);

		expect(screen.getByText("Faltan 14 días")).toBeVisible();
		expect(screen.getByText("Lista creada")).toBeVisible();
		expect(screen.getByText("Gran día")).toBeVisible();
	});

	it("clamps progress-bar to 100% when createdAt is after eventDate", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));

		const { container } = render(
			<Countdown
				createdAt="2026-08-25T00:00:00.000Z"
				eventDate="2026-08-20"
				variant="progress-bar"
			/>,
		);

		const fill = container.querySelector('[style*="width"]');
		expect(fill).toHaveStyle({ width: "100%" });
	});

	it("falls back to the default variant for an unknown id", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));

		render(<Countdown eventDate="2026-08-20" variant="not-a-real-variant" />);

		expect(screen.getByText("Faltan 14 días")).toHaveClass("border");
	});

	it("renders the past-event message in a variant-neutral container instead of a pill", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));

		render(<Countdown eventDate="2026-08-20" variant="filled-pill" />);

		const message = screen.getByText("Gracias por celebrar con nosotros.");
		expect(message).toBeVisible();
		expect(screen.queryByText(/Faltan|Falta 1|Es hoy/)).toBeNull();
	});

	it("never displays a negative day count", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));

		render(<Countdown eventDate="2026-08-20" variant="outline-pill" />);

		expect(screen.queryByText(/-\d+/)).toBeNull();
	});
});
