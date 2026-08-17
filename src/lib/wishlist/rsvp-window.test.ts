import { describe, expect, it } from "vitest";
import { isRsvpClosed, rsvpClosesAt } from "./rsvp-window";

describe("isRsvpClosed", () => {
	it("stays open through the whole event day, even hours after UTC midnight", () => {
		const eventDate = "2026-09-12T00:00:00.000Z";
		const stillTheSameDay = new Date("2026-09-12T20:00:00.000Z");

		expect(isRsvpClosed(eventDate, null, stillTheSameDay)).toBe(false);
	});

	it("closes once the event day has fully elapsed", () => {
		const eventDate = "2026-09-12T00:00:00.000Z";
		const nextDay = new Date("2026-09-13T00:00:01.000Z");

		expect(isRsvpClosed(eventDate, null, nextDay)).toBe(true);
	});

	it("falls back to the RSVP deadline when there is no event date", () => {
		const deadline = "2026-08-08T00:00:00.000Z";

		expect(
			isRsvpClosed(null, deadline, new Date("2026-08-08T23:00:00.000Z")),
		).toBe(false);
		expect(
			isRsvpClosed(null, deadline, new Date("2026-08-09T00:00:01.000Z")),
		).toBe(true);
	});

	it("ignores the RSVP deadline once an event date is set", () => {
		const eventDate = "2026-09-12T00:00:00.000Z";
		const pastDeadline = "2026-08-01T00:00:00.000Z";

		expect(
			isRsvpClosed(
				eventDate,
				pastDeadline,
				new Date("2026-09-12T12:00:00.000Z"),
			),
		).toBe(false);
	});

	it("never closes when neither date is set", () => {
		expect(isRsvpClosed(null, null)).toBe(false);
	});
});

describe("rsvpClosesAt", () => {
	it("returns the end of the UTC calendar day, not the stored instant", () => {
		const closesAt = rsvpClosesAt("2026-09-12T00:00:00.000Z", null);
		expect(closesAt?.toISOString()).toBe("2026-09-12T23:59:59.999Z");
	});

	it("returns null when neither date is set", () => {
		expect(rsvpClosesAt(null, null)).toBeNull();
	});
});
