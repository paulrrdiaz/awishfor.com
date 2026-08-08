import { describe, expect, it } from "vitest";
import { formatCountdown, getCountdownProgress } from "./countdown";

describe("formatCountdown", () => {
	it("returns Faltan N días for 44 days out", () => {
		const now = new Date("2024-01-01T10:00:00");
		const event = new Date("2024-02-14T00:00:00");
		expect(formatCountdown(event, now)).toBe("Faltan 44 días");
	});

	it("returns Falta 1 día for one day away", () => {
		const now = new Date("2024-01-01T10:00:00");
		const event = new Date("2024-01-02T00:00:00");
		expect(formatCountdown(event, now)).toBe("Falta 1 día");
	});

	it("returns Es hoy for the event day", () => {
		const now = new Date("2024-01-01T23:59:00");
		const event = new Date("2024-01-01T00:00:00");
		expect(formatCountdown(event, now)).toBe("Es hoy");
	});

	it("returns closed message for past events", () => {
		const now = new Date("2024-01-10T10:00:00");
		const event = new Date("2024-01-01T00:00:00");
		expect(formatCountdown(event, now)).toBe(
			"Gracias por celebrar con nosotros.",
		);
	});

	it("accepts a string eventDate", () => {
		const now = new Date("2024-01-01T00:00:00");
		expect(formatCountdown("2024-01-01T00:00:00", now)).toBe("Es hoy");
	});

	it("treats a date-only string as a local calendar date", () => {
		const now = new Date(2026, 7, 6, 12);
		expect(formatCountdown("2026-08-20", now)).toBe("Faltan 14 días");
	});
});

describe("getCountdownProgress", () => {
	it("reflects elapsed time between creation and the event", () => {
		// Created 36 days before "now"; event is 12 days after "now" — a
		// 48-day total span, 36 days elapsed, so the bar fills to 75%.
		const created = new Date("2025-12-20T00:00:00Z");
		const now = new Date("2026-01-25T00:00:00Z");
		const event = new Date("2026-02-06T00:00:00Z");
		expect(getCountdownProgress(created, event, now)).toBe(75);
	});

	it("renders full rather than negative when creation is after the event", () => {
		const created = new Date("2026-02-10T00:00:00Z");
		const event = new Date("2026-02-06T00:00:00Z");
		expect(getCountdownProgress(created, event, created)).toBe(100);
	});

	it("clamps to 0 before creation and 100 after the event", () => {
		const created = new Date("2026-01-01T00:00:00Z");
		const event = new Date("2026-01-11T00:00:00Z");
		expect(
			getCountdownProgress(created, event, new Date("2025-12-01T00:00:00Z")),
		).toBe(0);
		expect(
			getCountdownProgress(created, event, new Date("2026-02-01T00:00:00Z")),
		).toBe(100);
	});
});
