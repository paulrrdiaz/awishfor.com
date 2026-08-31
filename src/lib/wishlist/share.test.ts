import { describe, expect, it } from "vitest";
import {
	guestWhatsAppMessage,
	toEmailShareUrl,
	toGuestWhatsAppShareUrl,
	toWhatsAppShareUrl,
	whatsAppMessageForEvent,
} from "./share";

describe("whatsAppMessageForEvent", () => {
	it("returns baby_shower template", () => {
		const msg = whatsAppMessageForEvent(
			"baby_shower",
			"https://awishfor.com/w/mi-lista",
		);
		expect(msg).toContain("baby shower");
		expect(msg).toContain("https://awishfor.com/w/mi-lista");
	});

	it("returns birthday template", () => {
		const msg = whatsAppMessageForEvent(
			"birthday",
			"https://awishfor.com/w/cumple",
		);
		expect(msg).toContain("cumpleaños");
		expect(msg).toContain("https://awishfor.com/w/cumple");
	});

	it("returns wedding template", () => {
		const msg = whatsAppMessageForEvent(
			"wedding",
			"https://awishfor.com/w/boda",
		);
		expect(msg).toContain("casamos");
		expect(msg).toContain("https://awishfor.com/w/boda");
	});

	it("returns housewarming template", () => {
		const msg = whatsAppMessageForEvent(
			"housewarming",
			"https://awishfor.com/w/casa",
		);
		expect(msg).toContain("hogar");
		expect(msg).toContain("https://awishfor.com/w/casa");
	});

	it("returns general template for 'general'", () => {
		const msg = whatsAppMessageForEvent(
			"general",
			"https://awishfor.com/w/lista",
		);
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});

	it("falls back to general for unknown event type", () => {
		const msg = whatsAppMessageForEvent(
			"unknown_type",
			"https://awishfor.com/w/lista",
		);
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});

	it("falls back to general for null", () => {
		const msg = whatsAppMessageForEvent(null, "https://awishfor.com/w/lista");
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});

	it("falls back to general for undefined", () => {
		const msg = whatsAppMessageForEvent(
			undefined,
			"https://awishfor.com/w/lista",
		);
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});
});

describe("toWhatsAppShareUrl", () => {
	it("produces a wa.me link with URL-encoded message for baby_shower", () => {
		const url = toWhatsAppShareUrl(
			"https://awishfor.com/w/test",
			"baby_shower",
		);
		expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
		const decoded = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
		expect(decoded).toContain("baby shower");
		expect(decoded).toContain("https://awishfor.com/w/test");
	});

	it("produces general message when no eventType passed", () => {
		const url = toWhatsAppShareUrl("https://awishfor.com/w/test");
		const decoded = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
		expect(decoded).toContain("awishfor");
		expect(decoded).toContain("https://awishfor.com/w/test");
	});
});

describe("toEmailShareUrl", () => {
	it("produces a mailto link with a subject and the WhatsApp invitation copy", () => {
		const url = toEmailShareUrl("https://awishfor.com/w/boda", "wedding");

		expect(url).toMatch(/^mailto:\?subject=/);
		const [, query] = url.split("?");
		const params = new URLSearchParams(query);
		expect(params.get("subject")).toBe("Nuestra lista de boda");
		expect(params.get("body")).toContain("casamos");
		expect(params.get("body")).toContain("https://awishfor.com/w/boda");
	});

	it("falls back to the general subject and copy for an unknown event type", () => {
		const url = toEmailShareUrl("https://awishfor.com/w/test");
		const [, query] = url.split("?");
		const params = new URLSearchParams(query);
		expect(params.get("subject")).toBe("Mi wishlist");
		expect(params.get("body")).toContain("awishfor");
	});
});

describe("guestWhatsAppMessage", () => {
	it("addresses the named guest and carries their personal invitation link", () => {
		const msg = guestWhatsAppMessage({
			purpose: "invitation",
			eventType: "wedding",
			guestName: "Lucía",
			inviteUrl: "https://awishfor.com/w/boda/lucia",
		});
		expect(msg).toContain("Lucía");
		expect(msg).toContain("https://awishfor.com/w/boda/lucia");
	});

	it("varies the message body by purpose for the same event type", () => {
		const base = {
			eventType: "birthday",
			guestName: "Carlos",
			inviteUrl: "https://awishfor.com/w/cumple/carlos",
		};
		const invitation = guestWhatsAppMessage({ ...base, purpose: "invitation" });
		const reminder = guestWhatsAppMessage({ ...base, purpose: "reminder" });
		const thanks = guestWhatsAppMessage({ ...base, purpose: "thanks" });

		expect(invitation).not.toBe(reminder);
		expect(reminder).not.toBe(thanks);
		expect(invitation).not.toBe(thanks);
	});

	it("falls back to the general template for an unrecognized event type", () => {
		const msg = guestWhatsAppMessage({
			purpose: "reminder",
			eventType: "unknown_type",
			guestName: "Ana",
			inviteUrl: "https://awishfor.com/w/lista/ana",
		});
		expect(msg).toContain("Ana");
		expect(msg).toContain("https://awishfor.com/w/lista/ana");
	});

	it("falls back to the general template when the event type is missing", () => {
		const msg = guestWhatsAppMessage({
			purpose: "thanks",
			eventType: null,
			guestName: "Marco",
			inviteUrl: "https://awishfor.com/w/lista/marco",
		});
		expect(msg).toContain("Marco");
		expect(msg).toContain("https://awishfor.com/w/lista/marco");
	});
});

describe("toGuestWhatsAppShareUrl", () => {
	it("produces a wa.me link with the URL-encoded personalized message", () => {
		const url = toGuestWhatsAppShareUrl({
			purpose: "invitation",
			eventType: "baby_shower",
			guestName: "Renee",
			inviteUrl: "https://awishfor.com/w/babyshower/renee",
		});

		expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
		const decoded = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
		expect(decoded).toContain("Renee");
		expect(decoded).toContain("https://awishfor.com/w/babyshower/renee");
	});
});
