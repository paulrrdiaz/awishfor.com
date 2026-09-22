import { describe, expect, it } from "vitest";
import {
	buildInviteFollowUpMessage,
	calendarDaysUntil,
	classifyViewRecency,
	deriveInviteFollowUp,
	getEventProximity,
} from "./invite-follow-up";

const now = new Date("2026-09-22T12:00:00.000Z");
const base = {
	status: "pending",
	lastViewedAt: null,
	lastFollowUpKind: null,
	eventDate: "2026-10-06T00:00:00.000Z",
	rsvpDeadline: null,
	now,
} as const;

describe("invite follow-up calendar and view boundaries", () => {
	it("preserves the stored calendar day in America/Lima", () => {
		expect(calendarDaysUntil("2026-09-23T00:00:00.000Z", now)).toBe(1);
		expect(calendarDaysUntil("2026-09-22T00:00:00.000Z", now)).toBe(0);
		expect(calendarDaysUntil("2026-09-21T00:00:00.000Z", now)).toBe(-1);
	});

	it("classifies exact 48-hour and 14-day view boundaries", () => {
		expect(classifyViewRecency("2026-09-20T12:00:00.000Z", now)).toBe("recent");
		expect(classifyViewRecency("2026-09-20T11:59:59.999Z", now)).toBe(
			"intermediate",
		);
		expect(classifyViewRecency("2026-09-08T12:00:00.000Z", now)).toBe(
			"intermediate",
		);
		expect(classifyViewRecency("2026-09-08T11:59:59.999Z", now)).toBe("stale");
	});

	it("classifies every event-proximity state", () => {
		expect(getEventProximity("2026-10-06T00:00:00.000Z", now)?.stage).toBe(
			"within_14_days",
		);
		expect(getEventProximity("2026-09-29T00:00:00.000Z", now)?.stage).toBe(
			"within_7_days",
		);
		expect(getEventProximity("2026-09-23T00:00:00.000Z", now)?.stage).toBe(
			"tomorrow",
		);
		expect(getEventProximity("2026-09-22T00:00:00.000Z", now)?.stage).toBe(
			"today",
		);
		expect(getEventProximity("2026-09-21T00:00:00.000Z", now)?.stage).toBe(
			"past",
		);
	});
});

describe("invite follow-up projection", () => {
	it.each([
		[{ ...base }, "invitation"],
		[{ ...base, lastViewedAt: "2026-09-20T11:00:00.000Z" }, "rsvp_reminder"],
		[
			{ ...base, status: "confirmed", eventDate: "2026-10-06T00:00:00.000Z" },
			"event_14_day",
		],
		[
			{ ...base, status: "confirmed", eventDate: "2026-09-29T00:00:00.000Z" },
			"event_7_day",
		],
		[
			{ ...base, status: "confirmed", eventDate: "2026-09-23T00:00:00.000Z" },
			"event_1_day",
		],
	] as const)("derives %s as %s", (input, kind) => {
		expect(deriveInviteFollowUp(input)?.kind).toBe(kind);
	});

	it.each([
		{ ...base, status: "declined" },
		{ ...base, eventDate: "2026-09-22T00:00:00.000Z" },
		{ ...base, status: "confirmed", eventDate: null },
		{ ...base, status: "confirmed", eventDate: "2026-10-07T00:00:00.000Z" },
	])("omits ineligible follow-ups", (input) => {
		expect(deriveInviteFollowUp(input)).toBeNull();
	});

	it("de-emphasizes recent or same-stage copies and reactivates later stages", () => {
		expect(
			deriveInviteFollowUp({
				...base,
				lastViewedAt: "2026-09-21T12:00:00.000Z",
			})?.emphasis,
		).toBe("deemphasized");
		expect(
			deriveInviteFollowUp({ ...base, lastFollowUpKind: "invitation" })
				?.emphasis,
		).toBe("deemphasized");
		expect(
			deriveInviteFollowUp({
				...base,
				status: "confirmed",
				eventDate: "2026-09-29T00:00:00.000Z",
				lastFollowUpKind: "event_14_day",
			})?.emphasis,
		).toBe("recommended");
	});
});

describe("invite follow-up messages", () => {
	const messageInput = {
		guestName: "María",
		inviteUrl: "https://awishfor.com/w/lista/maria",
		eventType: "wedding",
		eventDate: "2026-10-06T00:00:00.000Z",
		eventTime: "18:00",
		eventLocation: "La Casa Verde",
		rsvpDeadline: "2026-09-20T00:00:00.000Z",
		now,
	} as const;

	it.each([
		"invitation",
		"rsvp_reminder",
		"event_14_day",
		"event_7_day",
		"event_1_day",
	] as const)("builds a privacy-safe %s message", (kind) => {
		const message = buildInviteFollowUpMessage({ ...messageInput, kind });
		expect(message).toContain(messageInput.inviteUrl);
		expect(message).not.toMatch(/vist|abr|seguimiento|copiad/i);
	});

	it.each([
		[null, null],
		["18:00", null],
		[null, "La Casa Verde"],
		["18:00", "La Casa Verde"],
	] as const)("omits missing logistics cleanly", (eventTime, eventLocation) => {
		const message = buildInviteFollowUpMessage({
			...messageInput,
			kind: "event_7_day",
			eventTime,
			eventLocation,
		});
		expect(message).not.toContain("null");
		expect(message).not.toContain("undefined");
	});

	it("asks for a direct reply after the RSVP deadline", () => {
		expect(
			buildInviteFollowUpMessage({ ...messageInput, kind: "rsvp_reminder" }),
		).toContain("respóndenos directamente");
	});
});
