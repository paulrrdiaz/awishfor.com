import { describe, expect, it } from "vitest";
import { formatCountdown } from "./countdown";

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
		expect(formatCountdown(event, now)).toBe("Este evento ya pasó");
	});

	it("accepts a string eventDate", () => {
		const now = new Date("2024-01-01T00:00:00");
		expect(formatCountdown("2024-01-01T00:00:00", now)).toBe("Es hoy");
	});
});
