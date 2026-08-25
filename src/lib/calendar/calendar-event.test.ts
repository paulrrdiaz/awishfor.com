import { describe, expect, it } from "vitest";
import { CALENDAR_TIMEZONE, createCalendarEvent } from "./calendar-event";

const BASE_EVENT = {
	title: "Boda de Ana y Luis",
	eventDate: "2026-10-17T00:00:00.000Z",
	eventTime: "14:30",
	location: "Barranco, Lima",
	description: "Una tarde para celebrar juntos.",
	inviteUrl: "https://awishfor.com/w/boda/ana",
};

describe("createCalendarEvent", () => {
	it("creates a Lima timed event with the supplied end time", () => {
		const event = createCalendarEvent({ ...BASE_EVENT, endTime: "18:00" });
		const google = new URL(event.googleCalendarUrl);

		expect(google.searchParams.get("dates")).toBe(
			"20261017T143000/20261017T180000",
		);
		expect(google.searchParams.get("ctz")).toBe(CALENDAR_TIMEZONE);
		expect(google.searchParams.get("location")).toBe("Barranco, Lima");
		expect(google.searchParams.get("details")).toBe(
			"Una tarde para celebrar juntos.\n\nInvitación: https://awishfor.com/w/boda/ana",
		);
		expect(event.icalendar).toContain(
			"DTSTART;TZID=America/Lima:20261017T143000",
		);
		expect(event.icalendar).toContain(
			"DTEND;TZID=America/Lima:20261017T180000",
		);
		expect(event.icalendar).toContain("LOCATION:Barranco\\, Lima");
		expect(event.icalendar).toContain(
			"DESCRIPTION:Una tarde para celebrar juntos.\\n\\nInvitación: https://awishfor.com/w/boda/ana",
		);
		expect(event.icalendar).toContain("TRIGGER:-P1W");
		expect(event.icalendar).toContain("TRIGGER:-P1D");
		expect(event.icalendar).toContain("TRIGGER:-PT3H");
	});

	it("uses a one-hour fallback that carries into the next day", () => {
		const event = createCalendarEvent({
			...BASE_EVENT,
			eventTime: "23:30",
			endTime: null,
		});

		expect(new URL(event.googleCalendarUrl).searchParams.get("dates")).toBe(
			"20261017T233000/20261018T003000",
		);
		expect(event.icalendar).toContain(
			"DTEND;TZID=America/Lima:20261018T003000",
		);
	});

	it("creates an all-day event with an exclusive end date", () => {
		const event = createCalendarEvent({
			...BASE_EVENT,
			eventDate: "2026-12-31",
			eventTime: null,
			endTime: null,
		});

		expect(new URL(event.googleCalendarUrl).searchParams.get("dates")).toBe(
			"20261231/20270101",
		);
		expect(event.icalendar).toContain("DTSTART;VALUE=DATE:20261231");
		expect(event.icalendar).toContain("DTEND;VALUE=DATE:20270101");
		expect(event.filename).toBe("boda-de-ana-y-luis-20261231.ics");
	});

	it("omits absent locations and escapes calendar text", () => {
		const event = createCalendarEvent({
			...BASE_EVENT,
			title: "Ana, Luis; y \\ familia\n¡celebran!",
			location: null,
			endTime: null,
		});

		expect(new URL(event.googleCalendarUrl).searchParams.has("location")).toBe(
			false,
		);
		expect(event.icalendar).toContain(
			"SUMMARY:Ana\\, Luis\\; y \\\\ familia\\n¡celebran!",
		);
		expect(event.icalendar).not.toContain("LOCATION:");
		expect(event.icalendar).toContain("\r\n");
	});
});
