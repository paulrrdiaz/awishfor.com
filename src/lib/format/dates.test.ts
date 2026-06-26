import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatEventDate, formatRelativeDate } from "@/lib/format/dates";

describe("formatEventDate", () => {
	it("formats a date in Spanish", () => {
		const date = new Date("2026-12-25T00:00:00Z");
		const result = formatEventDate(date, "es");
		expect(result).toMatch(/diciembre/i);
		expect(result).toContain("2026");
	});

	it("formats a date in English", () => {
		const date = new Date("2026-12-25T00:00:00Z");
		const result = formatEventDate(date, "en");
		expect(result).toMatch(/december/i);
		expect(result).toContain("2026");
	});

	it("accepts ISO string input", () => {
		const result = formatEventDate("2026-06-15T00:00:00Z", "en");
		expect(result).toMatch(/june/i);
	});
});

describe("formatRelativeDate", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-06-26T12:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("formats a future date in English", () => {
		const future = new Date("2026-06-29T12:00:00Z");
		const result = formatRelativeDate(future, "en");
		expect(result).toMatch(/in 3 days|3 days/i);
	});

	it("formats a past date in Spanish", () => {
		const past = new Date("2026-06-23T12:00:00Z");
		const result = formatRelativeDate(past, "es");
		expect(result).toMatch(/hace|días/i);
	});

	it("formats hours for near-future dates in English", () => {
		const soon = new Date("2026-06-26T18:00:00Z");
		const result = formatRelativeDate(soon, "en");
		expect(result).toMatch(/in 6 hours|6 hours/i);
	});
});
