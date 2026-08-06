// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "./countdown";

describe("Countdown", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders the compact toolbar chip", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-06T12:00:00Z"));

		render(<Countdown eventDate="2026-08-20" variant="chip" />);

		expect(screen.getByText("Faltan 14 días")).toHaveClass(
			"h-[30px]",
			"rounded-full",
		);
	});
});
